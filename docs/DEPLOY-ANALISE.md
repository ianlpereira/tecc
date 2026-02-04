# 🌍 DEPLOY: Análise Detalhada de Plataformas

> **Data:** 4 Fevereiro 2026  
> **Objetivo:** Escolher melhor plataforma para deploy teste

---

## 📊 Matriz de Comparação (Completa)

```
PLAFORMA         | CUSTO MÍNIMO | SETUP | DOCKER | GIT AUTO | SEM DOWNTIME
─────────────────┼──────────────┼───────┼────────┼──────────┼─────────────
Railway          |    $5/mês    |  15m  |   ✅   |    ✅    |     ✅
─────────────────┼──────────────┼───────┼────────┼──────────┼─────────────
Render           |    $7/mês    |  15m  |   ✅   |    ✅    |     ❌ *
─────────────────┼──────────────┼───────┼────────┼──────────┼─────────────
DigitalOcean     |   $15/mês    |  20m  |   ✅   |    ✅    |     ✅
─────────────────┼──────────────┼───────┼────────┼──────────┼─────────────
Fly.io           |    $5/mês    |  20m  |   ✅   |    ✅    |     ✅
─────────────────┼──────────────┼───────┼────────┼──────────┼─────────────
AWS (EC2)        |   $20/mês    |  40m  |   ✅   |    ❌    |     ✅
─────────────────┼──────────────┼───────┼────────┼──────────┼─────────────
Heroku (legacy)  |   $50/mês    |  10m  |   ✅   |    ✅    |     ✅
─────────────────┼──────────────┼───────┼────────┼──────────┼─────────────
Azure Container  |   $25/mês    |  30m  |   ✅   |    ✅    |     ✅
─────────────────┼──────────────┼───────┼────────┼──────────┼─────────────

* Render: Spin-down após 15min inatividade (demora 30seg para acordar)
```

---

## 🥇 TOP 3 RECOMENDAÇÕES

### 1️⃣ MELHOR CUSTO-BENEFÍCIO: Railway

**Caso de Uso:** Você quer deploy rápido, barato e sem dor de cabeça

✅ **Prós:**

- $5/mês mínimo (mais barato)
- Deploy automático com GitHub
- Sem spin-down (sempre rápido)
- PostgreSQL incluído
- Interface intuitiva
- Logs em tempo real
- Auto-scaling

❌ **Contras:**

- Menos customização que DigitalOcean
- Menor comunidade que Render

**Quando escolher:** 👈 **RECOMENDADO PARA VOCÊ**

---

### 2️⃣ MAIS FÁCIL: Render

**Caso de Uso:** Você quer máxima simplicidade, aceita pequeno spin-down

✅ **Prós:**

- Interface super intuitiva
- Deploy com 3 cliques
- PostgreSQL grátis (até 90 dias)
- Sem requer cartão de crédito inicialmente

❌ **Contras:**

- Spin-down após inatividade (ruim para produção)
- Requer cartão de crédito depois

**Quando escolher:** Se preferir UI mais amigável que Railway

---

### 3️⃣ MELHOR PARA PRODUÇÃO: DigitalOcean

**Caso de Uso:** Você quer performance máxima e escalabilidade

✅ **Prós:**

- Performance excelente
- Full control via Docker
- Muito maduro e estável
- Ótima documentação
- Droplets reutilizáveis

❌ **Contras:**

- $5+ por serviço (caro)
- Setup mais longo
- Requer mais conhecimento DevOps

**Quando escolher:** Se custo não for issue e quer máximo controle

---

## 💰 CUSTO DETALHADO (3 meses teste)

### Cenário: 1 Backend + 1 Frontend + 1 PostgreSQL

#### Railway

```
PostgreSQL 512MB:    $12/mês
Backend (1GB RAM):   $5/mês
Frontend (0.5GB):    $5/mês
─────────────────────────────
TOTAL:               $22/mês × 3 = $66 (3 meses teste)
```

#### Render

```
PostgreSQL (free):   $0 (90 dias)
Backend (free):      $0 (primeira 100h/mês)
Frontend (free):     $0 (primeira 100h/mês)
────────────────────────────────
TOTAL:               $0 (primeiros 3 meses)
Depois:              ~$30/mês
```

#### DigitalOcean App Platform

```
Droplet PostgreSQL:  $5/mês
Backend Service:     $5/mês
Frontend Service:    $5/mês
─────────────────────────────
TOTAL:               $15/mês × 3 = $45 (3 meses)
```

#### Fly.io

```
PostgreSQL (1GB):    $3/mês
Backend:             $5/mês
Frontend:            $5/mês
─────────────────────────────
TOTAL:               $13/mês × 3 = $39 (3 meses)
```

---

## 🎯 ROTEIRO: Railway (Escolhido)

### Dia 1: Setup (30 min)

```
15 min: Criar conta Railway + conectar GitHub
10 min: Criar projeto e detectar serviços
5 min:  Configurar variáveis de ambiente
```

### Dia 2: Deploy (20 min)

```
5 min:  Iniciador deploy
10 min: Monitorar logs
5 min:  Testar endpoints
```

### Dia 3: Compartilhar com Cliente (10 min)

```
5 min:  Configurar domínio customizado (OPCIONAL)
5 min:  Documentar URLs e credenciais
```

**Total: 60 minutos de trabalho (muito fácil!)**

---

## 🔧 Railway: PASSO A PASSO COMPLETO

### Pré-Requisitos

1. **GitHub**: Repositório `tecc` público ou privado
2. **Railway**: Conta criada (<https://railway.app>)
3. **Credenciais**: Você terá acessar ambas

### Passos

#### 1. Criar Projeto no Railway

```
1. Ir para https://railway.app/dashboard
2. Clique em "Create New Project"
3. Escolha "Deploy from GitHub"
4. Autorize Railway acessar seu GitHub
5. Selecione repositório "tecc"
```

#### 2. Railway Detecta Automaticamente

Railway automaticamente:

- Vê `backend/Dockerfile` → cria Backend Service
- Vê `frontend/Dockerfile` → cria Frontend Service
- Pergunta se quer PostgreSQL

Clique "Yes" para PostgreSQL.

#### 3. Configurar Serviços

**Para PostgreSQL:**

```
Railroad cria automaticamente:
- POSTGRES_USER: tecc_user
- POSTGRES_PASSWORD: [aleatorio]
- POSTGRES_DB: tecc_db
- DATABASE_URL: postgresql+asyncpg://...
```

**Para Backend:**
Clique em "Backend" → "Variables" → "Add":

```
DATABASE_URL: ${{ Postgres.DATABASE_URL }}
ENVIRONMENT: production
DEBUG: false
```

**Para Frontend:**
Clique em "Frontend" → "Variables" → "Add":

```
VITE_API_URL: https://[seu-backend-railway].up.railway.app
```

#### 4. Deploy

```
1. Clicar em "Deploy" no Backend
2. Aguardar status "Running" (logs aparecerão)
3. Clicar em "Deploy" no Frontend
4. Aguardar status "Running"
```

#### 5. Testar

```bash
# Copiar URL do Backend nos Deployments
curl https://[seu-backend].up.railway.app/api/v1/branches
# Deve retornar: {"data": [], "total": 0}

# Acessar Frontend
https://[seu-frontend].up.railway.app
# Deve abrir a aplicação React
```

---

## 🔄 AUTO-DEPLOY (Já Funciona no Railway!)

Quando você fizer:

```bash
git push origin main
```

Railway automaticamente:

```
1. ✅ Detecta novo push
2. ✅ Faz build das imagens Docker
3. ✅ Testa saúde dos containers
4. ✅ Faz deploy sem downtime
5. ✅ Ativa novo versão
6. ✅ Envia logs para dashboard
```

### Preview Deployments (BONUS!)

```bash
# Criar branch feature
git checkout -b feature/novo-relatorio
git push origin feature/novo-relatorio

# Railway automaticamente cria:
# https://tecc-backend-feature-novo-relatorio.railway.app (preview)
# https://tecc-frontend-feature-novo-relatorio.railway.app (preview)

# Teste lá sem afetar produção!
# Quando merged em main, vai para produção
```

---

## 📱 COMPARTILHAR URL COM CLIENTE

Email para cliente:

```
Assunto: TECC - Ambiente de Testes Online

Olá!

Seu ambiente de testes está pronto!

Acesse: https://tecc-frontend-prod.up.railway.app

Como usar:
1. Abre o link acima
2. Selecione uma filial no topo
3. Navegue para "Contas a Pagar"
4. Crie sua primeira conta (teste com valores)
5. Veja os dados no Dashboard

API Docs (para testes técnicos):
https://tecc-backend-prod.up.railway.app/api/docs

Bugs ou dúvidas? Me avise!

Abraços!
```

---

## ⚠️ CHECKLIST PRÉ-DEPLOY

Antes de fazer deploy, execute:

```bash
cd /home/ianlp/tecc

# 1. Git updated
git status
# Deve estar clean

# 2. Backend pronto
cd backend
docker build -t tecc-backend:test .
docker run --rm tecc-backend:test python -c "import app.main; print('✅ Backend OK')"

# 3. Frontend pronto
cd ../frontend
docker build -t tecc-frontend:test .
docker run --rm tecc-frontend:test npm run build

# 4. Variáveis de ambiente
cat .env.example
# Checklist:
# - DATABASE_URL ← NÃO deve estar aqui (vai no Railway)
# - DEBUG = false ✅
# - ENVIRONMENT = production ✅
# - VITE_API_URL = https://seu-backend ✅

# 5. Push tudo
cd ..
git add .
git commit -m "Pronto para deploy em produção"
git push origin main
```

---

## 🚨 POSSÍVEIS PROBLEMAS & SOLUÇÕES

### Problema: "Build failed"

**Causa:** Dockerfile não está correto

**Solução:**

```bash
# Testar Dockerfile localmente
docker build -t tecc-backend ./backend
docker logs tecc_backend
# Ver exato erro que aparece

# Corrigir
# Commitar
git push origin main
# Railway tentará de novo automaticamente
```

### Problema: "Backend conecta mas Frontend não vê dados"

**Causa:** CORS não configurado ou VITE_API_URL errada

**Solução:**

```python
# backend/app/main.py - verificar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://seu-frontend-railway.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Commitar e empurrar
git push origin main
```

### Problema: "Migrations não rodaram"

**Causa:** Alembic não foi executado no startup

**Solução (Opção 1: Manual)**

```
1. Railway Dashboard → Backend → Deployments → Logs
2. Ver se alembic rodou
3. Se não, adicionar em backend/Dockerfile:
   CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app ..."]
```

**Solução (Opção 2: Railway CLI)**

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Logar
railway login

# Conectar ao seu projeto
railway link

# Rodar comando no backend
railway run alembic upgrade head
```

---

## 📊 MONITORAMENTO PÓS-DEPLOY

### Railway Dashboard

```
1. https://railway.app/dashboard
2. Selecionar projeto "tecc"
3. Ver em tempo real:
   ├── CPU %
   ├── Memory %
   ├── Network I/O
   ├── Deployment status
   └── Logs em tempo real
```

### Alertas Recomendados

Railway → Settings → Notifications:

- [ ] Deploy Failed
- [ ] Service Restart
- [ ] High CPU (>80%)
- [ ] High Memory (>80%)

---

## 🎓 APRENDIZADOS IMPORTANTES

### O que NÃO fazer

❌ Commitar `.env` com secrets  
❌ Usar `DEBUG=true` em produção  
❌ Esquecer CORS configuration  
❌ Rodar migrations manualmente no banco  

### O que SIM fazer

✅ Usar variáveis de ambiente para secrets  
✅ Testar Docker localmente antes de push  
✅ Configurar CORS antes de deploy  
✅ Deixar migrations rodarem automaticamente  

---

## 🎯 RESUMO EXECUTIVO

| Item | Status | Tempo |
|------|--------|-------|
| Escolher plataforma | ✅ Railway | - |
| Preparar repo | ✅ 3 min | Agora |
| Setup Railway | ⏳ 15 min | Dia 1 |
| Deploy | ⏳ 20 min | Dia 1 |
| Testar | ⏳ 10 min | Dia 1 |
| Compartilhar cliente | ⏳ 5 min | Dia 2 |
| **TOTAL** | | **50 min** |

---

## 📞 PRÓXIMOS PASSOS

1. [ ] Ler este documento completamente
2. [ ] Criar conta Railway (5 min)
3. [ ] Conectar GitHub (5 min)
4. [ ] Fazer deploy (20 min)
5. [ ] Testar endpoints (10 min)
6. [ ] Compartilhar URL com cliente (5 min)
7. [ ] Monitorar primeiras 24h
8. [ ] Coletar feedback

---

**Pronto!** Você está 20 minutos de dar ao cliente um ambiente de testes funcional.

Alguma dúvida? Quer que eu execute o deploy agora?
