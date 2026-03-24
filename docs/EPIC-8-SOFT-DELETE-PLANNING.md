# ÉPICO 8: Soft Delete em Todas as Entidades — PLANEJAMENTO

## Status: 📋 PLANEJADO

**Data de criação:** 24/03/2026
**Prioridade:** Alta — afeta integridade histórica de todos os dados
**Estimativa:** ~2 dias (backend) + ~0,5 dia (frontend)

---

## Contexto e Motivação

Atualmente, todas as operações de exclusão no sistema são **hard delete**: o registro é
removido permanentemente do banco de dados com `DELETE FROM`. Isso cria dois problemas
graves:

1. **Perda de histórico** — Uma filial, fornecedor ou categoria excluída apaga referências
   que existem em contas a pagar históricas, podendo causar erros de FK ou inconsistências
   nos relatórios.

2. **Irrecuperabilidade** — Não há como desfazer uma exclusão acidental.

A solução é implementar **Soft Delete**: ao invés de deletar fisicamente, adicionar um
campo `deleted_at TIMESTAMP NULL`. Quando preenchido, o registro é considerado excluído —
mas permanece no banco para preservar histórico e permitir restauração futura.

---

## Escopo — Entidades Afetadas

| Entidade   | Tabela        | Observação |
|------------|---------------|------------|
| Branch     | `branches`    | FK referenciada por bills, vehicles |
| Vendor     | `vendors`     | FK referenciada por bills |
| Category   | `categories`  | FK referenciada por bills |
| Vehicle    | `vehicles`    | FK referenciada por bills |
| Bill       | `bills`       | Entidade principal; já possui `status=CANCELLED` — soft delete complementa |

> **Bill Attachments** (`bill_attachments`): serão deletadas em cascata quando a bill
> associada for soft-deletada. Não precisam de soft delete próprio.

---

## Decisões de Design

### 1. Campo `deleted_at` no `BaseModel`
Adicionar coluna única na classe base — todas as tabelas herdam automaticamente.

```python
deleted_at = Column(DateTime, nullable=True, default=None, index=True)
```

- `NULL` → registro ativo
- `timestamp` → registro soft-deletado
- **Index** em `deleted_at` para filtros eficientes

### 2. `BaseRepository` — filtros automáticos
Todos os métodos `get_all`, `get_by_id`, `get_by_*` passarão a incluir
`.where(Model.deleted_at == None)` automaticamente.

O método `delete()` existente será substituído por:
```python
async def soft_delete(self, id: int) -> bool:
    db_obj = await self.get_by_id(id)      # já filtra deleted_at IS NULL
    if db_obj:
        db_obj.deleted_at = datetime.utcnow()
        await self.db.flush()
        return True
    return False
```

O método `delete()` original **permanece** para uso interno (ex.: exclusão real em testes).

### 3. Repositories especializados — queries existentes
Todos os métodos customizados nos repositories (`get_by_branch`, `get_by_vendor`, etc.)
precisam adicionar `.where(Model.deleted_at == None)`.

### 4. Services — sem mudança de interface
A chamada dos services permanece igual. A mudança é transparente: `delete()` interno
agora chama `soft_delete()`.

### 5. Routers — sem mudança de interface
Endpoints `DELETE /entity/{id}` continuam retornando `204 No Content` — comportamento
externo idêntico.

### 6. Proteção de FK integridade ao soft-deletar entidades pai
Ao soft-deletar uma **Branch**, **Vendor**, **Category** ou **Vehicle** que ainda
possua bills ativas (não canceladas, não pagas), o sistema deve:
- **Opção A (escolhida):** bloquear exclusão com HTTP 409, informando a quantidade
  de contas ativas vinculadas.
- Opção B: soft-deletar em cascata (descartada — perda não-intencional de bills).

### 7. Unicidade de nomes após soft delete
Campos `UNIQUE` em banco (ex.: `vendors.name`, `branches.name`, `vehicles.plate`) não
impedem que um novo registro com o mesmo nome seja criado após o soft delete do original,
pois a constraint de unicidade SQL ainda enxergará ambas as linhas.

**Solução:** Remover constraints `UNIQUE` das colunas afetadas e passar a verificar
unicidade por query com filtro `deleted_at IS NULL` no service (já feito parcialmente
em `vendor_service`, `branch_service`, `vehicle_service`).

---

## Plano de Implementação

### Backend

#### Passo 1 — `BaseModel`: adicionar campo `deleted_at`
**Arquivo:** `backend/app/models/base.py`

```python
deleted_at = Column(
    DateTime,
    nullable=True,
    default=None,
    index=True,
)
```

#### Passo 2 — `BaseRepository`: soft delete + filtros automáticos
**Arquivo:** `backend/app/repositories/base.py`

- `get_all()` → adiciona `.where(self.model.deleted_at == None)`
- `get_by_id()` → adiciona `.where(self.model.deleted_at == None)`
- `delete()` → renomear para `hard_delete()` (uso interno/testes)
- Adicionar `soft_delete(id)` → seta `deleted_at = datetime.utcnow()`

#### Passo 3 — Repositories especializados: filtrar `deleted_at IS NULL`
Todos os métodos `get_by_*` nos repositories abaixo precisam do filtro adicional:

| Repository | Métodos a corrigir |
|---|---|
| `BillRepository` | `get_by_branch`, `get_by_branches`, `get_by_vendor`, `get_by_status`, `get_pending_bills`, `get_by_invoice`, `get_by_recurrence_group`, `get_by_vehicle` |
| `BranchRepository` | `get_by_name`, `get_headquarters`, `get_with_children`, `get_children_ids`, `get_branch_ids_for_filter` |
| `VendorRepository` | `get_by_name`, `get_by_email` |
| `CategoryRepository` | `get_by_name` |
| `VehicleRepository` | `get_by_branch`, `get_by_plate` |

#### Passo 4 — Services: substituir `repository.delete()` por `repository.soft_delete()`
Também adicionar verificação de contas ativas antes de soft-deletar entidades pai:

| Service | Mudanças |
|---|---|
| `BillService.delete_bill()` | Chamar `soft_delete()` |
| `BranchService.delete_branch()` | Verificar bills ativas → 409; chamar `soft_delete()` |
| `VendorService.delete_vendor()` | Verificar bills ativas → 409; chamar `soft_delete()` |
| `CategoryService.delete_category()` | Verificar bills ativas → 409; chamar `soft_delete()` |
| `VehicleService.delete_vehicle()` | Verificar bills ativas → 409; chamar `soft_delete()` |

#### Passo 5 — Remover constraints UNIQUE do banco (migração)
Constraints afetadas:

| Tabela | Coluna | Constraint |
|---|---|---|
| `branches` | `name` | `branches_name_key` |
| `vendors` | `name` | `vendors_name_key` |
| `categories` | `name` | `categories_name_key` |
| `vehicles` | `plate` | `vehicles_plate_key` |

Substituir por: verificação por query no service (already done para vendor/vehicle; estender para branch/category).

#### Passo 6 — Migração Alembic
Arquivo: `backend/alembic/versions/XXXXXXXX_epic8_soft_delete.py`

```sql
-- Adicionar deleted_at em todas as tabelas de entidades
ALTER TABLE branches     ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;
ALTER TABLE vendors      ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;
ALTER TABLE categories   ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;
ALTER TABLE vehicles     ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;
ALTER TABLE bills        ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;

-- Índices para performance
CREATE INDEX ix_branches_deleted_at   ON branches(deleted_at);
CREATE INDEX ix_vendors_deleted_at    ON vendors(deleted_at);
CREATE INDEX ix_categories_deleted_at ON categories(deleted_at);
CREATE INDEX ix_vehicles_deleted_at   ON vehicles(deleted_at);
CREATE INDEX ix_bills_deleted_at      ON bills(deleted_at);

-- Remover constraints UNIQUE de nomes/placa
ALTER TABLE branches   DROP CONSTRAINT branches_name_key;
ALTER TABLE vendors    DROP CONSTRAINT vendors_name_key;
ALTER TABLE categories DROP CONSTRAINT categories_name_key;
ALTER TABLE vehicles   DROP CONSTRAINT vehicles_plate_key;
```

#### Passo 7 — Schemas: expor `deleted_at` (opcional read-only)
Adicionar campo `deleted_at: datetime | None = None` em `BranchResponse`,
`VendorResponse`, `CategoryResponse`, `VehicleResponse`, `BillResponse` — útil
para eventuais UIs de auditoria/restauração.

### Frontend

#### Passo 8 — UX: feedback visual de exclusão
O comportamento de exclusão permanece igual visualmente (item desaparece da tabela
após confirmar). A diferença é apenas no backend. Nenhuma mudança de código necessária
nas páginas existentes.

**Único ajuste:** mostrar mensagem de erro adequada quando o backend retornar 409
(entidade tem contas ativas vinculadas). Tratar o `AxiosError` nos hooks de delete:
- `useDeleteBranch`, `useDeleteVendor`, `useDeleteCategory`, `useDeleteVehicle`
- Exibir `message.error(error.response.data.detail)` ao invés de erro genérico.

---

## Migration Alembic — Detalhamento

**Arquivo a criar:**
`backend/alembic/versions/XXXXXXXX_epic8_soft_delete.py`

O `down_revision` deve apontar para a última migration existente:
`910719ade46b` (`add_updated_at_to_bill_attachments`)

### Rollback (`downgrade`)
```sql
-- Remover colunas deleted_at
ALTER TABLE bills        DROP COLUMN deleted_at;
ALTER TABLE vehicles     DROP COLUMN deleted_at;
ALTER TABLE categories   DROP COLUMN deleted_at;
ALTER TABLE vendors      DROP COLUMN deleted_at;
ALTER TABLE branches     DROP COLUMN deleted_at;

-- Restaurar constraints UNIQUE (possível conflito se houver nomes duplicados pós-remoção)
ALTER TABLE branches   ADD CONSTRAINT branches_name_key   UNIQUE (name);
ALTER TABLE vendors    ADD CONSTRAINT vendors_name_key    UNIQUE (name);
ALTER TABLE categories ADD CONSTRAINT categories_name_key UNIQUE (name);
ALTER TABLE vehicles   ADD CONSTRAINT vehicles_plate_key  UNIQUE (plate);
```

> ⚠️ O downgrade pode falhar se existirem registros com `name`/`plate` duplicados
> introduzidos após a migration (comportamento esperado — advertir nos docs).

---

## Critérios de Aceite

- [ ] Ao deletar uma Branch/Vendor/Category/Vehicle/Bill via API, o registro **não é
      removido** do banco — `deleted_at` é preenchido.
- [ ] Registros com `deleted_at IS NOT NULL` **não aparecem** em nenhuma listagem ou
      busca via API.
- [ ] Ao tentar deletar uma Branch/Vendor/Category/Vehicle com contas ativas vinculadas,
      a API retorna **HTTP 409** com mensagem explicativa.
- [ ] Não é possível criar uma nova entidade com mesmo `name`/`plate` de uma entidade
      **ativa** (sem soft-delete), mas **é possível** se a original estiver soft-deletada.
- [ ] Migration aplica sem erros em banco limpo e em banco com dados existentes.
- [ ] Frontend exibe mensagem de erro clara quando o 409 é retornado.
- [ ] Testes manuais: criar → deletar → listar (não aparece) → criar mesmo nome (funciona).

---

## Riscos e Mitigações

| Risco | Mitigação |
|---|---|
| Queries sem filtro `deleted_at IS NULL` expondo dados soft-deletados | Code review sistemático de cada `select()` + testes de integração |
| Constraints UNIQUE no banco impedindo nomes repetidos | Remover via migration (Passo 5) + validação por query no service |
| Performance: índice em `deleted_at` | Criar índice na migration (Passo 6) |
| Registros órfãos em `bill_attachments` | Não aplicável — attachments são deletados em cascata quando a bill é removida via lógica de negócio |
| Rollback da migration com dados duplicados | Documentado acima — advertência explícita |

---

## Ordem de Execução Recomendada

```
1. backend/app/models/base.py               ← campo deleted_at
2. backend/app/repositories/base.py         ← soft_delete() + filtros
3. backend/app/repositories/*_repository.py ← filtros nos métodos customizados
4. backend/app/services/*_service.py        ← chamar soft_delete + validação 409
5. backend/alembic/versions/EPIC8_*.py      ← migration
6. backend/app/schemas/*                    ← opcional: expor deleted_at
7. frontend/src/hooks/*                     ← tratamento de erro 409
```

---

## Estimativa de Arquivos Modificados

### Backend (novos)
- `backend/alembic/versions/XXXXXXXX_epic8_soft_delete.py`

### Backend (modificados)
- `backend/app/models/base.py`
- `backend/app/repositories/base.py`
- `backend/app/repositories/bill_repository.py`
- `backend/app/repositories/branch_repository.py`
- `backend/app/repositories/vendor_repository.py`
- `backend/app/repositories/category_repository.py`
- `backend/app/repositories/vehicle_repository.py`
- `backend/app/services/bill_service.py`
- `backend/app/services/branch_service.py`
- `backend/app/services/vendor_service.py`
- `backend/app/services/category_service.py`
- `backend/app/services/vehicle_service.py`
- `backend/app/schemas/bill.py` *(opcional)*
- `backend/app/schemas/branch.py` *(opcional)*
- `backend/app/schemas/vendor.py` *(opcional)*
- `backend/app/schemas/category.py` *(opcional)*
- `backend/app/schemas/vehicle.py` *(opcional)*

### Frontend (modificados)
- `frontend/src/hooks/useBranches.ts`
- `frontend/src/hooks/useVendors.ts`
- `frontend/src/hooks/useCategories.ts`
- `frontend/src/hooks/useVehicles.ts`

**Total:** ~20 arquivos modificados + 1 novo.
