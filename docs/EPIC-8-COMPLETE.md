# Epic 8 — Soft Delete: Implementação Completa

**Status:** ✅ CONCLUÍDO  
**Data:** 2026-03-24

---

## Resumo

Implementação de soft delete em todas as entidades principais do sistema (filiais, fornecedores, categorias, veículos e contas). Registros "excluídos" recebem um timestamp em `deleted_at` e deixam de aparecer em qualquer listagem ou busca, mas permanecem no banco de dados para auditoria.

---

## Mudanças Realizadas

### Backend

#### Models
- `backend/app/models/base.py` — campo `deleted_at: DateTime nullable=True index=True` adicionado ao `BaseModel`; propagado automaticamente a todas as entidades.

#### Repositories
- `backend/app/repositories/base.py`:
  - `get_all()` e `get_by_id()` filtram `deleted_at IS NULL`
  - Novo método `soft_delete(id)` — seta `deleted_at = utcnow()`
  - Antigo `delete()` renomeado para `hard_delete()` (uso interno)
- `backend/app/repositories/bill_repository.py` — todos os `get_by_*` filtram `deleted_at IS NULL`; novo método `get_by_category()`
- `backend/app/repositories/branch_repository.py` — todos os `get_by_*` filtram `deleted_at IS NULL`
- `backend/app/repositories/vendor_repository.py` — `get_by_name`, `get_by_email` filtram `deleted_at IS NULL`
- `backend/app/repositories/category_repository.py` — `get_by_name` filtra `deleted_at IS NULL`
- `backend/app/repositories/vehicle_repository.py` — `get_by_branch`, `get_by_plate` filtram `deleted_at IS NULL`

#### Services
- Todos os `delete_*` agora chamam `repository.soft_delete()` em vez de `repository.delete()`
- Proteção 409 adicionada: ao tentar excluir uma entidade vinculada a contas ativas (status ≠ PAID/CANCELLED), a API retorna HTTP 409 com mensagem descritiva
  - `branch_service.py` — proteção para filiais
  - `vendor_service.py` — proteção para fornecedores
  - `category_service.py` — proteção para categorias
  - `vehicle_service.py` — proteção para veículos

#### Schemas
- `backend/app/schemas/base.py` — `TimestampedSchema` expõe `deleted_at: datetime | None = None`; propagado automaticamente a todos os Response schemas

#### Migration
- `backend/alembic/versions/d1e2f3a4b5c6_epic8_soft_delete.py`
  - Adiciona coluna `deleted_at` + índice em: `branches`, `vendors`, `categories`, `vehicles`, `bills`
  - Remove constraints UNIQUE de nome/placa (unicidade agora garantida por query com filtro `deleted_at IS NULL`)
  - `down_revision = '0f1f3b804c93'`

### Frontend

#### Pages (tratamento de erros 409)
- `src/pages/Branches/index.tsx` — `onError` extrai `error.response.data.detail`
- `src/pages/Vendors/index.tsx` — idem
- `src/pages/Categories/index.tsx` — idem
- `src/pages/Vehicles/index.tsx` — idem
- `src/pages/Bills/index.tsx` — idem

---

## Comportamento Pós-Implementação

| Ação | Comportamento |
|------|--------------|
| Excluir entidade sem bills ativas | `deleted_at` recebe timestamp; registro some das listagens |
| Excluir entidade com bills ativas | HTTP 409 com mensagem detalhada; frontend exibe toast com o motivo |
| Excluir filial HQ | HTTP 400 (regra pré-existente mantida) |
| Excluir filial com filhos | HTTP 400 (regra pré-existente mantida) |
| Recriar entidade com mesmo nome/placa | Permitido (constraint UNIQUE removida do DB) |
| Listagem de qualquer entidade | Nunca retorna registros com `deleted_at IS NOT NULL` |

---

## Observações

- **Hard delete** mantido internamente como `BaseRepository.hard_delete()` para uso em testes ou migrations futuras
- **Bill attachments** não receberam soft delete (são excluídos por lógica de negócio junto com a bill)
- **Downgrade** da migration pode falhar se nomes/placas duplicadas foram introduzidas após a remoção das constraints (comportamento esperado e documentado)
