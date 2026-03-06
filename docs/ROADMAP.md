# 🚀 TECC - Projeto Full Stack (Status & Roadmap)

## 📊 Visão Geral

**TECC** é uma aplicação full-stack para gestão de contas a pagar e filiais.

- **Backend:** FastAPI + SQLAlchemy 2.0 + PostgreSQL
- **Frontend:** React 18 + TypeScript + Styled Components
- **DevOps:** Docker + Docker Compose + Alembic

---

## ✅ Épico 7: Controle de Frota de Veículos (COMPLETO)

**Status:** ✅ **DONE** — Concluído em 06/03/2026
**Documentação:** `docs/EPIC-7-VEHICLES.md`

### O que foi implementado:
- ✅ **Backend** — Tabela `vehicles` (placa única, marca, modelo, ano, filial, obs)
- ✅ **Backend** — FK `vehicle_id` nullable em `bills`
- ✅ **Backend** — CRUD completo `/api/v1/vehicles` + endpoint aninhado `/{id}/bills`
- ✅ **Backend** — `BillService.create_bill()` aceita `vehicle_id`; `get_bills_by_vehicle()`
- ✅ **Backend** — Migration `0f1f3b804c93` aplicada
- ✅ **Frontend** — `VehiclesPage` com tabela CRUD + modal de formulário + modal de detalhe (Tabs: Contas / Informações)
- ✅ **Frontend** — `BillForm` com campo Veículo opcional
- ✅ **Frontend** — Menu lateral com item "Veículos" e rota `/vehicles`

---

**Status:** ✅ **DONE** — Concluído em 01/03/2026  
**Documentação:** `docs/EPIC-6-PLANNING.md`

### F1 — Anexar Arquivos a Contas
- ✅ **Backend** — Tabela `bill_attachments` (base64, max 5MB, max 3 por conta)
- ✅ **Backend** — Endpoints: upload multipart, list, download blob, delete
- ✅ **Frontend** — Componente `<BillAttachments>` com dragger AntD, lista download/excluir
- ✅ **Frontend** — Seção "Anexos" no `BillForm` ao editar; badge 📎 na listagem

### F2 — Banco ao Marcar como Pago
- ✅ **Backend** — Campos `payment_bank` + `paid_at` em `bills`; `POST /mark-paid` com corpo opcional
- ✅ **Frontend** — Botão "Pago" no Dashboard abre modal com seletor de banco + datepicker

### F3 — Recorrência por Dia Fixo do Mês
- ✅ **Backend** — Campo `recurrence_day_of_month`; service usa `relativedelta` para gerar datas exatas
- ✅ **Frontend** — `BillForm`: radio "Intervalo" vs "Dia fixo do mês" + preview dinâmico

### F4 — Filtros Avançados em Contas a Pagar
- ✅ **Frontend** — 4 filtros independentes: Status, Categoria, Fornecedor, Filial + "Limpar Filtros" + contador

### ⚡ Deploy
- ✅ Migration `c3d4e5f6a7b8_epic6_fields.py` criada
- ⏳ Executar: `docker compose exec backend alembic upgrade head`

---

**Status:** 🚧 **IN PROGRESS** — Iniciado em 27/02/2026  
**Documentação:** `docs/FEATURE-RECORRENCIA.md`

### O que foi implementado:
- ✅ **Backend** — 5 novos campos no model `Bill` (`is_recurring`, `recurrence_group_id`, `recurrence_interval_days`, `recurrence_total`, `recurrence_index`)
- ✅ **Backend** — Schemas `BillCreate`/`BillResponse` com campos de recorrência
- ✅ **Backend** — Migration Alembic `b2c3d4e5f6a7`
- ✅ **Backend** — `BillService.create_bill()` gera N contas em loop com UUID de grupo
- ✅ **Backend** — `GET /bills/group/{group_id}` para listar ocorrências do grupo
- ✅ **Frontend** — `types/index.ts` com campos de recorrência em `Bill` e `BillCreate`
- ✅ **Frontend** — `billApi.getByGroup()` em `api.ts`
- ✅ **Frontend** — `BillForm`: checkbox "Conta Recorrente" + painel condicional com preview
- ✅ **Frontend** — `Bills/index.tsx`: ícone 🔄 com tooltip em contas recorrentes

### Pendente:
- ⏳ Executar migration: `docker compose exec backend alembic upgrade head`

---

## ✅ Épico 5: UX & Bug Fixes (COMPLETO)

**Status:** ✅ **DONE** — Concluído em 27/02/2026  
**Documentação:** `docs/EPIC-5-PLANNING.md`

### Bugs Corrigidos:
- ✅ **F6** — Fix bug: limite de ~2 fornecedores (guard `email NULL` no repository + service)
- ✅ **F5** — Fix bug: e-mail obrigatório no fornecedor (Zod schema reescrito)
- ✅ **F3** — Fix bug: campo valor não aceita decimais pt-BR (`decimalSeparator`, `formatter`/`parser` corrigidos)

### Dashboard Melhorado:
- ✅ **F8** — Tabela "Contas de Hoje" (substituiu "Últimas Lançadas") com colunas: Filial | Categoria | Fornecedor | Descrição | Valor | Status
- ✅ **F4** — Card KPI "Vence Hoje" adicionado (5 cards no total)
- ✅ **F9** — Botão "Pago" com confirmação para dar baixa rápida diretamente no Dashboard

### Features de Produtividade:
- ✅ **F1** — Múltiplas Matrizes: removida restrição de 1 HQ por sistema
- ✅ **F2** — Botão Duplicar (🗒️) em Contas a Pagar e Fornecedores

### UX Polish:
- ✅ **F7** — Pesquisa de fornecedor: `optionFilterProp`, placeholder e `notFoundContent` melhorados

---

## ✅ Épico 1: Foundation (COMPLETO)

**Status:** ✅ **DONE** - Docker e infraestrutura funcionando

### O que foi feito:
- ✅ Estrutura monorepo (`/backend` + `/frontend`)
- ✅ FastAPI com padrão em camadas
- ✅ React 18 com TypeScript + Styled Components
- ✅ PostgreSQL 16 com Docker Compose
- ✅ Documentação completa

### Resultado:
```
docker-compose up -d --build
Frontend: http://localhost:5173 ✅
Backend:  http://localhost:8000 ✅
Docs:     http://localhost:8000/api/docs ✅
DB:       postgres://localhost:5432 ✅
```

---

## ✅ Épico 2: Backend Models & CRUD (COMPLETO)

**Status:** ✅ **DONE** - Todos os endpoints funcionando

### Arquitetura Implementada:

```
API Layer (Routers)
    ↓
Service Layer (Business Logic)
    ↓
Repository Layer (Data Access)
    ↓
Models Layer (SQLAlchemy ORM)
    ↓
Database (PostgreSQL)
```

### Models Criados:
- `Branch` - Filiais/Lojas
- `Vendor` - Fornecedores
- `Category` - Categorias de Despesa
- `Bill` - Contas a Pagar (com status enum)

### Endpoints Implementados (16 total):

**Branches:**
- `GET /api/v1/branches` - Lista
- `POST /api/v1/branches` - Criar
- `GET /api/v1/branches/{id}` - Detalhe
- `PUT /api/v1/branches/{id}` - Atualizar
- `DELETE /api/v1/branches/{id}` - Deletar

**Vendors:** (5 endpoints idênticos)
**Categories:** (5 endpoints idênticos)
**Bills:** (5 endpoints idênticos)

### Teste de Funcionamento:
```bash
# Criar branch
curl -X POST http://localhost:8000/api/v1/branches \
  -H "Content-Type: application/json" \
  -d '{"name": "São Paulo", "is_headquarters": true}'

# Listar
curl http://localhost:8000/api/v1/branches
```

### Resultado:
✅ Todos os CRUD funcionando  
✅ Migrations automáticas  
✅ Validação de dados  
✅ Error handling  

---

## ✅ Épico 3: Frontend (COMPLETO)

**Status:** ✅ **DONE** - Implementação completa realizada em 30/01/2026

### Objetivo:
Implementar interface React completa para consumir os endpoints backend.

### Fases Planejadas:

| Fase | Nome | Tarefas | Tempo | Status |
|------|------|---------|-------|--------|
| 3.1 | Hooks & Services | 8 | 3-4h | ✅ DONE |
| 3.2 | Componentes UI | 5 | 6-8h | ✅ DONE |
| 3.3 | Pages | 6 | 6-8h | ✅ DONE |
| 3.4 | Styling & Layout | 7 | 4-5h | ✅ DONE |
| 3.5 | Routing | 5 | 2-3h | ✅ DONE |
| 3.6 | Testes | 10 | 5-6h | 📋 TODO |
| **TOTAL** | | **41** | **26-34h** | **95%** |

### Componentes a Implementar:

**Hooks:**
- useBranches()
- useVendors()
- useCategories()
- useBills()

**Componentes:**
- BranchSelector
- BranchForm
- VendorSelector
- BillForm
- BillTable
- Layout, Card, Button, Input, Modal

**Pages:**
- Dashboard
- Bills (PÁGINA PRINCIPAL)
- Branches
- Vendors
- Categories
- NotFound

**Routing:**
- `/` → Dashboard
- `/bills` → Bills
- `/branches` → Branches
- `/vendors` → Vendors
- `/categories` → Categories

### Ferramentas:
- React Query (já instalado)
- React Router (já instalado)
- Zod (já instalado)
---

## ✅ ÉPICO 4: Feature Matriz-Filial (COMPLETO)

**Status:** ✅ **DONE** - Implementado e testado

### Objetivo:
Implementar hierarquia entre Matriz e Filiais, permitindo filtrar dados consolidados por matriz.

### Escopo Realizado:
- ✅ **Backend:** Relacionamento hierárquico no modelo `Branch` com `parent_branch_id`
- ✅ **Frontend:** Interface para visualizar hierarquia e filtrar por matriz+filiais
- ✅ **Filtros:** Consolidação de dados de bills por matriz incluindo filiais
- ✅ **Validações:** Regras de integridade hierárquica implementadas
- ✅ **UX:** Visual com ícones 📍 (matriz) e ↳ (filial) + checkbox "Incluir filiais"

### Tempo Real:
- **Backend:** ~4 horas
- **Frontend:** ~3 horas
- **Debug & Polish:** ~1 hora
- **Total:** ~8 horas

### Documentação:
📄 **`FEATURE-MATRIZ-FILIAL.md`** - Especificação completa  
📄 **`EPIC-4-COMPLETE.md`** - Documentação de conclusão

### Status Técnico:
- ✅ Migration criada (`a1b2c3d4e5f6_add_parent_branch_hierarchy`)
- ✅ Model atualizado com relationships
- ✅ Repository implementado (get_children, get_with_children)
- ✅ Service com validações (validate_hierarchy)
- ✅ Endpoints novos (/children, /with-children)
- ✅ Frontend com hierarquia visual
- ✅ Filtro consolidado funcional
- ✅ TypeScript build sem erros
- ✅ Docker Compose funcionando

**Implementação completa e pronta para uso!**

---

## 🎯 Resumo Executivo

```
┌────────────────────────────────────────────────┐
│           TECC - Full Stack App                │
├────────────────────────────────────────────────┤
│                                                │
│  ✅ ÉPICO 1: Foundation          COMPLETO    │
│     └─ Infrastructure & Setup                 │
│                                                │
│  ✅ ÉPICO 2: Backend            COMPLETO    │
│     └─ Models, Repositories, Services, APIs   │
│                                                │
│  ✅ ÉPICO 3: Frontend           COMPLETO    │
│     └─ Hooks, Components, Pages, Routing      │
│                                                │
│  ✅ ÉPICO 4: Matriz-Filial      COMPLETO    │
│     └─ Hierarquia + Filtro Consolidado        │
│                                                │
├────────────────────────────────────────────────┤
│  Total Estimado: 49-57 horas (base)           │
│  Feature Matriz-Filial: +8 horas              │
│  Status Atual: 100% COMPLETO ✅               │
│  Próximo: Deploy em produção ou novas features│
└────────────────────────────────────────────────┘
```

---

## 📂 Estrutura de Arquivos (Estado Atual)

```
tecc/
├── backend/
│   ├── app/
│   │   ├── models/          ✅ COMPLETO
│   │   │   ├── base.py
│   │   │   ├── branch.py
│   │   │   ├── vendor.py
│   │   │   ├── category.py
│   │   │   └── bill.py
│   │   ├── repositories/    ✅ COMPLETO
│   │   │   ├── base.py
│   │   │   ├── branch_repository.py
│   │   │   ├── vendor_repository.py
│   │   │   ├── category_repository.py
│   │   │   └── bill_repository.py
│   │   ├── services/        ✅ COMPLETO
│   │   │   ├── branch_service.py
│   │   │   ├── vendor_service.py
│   │   │   ├── category_service.py
│   │   │   └── bill_service.py
│   │   ├── schemas/         ✅ COMPLETO
│   │   │   ├── base.py
│   │   │   ├── branch.py
│   │   │   ├── vendor.py
│   │   │   ├── category.py
│   │   │   └── bill.py
│   │   ├── routers/         ✅ COMPLETO
│   │   │   ├── health.py
│   │   │   ├── branches.py
│   │   │   ├── vendors.py
│   │   │   ├── categories.py
│   │   │   └── bills.py
│   │   ├── core/            ✅ COMPLETO
│   │   │   ├── config.py
│   │   │   └── database.py
│   │   └── main.py          ✅ COMPLETO
│   ├── alembic/             ✅ COMPLETO
│   │   ├── versions/
│   │   │   └── bd8ab0f9fcbf_initial_schema.py
│   │   └── env.py
│   ├── requirements.txt     ✅ COMPLETO
│   └── Dockerfile           ✅ COMPLETO
│
├── frontend/
│   ├── src/
│   │   ├── components/      📋 TODO (Phase 3.2)
│   │   ├── hooks/           📋 TODO (Phase 3.1)
│   │   ├── pages/           📋 TODO (Phase 3.3)
│   │   ├── routes/          📋 TODO (Phase 3.5)
│   │   ├── context/         ✅ branchStore.ts
│   │   ├── services/        ✅ apiClient.ts, queryClient.ts
│   │   ├── styles/          ✅ theme.ts, GlobalStyle.ts
│   │   ├── App.tsx          ✅ COMPLETO
│   │   └── main.tsx         ✅ COMPLETO
│   ├── package.json         ✅ COMPLETO
│   ├── vite.config.ts       ✅ COMPLETO
│   └── Dockerfile           ✅ COMPLETO
│
├── docker-compose.yml       ✅ COMPLETO
├── .env                     ✅ CONFIGURADO
├── .gitignore               ✅ COMPLETO
├── README.md                ✅ COMPLETO
├── STATUS.md                ✅ ATUALIZADO
├── EPIC-1.md                ✅ COMPLETO
├── EPIC-2-PLANNING.md       ✅ COMPLETO (agora histórico)
├── EPIC-3-PLANNING.md       ✅ CRIADO (detalhado)
└── EPIC-3-SUMMARY.md        ✅ CRIADO (quick ref)
```

---

## 🔄 Workflow de Desenvolvimento

### Para Backend (Épico 2 - CONCLUÍDO):
```bash
# 1. Criar modelo em app/models/
# 2. Executar migration: alembic revision --autogenerate
# 3. Aplicar migration: alembic upgrade head
# 4. Criar repository em app/repositories/
# 5. Criar service em app/services/
# 6. Criar schema em app/schemas/
# 7. Criar router em app/routers/
# 8. Integrar router em app/main.py
```

### Para Frontend (Épico 3 - EM BREVE):
```bash
# 1. Criar hook em src/hooks/ (React Query)
# 2. Criar componente em src/components/
# 3. Usar hook no componente
# 4. Criar página em src/pages/
# 5. Adicionar rota em src/routes/
# 6. Navegar pelo App.tsx
```

---

## 🚀 Próximos Passos

### Imediato (Epopeia 3.1 - Hooks):
1. Implementar `src/hooks/useBranches.ts`
2. Implementar `src/hooks/useVendors.ts`
3. Implementar `src/hooks/useCategories.ts`
4. Implementar `src/hooks/useBills.ts`

### Curto Prazo (Épico 3.2-3.3):
5. Criar componentes básicos
6. Criar páginas principais
7. Implementar routing

### Médio Prazo (Épico 3.4-3.5):
8. Styling e layout final
9. Responsividade
10. Polish visual

### Longo Prazo (Épico 3.6):
11. Testes unitários
12. Testes de integração
13. E2E tests

---

## 📚 Documentação de Referência

- `EPIC-1.md` - Foundation details (histórico)
- `EPIC-2-PLANNING.md` - Backend planning (completo)
- `EPIC-3-PLANNING.md` - Frontend planning (em detalhes)
- `EPIC-3-SUMMARY.md` - Frontend quick reference
- `README.md` - Instruções principais
- `STATUS.md` - Status atualizado
- `DOCKER-FIX.md` - Troubleshooting Docker
- `DOCKER-TROUBLESHOOTING.md` - Mais troubleshooting

---

## 💾 Como Rodar Agora

### Backend Funcionando:
```bash
cd /home/ianlp/tecc
docker-compose up -d

# Endpoints disponíveis
curl http://localhost:8000/api/v1/branches
curl http://localhost:8000/api/v1/vendors
curl http://localhost:8000/api/v1/categories
curl http://localhost:8000/api/v1/bills

# Swagger UI
open http://localhost:8000/api/docs
```

### Frontend em Desenvolvimento:
```bash
cd /home/ianlp/tecc/frontend
npm install  # se não tiver feito
npm run dev

# Acesso
open http://localhost:5173
```

---

## 📊 Métricas

| Métrica | Valor |
|---------|-------|
| Linhas de código (Backend) | ~500 |
| Linhas de código (Frontend) | ~150 (será ~2000) |
| Endpoints implementados | 16 |
| Modelos criados | 4 |
| Componentes planejados | 12 |
| Páginas planejadas | 6 |
| Tempo investido | ~23h |
| Tempo restante | ~26-34h |
| Progresso total | 40% ✅ |

---

## 🎓 Stack Tecnológico

### Backend
- Python 3.11
- FastAPI 0.104+
- SQLAlchemy 2.0 (ORM)
- PostgreSQL 16
- Alembic (migrations)
- Pydantic (validation)
- Uvicorn (ASGI server)

### Frontend
- React 18
- TypeScript 5
- Vite (build tool)
- React Router 6
- React Query (TanStack)
- Styled Components
- Zod (validation)
- React Hook Form
- Axios (HTTP client)

### DevOps
- Docker & Docker Compose
- WSL2/Linux
- Git

---

## ✨ Insights & Aprendizados

### O que funcionou bem:
✅ Planejamento estruturado em épicos  
✅ Docker facilita muito o desenvolvimento  
✅ Separação de concerns (Models → Repos → Services → Routers)  
✅ TypeScript previne bugs  
✅ React Query simplifica state management  

### Desafios resolvidos:
✅ ELF header corruption (Docker)  
✅ Asyncpg vs Psycopg2 (Alembic)  
✅ Permission issues (WSL)  
✅ Auto-generated migrations (Alembic)  

### Próximos desafios:
🔄 Implementar componentes React  
🔄 Paginação no frontend  
🔄 Validações complexas  
🔄 Testes unitários  

---

**Última Atualização:** 27 Jan 2026, 23h  
**Status:** 🚀 Pronto para Épico 3  
**Próximo:** `src/hooks/useBranches.ts`
