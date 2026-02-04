# ✨ Épico 2 - Planning (Próximos Passos)

## 📋 Épico 2: Modelos & Endpoints CRUD

Quando Docker estiver funcionando, começaremos a implementação de dados.

### Fase 2.1: Migrations & Models

**Objetivo:** Criar schema do banco com Alembic

Tasks:
- [ ] Inicializar Alembic: `alembic init alembic`
- [ ] Configurar `alembic.ini` com DATABASE_URL
- [ ] Criar modelos em `app/models/`:
  - [ ] `branch.py` - Filiais
  - [ ] `vendor.py` - Fornecedores
  - [ ] `category.py` - Categorias
  - [ ] `bill.py` - Contas a Pagar
- [ ] Criar migration inicial: `alembic revision --autogenerate -m "initial"`
- [ ] Testar upgrade: `alembic upgrade head`

**Arquivos a criar:**
```
backend/
├── alembic/
│   ├── versions/
│   │   └── 001_initial.py
│   └── env.py
├── app/models/
│   ├── branch.py
│   ├── vendor.py
│   ├── category.py
│   └── bill.py
└── alembic.ini
```

### Fase 2.2: Repositories & Services

**Objetivo:** Implementar acesso a dados e lógica

Tasks:
- [ ] Criar repositórios em `app/repositories/`:
  - [ ] `branch_repository.py` - CRUD Branch
  - [ ] `vendor_repository.py` - CRUD Vendor
  - [ ] `category_repository.py` - CRUD Category
  - [ ] `bill_repository.py` - CRUD Bill
- [ ] Criar serviços em `app/services/`:
  - [ ] `branch_service.py` - Lógica Branch
  - [ ] `vendor_service.py` - Lógica Vendor
  - [ ] `category_service.py` - Lógica Category
  - [ ] `bill_service.py` - Lógica Bill + auto-apply branch_id
- [ ] Implementar padrão genérico para CRUD

**Padrão esperado:**

```python
# app/repositories/branch_repository.py
class BranchRepository:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_all(self) -> List[Branch]:
        pass
    
    async def get_by_id(self, id: int) -> Branch:
        pass
    
    async def create(self, schema: BranchCreate) -> Branch:
        pass
    
    # ... update, delete

# app/services/branch_service.py
class BranchService:
    def __init__(self, repository: BranchRepository):
        self.repository = repository
    
    async def list_branches(self) -> List[BranchResponse]:
        pass
    
    # ... lógica de negócio
```

### Fase 2.3: Schemas Pydantic

**Objetivo:** Definir DTOs Request/Response

Tasks:
- [ ] Criar schemas em `app/schemas/`:
  - [ ] `branch.py` - BranchCreate, BranchUpdate, BranchResponse
  - [ ] `vendor.py` - VendorCreate, VendorUpdate, VendorResponse
  - [ ] `category.py` - CategoryCreate, CategoryUpdate, CategoryResponse
  - [ ] `bill.py` - BillCreate, BillUpdate, BillResponse

**Padrão esperado:**

```python
# app/schemas/branch.py
class BranchBase(BaseSchema):
    name: str
    is_headquarters: bool = False

class BranchCreate(BranchBase):
    pass

class BranchUpdate(BranchBase):
    pass

class BranchResponse(BranchBase):
    id: int
    created_at: datetime
    updated_at: datetime
```

### Fase 2.4: Routers & Endpoints

**Objetivo:** Criar endpoints REST com validação

Tasks:
- [ ] Criar routers em `app/routers/`:
  - [ ] `branches.py` - GET, POST, PUT, DELETE
  - [ ] `vendors.py` - GET, POST, PUT, DELETE
  - [ ] `categories.py` - GET, POST, PUT, DELETE
  - [ ] `bills.py` - GET, POST, PUT, DELETE + auto-branch_id
- [ ] Implementar error handling com HTTPException
- [ ] Incluir todos em `app/main.py`

**Padrão esperado:**

```python
# app/routers/branches.py
router = APIRouter(prefix="/api/v1/branches", tags=["branches"])

@router.get("/", response_model=List[BranchResponse])
async def list_branches(db: AsyncSession = Depends(get_db)):
    service = BranchService(BranchRepository(db))
    return await service.list_branches()

@router.post("/", response_model=BranchResponse)
async def create_branch(
    schema: BranchCreate,
    db: AsyncSession = Depends(get_db)
):
    service = BranchService(BranchRepository(db))
    return await service.create_branch(schema)

# ... get_by_id, update, delete
```

### Fase 2.5: Testes

**Objetivo:** Garantir qualidade

Tasks:
- [ ] Criar testes em `backend/tests/`:
  - [ ] `test_branch_repository.py`
  - [ ] `test_branch_service.py`
  - [ ] `test_branch_router.py`
- [ ] Configurar pytest com asyncio
- [ ] Coverage target: 80%+

---

## 🎯 Fase 3: Frontend (Paralelo/Após Endpoints)

### Fase 3.1: Setup de Hooks & Services

Tasks:
- [ ] Criar custom hooks em `src/hooks/`:
  - [ ] `useBranches()` - Query branches
  - [ ] `useVendors()` - Query vendors
  - [ ] `useCategories()` - Query categories
  - [ ] `useBills()` - Query bills (com paginação)
- [ ] Criar mutations em `src/services/`:
  - [ ] `createBranch()`, `updateBranch()`, etc.
  - [ ] Integrar com React Query

### Fase 3.2: Componentes UI

Tasks:
- [ ] `BranchSelector` - Header com seletor de filial
- [ ] `BranchForm` - Formulário CRUD
- [ ] `VendorSelector` - Dropdown de fornecedores
- [ ] `BillForm` - Formulário lançamento contas
- [ ] `BillTable` - Tabela de contas com paginação

### Fase 3.3: Pages

Tasks:
- [ ] `pages/Dashboard.tsx` - Home
- [ ] `pages/Branches.tsx` - Gestão filiais
- [ ] `pages/Vendors.tsx` - Gestão fornecedores
- [ ] `pages/Bills.tsx` - Gestão contas a pagar
- [ ] `pages/NotFound.tsx` - 404

---

## 📊 Estimativa de Tempo

| Fase | Tarefas | Tempo |
| ---- | ------- | ----- |
| 2.1 Migrations | 5 tasks | 2-3h |
| 2.2 Repositories | 6 tasks | 4-5h |
| 2.3 Schemas | 4 tasks | 1-2h |
| 2.4 Routers | 6 tasks | 3-4h |
| 2.5 Testes | 3 tasks | 2-3h |
| **TOTAL BACKEND** | **24 tasks** | **~15-17h** |
| 3.1 Hooks | 4 tasks | 2-3h |
| 3.2 Componentes | 5 tasks | 5-6h |
| 3.3 Pages | 5 tasks | 4-5h |
| **TOTAL FRONTEND** | **14 tasks** | **~11-14h** |
| **TOTAL ÉPICO 2** | **38 tasks** | **~26-31h** |

---

## 🚀 Prioridade

1. **Alta:** Migrações + Modelos (sem isso, nada funciona)
2. **Alta:** Repositories base (data access é crítico)
3. **Alta:** Endpoints CRUD (necessário para frontend)
4. **Média:** Testes (qualidade)
5. **Média:** Frontend (UI)

---

## 📝 Checklist Pré-Épico 2

Antes de começar, confirme:

- [ ] Docker funcionando (`docker-compose up -d --build`)
- [ ] Frontend acessível em `http://localhost:5173`
- [ ] Backend acessível em `http://localhost:8000`
- [ ] Swagger UI em `http://localhost:8000/api/docs`
- [ ] Database conectado (health check)
- [ ] Hot-reload funcionando (editar arquivo = recarrega)

---

## 🔗 Referências

- SQLAlchemy 2.0 Docs: https://docs.sqlalchemy.org/
- FastAPI Tutorial: https://fastapi.tiangolo.com/
- Alembic: https://alembic.sqlalchemy.org/
- React Query: https://tanstack.com/query/
- Zod: https://zod.dev/

---

**Status:** Planejado para próxima execução  
**Prioridade:** ALTA  
**Início estimado:** Assim que Docker funcionar ✅
