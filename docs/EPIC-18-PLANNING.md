# Epic 18 — Sistema de Autenticação JWT + Painel Admin de Usuários

> **Status:** 🚧 Em andamento

## Objetivo

Implementar um sistema de autenticação robusto com JWT para proteger todas as rotas da API. Usuários são criados exclusivamente por admins — não há auto-cadastro nem confirmação de e-mail. Um painel admin permite criar, editar e desativar usuários.

---

## Requisitos

### Funcionais
- [ ] Login via `username` + `password` → retorna JWT access token
- [ ] Todas as rotas da API protegidas por autenticação
- [ ] Dois papéis: `admin` e `user`
- [ ] Apenas admins podem criar, editar e desativar usuários
- [ ] Usuário admin padrão criado automaticamente no primeiro deploy
- [ ] Frontend exibe tela de login e redireciona rotas protegidas
- [ ] Painel `/admin/users` acessível apenas para admins
- [ ] Logout limpa o token e redireciona para `/login`

### Não-Funcionais
- [ ] Token JWT com expiração configurável (padrão: 8h)
- [ ] Senhas armazenadas com bcrypt hash
- [ ] Token armazenado em `localStorage` (simples, internal tool)
- [ ] Sem refresh token (sessões stateless, expiração simples)
- [ ] Sem confirmação de e-mail

---

## Arquitetura

### Backend

```
app/
  models/
    user.py              # User SQLAlchemy model
  schemas/
    user.py              # UserCreate, UserUpdate, UserResponse
    auth.py              # LoginRequest, TokenResponse
  repositories/
    user_repository.py   # CRUD + get_by_username
  services/
    user_service.py      # lógica de negócio + autenticação
  routers/
    auth.py              # POST /auth/login, GET /auth/me
    users.py             # CRUD /users/ (admin only)
  core/
    security.py          # hash_password, verify_password, create/decode JWT
    dependencies.py      # get_current_user, require_admin (FastAPI Depends)
```

### Frontend

```
src/
  context/
    AuthContext.tsx       # user, token, login(), logout()
  components/
    PrivateRoute/         # redireciona /login se não autenticado
    AdminRoute/           # redireciona / se não admin
  pages/
    Login/                # tela de login (sem Layout)
    Admin/
      Users/              # painel admin de usuários
  hooks/
    useAuth.ts            # acesso ao AuthContext
    useUsers.ts           # CRUD de usuários via React Query
  services/
    api.ts                # authApi.login(), usersApi.*
```

---

## Modelo de Dados

```sql
CREATE TABLE users (
  id           SERIAL PRIMARY KEY,
  username     VARCHAR(64) UNIQUE NOT NULL,
  email        VARCHAR(255) UNIQUE,
  full_name    VARCHAR(255),
  hashed_password VARCHAR(255) NOT NULL,
  role         VARCHAR(16) NOT NULL DEFAULT 'user',  -- 'admin' | 'user'
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at   TIMESTAMP
);
```

---

## Fluxo de Autenticação

```
1. POST /api/v1/auth/login  { username, password }
   → verifica usuário ativo + bcrypt verify
   → retorna { access_token, token_type: "bearer", user: {...} }

2. Frontend armazena token em localStorage

3. Todas as requests incluem: Authorization: Bearer <token>

4. FastAPI Depends(get_current_user) valida JWT em cada endpoint

5. Depends(require_admin) verifica role == "admin" para rotas admin
```

---

## Endpoints

### Auth
| Método | Rota | Proteção | Descrição |
|---|---|---|---|
| POST | `/api/v1/auth/login` | Pública | Login, retorna JWT |
| GET | `/api/v1/auth/me` | Autenticado | Retorna usuário atual |

### Users (Admin only)
| Método | Rota | Proteção | Descrição |
|---|---|---|---|
| GET | `/api/v1/users/` | Admin | Lista todos os usuários |
| POST | `/api/v1/users/` | Admin | Cria novo usuário |
| GET | `/api/v1/users/{id}` | Admin | Detalhe do usuário |
| PUT | `/api/v1/users/{id}` | Admin | Edita usuário |
| PATCH | `/api/v1/users/{id}/deactivate` | Admin | Desativa usuário |
| PATCH | `/api/v1/users/{id}/activate` | Admin | Ativa usuário |

---

## Admin Padrão

Criado automaticamente via `startup_event` ou seed script se não existir nenhum usuário admin:

```
username: admin
password: admin123  (deve ser trocada em produção)
role: admin
```

---

## Dependências Novas

### Backend
```
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
```

### Frontend
Nenhuma nova — usa `axios` interceptors já existentes + React Context API.
