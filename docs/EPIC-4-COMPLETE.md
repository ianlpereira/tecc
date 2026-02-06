# ÉPICO 4: Sistema de Hierarquia Matriz-Filial - CONCLUÍDO ✅

## Status: IMPLEMENTADO E FUNCIONAL

Data de Conclusão: 2024
Versão: 1.0.0

---

## Resumo Executivo

Feature completa que permite associação de filiais a uma matriz, com:
- Filtragem consolidada de contas por hierarquia
- Interface visual com indicadores de hierarquia
- Validações robustas de relacionamento
- Migração de banco de dados aplicada

---

## Componentes Implementados

### 🗄️ Backend

#### 1. Modelo de Dados (`backend/app/models/branch.py`)
```python
# Campo adicionado:
parent_branch_id = Column(Integer, ForeignKey("branches.id", ondelete="SET NULL"), nullable=True)

# Relacionamentos:
parent = relationship("Branch", remote_side=[id], foreign_keys=[parent_branch_id])
children = relationship("Branch", back_populates="parent", foreign_keys=[parent_branch_id])
```

#### 2. Schema (`backend/app/schemas/branch.py`)
- `BranchBase`: Adicionado `parent_branch_id: Optional[int]`
- `BranchResponse`: Adicionado campos de hierarquia
- `BranchWithChildren`: Novo schema para representação com filiais

#### 3. Repositório (`backend/app/repositories/branch_repository.py`)
Métodos adicionados:
- `get_by_id_with_children()`: Busca filial com suas filiais
- `get_children()`: Lista todas as filiais de uma matriz
- `get_by_branches()`: Filtra registros por múltiplas filiais (usado em bills)

#### 4. Serviço (`backend/app/services/branch_service.py`)
Lógica implementada:
- `validate_hierarchy()`: Validações de integridade
  - Matriz não pode ter pai
  - Filial só pode ter matriz como pai
  - Previne ciclos
- `get_branch_with_children()`: Retorna hierarquia completa
- `get_children()`: Lista filiais

#### 5. Rotas (`backend/app/routers/branches.py`)
Novos endpoints:
- `GET /branches/{id}/children` - Lista filiais de uma matriz
- `GET /branches/{id}/with-children` - Retorna matriz com suas filiais

#### 6. Rotas de Bills (`backend/app/routers/bills.py`)
Parâmetro adicionado:
- `?include_children=true` - Inclui contas das filiais ao filtrar por matriz

#### 7. Migração (`backend/alembic/versions/a1b2c3d4e5f6_add_parent_branch_hierarchy.py`)
```sql
-- Operações:
ALTER TABLE branches ADD COLUMN parent_branch_id INTEGER;
ALTER TABLE branches ADD CONSTRAINT fk_parent_branch FOREIGN KEY (parent_branch_id) REFERENCES branches(id) ON DELETE SET NULL;
CREATE INDEX ix_branches_parent_branch_id ON branches(parent_branch_id);
```

---

### 🎨 Frontend

#### 1. Types (`frontend/src/types/index.ts`)
```typescript
export interface Branch {
  parent_branch_id?: number | null;
  parent?: Branch | null;
  // ...
}

export interface BranchWithChildren extends Branch {
  children?: Branch[];
}
```

#### 2. API Client (`frontend/src/services/api.ts`)
```typescript
// branchApi:
getChildren(id: number)
getWithChildren(id: number)

// billApi:
getAll(branchId?: number, includeChildren?: boolean)
```

#### 3. Hooks

**useBranches** (`frontend/src/hooks/useBranches.ts`)
- Adicionado parâmetro `includeHierarchy?: boolean`
- Novos hooks:
  - `useBranchChildren(id)`
  - `useBranchWithChildren(id)`

**useBills** (`frontend/src/hooks/useBills.ts`)
- Nova assinatura: `useBills(branchId?: number, includeChildren = false)`
- Query key incluindo branchId e includeChildren

#### 4. Context (`frontend/src/context/branchStore.ts`)
```typescript
interface BranchStore {
  includeChildren: boolean;
  setIncludeChildren: (value: boolean) => void;
}
```

#### 5. Componentes

**BranchSelector** (`frontend/src/components/BranchSelector/index.tsx`)
- Visual de hierarquia com ícones:
  - 📍 = Matriz
  - ↳ = Filial (indentada)
- Checkbox "Incluir filiais" aparece quando matriz está selecionada

**BranchForm** (`frontend/src/components/BranchForm/index.tsx`)
- Campo Select "Filial de" para selecionar matriz
- Aparece apenas quando `is_headquarters = false`
- Lista apenas matrizes disponíveis
- Validação automática no backend

#### 6. Pages

**Bills** (`frontend/src/pages/Bills/index.tsx`)
- Usa `useBills(currentBranch?.id, includeChildren)`
- Removida filtragem manual por branch (agora no backend)
- Exibe contas consolidadas quando matriz selecionada

**Dashboard** (`frontend/src/pages/Dashboard/index.tsx`)
- Usa `useBills(currentBranch?.id, includeChildren)`
- Estatísticas considerando hierarquia

---

## Validações Implementadas

### Backend
1. **Matriz não pode ter pai**
   - `is_headquarters=true` → `parent_branch_id` deve ser `null`
   
2. **Filial só pode ter matriz como pai**
   - `is_headquarters=false` → `parent_branch_id` deve apontar para matriz
   
3. **Previne ciclos**
   - Verifica que pai não é descendente do filho

### Frontend
- Campo "Filial de" oculto para matrizes
- Lista filtrada mostra apenas matrizes disponíveis
- Sincronização automática com estado do checkbox

---

## Fluxo de Uso

### Cadastro de Filial
1. Usuário acessa "Filiais" → "Nova Filial"
2. Preenche nome, deixa "É Matriz?" desmarcado
3. Campo "Filial de" aparece com lista de matrizes
4. Seleciona matriz desejada
5. Salva → Backend valida e cria relacionamento

### Filtragem Consolidada
1. Usuário seleciona uma matriz no BranchSelector
2. Checkbox "Incluir filiais" aparece e está marcado por padrão
3. Lista de contas mostra:
   - Contas da matriz
   - Contas de todas as filiais associadas
4. Desmarcar checkbox → mostra apenas contas da matriz

---

## Estrutura de Dados

### Exemplo no Banco
```
branches:
  id=1, name="Matriz Centro", is_headquarters=true, parent_branch_id=null
  id=2, name="Filial Norte", is_headquarters=false, parent_branch_id=1
  id=3, name="Filial Sul", is_headquarters=false, parent_branch_id=1
```

### Resposta API GET /branches/1/with-children
```json
{
  "id": 1,
  "name": "Matriz Centro",
  "is_headquarters": true,
  "parent_branch_id": null,
  "children": [
    {
      "id": 2,
      "name": "Filial Norte",
      "is_headquarters": false,
      "parent_branch_id": 1
    },
    {
      "id": 3,
      "name": "Filial Sul",
      "is_headquarters": false,
      "parent_branch_id": 1
    }
  ]
}
```

---

## Testes Manuais Recomendados

### ✅ Checklist de Validação

#### Cadastro
- [ ] Criar uma matriz sem pai
- [ ] Criar filial associada à matriz
- [ ] Tentar criar matriz com pai (deve falhar)
- [ ] Tentar criar filial com filial como pai (deve falhar)

#### Visualização
- [ ] BranchSelector mostra hierarquia visual (📍 ↳)
- [ ] Checkbox "Incluir filiais" aparece para matriz
- [ ] Checkbox não aparece para filial

#### Filtragem
- [ ] Selecionar matriz com "Incluir filiais" marcado
  - Deve mostrar contas da matriz + filiais
- [ ] Desmarcar "Incluir filiais"
  - Deve mostrar apenas contas da matriz
- [ ] Selecionar filial
  - Deve mostrar apenas contas da filial

#### Dashboard
- [ ] Estatísticas corretas para matriz (com/sem filiais)
- [ ] Estatísticas corretas para filial individual

---

## Arquivos Modificados

### Backend (9 arquivos)
1. `backend/app/models/branch.py`
2. `backend/app/schemas/branch.py`
3. `backend/app/repositories/branch_repository.py`
4. `backend/app/repositories/bill_repository.py`
5. `backend/app/services/branch_service.py`
6. `backend/app/services/bill_service.py`
7. `backend/app/routers/branches.py`
8. `backend/app/routers/bills.py`
9. `backend/alembic/versions/a1b2c3d4e5f6_add_parent_branch_hierarchy.py`

### Frontend (9 arquivos)
1. `frontend/src/types/index.ts`
2. `frontend/src/services/api.ts`
3. `frontend/src/hooks/useBranches.ts`
4. `frontend/src/hooks/useBills.ts`
5. `frontend/src/context/branchStore.ts`
6. `frontend/src/components/BranchSelector/index.tsx`
7. `frontend/src/components/BranchForm/index.tsx`
8. `frontend/src/pages/Bills/index.tsx`
9. `frontend/src/pages/Dashboard/index.tsx`

### Documentação (2 arquivos)
1. `docs/FEATURE-MATRIZ-FILIAL.md` (especificação)
2. `docs/EPIC-4-COMPLETE.md` (este arquivo)

---

## Comandos Docker

### Build
```bash
# Frontend
docker compose build frontend

# Backend
docker compose build backend

# Ambos
docker compose build
```

### Deploy
```bash
# Iniciar serviços
docker compose up -d

# Verificar logs
docker compose logs -f backend
docker compose logs -f frontend

# Aplicar migração (se necessário)
docker compose exec backend alembic upgrade head
```

---

## Performance

### Otimizações Implementadas
1. **Índice no banco**: `ix_branches_parent_branch_id`
2. **Eager loading**: `joinedload()` para evitar N+1 queries
3. **Query consolidada**: Uma única query no backend vs múltiplas no frontend
4. **Cache no React Query**: Dados hierárquicos cacheados

### Queries Otimizadas
```python
# Antes (múltiplas queries no frontend):
bills = get_bills()
branches = get_branches()
filtered = [b for b in bills if b.branch_id in child_ids]

# Depois (uma query no backend):
bills = get_bills(branch_id=1, include_children=True)
```

---

## Próximos Passos (Opcional)

### Melhorias Futuras
1. Suporte para hierarquia de N níveis (atualmente 2 níveis: matriz → filial)
2. Gráficos de comparação entre filiais
3. Relatórios consolidados com breakdown por filial
4. Filtros avançados (múltiplas matrizes, range de datas, etc.)
5. Transferência de contas entre filiais
6. Histórico de alterações na hierarquia

### Refatorações Sugeridas
- Mover lógica de hierarquia para service helper
- Criar componente reutilizável para árvore de hierarquia
- Adicionar testes unitários
- Adicionar testes E2E para fluxo completo

---

## Troubleshooting

### Problema: Checkbox não aparece para matriz
**Solução**: Verificar que `currentBranch.is_headquarters === true`

### Problema: Filial não carrega contas
**Solução**: Verificar que `parent_branch_id` está correto no banco

### Problema: Erro ao salvar filial com pai
**Solução**: Garantir que pai é matriz (`is_headquarters = true`)

### Problema: Build TypeScript falhando
**Solução**: 
```bash
# Rebuild containers
docker compose build --no-cache frontend

# Verificar hooks
grep -r "useBills()" frontend/src/pages/
# Deve estar vazio - todas as chamadas devem ter parâmetros
```

---

## Referências

- Especificação: `docs/FEATURE-MATRIZ-FILIAL.md`
- Roadmap: `docs/ROADMAP.md` (ÉPICO 4)
- SQLAlchemy Self-Referential: https://docs.sqlalchemy.org/en/20/orm/self_referential.html
- React Query Dependent Queries: https://tanstack.com/query/latest/docs/react/guides/dependent-queries

---

## Assinaturas

**Desenvolvedor**: GitHub Copilot  
**Revisão**: Pendente  
**Aprovação**: Pendente  

---

**FIM DO DOCUMENTO**
