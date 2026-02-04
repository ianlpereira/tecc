# 📋 DEPLOY RÁPIDO - Guia Executivo

**Objetivo:** Deploy da aplicação TECC em produção para teste com cliente  
**Tempo:** 20-30 minutos  
**Custo:** $7-22/mês  
**Facilidade:** ⭐ Muito Fácil  

---

## 🎯 DECISÃO RÁPIDA

### ✅ Recomendação: Railway (Melhor Custo-Benefício)

**Por quê?**
- $5-22/mês (mínimo)
- Deploy automático com GitHub
- Sem downtime
- PostgreSQL incluído
- Sem spin-down

---

## 🚀 DEPLOY EM 5 PASSOS

### 1️⃣ Preparar Repositório (3 min)

```bash
cd /home/ianlp/tecc

# Verificar tudo está commitado
git status

# Enviar para GitHub (se não estiver)
git push origin main
```

### 2️⃣ Ir para Railway (5 min)

1. Acessar https://railway.app
2. Clique "Create New Project"
3. Escolha "Deploy from GitHub"
4. Autorizar e selecionar `tecc`

### 3️⃣ Railway Detecta Automaticamente (10 min)

Railway vai:
- ✅ Ver 2 Dockerfiles (backend + frontend)
- ✅ Detectar PostgreSQL necessário
- ✅ Criar 3 serviços automaticamente

### 4️⃣ Configurar Variáveis de Ambiente (5 min)

**Para Backend:**
```
DATABASE_URL = postgresql+asyncpg://user:pass@db-host:5432/tecc_db
ENVIRONMENT = production
DEBUG = false
```

**Para Frontend:**
```
VITE_API_URL = https://seu-backend-railway.up.railway.app
```

### 5️⃣ Deploy (2 min)

Clique "Deploy" → Aguarde ✅ → Pronto!

URLs geradas:
```
Frontend: https://tecc-frontend-prod.up.railway.app
Backend:  https://tecc-backend-prod.up.railway.app
Docs:     https://tecc-backend-prod.up.railway.app/api/docs
```

---

## 🔗 COMPARTILHAR COM CLIENTE

```
Acesse: https://tecc-frontend-prod.up.railway.app

Instruções:
1. Selecione uma filial no topo
2. Clique em "Contas a Pagar"
3. Crie sua primeira conta
4. Veja no Dashboard

Bugou algo? Avise!
```

---

## 💰 CUSTO

```
Teste (primeiras 100h):        $0
Produção Mensal (recomendado): $22-30
  - PostgreSQL:    $12
  - Backend:       $5
  - Frontend:      $5
```

---

## ❌ ALTERNATIVAS (Se Railway falhar)

| Plataforma | Custo | Setup | Sem Downtime |
|-----------|-------|-------|--------------|
| **Render** | $7 | 15min | ❌ (spin-down) |
| **Railway** | $5 | 15min | ✅ |
| **DigitalOcean** | $15 | 20min | ✅ |
| **Fly.io** | $5 | 20min | ✅ |

---

## 📞 CHECKLIST ANTES DE DEPLOY

- [ ] Git repository atualizado
- [ ] Backend responde em `/api/health`
- [ ] Frontend carrega localmente
- [ ] Migrations criadas em `backend/alembic/versions/`
- [ ] `.env.example` não tem secrets
- [ ] Dockerfiles testados localmente

---

## 🎉 PRONTO!

Seu cliente consegue testar em 20 minutos por $7-22/mês.

**Next:** Executar deploy ou precisa de ajuda específica?
