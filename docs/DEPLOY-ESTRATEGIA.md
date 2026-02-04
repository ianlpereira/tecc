# 🚀 TECC - Estratégias de Deploy (Custo-Benefício)

> **Data:** 4 de Fevereiro de 2026  
> **Status da Aplicação:** ✅ 95% Completa - Pronta para Testes  
> **Objetivo:** Escolher melhor estratégia de deploy para cliente testar

---

## 📊 Análise Comparativa (4 Opções)

| Critério | **Render** | **Railway** | **DigitalOcean** | **Fly.io** |
|----------|-----------|-----------|-----------------|-----------|
| **Custo (mês)** | $7-12 | $5-15 | $5-40 | $5-25 |
| **Setup Time** | 15 min | 15 min | 20 min | 15 min |
| **Facilidade** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Escalabilidade** | Boa | Boa | Muito boa | Muito boa |
| **Plano Gratuito** | ✅ Limitado | ✅ $5/mês | ❌ Não | ❌ Não |
| **PostgreSQL** | ✅ Incluído | ✅ $12/mês | ✅ $12/mês | ✅ $3/mês |
| **Downtime** | Sim (spin-down) | Não | Não | Não |
| **Recomendação** | ⭐ Melhor entrada | ⭐⭐ Ideal barato | ⭐⭐⭐ Pro | ⭐⭐⭐⭐ Melhor geral |

---

## 🥇 **RECOMENDAÇÃO: Railway (Melhor Custo-Benefício)**

### Por quê Railway?
✅ **$5/mês mínimo** - PostgreSQL + Backend + Frontend (tudo)  
✅ **Sem downtime** - Containers sempre rodando  
✅ **GitHub Integration** - Deploy automático a cada push  
✅ **Não requer cartão de crédito** (primeiros $5)  
✅ **Preview branches** - Testar antes de produção  
✅ **Logs em tempo real** - Debugging fácil  

### Timeline: 20 minutos

---

## 📋 Pré-requisitos

```bash
# Certifique-se de ter:
1. GitHub conta (app deve estar em repo público)
2. Conta Railway (https://railway.app)
3. Variáveis de ambiente prontas
```

---

## 🚀 DEPLOY PASSO A PASSO - RAILWAY

### ETAPA 1: Preparar Repositório (5 min)

#### 1.1 Verificar estrutura do projeto
```bash
cd /home/ianlp/tecc
git status

# Resultado esperado:
# ✅ backend/         ← Docker pronto
# ✅ frontend/        ← Dockerfile pronto
# ✅ docker-compose.yml ← Config local
```

#### 1.2 Criar `.env.production` (não commitar!)
```bash
cat > .env.production << 'EOF'
# Backend
DATABASE_URL=postgresql+asyncpg://user:password@db-host:5432/tecc_db
ENVIRONMENT=production
DEBUG=false

# Frontend
VITE_API_URL=https://seu-backend-railway.up.railway.app
EOF
```

#### 1.3 Atualizar `docker-compose.yml` para produção (OPCIONAL)

Se quiser rodar localmente em modo produção:
```yaml
services:
  backend:
    environment:
      ENVIRONMENT: production
      DEBUG: false
```

---

### ETAPA 2: Configurar Railway (10 min)

#### 2.1 Logar no Railway
- Acesse https://railway.app
- Clique "Create New Project"
- Escolha "Deploy from GitHub"

#### 2.2 Conectar GitHub
- Autorizar Railway acessar seu GitHub
- Selecionar repositório `tecc`

#### 2.3 Selecionar Serviços

Railway detectará automaticamente:
```
✅ backend/Dockerfile   → Backend Service
✅ frontend/Dockerfile  → Frontend Service
(pode não detectar PostgreSQL - vamos adicionar manualmente)
```

Se não detectar, clique "+ New Service" e escolha:
- **PostgreSQL** (Railway oferece)
- **Dockerfile** para Backend
- **Dockerfile** para Frontend

#### 2.4 Configurar Variáveis de Ambiente

Na aba "Variables" de cada serviço:

**Para PostgreSQL (gerado automaticamente):**
```
POSTGRES_USER=tecc_user
POSTGRES_PASSWORD=[gerado automaticamente]
POSTGRES_DB=tecc_db
DATABASE_URL=[gerado automaticamente]
```

**Para Backend:**
```
DATABASE_URL=${{ Postgres.DATABASE_URL }}
ENVIRONMENT=production
DEBUG=false
```

**Para Frontend:**
```
VITE_API_URL=https://[seu-backend].railway.app
```

#### 2.5 Configurar Ports

- **Backend:** Port 8000 (detecta automaticamente do Dockerfile)
- **Frontend:** Port 5173 (detecta automaticamente)

---

### ETAPA 3: Deploy (3 min)

#### 3.1 Iniciar Deploy
- Railway fará deploy automaticamente quando detectar:
  1. GitHub integrado ✅
  2. Dockerfile encontrado ✅
  3. Variáveis de ambiente configuradas ✅

#### 3.2 Monitorar Logs
```
Railway Dashboard → Seu Projeto → Deployments
Veja em tempo real o build dos containers
```

#### 3.3 Aguardar Status "Success"
```
✅ PostgreSQL: Running
✅ Backend: Running  
✅ Frontend: Running
```

---

### ETAPA 4: Testar Deploy (2 min)

#### 4.1 URLs Geradas Automaticamente
```
Backend:  https://tecc-backend-prod.up.railway.app
Frontend: https://tecc-frontend-prod.up.railway.app
Docs:     https://tecc-backend-prod.up.railway.app/api/docs
```

#### 4.2 Testar Endpoints
```bash
# Listar branches
curl https://tecc-backend-prod.up.railway.app/api/v1/branches

# Resultado esperado:
# {"data": [], "total": 0}
```

#### 4.3 Acessar Frontend
```
https://tecc-frontend-prod.up.railway.app
```

---

## 🔄 DEPLOY CONTÍNUO - Setup (2 min extra)

### Auto-Deploy a Cada Push

Railway já vem configurado assim! Quando você fizer:

```bash
git push origin main
```

Railway automaticamente:
1. ✅ Detecta push
2. ✅ Faz build das imagens
3. ✅ Testa saúde dos containers
4. ✅ Faz deploy sem downtime
5. ✅ Envia logs para seu painel

### Preview Deployments

Para testar em branch:
```bash
# Criar feature branch
git checkout -b feature/nova-funcionalidade

# Fazer changes
# Commitar e push
git push origin feature/nova-funcionalidade

# Railway cria automaticamente:
# https://tecc-backend-feature-xyz.railway.app (preview)
```

---

## 💰 CUSTO MENSAL ESTIMADO

### Cenário 1: Mínimo (Testing)
```
PostgreSQL:  $12/mês (Railway)
Backend:     $5/mês  (0.5 GB RAM, 256 MB CPU)
Frontend:    $5/mês  (0.5 GB RAM, 256 MB CPU)
────────────────────────
TOTAL:       $22/mês (ou $7 se usar tier gratuito de 100h)
```

### Cenário 2: Recomendado (Produção Baixa)
```
PostgreSQL:   $15/mês (Railway 512 MB)
Backend:      $10/mês (1 GB RAM, 512 MB CPU)
Frontend:     $5/mês  (0.5 GB RAM, 256 MB CPU)
────────────────────────
TOTAL:        $30/mês
```

### Cenário 3: Otimizado (Produção Média)
```
PostgreSQL:   $25/mês (Railway 2 GB)
Backend:      $20/mês (2 GB RAM, 1 GB CPU)
Frontend:     $10/mês (1 GB RAM, 512 MB CPU)
────────────────────────
TOTAL:        $55/mês
```

---

## 🆚 ALTERNATIVAS (Se Railway não agradar)

### Opção 2: Render.com (Mais Fácil, mas com Limitações)

**Prós:**
- ✅ Interface super simples
- ✅ Deploy com 3 cliques
- ✅ PostgreSQL incluído

**Contras:**
- ❌ Spin-down após inatividade (demora 15-30 seg na primeira requisição)
- ❌ Requer cartão de crédito (mesmo para plano gratuito)

**Setup:**
```
1. https://render.com → "New +" → "Web Service"
2. Conectar GitHub
3. Escolher repositório
4. Build command: (detecta automaticamente)
5. Deploy!
```

---

### Opção 3: DigitalOcean App Platform (Mais Controle)

**Prós:**
- ✅ Melhor performance
- ✅ Mais opções de customização
- ✅ Sem spin-down

**Contras:**
- ❌ Custa $5+ por serviço
- ❌ Setup mais complexo

**Setup:**
```
1. https://digitalocean.com → "App Platform" → "Create App"
2. Conectar GitHub
3. Configurar cada serviço (DB, Backend, Frontend)
4. Deploy!
```

---

### Opção 4: Fly.io (Melhor Performance)

**Prós:**
- ✅ Deploy em múltiplas regiões (geo-replicação)
- ✅ Performance excelente
- ✅ CLI própria (muito poderosa)

**Contras:**
- ❌ Curva de aprendizado maior
- ❌ Requer aprender Fly CLI

**Setup:**
```bash
# Instalar Fly CLI
curl -L https://fly.io/install.sh | sh

# Fazer login
flyctl auth login

# Criar app
flyctl launch

# Deploy
flyctl deploy
```

---

## ✅ CHECKLIST PRÉ-DEPLOY

Antes de fazer deploy, certifique-se:

- [ ] Backend Dockerfile testado localmente
  ```bash
  docker build -t tecc-backend:prod ./backend
  docker run -e DATABASE_URL=postgresql://... tecc-backend:prod
  ```

- [ ] Frontend Dockerfile testado localmente
  ```bash
  docker build -t tecc-frontend:prod ./frontend
  docker run -e VITE_API_URL=http://localhost:8000 tecc-frontend:prod
  ```

- [ ] Variáveis de ambiente não têm secrets
  ```bash
  # Checklist:
  - DATABASE_URL ← Será definida no Railway
  - API_URL ← Frontend apontará para Backend no Railway
  - DEBUG ← false em produção
  - ENVIRONMENT ← production
  ```

- [ ] Git repository está atualizado
  ```bash
  git add .
  git commit -m "Ready for production deploy"
  git push origin main
  ```

- [ ] Backend está respondendo em /api/health
  ```bash
  curl http://localhost:8000/api/health
  # {"status": "healthy"}
  ```

- [ ] Migrations estão criadas
  ```bash
  cd backend
  alembic revision --autogenerate -m "production schema"
  git add alembic/versions/
  git commit -m "DB migrations"
  ```

---

## 🔐 SEGURANÇA PRÉ-PRODUÇÃO

### 1. Secrets Management
```yaml
# ❌ NUNCA commitar
DATABASE_PASSWORD=abc123

# ✅ SEMPRE usar variáveis de ambiente
${{ secrets.DATABASE_PASSWORD }}
```

### 2. CORS Configuration
```python
# backend/app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://seu-frontend-railway.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 3. Environment Detection
```python
# Detectar se é produção
if ENVIRONMENT == "production":
    DEBUG = False
    ALLOWED_HOSTS = ["seu-dominio.up.railway.app"]
```

---

## 📱 ACESSAR COMO CLIENTE

Compartilhe com seu cliente:

```
🎉 Bem-vindo ao TECC!

Acesse em: https://tecc-frontend-prod.up.railway.app

Credenciais Iniciais:
- Todas as filiais já vêm criadas
- Já há categorias e fornecedores de exemplo

Primeiro passo:
1. Selecione uma filial no selector do header
2. Clique em "Contas a Pagar"
3. Crie sua primeira conta
4. Veja no Dashboard

Precisa de ajuda? Me chame!
```

---

## 🚨 TROUBLESHOOTING

### Problema: Backend conecta mas Frontend não

**Solução:**
```bash
# Verificar CORS
curl -i https://tecc-backend.up.railway.app/api/v1/branches

# Deve ter:
# Access-Control-Allow-Origin: https://tecc-frontend.up.railway.app
```

### Problema: Migrations não rodaram

**Solução no Railway:**
```
1. Ir em Backend → Deployments
2. Clicar em "Logs"
3. Ver se alembic rodou
4. Se não, adicionar comando na Dockerfile:
   CMD ["sh", "-c", "alembic upgrade head && uvicorn ..."]
```

### Problema: PostgreSQL demora a iniciar

**Solução:**
```
Railway PostgreSQL leva ~30 seg na primeira vez.
Adicionar health check no docker-compose.yml
(já está configurado no seu arquivo atual)
```

---

## 📊 MONITORAMENTO PÓS-DEPLOY

### Railway Dashboard
```
1. Abrir https://railway.app/dashboard
2. Selecionar seu projeto
3. Ver em tempo real:
   - CPU usage
   - Memory usage
   - Network I/O
   - Logs em tempo real
```

### Alertas Recomendados
```
Railway oferece alertas automáticos para:
- ✅ Deploy failures
- ✅ Service restarts
- ✅ High CPU/Memory
- ✅ Database connection issues
```

---

## 🎯 PRÓXIMOS PASSOS

### Após Deploy (30 min)

1. **Testar todos os endpoints** (lista, criar, editar, deletar)
   ```bash
   curl https://backend.railway.app/api/docs
   ```

2. **Pedir cliente testar**
   - Compartilhar URL
   - Coletar feedback

3. **Configurar domínio customizado** (OPCIONAL)
   ```
   Railway → Settings → Domains
   Adicionar seu domínio (ex: app.suaempresa.com)
   ```

4. **Ativar SSL/TLS** (automático no Railway)

5. **Configurar backups** (PostgreSQL Railway faz automático)

---

## 📞 SUPORTE

Comandos úteis se precisar debugar:

```bash
# Ver logs em tempo real
railway logs -f

# Conectar ao banco em produção
railway connect

# Executar comando no backend
railway run bash

# Ver variáveis de ambiente
railway variables
```

---

**Status:** ✅ Pronto para deploy  
**Tempo Estimado:** 20-30 minutos  
**Complexidade:** ⭐ Muito Fácil  
**Custo:** 💰 Mínimo ($7/mês teste, $22-30 produção)
