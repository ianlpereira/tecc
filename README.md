# TECC - Sistema Financeiro Centralizado

> Sistema de gestão centralizada de contas a pagar para matriz com múltiplas filiais.

## 📋 Visão Geral

**TECC** é um sistema financeiro interno para gerenciar contas a pagar de uma matriz e 19 filiais dispersas geograficamente. Centraliza toda a gestão financeira com forte separação lógica de dados por filial.

### Características Principais

- ✅ **Single Tenant** - Um único banco de dados, forte separação lógica por filial
- ✅ **Contexto de Filial Globalizado** - Seletor no header que auto-aplica branch_id em todos os lançamentos
- ✅ **Gestão de Contas a Pagar** - Lançamento ágil e rastreamento completo
- ✅ **Arquitetura em Camadas** - Clean, escalável e mantível

## 🏗️ Arquitetura do Projeto (Monorepo)

```
tecc/
├── backend/                 # FastAPI Python
│   ├── app/
│   │   ├── routers/         # Endpoints (REST API)
│   │   ├── services/        # Lógica de negócio
│   │   ├── repositories/    # Acesso a dados
│   │   ├── models/          # SQLAlchemy ORM
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── core/
│   │   │   ├── config.py    # Configuração
│   │   │   └── database.py  # Session e engine
│   │   └── main.py          # App FastAPI
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .dockerignore
├── frontend/                # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── pages/           # Páginas
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API e queries
│   │   ├── context/         # Zustand stores
│   │   ├── styles/          # Styled Components
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── index.html
├── docker-compose.yml       # Orquestração local
├── .env.example
├── .gitignore
├── instructions.md          # Diretrizes de código
└── README.md               # Este arquivo

```

## 🚀 Quick Start

### Pré-requisitos

- Docker & Docker Compose
- Git

### Setup Local

1. **Clone o repositório:**
   ```bash
   cd tecc
   ```

2. **Configure o `.env`:**
   ```bash
   cp .env.example .env
   ```

3. **Inicie os serviços:**
   ```bash
   docker-compose up
   ```

   Aguarde o build das imagens (primeira execução pode levar 2-3 minutos).

4. **Acesse a aplicação:**
   - **Frontend:** http://localhost:5173
   - **Backend (API Docs):** http://localhost:8000/api/docs
   - **Health Check:** http://localhost:8000/api/health

### Hot Reload

- **Backend:** FastAPI recarrega automaticamente com `uvicorn --reload`
- **Frontend:** Vite HMR recarrega em tempo real

## 📊 Modelagem de Dados (Épico 1 - Fundação)

```sql
-- Estrutura base (será expandida)

-- Filiais
CREATE TABLE branches (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    is_headquarters BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Fornecedores (compartilhados entre filiais)
CREATE TABLE vendors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tax_id VARCHAR(20) UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Categorias (Plano de contas simplificado)
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Contas a Pagar (Core do sistema)
CREATE TABLE bills (
    id SERIAL PRIMARY KEY,
    branch_id INTEGER NOT NULL,
    vendor_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (vendor_id) REFERENCES vendors(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

## 🛠️ Stack Tecnológico

### Backend
- **Python 3.11+** - Linguagem
- **FastAPI** - Framework web assíncrono
- **SQLAlchemy 2.0** - ORM assíncrono
- **Pydantic v2** - Validação de dados
- **PostgreSQL** - Banco de dados
- **Alembic** - Migração de schema

### Frontend
- **React 18** - Biblioteca UI
- **Vite** - Build tool
- **TypeScript** - Type safety
- **React Router v6** - Roteamento
- **Styled Components** - Estilização (CSS-in-JS)
- **Ant Design** - Componentes complexos
- **React Hook Form + Zod** - Gestão de forms
- **TanStack Query** - Server state management
- **Axios** - HTTP client
- **Zustand** - Client state management

### Infra
- **Docker** - Containerização
- **Docker Compose** - Orquestração local
- **PostgreSQL 16 Alpine** - BD leve e rápido

## 📖 Guias de Desenvolvimento

### 1. Adicionar um novo Router (Backend)

Crie um arquivo em `backend/app/routers/`:

```python
# backend/app/routers/branches.py
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db

router = APIRouter(prefix="/api/v1/branches", tags=["branches"])

@router.get("/")
async def list_branches(db: AsyncSession = Depends(get_db)):
    # TODO: Implementar
    pass
```

Depois inclua em `backend/app/main.py`:

```python
from app.routers import branches
app.include_router(branches.router)
```

### 2. Criar um Componente React (Frontend)

Use a estrutura de pastas com separação de lógica e view:

```
frontend/src/components/MyComponent/
├── index.tsx       # Lógica e JSX
└── styles.ts       # Styled Components
```

**Exemplo:**

```typescript
// components/BranchSelector/index.tsx
import React from 'react'
import { Select } from 'antd'
import * as S from './styles'

interface Props {
  value?: number
  onChange?: (id: number) => void
}

const BranchSelector: React.FC<Props> = ({ value, onChange }) => {
  return (
    <S.Container>
      <Select
        placeholder="Selecione uma filial"
        value={value}
        onChange={onChange}
      />
    </S.Container>
  )
}

export default BranchSelector
```

```typescript
// components/BranchSelector/styles.ts
import styled from 'styled-components'

export const Container = styled.div`
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.surface};
  border-radius: 4px;
`
```

### 3. Adicionar uma Query (Frontend)

Use TanStack Query com Axios:

```typescript
// hooks/useBranches.ts
import { useQuery } from '@tanstack/react-query'
import apiClient from '@/services/apiClient'

export const useBranches = () => {
  return useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const { data } = await apiClient.get('/branches')
      return data
    },
  })
}
```

## 🔄 Fluxo de Trabalho

1. **Branching:** `git checkout -b feature/nome-da-feature`
2. **Development:** Altere código, veja as mudanças em tempo real
3. **Commit:** `git commit -m "feat: descrição"`
4. **Push:** `git push origin feature/nome-da-feature`
5. **Pull Request:** Crie PR para code review

## ✅ Checklist de Setup Completo

- [x] Estrutura de pastas monorepo criada
- [x] `docker-compose.yml` configurado (PostgreSQL, Backend, Frontend)
- [x] `requirements.txt` (Backend com todas as dependências)
- [x] `package.json` (Frontend com stack completo)
- [x] Backend: Main app, config, database, routers base
- [x] Frontend: Vite, TypeScript, Styled Components, theme, API client
- [x] `.env.example` e `.gitignore`
- [x] Este README

## 📝 Próximos Passos (Épico 2+)

- [ ] Implementar migrações Alembic
- [ ] Criar modelos SQLAlchemy (Branch, Vendor, Category, Bill)
- [ ] Implementar repositórios
- [ ] Implementar serviços de negócio
- [ ] Criar endpoints CRUD
- [ ] Autenticação & Autorização
- [ ] Testes (pytest + React Testing Library)
- [ ] CI/CD (GitHub Actions)

## 📚 Diretrizes de Código

Veja `instructions.md` para:
- Arquitetura em camadas (Backend)
- Type Safety (Python + TypeScript)
- Styled Components + Ant Design (Frontend)
- Database Best Practices
- Error Handling

## 🐛 Troubleshooting

### ⚠️ Erro: "input/output error" no Docker

Se encontrar:
```
write /var/lib/docker/buildkit/containerd-overlayfs/metadata_v2.db: input/output error
```

**Solução rápida:**
1. Feche Docker Desktop completamente
2. Execute (PowerShell Admin):
   ```powershell
   Remove-Item -Path "$env:APPDATA\Docker" -Recurse -Force
   ```
3. Reinicie Docker Desktop
4. Tente novamente: `docker-compose up -d --build`

Veja `DOCKER-FIX.md` para mais detalhes.

### Porta já em uso

```bash
# Libere a porta (ex: 5173)
npx kill-port 5173
```

### PostgreSQL não inicia

```bash
docker-compose logs db
```

### Hot reload não funciona (Frontend)

Reinicie o container:

```bash
docker-compose restart frontend
```

### Import errors no TypeScript

Execute:

```bash
cd frontend && npm install
```

## 📞 Contato & Suporte

Para dúvidas sobre o setup ou padrões do projeto, consulte:
- `instructions.md` - Diretrizes técnicas
- `docker-compose.yml` - Configuração dos serviços
- Logs: `docker-compose logs -f [service_name]`

---

**Versão:** 1.0.0  
**Última atualização:** Jan 2026  
**Status:** 🚀 Foundation Complete
