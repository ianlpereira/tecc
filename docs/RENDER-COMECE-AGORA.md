# ✅ RENDER - Comece Seu Deploy GRÁTIS Agora!

> **Objetivo:** Economizar $66 em 3 meses + testar com cliente

---

## 🎯 RESUMO RENDER

```
Custo (3 meses):       $0 (totalmente GRÁTIS!)
Custo (mês 4+):        ~$29/mês (paga normal)
Setup:                 ~30 minutos
Facilidade:            ⭐⭐⭐⭐⭐ (fácil!)
Desvantagem:           Spin-down (30seg primeira vez)
Auto-Deploy:           ✅ Sim (Git push)
Melhor para:           Testes e MVP grátis
```

---

## 📋 5 PASSOS PARA DEPLOY RENDER

### 1️⃣ Criar Conta (5 min)

```
→ https://render.com
→ "Get Started"
→ Sign up com GitHub
→ Autorizar Render
→ Confirmar email
```

### 2️⃣ Criar Backend (8 min)

```
→ Dashboard → "Create New" → "Web Service"
→ Selecionar "tecc" repository
→ Config:
   Name: tecc-backend
   Root: backend/
   Build: pip install -r requirements.txt
   Start: uvicorn app.main:app --host 0.0.0.0 --port 8000
   DEBUG: false
→ Criar
```

### 3️⃣ Criar PostgreSQL (automático)

```
→ No mesmo projeto: "Create +" → "PostgreSQL"
→ Render cria automaticamente
→ Copiar DATABASE_URL
→ Ir em Backend → Variáveis
→ Colar DATABASE_URL
```

### 4️⃣ Criar Frontend (5 min)

```
→ Dashboard → "Create New" → "Web Service"
→ Config:
   Name: tecc-frontend
   Root: frontend/
   Build: npm install && npm run build
   Start: npm run preview
   VITE_API_URL: https://tecc-backend-xxxx.onrender.com
→ Criar
```

### 5️⃣ Testar (5 min)

```
→ Aguardar deploy finalizar (status "Live")
→ Acessar https://tecc-frontend-xxxx.onrender.com
→ Testar funcionalidades
→ Verificar conexão com backend
```

**Total: ~30 minutos** ✅

---

## 🌐 URLS FINAIS

```
Frontend (Cliente acessa):
https://tecc-frontend-[ID].onrender.com

Backend (API):
https://tecc-backend-[ID].onrender.com

Docs:
https://tecc-backend-[ID].onrender.com/api/docs
```

---

## 💾 VARIÁVEIS DE AMBIENTE

### Backend
```
DATABASE_URL:    postgresql://user:pass@host/db
ENVIRONMENT:     production
DEBUG:           false
```

### Frontend
```
VITE_API_URL:    https://tecc-backend-[ID].onrender.com
```

---

## ⚠️ SOBRE SPIN-DOWN

**O que é:**
- Render desativa serviço após 15 min inativo
- Primeira requisição demora ~30 segundos
- Próximas: normal

**Como lidar:**
- Documentar para cliente
- Usar UptimeRobot (FREE) para manter acordado
- Aceitar como limitação de teste grátis

**UptimeRobot (Optional):**
```
1. uptimerobot.com (grátis)
2. Add monitor
3. URL: https://tecc-backend-[ID].onrender.com/api/health
4. Interval: 5 min
5. Pronto! (mantém acordado)
```

---

## 🔄 AUTO-DEPLOY

Cada `git push`:
```
git push origin main
  ↓
Render detecta
  ↓
Build automático (2-3 min)
  ↓
Deploy automático
  ↓
Cliente vê mudança
```

**Sem você fazer nada!** 🚀

---

## 🚨 SE QUEBRAR

### Build falhou?
```
1. Render Dashboard → Deployments
2. Ver logs do último deploy
3. Corrigir erro em VSCode
4. git push origin main
5. Render tenta de novo (automático)
```

### PostgreSQL não conecta?
```
1. Verificar DATABASE_URL está certo
2. Ir em PostgreSQL → "Info"
3. Copiar "Internal Database URL"
4. Colar em Backend → Variáveis
```

### Frontend não vê Backend?
```
1. Verificar VITE_API_URL está correto
2. CORS deve estar configurado no Backend
3. Testar: curl https://backend/api/health
```

---

## 📊 LINHA DO TEMPO

```
Mês 1-3:      RENDER (GRÁTIS)
              ├─ Cliente testa
              ├─ Você economiza $66
              ├─ Aceita spin-down
              └─ Coleta feedback

Mês 4+:       DECIDIR
              ├─ Opção A: Migrar para Railway
              │  (30 min, $22/mês, sem spin-down)
              │
              └─ Opção B: Continuar Render
                 ($29/mês depois, com spin-down)
```

---

## 💰 CUSTO COMPARATIVO

```
Render 3 meses:    $0 ✅ (VOCÊ ECONOMIZA)
Railway 3 meses:   $66
Diferença:         $66 (economia!)

Render mês 4+:     $29/mês
Railway mês 4+:    $22/mês
```

---

## 🎬 AGORA VOCÊ PRECISA

1. ✅ Ler este documento (fazendo!)
2. ⏳ Abrir https://render.com
3. ⏳ Sign up com GitHub
4. ⏳ Seguir 5 passos acima
5. ⏳ Testar URLs
6. ⏳ Compartilhar com cliente

**Tempo total: 30-40 minutos**

---

## ✅ CHECKLIST FINAL

```
Render Setup:
[ ] Conta criada
[ ] GitHub autorizado
[ ] Backend criado + variáveis
[ ] PostgreSQL criado + DATABASE_URL copiada
[ ] Frontend criado + VITE_API_URL configurada
[ ] Deploy completado (Status: "Live")
[ ] URLs geradas

Testes:
[ ] Backend respondendo (/api/health)
[ ] Frontend carregando
[ ] PostgreSQL conectado
[ ] Primeira conta criada

Documentação:
[ ] Preparado para compartilhar com cliente
[ ] UptimeRobot configurado (optional)
[ ] Backup das URLs

Status: ✅ Pronto para cliente testar!
```

---

## 📱 COMPARTILHAR COM CLIENTE

```
Título: TECC - Ambiente de Teste (Grátis!)

Corpo:
Olá!

Seu teste está pronto e é COMPLETAMENTE GRÁTIS por 3 meses!

🎉 Acesse: https://tecc-frontend-[ID].onrender.com

⚠️ Nota importante:
Se não acessar por 15 minutos, o servidor "dorme".
Primeira requisição após dormir demora ~30 segundos.
É normal em testes gratuitos!

Como usar:
1. Clique no link acima
2. Selecione uma filial
3. Vá para "Contas a Pagar"
4. Teste a funcionalidade
5. Dê feedback!

API Docs (testes técnicos):
https://tecc-backend-[ID].onrender.com/api/docs

Dúvidas? Me avisa!
```

---

## 🔄 DEPOIS (Mês 4)

### Opção 1: Migrar para Railway (30 min)

```
Vantagens:
✅ Sem spin-down
✅ Mais rápido (80ms vs 120ms)
✅ Mais barato ($22 vs $29)
✅ Melhor para produção

Como migrar:
1. Backup do PostgreSQL (2 min)
2. Criar projeto Railway (5 min)
3. Restaurar banco (5 min)
4. Atualizar variáveis (3 min)
5. Git push (1 min)
6. Testar (5 min)
Total: 30 minutos
```

### Opção 2: Continuar Render

```
Custo: $29/mês
Com spin-down
Para testes/MVP
```

### Opção 3: Cancelar

```
Se cliente não gostou
Sem prejuízo ($0 investido)
```

---

## 🌟 VANTAGENS RENDER

✅ $0 por 3 meses (economia real)  
✅ Teste real sem custo  
✅ PostgreSQL incluído  
✅ Auto-deploy automático  
✅ Fácil de cancelar se não gostar  
✅ Fácil migrar para Railway depois  

---

## 🚀 COMECE AGORA!

```
1. Abra: https://render.com
2. Sign up com GitHub
3. Siga os 5 passos acima
4. Em 30 min: Cliente testando GRÁTIS!
```

---

## 📊 RENDER vs RAILWAY (Quick)

```
                RENDER      RAILWAY
Custo 3m:       $0 ⭐      $66
Setup:          30 min      30 min
Spin-down:      Sim ❌      Não ✅
Para testar:    ✅ PERFEITO OK
Para produção:  OK          ✅ MELHOR
```

---

## 💡 PRO TIP

```
HOJE:    Use Render (GRÁTIS + testa com cliente)
MÊS 4:   Se gostar → Migre Railway (melhor + barato)
         Se não:   → Cancelar (sem prejuízo)
```

---

**Pronto?**

**→ Abra https://render.com e comece! 🚀**

---

*30 minutos de trabalho = cliente testando GRÁTIS por 3 meses!*

*Você consegue! 💪*
