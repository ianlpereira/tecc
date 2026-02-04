# 🔧 Docker Troubleshooting Guide

## ❌ Problema: Input/Output Error no Docker

Se você receber erros como:

```
error committing: write /var/lib/docker/buildkit/containerd-overlayfs/metadata_v2.db: input/output error
```

ou

```
blob sha256:... expected at ... input/output error
```

### ✅ Solução: Reset do Docker Desktop

#### Passo 1: Parar Docker Desktop
- Clique no ícone Docker na bandeja do sistema (canto inferior direito)
- Selecione "Quit Docker Desktop"
- Aguarde até fechardiv completamente

#### Passo 2: Limpar dados corrompidos
```powershell
# Abra PowerShell como Administrador

# Remova os arquivos corrompidos (CUIDADO: apaga dados docker)
Remove-Item -Path "$env:APPDATA\Docker" -Recurse -Force
```

#### Passo 3: Reiniciar Docker Desktop
- Abra Docker Desktop novamente
- Aguarde a inicialização completa (2-3 minutos)

#### Passo 4: Verificar status
```powershell
docker ps
# Deve retornar sem erros
```

#### Passo 5: Tentar build novamente
```powershell
cd c:\Users\ianlp\Documents\projs\tecc
docker-compose up -d --build
```

---

## 🚨 Se Ainda Não Funcionar

### Opção A: Reset Completo do Docker
1. Desinstale Docker Desktop
2. Limpe `$env:APPDATA\Docker`
3. Reinicie o Windows
4. Instale Docker Desktop novamente

### Opção B: Usar Docker com WSL2 Backend
Se usar Windows 10/11 com WSL2:

```powershell
# Abra PowerShell como Admin
wsl --list --verbose

# Se WSL2 está instalado, Docker Desktop usará automaticamente
# Caso contrário, instale WSL2
```

### Opção C: Usar Podman em vez de Docker (Alternativa)
```powershell
# Instalar Podman
choco install podman

# Usar de forma compatível
podman compose up -d --build
```

---

## ✅ Verificação de Saúde

Depois de resolver, teste:

```powershell
# Teste 1: Imagens disponíveis
docker images

# Teste 2: Containers rodando
docker ps

# Teste 3: Build simples
docker build -t test:latest .

# Teste 4: Compose up
docker-compose up -d --build
```

---

## 📝 Status Esperado

Quando funcionar, você deve ver:

```
[+] Running 4/4
 ✔ Network tecc_default Created              0.0s
 ✔ Container tecc_db Created                 0.0s
 ✔ Container tecc_backend Created            0.0s
 ✔ Container tecc_frontend Created           0.0s
```

E acessar:
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/api/docs

