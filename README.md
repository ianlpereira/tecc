# financial-control

> Template de sistema financeiro de contas a pagar para matriz com múltiplas filiais.

[![Template](https://img.shields.io/badge/type-template-blue)]()
[![Backend](https://img.shields.io/badge/backend-FastAPI-success)]()
[![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20Vite-success)]()

## 📋 Visão Geral

**financial-control** é um template de sistema financeiro interno para gerenciar contas a pagar com suporte a múltiplas filiais. Centraliza a gestão financeira com separação lógica de dados por filial e controle de acesso por papel (admin/usuário).

### Funcionalidades Incluídas

- ✅ **Contas a Pagar** — Lançamento, aprovação, pagamento e cancelamento de contas, com recorrência
- ✅ **Filiais** — Múltiplas filiais com matriz, hierarquia pai/filho
- ✅ **Fornecedores** — Cadastro compartilhado entre filiais
- ✅ **Categorias** — Plano de contas simplificado
- ✅ **Meios de Pagamento** — Cadastro e vínculo a contas
- ✅ **Anexos** — Upload de comprovantes por conta
- ✅ **Relatórios** — Exportação e análise de contas
- ✅ **Usuários e Autenticação** — JWT, papéis (admin/user), troca de senha obrigatória
- ✅ **Contexto de Filial Global** — Seletor no header aplicado automaticamente

---

## 🚀 Criando um Novo Cliente

Este repositório é um **GitHub Template**. Para criar um novo cliente:

### Opção A — Via GitHub (recomendado)

1. Clique em **"Use this template"** no GitHub
2. Dê um nome ao repositório (ex: `acme`)
3. Clone o novo repositório
4. Execute o script de setup:
   ```bash
   ./scripts/setup.sh acme
   ```

### Opção B — Local / Manual

```bash
# Clone o template
git clone https://github.com/<seu-usuario>/financial-control.git acme
cd acme

# Execute o setup
./scripts/setup.sh acme

# Configure o ambiente
cp .env.example .env
# Edite .env com suas credenciais

# Suba os containers
docker compose up -d
```

O script `setup.sh` substitui todos os placeholders `tecc` pelo nome do cliente em todos os arquivos relevantes.

---

## 🏗️ Arquitetura (Monorepo)

```
financial-control/
├── backend/                 # FastAPI Python
│   ├── app/
│   │   ├── routers/         # Endpoints (REST API)
│   │   ├── services/        # Lógica de negócio
│   │   ├── repositories/    # Acesso a dados (ORM)
│   │   ├── models/          # SQLAlchemy ORM
│   │   ├── schemas/         # Pydantic v2 schemas
│   │   └── core/            # Config, DB, Auth, Deps
│   ├── alembic/             # Migrations
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/      # Componentes reutilizáveis
│   │   ├── pages/           # Páginas
│   │   ├── hooks/           # Custom hooks (TanStack Query)
│   │   ├── services/        # Axios + API client
│   │   ├── context/         # Auth (Context API) + Branch (Zustand)
│   │   └── styles/          # Styled Components + tema
│   └── Dockerfile
├── scripts/
│   └── setup.sh             # Bootstrap para novo cliente
├── docker-compose.yml
├── render.yaml              # Deploy no Render
└── .env.example
```

---

## 🛠️ Stack

| Camada | Tecnologia |
|---|---|
| Backend | Python 3.11, FastAPI, SQLAlchemy 2.0 async, Pydantic v2 |
| Banco de dados | PostgreSQL 16, Alembic (migrations) |
| Auth | JWT (python-jose), bcrypt |
| Frontend | React 18, Vite, TypeScript strict |
| Estilização | Styled Components + Ant Design |
| Estado servidor | TanStack Query (React Query) |
| Estado cliente | Zustand |
| Forms | React Hook Form + Zod |
| HTTP | Axios |
| Infra | Docker, Docker Compose |
| Deploy | Render (backend + frontend + PostgreSQL) |

---

## ⚡ Quick Start (após `setup.sh`)

```bash
# 1. Configure o ambiente
cp .env.example .env
# Edite .env: JWT_SECRET_KEY, DEFAULT_ADMIN_PASSWORD

# 2. Suba os serviços
docker compose up -d

# 3. (primeira vez) Aplique as migrations
docker compose exec backend alembic upgrade head

# 4. Acesse
# Frontend:  http://localhost:5173
# API Docs:  http://localhost:8000/api/docs
```

---

## 🗃️ Migrations

```bash
# Criar nova migration
docker compose exec backend alembic revision --autogenerate -m "descrição"

# Aplicar todas as migrations
docker compose exec backend alembic upgrade head

# Rollback
docker compose exec backend alembic downgrade -1
```

---

## 🌐 Deploy (Render)

O arquivo `render.yaml` define os serviços. Para fazer o deploy:

1. Crie uma conta no [Render](https://render.com)
2. Conecte o repositório do cliente
3. Configure as variáveis de ambiente no dashboard do Render:
   - `DATABASE_URL`
   - `JWT_SECRET_KEY`
   - `DEFAULT_ADMIN_USERNAME`
   - `DEFAULT_ADMIN_PASSWORD`
4. Atualize `CORS_ORIGINS` em `backend/app/core/config.py` com a URL real do frontend
5. Faça o deploy via `render.yaml`

---

## 🔧 Adicionando Módulos Específicos do Cliente

Módulos adicionais (ex: Veículos, Contratos, Estoque) podem ser adicionados após o fork:

1. **Backend:** Crie o modelo, repositório, serviço e router seguindo a arquitetura em camadas
2. **Backend:** Gere a migration: `alembic revision --autogenerate -m "add_X_table"`
3. **Frontend:** Crie a página em `src/pages/`, o hook em `src/hooks/`, e adicione a rota em `App.tsx` e o item de menu em `Layout/index.tsx`

Consulte os arquivos existentes como referência de padrão.

---

## 📖 Padrões de Código

Veja `.github/instructions/intructions.instructions.md` para:
- Arquitetura em camadas (Backend)
- Type Safety (Python + TypeScript)
- Styled Components + Ant Design
- Database best practices
- Error handling

---

**Versão do template:** 1.0.0
