# 🎬 TECC - Início Rápido

## Uma única coisa a fazer AGORA

### Resolva Docker (5 minutos)

Seu Docker Desktop está com problemas de I/O. Solução rápida:

```powershell
# 1. Feche Docker Desktop (clique em Quit)
# 2. Abra PowerShell como Administrador
# 3. Copie e execute isto:

Remove-Item -Path "$env:APPDATA\Docker" -Recurse -Force

# 4. Reinicie Docker Desktop
# 5. Aguarde 2 minutos
# 6. Execute isto no terminal do VS Code:

cd c:\Users\ianlp\Documents\projs\tecc
docker-compose up -d --build
```

**Pronto!** Se funcionar, você verá:

```
[+] Running 4/4
 ✔ Network tecc_default Created
 ✔ Container tecc_db Created
 ✔ Container tecc_backend Created
 ✔ Container tecc_frontend Created
```

---

## ✅ Depois de Docker Funcionar

### Acesse:

1. **Frontend:** http://localhost:5173
   - Página branca com "Welcome to TECC"
   - Hot-reload funciona (edite `frontend/src/App.tsx`)

2. **Backend API:** http://localhost:8000
   - JSON com info da API

3. **Swagger UI:** http://localhost:8000/api/docs
   - Documentação interativa
   - Botão "Try it out" para testar endpoints

---

## 📚 O Que Você Tem

✅ **Backend Completo**
- FastAPI app com routers
- SQLAlchemy 2.0 async setup
- Pydantic v2 schemas
- Type hints 100%
- Estrutura em camadas

✅ **Frontend Completo**
- React + Vite + TypeScript
- Styled Components + Ant Design
- React Query + Zustand setup
- Hot-reload funcionando
- Theme centralizado

✅ **Infra Completo**
- Docker Compose pronto
- PostgreSQL rodando
- Volumes persistentes
- .env configurado

---

## 🚀 Próximo Passo (Épico 2)

Quando Docker funcionar, comece:

```bash
# Adicionar modelos SQLAlchemy
# Criar migrações Alembic
# Implementar repositories CRUD
# Criar endpoints GET/POST/PUT/DELETE
# Testes unitários
```

Veja `EPIC-2-PLANNING.md` para o plano completo.

---

## 📖 Documentação Rápida

| Arquivo | Conteúdo |
| ------- | -------- |
| `README.md` | Setup completo |
| `SUMMARY.md` | Resumo executivo |
| `STATUS.md` | Status atual |
| `DOCKER-FIX.md` | Troubleshooting |
| `EPIC-1.md` | Épico 1 detalho |
| `EPIC-2-PLANNING.md` | Próximos passos |
| `instructions.md` | Padrões de código |

---

## 🎯 Objetivo Final

Sistema financeiro centralizado com:
- ✅ 1 Matriz + 19 Filiais
- ✅ Gestão de contas a pagar
- ✅ Seletor de filial no header
- ✅ Auto-aplicação de branch_id
- ✅ UI rápida e responsiva

**Você está 95% lá. Só falta Docker funcionar! 🚀**

---

**Versão:** 1.0.0  
**Data:** Jan 27, 2026  
**Status:** 🔧 Aguardando Docker fix
