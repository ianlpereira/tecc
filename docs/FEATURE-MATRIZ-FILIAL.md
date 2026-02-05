# 🏢 Feature: Hierarquia Matriz-Filial

> **Status:** 📋 Planejamento  
> **Prioridade:** Alta  
> **Estimativa:** 4-6 horas  
> **Criado em:** 5 de Fevereiro de 2026

---

## 🎯 Objetivo

Implementar relacionamento hierárquico entre **Matriz** e **Filiais**, permitindo:

1. **Associar filiais a uma matriz**
2. **Filtrar dados por matriz** (trazendo todas as filiais associadas)
3. **Visualizar hierarquia** de forma clara na interface

---

## 📋 Requisitos Funcionais

### RF1: Relacionamento Matriz-Filial
- Uma **Matriz** pode ter **N filiais**
- Uma **Filial** pode ter **1 matriz** (ou nenhuma, se for matriz)
- **Matriz** é identificada por `is_headquarters=True`
- **Filial** comum tem `parent_branch_id` apontando para matriz

### RF2: Filtro por Matriz
- Ao selecionar uma **Matriz**, sistema deve:
  - Trazer dados da própria matriz
  - Trazer dados de **todas as filiais** associadas
  - Aplicar filtro em:
    - ✅ Contas a Pagar (`bills`)
    - ✅ Fornecedores (filtrados por uso nas filiais)
    - ✅ Categorias (filtradas por uso nas filiais)

### RF3: Interface
- **Dropdown de filiais** deve mostrar hierarquia:
  ```
  📍 Matriz São Paulo
     ↳ Filial Paulista
     ↳ Filial Moema
  📍 Matriz Rio de Janeiro
     ↳ Filial Copacabana
  ```
- **Indicador visual** de matriz vs filial
- **Filtro consolidado** opcional (ver apenas matriz ou matriz+filiais)

---

## 🗄️ Modelo de Dados

### Branch Model (Alterações)

```python
class Branch(BaseModel):
    __tablename__ = "branches"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False, unique=True)
    is_headquarters = Column(Boolean, default=False, nullable=False)
    
    # 🆕 NOVO: Relacionamento hierárquico
    parent_branch_id = Column(
        Integer, 
        ForeignKey("branches.id", ondelete="SET NULL"), 
        nullable=True
    )
    
    # 🆕 NOVO: Relationships
    parent = relationship(
        "Branch",
        remote_side=[id],
        backref="children"
    )
```

### Regras de Negócio

1. **Matriz não pode ter parent:**
   - `is_headquarters=True` → `parent_branch_id=NULL`

2. **Filial deve ter parent (opcional):**
   - `is_headquarters=False` → `parent_branch_id` pode ser NULL ou apontar para Matriz

3. **Validação:**
   - Matriz não pode ser filha de outra
   - Filial não pode ter filhas (apenas 1 nível de hierarquia)

---

## 🔧 Implementação Técnica

### 1️⃣ Backend (4 horas)

#### Migration (30 min)
```python
# alembic/versions/xxx_add_parent_branch.py
def upgrade():
    op.add_column(
        'branches',
        sa.Column('parent_branch_id', sa.Integer(), nullable=True)
    )
    op.create_foreign_key(
        'fk_branches_parent',
        'branches', 'branches',
        ['parent_branch_id'], ['id'],
        ondelete='SET NULL'
    )
```

#### Model Update (15 min)
- Adicionar `parent_branch_id` em `Branch`
- Adicionar `relationship` para `parent` e `children`

#### Schema Update (20 min)
```python
class BranchResponse(TimestampedSchema):
    id: int
    name: str
    is_headquarters: bool
    parent_branch_id: int | None = None
    parent_name: str | None = None  # 🆕 Para exibição
    children_count: int = 0  # 🆕 Contador de filiais
```

#### Repository (30 min)
```python
class BranchRepository:
    async def get_with_children(self, branch_id: int):
        """Get branch with all children IDs."""
        
    async def get_hierarchy(self):
        """Get all branches organized by hierarchy."""
        
    async def get_branch_ids_for_filter(self, branch_id: int) -> List[int]:
        """Returns [branch_id] + all children IDs for filtering."""
```

#### Service Layer (45 min)
```python
class BranchService:
    async def get_branch_with_hierarchy(self, branch_id: int):
        """Get branch details + children."""
        
    async def validate_hierarchy(self, branch_data):
        """Validate business rules before save."""
        # - Matriz não pode ter parent
        # - Filial não pode ter filhas
        
class BillService:
    async def get_bills_by_branch(
        self, 
        branch_id: int, 
        include_children: bool = True
    ):
        """Get bills filtering by branch hierarchy."""
```

#### Router Updates (30 min)
```python
# GET /api/v1/branches?include_hierarchy=true
# GET /api/v1/branches/{id}/children
# GET /api/v1/bills?branch_id=1&include_children=true
```

#### Tests (1 hora)
- Test hierarchy validation
- Test filtering with children
- Test edge cases (circular refs, etc)

---

### 2️⃣ Frontend (2 horas)

#### Types (15 min)
```typescript
interface Branch {
  id: number;
  name: string;
  is_headquarters: boolean;
  parent_branch_id?: number;
  parent_name?: string;
  children_count?: number;
}
```

#### BranchSelector Component (45 min)
```tsx
// Renderizar hierarquia visual
<S.BranchOption isHeadquarters={branch.is_headquarters}>
  {branch.is_headquarters ? '📍' : '  ↳'} {branch.name}
  {branch.children_count > 0 && ` (${branch.children_count} filiais)`}
</S.BranchOption>
```

#### Filter Logic (30 min)
- Adicionar toggle "Incluir filiais" no filtro
- Passar `include_children` para API
- Atualizar queries React Query

#### Visual Updates (30 min)
- Badge visual para Matriz/Filial
- Hierarquia indentada no dropdown
- Tooltip mostrando estrutura

---

## 📊 Endpoints API

### Novos/Modificados

```bash
# Lista com hierarquia
GET /api/v1/branches?include_hierarchy=true
Response: [
  {
    "id": 1,
    "name": "Matriz São Paulo",
    "is_headquarters": true,
    "parent_branch_id": null,
    "children": [
      {"id": 2, "name": "Filial Paulista", ...},
      {"id": 3, "name": "Filial Moema", ...}
    ]
  }
]

# Filhos de uma matriz
GET /api/v1/branches/1/children
Response: [
  {"id": 2, "name": "Filial Paulista"},
  {"id": 3, "name": "Filial Moema"}
]

# Contas a pagar com filtro hierárquico
GET /api/v1/bills?branch_id=1&include_children=true
Response: [
  // Bills da matriz (id=1) + filiais (id=2,3)
]
```

---

## ✅ Critérios de Aceite

### Backend
- [ ] Migration aplicada com sucesso
- [ ] Modelo `Branch` com `parent_branch_id`
- [ ] Validação: Matriz não pode ter parent
- [ ] Validação: Filial não pode ter filhas (1 nível apenas)
- [ ] Endpoint retorna hierarquia corretamente
- [ ] Filtro de `bills` por matriz traz filiais também
- [ ] Tests cobrindo regras de negócio

### Frontend
- [ ] Dropdown mostra hierarquia visual (indentação)
- [ ] Ícones diferenciando Matriz (📍) de Filial (↳)
- [ ] Toggle "Incluir filiais" funcional
- [ ] Filtrar por matriz traz dados consolidados
- [ ] Badge visual de Matriz/Filial
- [ ] Tooltip com informação de hierarquia

### UX
- [ ] Performance: Query consolidada não ultrapassa 500ms
- [ ] Não quebra funcionalidades existentes
- [ ] Filiais sem matriz continuam funcionando (backward compatible)

---

## 🚨 Riscos & Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Dados existentes sem parent | Alto | Migration preserva branches existentes como independentes |
| Circular reference | Médio | Validação na Service Layer |
| Performance em muitas filiais | Médio | Indexar `parent_branch_id`, usar `join` eficiente |
| Quebrar filtros existentes | Alto | Manter `include_children` como **opcional** (default=false) |

---

## 📈 Estimativas

| Etapa | Tempo | Responsável |
|-------|-------|-------------|
| Migration | 30 min | Backend |
| Model + Schema | 35 min | Backend |
| Repository | 30 min | Backend |
| Service + Validation | 45 min | Backend |
| Routers | 30 min | Backend |
| Tests Backend | 1h | Backend |
| **Subtotal Backend** | **3h 50min** | |
| Frontend Types | 15 min | Frontend |
| Component Hierarquia | 45 min | Frontend |
| Filter Logic | 30 min | Frontend |
| Visual Polish | 30 min | Frontend |
| **Subtotal Frontend** | **2h** | |
| **TOTAL** | **~6 horas** | |

---

## 🎯 Exemplo de Uso

### Cenário: Cliente tem 3 filiais

```
Estrutura:
📍 Matriz Centro (id=1)
   ↳ Filial Zona Sul (id=2)
   ↳ Filial Zona Norte (id=3)
   ↳ Filial Zona Oeste (id=4)
```

### Comportamento:

1. **Usuário seleciona "Matriz Centro"**
2. **Sistema pergunta:** "Incluir filiais?"
3. **Se SIM:**
   - Traz contas a pagar de: Centro + Zona Sul + Zona Norte + Zona Oeste
   - Dashboard mostra: Total consolidado
4. **Se NÃO:**
   - Traz apenas contas da Matriz Centro

---

## 📚 Referências

- `docs/STATUS.md` - Épico 2 (Models atuais)
- `docs/EPIC-3-PLANNING.md` - Frontend planejado
- `backend/app/models/branch.py` - Modelo atual
- `backend/app/models/bill.py` - Relacionamento com Branch

---

## ✨ Próximos Passos

1. ✅ **Revisar este documento**
2. ⏳ **Aprovar feature** (aguardando OK)
3. ⏳ Criar branch `feature/matriz-filial`
4. ⏳ Implementar Backend (Migration → Tests)
5. ⏳ Implementar Frontend
6. ⏳ Code Review
7. ⏳ Deploy

---

**Aguardando aprovação para implementação!** 🚀
