# 🎯 DEPLOY RENDER - Guia Completo (3 Meses Grátis)

> **Vantagem:** Primeiras 100h/mês grátis em cada serviço = $0 por 3 meses!

---

## ✅ POR QUE RENDER (Se Quer Grátis)

```
PostgreSQL:    Grátis por 90 dias
Backend:       Primeiras 100h/mês grátis ($0)
Frontend:      Primeiras 100h/mês grátis ($0)
────────────────────────────────────────
Mês 1-3:       $0 (totalmente grátis!)
Mês 4+:        ~$30/mês (paga normal)

vs Railway:    $22/mês desde o começo
Diferença:     Você economiza $66 em 3 meses
```

**Desvantagem:** Spin-down após 15min inatividade (demora 30seg acordar)

---

## 🚀 SETUP RENDER - PASSO A PASSO (20 minutos)

### ETAPA 1: Criar Conta Render (5 min)

```
1. Abrir https://render.com
2. Clicar "Get Started"
3. Sign up com GitHub
4. Autorizar Render acessar seu repositório
5. Confirmar email
```

---

### ETAPA 2: Criar Novo Projeto (2 min)

```
1. Dashboard → "Create New"
2. Escolher "Web Service"
3. Conectar GitHub (já autorizado)
4. Selecionar repositório "tecc"
```

---

### ETAPA 3: Configurar Backend (8 min)

#### 3.1 Configurações Iniciais

```
Name:              tecc-backend
Region:            São Paulo (Brazil South) ou us-east-1
Branch:            main
Root Directory:    backend
```

#### 3.2 Build & Deploy

```
Build Command:     pip install -r requirements.txt
Start Command:     uvicorn app.main:app --host 0.0.0.0 --port 8000
Environment:       production
```

#### 3.3 Variáveis de Ambiente

Clique "Advanced" → "Add Environment Variable":

```
DATABASE_URL:      (deixa em branco por agora)
ENVIRONMENT:       production
DEBUG:             false
```

#### 3.4 Criar PostgreSQL Database

```
1. No mesmo projeto, clique "Create +"
2. Escolher "PostgreSQL"
3. Render cria automaticamente
4. Copia a DATABASE_URL gerada
5. Volta ao Backend e cola em DATABASE_URL
```

**Resultado esperado:**
```
Backend rodando em: https://tecc-backend-xxxx.onrender.com
PostgreSQL conectado
```

---

### ETAPA 4: Configurar Frontend (5 min)

#### 4.1 Novo Web Service

```
1. Dashboard → "Create New" → "Web Service"
2. Selecionar repositório "tecc" novamente
3. Name: tecc-frontend
4. Region: us-east-1 (mais perto)
5. Branch: main
6. Root Directory: frontend
```

#### 4.2 Build & Deploy

```
Build Command:     npm install && npm run build
Start Command:     npm run preview
Environment:       production
```

#### 4.3 Variáveis de Ambiente

```
VITE_API_URL:      https://tecc-backend-xxxx.onrender.com
```

**Resultado esperado:**
```
Frontend rodando em: https://tecc-frontend-xxxx.onrender.com
Conectado ao backend
```

---

## 📝 CHECKLIST: CONFIG RENDER

```
Backend:
[ ] Nome: tecc-backend
[ ] Root: backend/
[ ] Build: pip install -r requirements.txt
[ ] Start: uvicorn app.main:app --host 0.0.0.0 --port 8000
[ ] DATABASE_URL: postgres://...
[ ] DEBUG: false

PostgreSQL:
[ ] Criado automaticamente
[ ] DATABASE_URL copiada
[ ] Conexão testada

Frontend:
[ ] Nome: tecc-frontend
[ ] Root: frontend/
[ ] Build: npm install && npm run build
[ ] Start: npm run preview
[ ] VITE_API_URL: https://backend-url
```

---

## ⏱️ TIMELINE DEPLOY RENDER

```
0-5 min:    Criar conta + autorizar GitHub
5-10 min:   Criar Backend service
10-15 min:  Criar PostgreSQL (automático)
15-20 min:  Criar Frontend service
20-25 min:  Configurar variáveis
25-30 min:  Deploy & Testes
────────────────────────────────
Total:      30 minutos
```

---

## 🔄 DEPLOY AUTOMÁTICO (Já Vem Habilitado)

Cada vez que você fizer:

```bash
git push origin main
```

Render automaticamente:
1. Detecta novo push
2. Faz build das imagens
3. Testa healthcheck
4. Faz deploy

**Demora:** ~2-3 minutos por serviço

---

## 🚨 SPIN-DOWN (Importante Saber)

Render desativa serviço após **15 minutos inativo**.

Quando cliente acessa pela primeira vez:
```
1. Requisição chega
2. Render "acorda" o serviço
3. Leva ~30 segundos
4. Requisição completa
```

**Como lidar:**
- Documentar para cliente: "Primeira vez pode demorar 30seg"
- Usar Render Cron para manter "acordado"
- Upgrade para plano pago ($7+) para evitar

### Manter Serviço Acordado (OPCIONAL)

Se quiser evitar spin-down nos 3 primeiros meses:

Crie um simples cronjob que pinga o serviço a cada 10min:

```bash
# No seu computador, rode a cada 10 minutos:
while true; do
  curl -s https://tecc-backend-xxxx.onrender.com/api/health > /dev/null
  sleep 600  # 10 minutos
done
```

Ou use um serviço como [UptimeRobot](https://uptimerobot.com) (grátis):
```
1. Criar conta
2. Add monitor
3. URL: https://tecc-backend.onrender.com/api/health
4. Intervalo: 5 minutos
5. Pronto! (mantém acordado)
```

---

## 🐛 TROUBLESHOOTING RENDER

### Problema: Build falhou

**Solução:**
```
1. Ir em Deployments
2. Ver último deployment
3. Clicar em "Logs"
4. Ver exato erro que apareceu
5. Corrigir em VSCode
6. git push origin main
7. Render tenta novamente (automático)
```

### Problema: Migrations não rodaram

**Solução 1 (Automático - Recomendado):**
```
Editar backend/Dockerfile:
   
   Antes:
   CMD ["uvicorn", "app.main:app", ...]
   
   Depois:
   CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app ..."]
```

**Solução 2 (Manual - Último Recurso):**
```
1. Render Dashboard → Backend
2. Shell (canto superior direito)
3. Executar:
   alembic upgrade head
4. Sair
```

### Problema: Frontend não conecta ao Backend

**Verificar:**
```
1. VITE_API_URL está correto?
   https://tecc-backend-xxxx.onrender.com
   
2. Backend está respondendo?
   curl https://tecc-backend-xxxx.onrender.com/api/health
   
3. CORS está configurado?
   backend/app/main.py:
   allow_origins=["https://tecc-frontend-xxxx.onrender.com"]
```

### Problema: PostgreSQL não conecta

**Verificar:**
```
1. DATABASE_URL está copiada certo?
   Ir em PostgreSQL → Info
   Copiar "Internal Database URL" (para Backend)
   
2. Backend pode ver PostgreSQL?
   No Shell do Backend:
   python -c "import asyncpg; print('OK')"
   
3. Migrations podem rodar?
   alembic upgrade head (no Shell)
```

### Problema: 30 segundos demora ao acessar

**Isso é spin-down (normal em Render free tier)**

Soluções:
- A) Usar UptimeRobot para manter acordado
- B) Aceitar delay na primeira requisição
- C) Upgrade para pago ($7+/mês)
- D) Migrar para Railway depois

---

## 📊 MONITORAMENTO RENDER

### Acessar Dashboard

```
1. https://dashboard.render.com
2. Selecionar seu projeto
3. Ver em tempo real:
   - CPU %
   - Memory %
   - Requests/segundo
   - Logs em tempo real
   - Deployments histórico
```

### Alertas (OPCIONAL)

```
Settings → Notifications:
[ ] Deployment failure
[ ] Service outage
[ ] High CPU/Memory
```

---

## 💰 CUSTO PROGRESSIVO

```
Mês 1-3 (Teste Gratuito):
├─ Backend:    FREE (primeiras 100h)
├─ Frontend:   FREE (primeiras 100h)
├─ PostgreSQL: FREE (90 dias)
└─ TOTAL:      $0

Mês 4+ (Pago):
├─ Backend:    $7/mês (se 100h/mês)
├─ Frontend:   $7/mês (se 100h/mês)
├─ PostgreSQL: $15/mês
└─ TOTAL:      $29/mês

vs Railway:    $22/mês desde começo
Economia 3m:   $66 (Render grátis vs Railway)
```

---

## 🚀 URLS FINAIS (Exemplo)

```
Frontend (Cliente acessa):
https://tecc-frontend-abc123.onrender.com

Backend (API):
https://tecc-backend-abc123.onrender.com

Docs (Você testa):
https://tecc-backend-abc123.onrender.com/api/docs

Health Check:
https://tecc-backend-abc123.onrender.com/api/health
```

---

## 📱 COMPARTILHAR COM CLIENTE

Email para cliente:

```
Assunto: TECC - Ambiente de Testes (Primeiras 100h grátis!)

Oi!

Seu ambiente de testes está pronto!

🎉 Bom para saber: Primeiros 3 meses são GRÁTIS!

Acesse: https://tecc-frontend-abc123.onrender.com

⚠️ Nota importante:
Se não acessar por 15min, o servidor "dorme".
Primeira requisição após dormir demora ~30 segundos.
Depois volta ao normal!

Como usar:
1. Clique no link acima
2. Selecione uma filial
3. Vá para "Contas a Pagar"
4. Crie seu primeiro registro
5. Veja no Dashboard

API Docs (testes técnicos):
https://tecc-backend-abc123.onrender.com/api/docs

Bugs ou dúvidas? Me avisa!

Abraços!
```

---

## ✅ CHECKLIST PRÉ-DEPLOY RENDER

```
Código:
[ ] Backend Dockerfile testado localmente
[ ] Frontend Dockerfile testado localmente
[ ] Migrations em alembic/versions/
[ ] .env.example sem secrets
[ ] Git updated (git push origin main)

Render:
[ ] Conta criada
[ ] GitHub autorizado
[ ] Backend criado + variáveis
[ ] PostgreSQL criado + DATABASE_URL copiada
[ ] Frontend criado + VITE_API_URL configurada

Testes:
[ ] Backend respondendo em /api/health
[ ] Frontend carregando
[ ] Conexão PostgreSQL funcionando
[ ] Migrations rodadas
[ ] Primeira conta criada

Status: ✅ Pronto para deploy!
```

---

## 🎬 DEPOIS DO DEPLOY

### Primeira Semana
```
[ ] Cliente testa
[ ] Coletar feedback
[ ] Corrigir bugs críticos
[ ] Documentar issues
```

### Primeira Mês
```
[ ] Monitorar performance
[ ] Ajustar variáveis de ambiente
[ ] Fazer backups manuais do banco
[ ] Planejar migração para Railway (se quiser)
```

### Mês 3 (Antes de virar Pago)
```
[ ] Decidir: continuar Render ou migrar Railway?
[ ] Se continuar: planejar upgrade pago
[ ] Se migrar: preparar migração de dados
```

---

## 🔄 MIGRAÇÃO PARA RAILWAY (Se Depois Quiser)

Render → Railway é fácil:

```
1. Fazer backup do PostgreSQL Render
2. Criar projeto Railway
3. Restaurar backup em Railway PostgreSQL
4. Atualizar Backend DATABASE_URL
5. Atualizar Frontend VITE_API_URL
6. Git push
7. Railway faz deploy automático
8. Testar tudo
9. Deletar projeto Render
```

---

## 💡 DICAS PROFISSIONAIS

### Para Evitar Spin-Down
```bash
# Usar UptimeRobot (FREE):
1. https://uptimerobot.com
2. Sign up (grátis)
3. Add monitor
4. URL: https://tecc-backend.onrender.com/api/health
5. Interval: 5 minutos
6. Pronto! (mantém acordado)
```

### Para Acelerar Deploy
```
1. Render preferencia: regiões norte-americanas
2. Se cliente é Brasil: aceitar ~1-2seg de latência
3. Upgrade para Railway depois se precisar (melhor latência)
```

### Para Monitorar Banco
```
1. Fazer backup manual a cada semana:
   pg_dump -U user -h host database > backup.sql
2. Guardar em local seguro
3. Se quebrar, restaurar com:
   psql -U user -h host database < backup.sql
```

---

## 🎯 PRÓXIMOS PASSOS

### AGORA (Você faz):
1. Criar conta Render (5 min)
2. Autorizar GitHub (2 min)
3. Criar Backend (8 min)
4. Criar PostgreSQL (automático)
5. Criar Frontend (5 min)
6. Configurar variáveis (2 min)
7. Testar URLs (3 min)

### DEPOIS:
1. Compartilhar com cliente
2. Cliente testa por 3 meses
3. Coletar feedback
4. Decidir próximo passo

---

## 📊 RENDER vs RAILWAY (Comparação Final)

```
                    RENDER           RAILWAY
Custo 3 meses:      $0 ⭐           $66
Facilidade setup:   ⭐⭐⭐⭐⭐      ⭐⭐⭐⭐⭐
Sem downtime:       ❌ (spin-down)  ✅
Latência (Brasil):  ⭐⭐            ⭐⭐⭐
Auto-deploy:        ✅              ✅
PostgreSQL incl:    ✅ (90d)        ✅
Dashboard:          ⭐⭐⭐⭐        ⭐⭐⭐⭐⭐

Melhor para:
- RENDER:   Teste GRATUITO de 3 meses
- RAILWAY:  Produção sem comprometimento
```

---

## 🚀 STATUS FINAL

```
Aplicação:        100% pronta ✅
Plataforma:       Render (grátis 3m)
Custo:            $0 por 3 meses
Setup:            ~30 minutos
Deploy:           Automático (Git push)
Spin-down:        Sim (mitigável com UptimeRobot)

Próximo:          Seguir passo a passo acima!
```

---

**Comece agora:**
1. Abra https://render.com
2. Sign up com GitHub
3. Siga o guia acima
4. Em 30 min, cliente testando! 🚀

---

*Boa sorte! Você consegue fazer isso! 💪*
