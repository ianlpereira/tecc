# TECC - Épico 1: Fundação ✅

## Status: COMPLETO

Este documento descreve o setup completo da **Épico 1 (Foundation)** do projeto TECC.

---

## O que foi entregue

### 1. Estrutura Monorepo ✅

```
tecc/
├── backend/                 # FastAPI app
├── frontend/                # React + Vite app
├── docker-compose.yml       # Orquestração
├── .env.example
├── .gitignore
├── README.md
└── EPIC-1.md               # Este arquivo
```

### 2. Backend (Python + FastAPI) ✅

**Estrutura de camadas:**
- `routers/` - Endpoints REST
- `services/` - Lógica de negócio
- `repositories/` - Acesso a dados
- `models/` - SQLAlchemy ORM
- `schemas/` - Pydantic v2
- `core/` - Config e database

**Arquivos criados:**
- ✅ `main.py` - FastAPI app com CORS
- ✅ `core/config.py` - Settings com Pydantic Settings
- ✅ `core/database.py` - SQLAlchemy Async + session factory
- ✅ `models/base.py` - BaseModel com timestamps
- ✅ `routers/health.py` - Health check endpoint
- ✅ `requirements.txt` - Todas as dependencies (FastAPI, SQLAlchemy 2.0, Pydantic v2, asyncpg)

**Recursos:**
- ✅ Async/await obrigatório
- ✅ Type safety via type hints
- ✅ Error handling com HTTPException
- ✅ Dependency Injection (FastAPI Depends)
- ✅ CORS configurado

### 3. Frontend (React + TypeScript + Vite) ✅

**Estrutura:**
- `components/` - Componentes React
- `pages/` - Páginas
- `hooks/` - Custom hooks
- `services/` - API client e queries
- `context/` - Zustand stores
- `styles/` - Global + theme

**Arquivos criados:**
- ✅ `vite.config.ts` - Config com hot-reload
- ✅ `tsconfig.json` - Strict mode + path aliases
- ✅ `App.tsx` - Setup inicial com providers
- ✅ `main.tsx` - Entry point
- ✅ `styles/GlobalStyle.ts` - Styled Components global
- ✅ `styles/theme.ts` - Theme com colors, spacing, breakpoints
- ✅ `services/apiClient.ts` - Axios com interceptors
- ✅ `services/queryClient.ts` - TanStack Query config
- ✅ `context/branchStore.ts` - Zustand store para filial (UX crítica)
- ✅ `package.json` - React 18, Vite, TypeScript, Styled Components, Ant Design, React Query

**Recursos:**
- ✅ TypeScript strict mode
- ✅ Styled Components (sem CSS modules/Tailwind)
- ✅ Ant Design para componentes complexos
- ✅ React Hook Form + Zod prontos
- ✅ React Query para server state
- ✅ Zustand para client state
- ✅ Path aliases configurados

### 4. Infraestrutura (Docker) ✅

**docker-compose.yml com 3 serviços:**

1. **PostgreSQL 16 Alpine**
   - ✅ Health check configurado
   - ✅ Volumes persistentes (`postgres_data`)
   - ✅ Variáveis de ambiente

2. **Backend (FastAPI)**
   - ✅ Uvicorn com `--reload`
   - ✅ Volumes para hot-reload
   - ✅ DATABASE_URL apontando para db
   - ✅ Healthcheck dependency

3. **Frontend (Node + Vite)**
   - ✅ Vite dev server
   - ✅ Volumes para hot-reload
   - ✅ Port 5173 exposto
   - ✅ VITE_API_URL configurado

**Recursos:**
- ✅ Hot-reload ativo para backend e frontend
- ✅ Healthchecks para db
- ✅ .env support
- ✅ Arquivo `.dockerignore` otimizado

### 5. Configuração e Documentação ✅

- ✅ `.env.example` com todas as variáveis necessárias
- ✅ `.gitignore` robusto (Python + Node + IDE)
- ✅ `README.md` completo com quick start, arquitetura, stack e guias
- ✅ `Dockerfile` backend (multi-stage ready)
- ✅ `Dockerfile` frontend (multi-stage: dev, build, production)

---

## Como Usar

### 1. Clonar e Preparar

```bash
cd tecc
cp .env.example .env
```

### 2. Iniciar Docker Compose

```bash
docker-compose up
```

Primeira execução pode levar 2-3 minutos (build das imagens).

### 3. Verificar Status

**Backend:**
```bash
curl http://localhost:8000/
curl http://localhost:8000/api/health
```

**Frontend:**
Abra http://localhost:5173 no navegador.

**Swagger API:**
http://localhost:8000/api/docs

### 4. Fazer Alterações

As mudanças no código são refletidas em tempo real:

**Backend:** Edite qualquer arquivo em `backend/app/` → recarrega automaticamente
**Frontend:** Edite qualquer arquivo em `frontend/src/` → HMR

---

## Padrões Implementados

### Backend

✅ **Layered Architecture:**
- Routers recebem requests
- Services contêm lógica
- Repositories acessam DB
- Models são entidades ORM

✅ **Async/Await obrigatório**
```python
async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session
```

✅ **Pydantic v2 com `from_attributes`**
```python
class BaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
```

✅ **Type Hints Completo**
```python
async def list_branches(db: AsyncSession = Depends(get_db)) -> List[BranchSchema]:
    pass
```

✅ **Dependency Injection via FastAPI Depends**
```python
@router.get("/")
async def list_branches(db: AsyncSession = Depends(get_db)):
    pass
```

### Frontend

✅ **Styled Components + Ant Design**
```typescript
// Sem CSS modules, sem Tailwind
import * as S from './styles'
<S.Container>
  <Button type="primary">Ação</Button>
</S.Container>
```

✅ **TypeScript Strict Mode**
- `strict: true` em `tsconfig.json`
- `noUnusedLocals: true`
- `noUnusedParameters: true`

✅ **React Query para Server State**
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['branches'],
  queryFn: () => apiClient.get('/branches')
})
```

✅ **Zustand para Client State**
```typescript
export const useBranchStore = create<BranchStore>(set => ({
  currentBranch: null,
  setCurrentBranch: (branch) => set({ currentBranch: branch })
}))
```

✅ **Theme Context via Styled Components**
```typescript
<ThemeProvider theme={theme}>
  <S.Container>{/* usa theme.colors... */}</S.Container>
</ThemeProvider>
```

---

## Verificação da Setup

Execute isto para validar o setup:

### Backend
```bash
# Verificar imports
docker-compose exec backend python -c "from app.main import app; print('✅ Backend OK')"

# Verificar database connection
docker-compose exec backend python -c "
import asyncio
from app.core.database import engine
async def test(): 
    async with engine.begin() as conn: 
        print('✅ Database OK')
asyncio.run(test())
"
```

### Frontend
```bash
# Verificar build
docker-compose exec frontend npm run type-check
```

---

## Próximos Passos (Épico 2+)

1. **Migrações Alembic** - Schema versionado
2. **Modelos SQLAlchemy** - Branch, Vendor, Category, Bill (com relacionamentos)
3. **Repositórios** - CRUD base para cada modelo
4. **Serviços** - Lógica de negócio (ex: auto-apply branch_id)
5. **Endpoints CRUD** - GET, POST, PUT, DELETE
6. **Autenticação** - JWT com python-jose
7. **Frontend Pages & Components** - BranchSelector no header, formulário de bills, etc.
8. **Testes** - pytest + React Testing Library
9. **CI/CD** - GitHub Actions

---

## Stack Confirmado ✅

| Componente | Tecnologia | Versão |
|-----------|-----------|--------|
| **Python** | Python | 3.11+ |
| **Backend** | FastAPI | 0.104.1 |
| **ORM** | SQLAlchemy | 2.0.23 |
| **Driver DB** | asyncpg | 0.29.0 |
| **Validação** | Pydantic | 2.5.2 |
| **Banco** | PostgreSQL | 16 Alpine |
| **Frontend** | React | 18.2.0 |
| **Build** | Vite | 5.0.8 |
| **Linguagem** | TypeScript | 5.3.3 |
| **Estilo** | Styled Components | 6.1.0 |
| **UI** | Ant Design | 5.11.3 |
| **Roteamento** | React Router | 6.20.0 |
| **Forms** | React Hook Form | 7.48.0 |
| **Validação Forms** | Zod | 3.22.4 |
| **Server State** | TanStack Query | 5.28.0 |
| **Client State** | Zustand | 4.4.1 |
| **HTTP** | Axios | 1.6.2 |
| **Infra** | Docker Compose | Latest |

---

## Observações Importantes

1. **Variáveis de Ambiente:** Copie `.env.example` para `.env` e ajuste conforme necessário
2. **Hot-reload:** Funciona automaticamente, não precisa reiniciar containers
3. **Banco de Dados:** Criado automaticamente no primeiro `docker-compose up`
4. **TypeScript Errors:** São avisos até `npm install` no frontend
5. **Port Conflicts:** Se portas já estão em uso, edite `docker-compose.yml`

---

## Documentação de Referência

- Backend: Veja `instructions.md` seção 2
- Frontend: Veja `instructions.md` seção 3
- DB: Veja `instructions.md` seção 4
- General: Veja `README.md`

---

✅ **Épico 1 (Foundation) COMPLETO!**

Próxima etapa: Criar modelos de dados e endpoints CRUD (Épico 2).
