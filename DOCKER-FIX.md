# 🐛 Possível Solução para o Problema Docker

Sua máquina encontrou um erro de I/O do Docker Desktop. Isto acontece quando o HD ou sistema de arquivos está sobrecarregado.

## Passos Rápidos para Resolver

1. **Feche Docker Desktop completamente**
   - Clique com botão direito no ícone Docker (canto inferior direito)
   - Selecione "Quit Docker Desktop"
   - Aguarde 30 segundos

2. **Limpe os dados corrompidos**
   ```powershell
   # Abra PowerShell como Administrador
   # Apague a pasta de dados Docker
   Remove-Item -Path "$env:APPDATA\Docker" -Recurse -Force -ErrorAction SilentlyContinue
   ```

3. **Reinicie Docker Desktop**
   - Execute Docker Desktop novamente
   - Aguarde 2-3 minutos até estar totalmente pronto

4. **Tente o comando novamente**
   ```powershell
   cd c:\Users\ianlp\Documents\projs\tecc
   docker-compose down -v
   docker-compose up -d --build
   ```

## Se Persistir o Erro

Tente executar os containers **sem rebuild**:

```powershell
docker-compose up -d
```

Isto usa as imagens em cache se disponível.

## Ultima Alternativa

Se nada funcionar, Docker Desktop pode estar profundamente corrompido. Reinstale:

```powershell
# Desinstale
choco uninstall docker-desktop -y

# Remova arquivos residuais
Remove-Item -Path "$env:APPDATA\Docker" -Recurse -Force -ErrorAction SilentlyContinue

# Reinstale
choco install docker-desktop -y

# Reinicie o Windows
Restart-Computer
```

Depois tente `docker-compose up -d --build` novamente.

---

**Status do Projeto**: Arquivos estão prontos, é um problema de infraestrutura local. Uma vez que o Docker funcione, está tudo configurado! ✅
