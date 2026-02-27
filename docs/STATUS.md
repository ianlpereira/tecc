# 📊 Status Projeto - Épicos 1, 2, 3, 4, 5 e Feature Recorrência

> **Última Atualização:** 27 de Fevereiro de 2026

---

## 🚧 FEATURE: Contas Recorrentes (EM DESENVOLVIMENTO)

> **Documentação completa:** `docs/FEATURE-RECORRENCIA.md`  
> **Iniciado em:** 27/02/2026

### Backend

- [x] Model `Bill`: 5 novos campos (`is_recurring`, `recurrence_group_id`, `recurrence_interval_days`, `recurrence_total`, `recurrence_index`)
- [x] Schemas `BillCreate` / `BillResponse`: campos de recorrência adicionados
- [x] Migration Alembic: `b2c3d4e5f6a7_add_recurrence_fields_to_bills.py`
- [x] Repository: `get_by_recurrence_group(group_id)`
- [x] Service `create_bill()`: lógica de geração em loop com UUID de grupo
- [x] Router: endpoint `GET /bills/group/{group_id}`

### Frontend

- [x] `types/index.ts`: campos de recorrência em `Bill` e `BillCreate`
- [x] `api.ts`: método `billApi.getByGroup(groupId)`
- [x] `BillForm`: checkbox "Conta Recorrente" + painel condicional com intervalo e ocorrências
- [x] `Bills/index.tsx`: ícone 🔄 (SyncOutlined) com tooltip na coluna Descrição

**Status: 🚧 EM DESENVOLVIMENTO — Aguardando execução da migration no banco**

---

## 🚧 ÉPICO 5 - UX & Bug Fixes (EM DESENVOLVIMENTO)

> **Documentação completa:** `docs/EPIC-5-PLANNING.md`  
> **Iniciado em:** 27/02/2026

### Sprint 1 — Bugs Críticos

- [x] **F6** — Fix bug: limite de ~2 fornecedores (`vendor_repository.py` + `vendor_service.py`)
- [x] **F5** — Fix bug: e-mail obrigatório no fornecedor (`VendorForm/index.tsx`)
- [x] **F3** — Fix bug: campo valor não aceita decimais pt-BR (`BillForm/index.tsx`)

### Sprint 2 — Dashboard

- [x] **F8** — Dashboard: tabela "Contas de Hoje" (`Dashboard/index.tsx`)
- [x] **F4** — Dashboard: card "Vence Hoje" (`Dashboard/index.tsx`)
- [x] **F9** — Dashboard: botão "Pago" para dar baixa rápida (`Dashboard/index.tsx` + `useBills.ts`)

### Sprint 3 — Features de Produtividade

- [x] **F1** — Múltiplas matrizes: removida restrição de 1 HQ (`branch_service.py`)
- [x] **F2** — Botão Duplicar em Contas a Pagar e Fornecedores

### Sprint 4 — UX Polish

- [x] **F7** — Pesquisa de fornecedor melhorada no BillForm (`optionFilterProp`, `notFoundContent`, placeholder)

**Status: ✅ CONCLUÍDO — 27/02/2026**

---

## ✅ ÉPICO 1 - Completado com Sucesso (Foundation)

### Estrutura de Pastas
- [x] Monorepo `/backend` e `/frontend` criado
- [x] Subdiretorios com arquitetura em camadas

### Backend
- [x] `main.py` - FastAPI app
- [x] `core/config.py` - Pydantic Settings
- [x] `core/database.py` - SQLAlchemy 2.0 Async
- [x] `models/base.py` - BaseModel com timestamps
- [x] `routers/health.py` - Health check
- [x] `requirements.txt` - Todas as dependências
- [x] `Dockerfile` - Multi-stage otimizado

### Frontend
- [x] `vite.config.ts` - Vite com hot-reload
- [x] `tsconfig.json` - TypeScript strict mode
- [x] `App.tsx` - Setup com providers
- [x] `main.tsx` - Entry point
- [x] `styles/GlobalStyle.ts` - Styled Components
- [x] `styles/theme.ts` - Theme centralizado
- [x] `services/apiClient.ts` - Axios com interceptors
- [x] `services/queryClient.ts` - React Query config
- [x] `context/branchStore.ts` - Zustand store
- [x] `package.json` - Stack completo
- [x] `Dockerfile` - Multi-stage otimizado (mudado para slim)

### Configuração
- [x] `docker-compose.yml` - PostgreSQL + Backend + Frontend (versão removida)
- [x] `.env.example` - Variáveis de ambiente
- [x] `.gitignore` - Python + Node + IDE
- [x] `README.md` - Documentação completa
- [x] `EPIC-1.md` - Resumo da fase

### Correções Feitas

#### 1. Frontend Dockerfile
**Problema:** `package-lock.json` não existe ainda
**Solução:** Mudado para `npm install` (sem `--ci`) após copiar `package.json`

#### 2. Docker Compose Version
**Problema:** `version: '3.8'` é obsoleto no Compose v2+
**Solução:** Removido, Compose detecta automaticamente

#### 3. Node Alpine Issue
**Problema:** Node 20-alpine tinha erro `exec format error`
**Solução:** Mudado para `node:20-slim` (mais robusto)

---

## ✅ ÉPICO 2 - Completado com Sucesso (Backend)

### Models & Repositories
- [x] `models/branch.py` - Modelo de Filiais
- [x] `models/vendor.py` - Modelo de Fornecedores
- [x] `models/category.py` - Modelo de Categorias
- [x] `models/bill.py` - Modelo de Contas a Pagar (com BillStatus enum)
- [x] `repositories/base.py` - Repository base genérico
- [x] `repositories/branch_repository.py`
- [x] `repositories/vendor_repository.py`
- [x] `repositories/category_repository.py`
- [x] `repositories/bill_repository.py`

### Services & Schemas
- [x] `services/branch_service.py`
- [x] `services/vendor_service.py`
- [x] `services/category_service.py`
- [x] `services/bill_service.py`
- [x] `schemas/branch.py`
- [x] `schemas/vendor.py`
- [x] `schemas/category.py`
- [x] `schemas/bill.py`

### Routers (16 endpoints)
- [x] `routers/branches.py` - 5 endpoints CRUD
- [x] `routers/vendors.py` - 5 endpoints CRUD
- [x] `routers/categories.py` - 5 endpoints CRUD
- [x] `routers/bills.py` - 5 endpoints CRUD (com filtros)

---

## ✅ ÉPICO 3 - Completado com Sucesso (Frontend)

### Tipos & Serviços (Fase 3.1)
- [x] `src/types/index.ts` - Interfaces TypeScript
- [x] `src/services/api.ts` - Funções CRUD para API

### Custom Hooks (Fase 3.1)
- [x] `src/hooks/useBranches.ts` - React Query hook
- [x] `src/hooks/useVendors.ts` - React Query hook
- [x] `src/hooks/useCategories.ts` - React Query hook
- [x] `src/hooks/useBills.ts` - React Query hook

### Componentes UI (Fase 3.2 + 3.4)
- [x] `src/components/Layout/` - Header, Sidebar, Layout
- [x] `src/components/Card/` - Card wrapper
- [x] `src/components/BranchSelector/` - Dropdown de filiais
- [x] `src/components/BranchForm/` - Formulário com validação
- [x] `src/components/VendorForm/` - Formulário com validação
- [x] `src/components/CategoryForm/` - Formulário com validação
- [x] `src/components/BillForm/` - Formulário completo com validação

### Pages (Fase 3.3)
- [x] `src/pages/Dashboard/` - Dashboard com estatísticas
- [x] `src/pages/Branches/` - CRUD completo de Filiais
- [x] `src/pages/Vendors/` - CRUD completo de Fornecedores
- [x] `src/pages/Categories/` - CRUD completo de Categorias
- [x] `src/pages/Bills/` - CRUD completo de Contas
- [x] `src/pages/NotFound/` - Página 404

### Routing (Fase 3.5)
- [x] `src/App.tsx` - Rotas configuradas com React Router
- [x] Navegação via Sidebar
- [x] Rota principal redirects para Dashboard

---

## 🚀 Aplicação em Funcionamento

### Acessos
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:8000
- **API Docs:** http://localhost:8000/api/docs

### Comandos Docker
```bash
# Iniciar containers
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Parar containers
docker-compose down

# Executar migrations (se necessário)
docker exec tecc_backend alembic upgrade head
```

---

## ✅ ÉPICO 2 - Completado com Sucesso (Backend Models & Endpoints)

### Fase 2.1: Migrations & Models ✅
- [x] Alembic inicializado
- [x] alembic/env.py configurado com DATABASE_URL
- [x] Modelos criados:
  - [x] `app/models/branch.py` - Filiais
  - [x] `app/models/vendor.py` - Fornecedores
  - [x] `app/models/category.py` - Categorias
  - [x] `app/models/bill.py` - Contas a Pagar (com enum BillStatus)
- [x] Migration automática criada
- [x] Migration aplicada ao banco de dados

### Fase 2.2: Repositories & Services ✅
- [x] Base repository genérico criado (`app/repositories/base.py`)
- [x] Repositories CRUD:
  - [x] `app/repositories/branch_repository.py`
  - [x] `app/repositories/vendor_repository.py`
  - [x] `app/repositories/category_repository.py`
  - [x] `app/repositories/bill_repository.py`
- [x] Services com lógica de negócio:
  - [x] `app/services/branch_service.py`
  - [x] `app/services/vendor_service.py`
  - [x] `app/services/category_service.py`
  - [x] `app/services/bill_service.py`

### Fase 2.3: Schemas Pydantic ✅
- [x] Schemas Create/Update/Response:
  - [x] `app/schemas/branch.py` - BranchCreate, BranchUpdate, BranchResponse
  - [x] `app/schemas/vendor.py` - VendorCreate, VendorUpdate, VendorResponse
  - [x] `app/schemas/category.py` - CategoryCreate, CategoryUpdate, CategoryResponse
  - [x] `app/schemas/bill.py` - BillCreate, BillUpdate, BillResponse

### Fase 2.4: Routers & Endpoints ✅
- [x] Routers REST com GET, POST, PUT, DELETE:
  - [x] `app/routers/branches.py`
  - [x] `app/routers/vendors.py`
  - [x] `app/routers/categories.py`
  - [x] `app/routers/bills.py`
- [x] Error handling com HTTPException
- [x] Todos os routers integrados em `app/main.py`

### Endpoints Funcionais ✅
- ✅ `GET /api/v1/branches` - Listar filiais
- ✅ `POST /api/v1/branches` - Criar filial
- ✅ `GET /api/v1/branches/{id}` - Obter filial
- ✅ `PUT /api/v1/branches/{id}` - Atualizar filial
- ✅ `DELETE /api/v1/branches/{id}` - Deletar filial
- ✅ (Idem para vendors, categories, bills)

**Status:** ✅ **PRONTO PARA USO**

---

## 📋 ÉPICO 3 - Planejamento Detalhado (Frontend)

**Arquivo:** `EPIC-3-PLANNING.md` (criado)

### Fase 3.1: Setup de Hooks & Services (P0 - CRÍTICO)
- [ ] React Query setup e instância
- [ ] Custom hooks:
  - [ ] useBranches()
  - [ ] useVendors()
  - [ ] useCategories()
  - [ ] useBills()
- [ ] API Client utilities melhorados

### Fase 3.2: Componentes UI (P1 - MVP)
- [ ] BranchSelector - Dropdown de filiais
- [ ] BranchForm - Formulário CRUD
- [ ] VendorSelector - Dropdown de fornecedores
- [ ] BillForm - Formulário de contas
- [ ] BillTable - Tabela paginada

### Fase 3.3: Pages (P0 - CRÍTICO)
- [ ] Dashboard - Home com estatísticas
- [ ] Branches - Gestão de filiais
- [ ] Vendors - Gestão de fornecedores
- [ ] Categories - Gestão de categorias
- [ ] Bills - Gestão de contas (PRINCIPAL)
- [ ] NotFound - Página 404

### Fase 3.4: Styling & Layout (P1 - MVP)
- [ ] Theme refinamento
- [ ] Componentes styled (Layout, Card, Button, Input, Modal)
- [ ] Responsive design

### Fase 3.5: Routing & Navigation (P0 - CRÍTICO)
- [ ] React Router setup
- [ ] Rotas principais
- [ ] Sidebar com navegação
- [ ] Active route highlighting

### Fase 3.6: Testes & QA (P2 - POLISH)
- [ ] Vitest + React Testing Library setup
- [ ] Testes para hooks
- [ ] Testes para componentes
- [ ] Coverage 70%+

**Estimativa:** 26-34 horas de trabalho  
**Status:** 📋 Pronto para iniciar  
**Prioridade:** ALTA

---

## 📊 Resumo Geral

| Épico | Status | Fases | Estimativa |
| ----- | ------ | ----- | ---------- |
| 1 - Foundation | ✅ **CONCLUÍDO** | 1/1 | ~8h |
| 2 - Backend | ✅ **CONCLUÍDO** | 4/4 | ~15h |
| 3 - Frontend | ✅ **CONCLUÍDO** | 6/6 | ~26-34h |
| 4 - Hierarquia Matriz-Filial | ✅ **CONCLUÍDO** | Full-Stack | ~8h |

**Total Projeto:** ~57-65 horas  
**Status Atual:** Sistema completo e funcional com hierarquia de filiais

---

## ✅ ÉPICO 4 - Sistema de Hierarquia Matriz-Filial (CONCLUÍDO)

### Objetivo
Permitir associação de filiais a uma matriz, com filtragem consolidada de contas.

### Funcionalidades Implementadas
- [x] Modelo de dados com `parent_branch_id`
- [x] Relacionamentos self-referential no SQLAlchemy
- [x] Validações de hierarquia no backend
- [x] Endpoints para consulta de hierarquia
- [x] Migração de banco de dados
- [x] Interface de seleção de matriz no formulário
- [x] BranchSelector com visual hierárquico (📍 ↳)
- [x] Filtro consolidado com checkbox "Incluir filiais"
- [x] Integração completa frontend-backend
- [x] TypeScript build sem erros

### Componentes Modificados

#### Backend (9 arquivos)
- `models/branch.py` - parent_branch_id + relationships
- `schemas/branch.py` - BranchWithChildren
- `repositories/branch_repository.py` - get_children, get_with_children
- `repositories/bill_repository.py` - get_by_branches
- `services/branch_service.py` - validate_hierarchy
- `services/bill_service.py` - include_children logic
- `routers/branches.py` - /children, /with-children endpoints
- `routers/bills.py` - include_children query param
- `alembic/versions/a1b2c3d4e5f6_add_parent_branch_hierarchy.py`

#### Frontend (9 arquivos)
- `types/index.ts` - BranchWithChildren interface
- `services/api.ts` - hierarchy API methods
- `hooks/useBranches.ts` - includeHierarchy + new hooks
- `hooks/useBills.ts` - branchId + includeChildren params
- `context/branchStore.ts` - includeChildren state
- `components/BranchSelector/index.tsx` - visual hierarchy
- `components/BranchForm/index.tsx` - parent branch select
- `pages/Bills/index.tsx` - consolidated filtering
- `pages/Dashboard/index.tsx` - hierarchical stats

### Validações
1. ✅ Matriz não pode ter pai
2. ✅ Filial só pode ter matriz como pai
3. ✅ Previne ciclos na hierarquia
4. ✅ TypeScript strict mode compliance

### Status da Migração
```bash
Migration ID: a1b2c3d4e5f6_add_parent_branch_hierarchy
Status: Applied (head)
```

### Documentação
- `FEATURE-MATRIZ-FILIAL.md` - Especificação técnica completa
- `EPIC-4-COMPLETE.md` - Documentação de conclusão com checklist

---

## 🎯 Arquitetura Completa

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                     │
│  Pages → Components → Hooks → Services → API Client    │
│         [Hierarquia Visual com 📍 ↳]                    │
├─────────────────────────────────────────────────────────┤
│                 Backend (FastAPI)                       │
│  Routers → Services → Repositories → Models            │
│       [Validação de Hierarquia + Filtragem]            │
├─────────────────────────────────────────────────────────┤
│              Database (PostgreSQL)                      │
│  Branches (parent_branch_id) | Vendors | Categories    │
│              Bills (branch_id FK)                       │
└─────────────────────────────────────────────────────────┘
```

---

**Última Atualização:** 2024 - Épico 4 Completo ✅

---

## 📝 Resumo

| Item | Status |
|------|--------|
| Código Backend | ✅ 100% |
| Código Frontend | ✅ 100% |
| Docker Compose | ✅ 100% |
| Config/Env | ✅ 100% |
| Documentação | ✅ 100% |
| Hierarquia Matriz-Filial | ✅ 100% |
| **Sistema Completo** | ✅ **FUNCIONANDO** |

**Próximos Passos Sugeridos:**
1. Testes manuais do fluxo completo
2. Validação de UX com usuários
3. Considerar melhorias futuras (ver EPIC-4-COMPLETE.md)

