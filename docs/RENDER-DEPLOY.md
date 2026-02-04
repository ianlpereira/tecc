# 🚀 Deploy Render - Guia Completo

> Deploy GRÁTIS por 3 meses + cliente testando

---

## 🎯 RESUMO RENDER

```
Custo (3 meses):        $0 (GRÁTIS!)
Custo (mês 4+):         ~$29/mês
Setup:                  ~30 minutos
Facilidade:             ⭐⭐⭐⭐⭐
Auto-Deploy:            ✅ Sim (git push)
Spin-down:              Sim (30seg primeira vez)
```

---

## 5️⃣ PASSOS PARA DEPLOY

### 1️⃣ Criar Conta (5 min)

```
→ https://render.com
→ "Get Started"
→ Sign up com GitHub
→ Autorizar Render
→ Confirmar email
```

---

### 2️⃣ Criar Backend (8 min) - ⭐ IMPORTANTE!

```
1. Dashboard → "Create New" → "Web Service"
2. Selecionar "tecc" repository
3. Configurar EXATAMENTE:

   Name:              tecc-backend
   ⭐ Root Directory: backend/  ← CRÍTICO!
   Build Command:     pip install -r requirements.txt
   Start Command:     uvicorn app.main:app --host 0.0.0.0 --port 8000
   Environment:       production
   DEBUG:             false

4. Criar serviço
```

**Resultado esperado:**
- Build detecta `backend/Dockerfile` ✅
- Backend em: <https://tecc-backend-xxxx.onrender.com>

---

### 3️⃣ Criar PostgreSQL (automático)

```
1. Dashboard → "Create +" → "PostgreSQL"
2. Render cria automaticamente
3. Copiar "Internal Database URL"
4. Ir em Backend → Environment
5. Adicionar: DATABASE_URL=[URL copiada]
6. Salvar e restart backend
```

---

### 4️⃣ Criar Frontend (5 min) - ⭐ IMPORTANTE

```
1. Dashboard → "Create New" → "Web Service"
2. Selecionar "tecc" repository
3. Configurar EXATAMENTE:

   Name:              tecc-frontend
   ⭐ Root Directory: frontend/  ← CRÍTICO!
   Build Command:     npm install && npm run build
   Start Command:     npm run preview
   VITE_API_URL:      https://tecc-backend-xxxx.onrender.com

4. Criar serviço
```

**Resultado esperado:**
- Frontend em: <https://tecc-frontend-xxxx.onrender.com>

---

### 5️⃣ Testar (5 min)

```
1. Aguardar ambos status "Live"
2. Acessar https://tecc-frontend-xxxx.onrender.com
3. Verificar funcionalidades
4. Testar API Docs: https://tecc-backend-xxxx.onrender.com/api/docs
```

**Total: ~30 minutos** ✅

---

## 🌐 URLS FINAIS

```
Frontend (Cliente):    https://tecc-frontend-[ID].onrender.com
Backend (API):         https://tecc-backend-[ID].onrender.com
API Docs:              https://tecc-backend-[ID].onrender.com/api/docs
Health Check:          https://tecc-backend-[ID].onrender.com/api/health
```

---

## ✅ CHECKLIST SETUP

```
Backend:
[ ] Name: tecc-backend
[ ] Root Directory: backend/  ← CRÍTICO!
[ ] Build: pip install -r requirements.txt
[ ] Start: uvicorn app.main:app --host 0.0.0.0 --port 8000
[ ] DATABASE_URL: postgres://...
[ ] Status: "Live"

PostgreSQL:
[ ] Criado automaticamente
[ ] DATABASE_URL configurada no Backend

Frontend:
[ ] Name: tecc-frontend
[ ] Root Directory: frontend/  ← CRÍTICO!
[ ] Build: npm install && npm run build
[ ] Start: npm run preview
[ ] VITE_API_URL: https://backend-url
[ ] Status: "Live"

Testes:
[ ] Frontend carrega
[ ] Backend responde
[ ] API Docs acessível
```

---

## 🔄 AUTO-DEPLOY

Cada `git push`:
```bash
git push origin main
  ↓
Render detecta
  ↓
Build automático
  ↓
Deploy
  ↓
Pronto! 🚀
```

Sem você fazer nada!

---

## ⚠️ SPIN-DOWN (Esperado)

**O que é:**
- Render desativa após 15 min inativo
- Primeira requisição demora ~30 segundos
- Próximas: normal

**Como lidar:**
1. Documentar para cliente
2. Usar UptimeRobot (FREE) para manter acordado
3. Aceitar como limitação de teste grátis

**UptimeRobot Setup (Opcional):**
```
1. https://uptimerobot.com
2. Sign up (grátis)
3. Add monitor
4. URL: https://tecc-backend-[ID].onrender.com/api/health
5. Interval: 5 minutos
6. Pronto! Mantém acordado 24/7
```

---

## 🚨 TROUBLESHOOTING

### Erro: "Dockerfile not found"

**Solução:**
```
1. Backend → Settings
2. Root Directory: backend/
3. Salvar e rebuild
```

### Build falhou

**Solução:**
```
1. Deployments → último deployment
2. Ver logs
3. Corrigir em VSCode
4. git push (rebuild automático)
```

### Frontend não conecta API

**Solução:**
```
1. Verificar VITE_API_URL correto
2. Verificar CORS no Backend
3. Testar: curl https://backend/api/health
```

### PostgreSQL não conecta

**Solução:**
```
1. Copiar "Internal Database URL" correto
2. Colar em Backend → Environment
3. Restart Backend
```

---

## 📊 CUSTO

```
Mês 1-3:        $0 (GRÁTIS!)
Mês 4+:         $29/mês (opcional)
```

---

## 📝 COMPARTILHAR COM CLIENTE

```
Assunto: TECC - Sua Demo Está Pronta! 🎉

Olá!

Acesse: https://tecc-frontend-[ID].onrender.com

🎉 Bom saber: Primeiros 3 meses GRÁTIS!

⚠️ Nota: Se não acessar por 15 min, servidor "dorme".
Primeira requisição depois demora ~30 seg (normal em testes grátis).

Como testar:
1. Clique no link
2. Selecione uma filial
3. Vá para "Contas a Pagar"
4. Crie seu primeiro teste
5. Aproveite!

API Docs (testes técnicos):
https://tecc-backend-[ID].onrender.com/api/docs

Abraços!
```

---

## 🎬 PRÓXIMOS PASSOS

1. ✅ Ler este guia
2. ⏳ Abrir <https://render.com>
3. ⏳ Criar conta (5 min)
4. ⏳ Criar Backend (8 min)
5. ⏳ Criar PostgreSQL (automático)
6. ⏳ Criar Frontend (5 min)
7. ⏳ Testar (5 min)
8. ⏳ Compartilhar com cliente

**Total: 30 minutos** ⏱️

---

## 💡 DICA IMPORTANTE

**Key do sucesso:** Root Directory correto = Deploy bem-sucedido! 🔑

Backend:  `backend/`  ← Não esqueça!
Frontend: `frontend/` ← Não esqueça!

---

🚀 **Comece agora em: <https://render.com>**
