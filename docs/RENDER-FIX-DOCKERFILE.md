# ✅ FIX RENDER - Dockerfile não encontrado

> **Problema:** Render procura Dockerfile na raiz, mas está em backend/

---

## 🔧 SOLUÇÃO RÁPIDA (2 opções)

### ❌ O QUE NÃO FAZER

Não crie Dockerfile na raiz! Fará deploy de tudo junto.

---

### ✅ SOLUÇÃO 1: Configurar Render Corretamente (RECOMENDADO)

Ao criar o serviço Backend no Render:

```
1. Clicar em "Advanced"
2. "Root Directory": backend/
3. "Build Command": pip install -r requirements.txt
4. "Start Command": uvicorn app.main:app --host 0.0.0.0 --port 8000
5. Salvar
```

**Resultado:** Render procura `backend/Dockerfile` ✅

---

### ✅ SOLUÇÃO 2: Se Já Criou Errado

Se já criou o serviço e agora está com erro:

```
1. Render Dashboard → Backend
2. Settings (engrenagem)
3. "Root Directory": alterar para "backend/"
4. Salvar
5. Render tenta rebuild automático
```

---

## 🚨 ERRO QUE APARECEU

```
error: failed to solve: failed to read dockerfile: open Dockerfile: no such file or directory
```

**Significa:** Render procurou em:
```
/
├─ Dockerfile  ← procurou aqui (não existe!)
│
Deveria procurar em:
/backend/
├─ Dockerfile  ← está aqui!
```

---

## ✅ CORRIGIR AGORA

### Passo 1: Abrir Render Dashboard

```
https://dashboard.render.com
```

### Passo 2: Ir no Backend Service

```
Dashboard → tecc-backend
```

### Passo 3: Ir em Settings

```
Engrenagem (canto superior direito) → Settings
```

### Passo 4: Alterar Root Directory

```
ANTES:    (vazio ou "/")
DEPOIS:   backend/

Salvar
```

### Passo 5: Aguardar Rebuild

```
Render vai:
1. Detectar mudança
2. Fazer novo build
3. Procurar em backend/Dockerfile ✅
4. Deploy pronto!
```

---

## 📋 VERIFICAR DOCKERFILES

Confirme que os arquivos existem:

```bash
# Verificar
ls -la backend/Dockerfile
ls -la frontend/Dockerfile

# Resultado esperado:
# backend/Dockerfile existe? ✅
# frontend/Dockerfile existe? ✅
```

---

## 🚀 DEPOIS QUE CORRIGIR

```
1. Render faz rebuild automático
2. Logs mostram sucesso
3. Status muda para "Live"
4. Backend respondendo em https://tecc-backend-xxxx.onrender.com
5. Tudo funcionando! ✅
```

---

## 🔄 SE CONTINUAR COM ERRO

Se depois de corrigir Root Directory ainda der erro:

### Opção A: Deletar e Recriar

```
1. Render Dashboard → tecc-backend
2. "Delete Service"
3. "Create New" → "Web Service"
4. Configurar CORRETAMENTE:
   - Root Directory: backend/
   - Build: pip install -r requirements.txt
   - Start: uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Opção B: Verificar Dockerfile

```
1. Abrir backend/Dockerfile
2. Verificar se não está vazio
3. Verificar primeira linha: FROM python:3.11
4. Se vazio ou quebrado, restaurar do git
```

---

## 💾 RESTAURAR DOCKERFILE SE QUEBRADO

```bash
# Ver histórico
git log --oneline backend/Dockerfile

# Restaurar versão anterior
git checkout HEAD~1 backend/Dockerfile

# Ou resetar tudo
git reset --hard HEAD

# Depois commit e push
git add .
git commit -m "Fix Dockerfiles"
git push origin master
```

---

## ✅ CHECKLIST FIX

```
[ ] Root Directory (Backend): backend/
[ ] Root Directory (Frontend): frontend/
[ ] Build Commands configurados
[ ] Start Commands configurados
[ ] Backend Dockerfile existe? (backend/Dockerfile)
[ ] Frontend Dockerfile existe? (frontend/Dockerfile)
[ ] Git push feito (se alterou algo)
[ ] Render fazendo rebuild
[ ] Status: "Live" (esperado)
[ ] URLs respondendo
```

---

## 📞 SE TIVER DÚVIDA

Abra Render Dashboard e envie print:
```
Backend → Deployments → último deployment
```

Vou analisar os logs completos!

---

**Próximo passo:** Corrigir Root Directory agora! 🚀

---

*Render costuma dar esse erro quando:*
- *Root Directory não está configurado*
- *Aponta para raiz (/) em vez de backend/*
- *Dockerfile está em subpasta, não na raiz*
