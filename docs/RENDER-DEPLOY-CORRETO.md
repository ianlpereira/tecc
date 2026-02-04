# 🚀 RENDER DEPLOY - Guia Atualizado (Com Fix)

> Versão corrigida com solução para erro de Dockerfile

---

## ⚠️ ERRO COMUM (RESOLVIDO)

```
error: failed to solve: failed to read dockerfile: open Dockerfile: no such file or directory
```

**Causa:** Root Directory não configurado como `backend/`

**Solução:** Seguir este guia (já com correção incluída!)

---

## 🎯 RESUMO RENDER

```
Custo:             $0 por 3 meses
Setup:             ~30 minutos (COM CORREÇÃO)
Auto-deploy:       Sim (git push)
Spin-down:         Sim, mitigável com UptimeRobot
Backend Dockerfile: backend/Dockerfile
Frontend Dockerfile: frontend/Dockerfile
```

---

## 🚀 SETUP CORRETO (5 PASSOS)

### PASSO 1: Criar Conta (5 min)

```
→ https://render.com
→ "Get Started"
→ Sign up com GitHub
→ Autorizar Render
```

---

### PASSO 2: Criar Backend (8 min) - ⭐ CONFIGURAR CORRETAMENTE

```
1. Dashboard → "Create New" → "Web Service"
2. Selecionar "tecc" repository
3. Configurar EXATAMENTE assim:

   Name:              tecc-backend
   ⭐ Root Directory: backend/  (IMPORTANTE!)
   
   Build Command:     pip install -r requirements.txt
   Start Command:     uvicorn app.main:app --host 0.0.0.0 --port 8000
   
   Environment:       production
   DEBUG:             false
   ENVIRONMENT:       production

4. Criar serviço
```

**Resultado esperado:**
- Build detecta `backend/Dockerfile` ✅
- Build bem-sucedido
- Backend respondendo em https://tecc-backend-xxxx.onrender.com

---

### PASSO 3: Criar PostgreSQL (automático)

```
1. No projeto → "Create +" → "PostgreSQL"
2. Render cria automaticamente
3. Copiar "Internal Database URL"
4. Ir em Backend → Environment
5. Adicionar:
   DATABASE_URL: [colar URL copiada]
6. Salvar
```

---

### PASSO 4: Criar Frontend (5 min) - ⭐ TAMBÉM CORRIGIR

```
1. Dashboard → "Create New" → "Web Service"
2. Selecionar "tecc" repository
3. Configurar EXATAMENTE assim:

   Name:              tecc-frontend
   ⭐ Root Directory: frontend/  (IMPORTANTE!)
   
   Build Command:     npm install && npm run build
   Start Command:     npm run preview
   
   Environment:       production
   VITE_API_URL:      https://tecc-backend-xxxx.onrender.com

4. Criar serviço
```

**Resultado esperado:**
- Build detecta `frontend/Dockerfile` ✅
- Frontend respondendo em https://tecc-frontend-xxxx.onrender.com

---

### PASSO 5: Testar (5 min)

```
1. Aguardar ambos serviços em status "Live"
2. Acessar https://tecc-frontend-xxxx.onrender.com
3. Verificar funcionalidades
4. Testar conexão com backend
5. Pronto! ✅
```

**Total: ~30 minutos**

---

## ✅ CHECKLIST SETUP CORRETO

```
Backend:
[ ] Name: tecc-backend
[ ] Root Directory: backend/  ← CRÍTICO!
[ ] Build: pip install -r requirements.txt
[ ] Start: uvicorn app.main:app --host 0.0.0.0 --port 8000
[ ] DATABASE_URL: postgres://...
[ ] DEBUG: false
[ ] Status: "Live"

PostgreSQL:
[ ] Criado automaticamente
[ ] DATABASE_URL copiada
[ ] Conectado ao Backend

Frontend:
[ ] Name: tecc-frontend
[ ] Root Directory: frontend/  ← CRÍTICO!
[ ] Build: npm install && npm run build
[ ] Start: npm run preview
[ ] VITE_API_URL: https://backend-url
[ ] Status: "Live"

Teste Final:
[ ] Frontend carrega
[ ] Backend responde
[ ] API Docs acessível
[ ] Primeira conta criada
```

---

## 🌐 URLS FINAIS

```
Frontend (Cliente):
https://tecc-frontend-[ID].onrender.com

Backend (API):
https://tecc-backend-[ID].onrender.com

API Docs:
https://tecc-backend-[ID].onrender.com/api/docs

Health Check:
https://tecc-backend-[ID].onrender.com/api/health
```

---

## 🔄 AUTO-DEPLOY

Cada `git push`:
```bash
git push origin main
  ↓
Render detecta
  ↓
Build automático (2-3 min)
  ↓
Deploy sem downtime
  ↓
Cliente vê mudança
```

---

## ⚠️ SPIN-DOWN (Esperado)

**O que é:**
- Render desativa após 15 min inativo
- Primeira requisição: ~30 segundos
- Próximas: normal

**Como lidar:**
1. Documentar para cliente
2. Usar UptimeRobot (FREE) para manter acordado
3. Aceitar como limitação de teste grátis

**UptimeRobot Setup:**
```
1. https://uptimerobot.com
2. Sign up (grátis)
3. Add monitor
4. URL: https://tecc-backend-[ID].onrender.com/api/health
5. Interval: 5 minutos
6. Pronto! (mantém acordado 24/7)
```

---

## 🚨 SE DER ERRO

### Erro: "Dockerfile not found"

**Solução:**
```
1. Render Dashboard → Backend → Settings
2. Root Directory: backend/
3. Salvar
4. Render tenta rebuild automático
```

### Erro: "Build failed"

**Solução:**
```
1. Deployments → último deployment
2. Ver logs completos
3. Se erro em requisitos: pip freeze > requirements.txt
4. git push
5. Render tenta de novo (automático)
```

### Erro: Frontend não conecta API

**Solução:**
```
1. Verificar VITE_API_URL está correto
2. Verificar CORS no Backend:
   
   backend/app/main.py:
   allow_origins=["https://tecc-frontend-[ID].onrender.com"]

3. Backend respondendo?
   curl https://tecc-backend-[ID].onrender.com/api/health
```

---

## 📊 CUSTO PROGRESSIVO

```
Mês 1-3:       $0 (GRÁTIS!)
Mês 4+:        $29/mês (se continuar)

MÊS 4 (Opções):
├─ Migrar Railway: $22/mês (SEM spin-down)
├─ Continuar Render: $29/mês (COM spin-down)
└─ Cancelar: $0 (sem prejuízo)
```

---

## 📝 COMPARTILHAR COM CLIENTE

```
Assunto: TECC - Seu Teste Está Pronto (Grátis!)

Olá!

Acesse: https://tecc-frontend-[ID].onrender.com

🎉 Bom saber: Primeiros 3 meses são GRÁTIS!

⚠️ Nota importante:
Se não acessar por 15 minutos, o servidor "dorme".
Primeira requisição depois demora ~30 segundos.
É normal em testes gratuitos!

Como usar:
1. Clique no link
2. Selecione uma filial
3. Vá para "Contas a Pagar"
4. Crie seu primeiro teste
5. Aproveite!

API Docs (testes técnicos):
https://tecc-backend-[ID].onrender.com/api/docs

Dúvidas? Me avisa!

Abraços!
```

---

## 🎬 PRÓXIMOS PASSOS

1. ✅ Ler este guia (fazendo!)
2. ⏳ Abrir https://render.com
3. ⏳ Criar conta (5 min)
4. ⏳ Criar Backend com Root Directory = backend/ (8 min)
5. ⏳ Criar PostgreSQL (automático)
6. ⏳ Criar Frontend com Root Directory = frontend/ (5 min)
7. ⏳ Testar URLs (5 min)
8. ⏳ Compartilhar com cliente

**Total: 30 minutos**

---

## 💡 RESUMO IMPORTANTE

```
✅ Root Directory (Backend): backend/  ← CRÍTICO!
✅ Root Directory (Frontend): frontend/  ← CRÍTICO!
✅ Build commands corretos
✅ Start commands corretos
✅ Variáveis de ambiente configuradas
✅ PostgreSQL conectado
✅ Auto-deploy ativado

Se seguir tudo isso:
→ Pronto em 30 minutos!
→ Cliente testando GRÁTIS por 3 meses!
→ Economiza $66!
```

---

## 🚀 COMECE AGORA!

https://render.com → Siga este guia → Pronto! 🎉

---

*Boa sorte! Você consegue fazer isso! 💪*

*A chave é: Root Directory correto = sucesso garantido!*
