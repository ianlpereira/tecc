# ÉPICO 9: Correção de Fuso Horário (Bug Vencimento -1 dia)

**Status:** 📋 PLANEJADO  
**Prioridade:** 🔴 CRÍTICA — afeta todos os lançamentos em produção  
**Data de Planejamento:** 24/03/2026

---

## Problema

Ao lançar uma conta com vencimento em qualquer data (ex: 30/04/2026), o sistema salva e exibe **29/04/2026** (um dia antes). Isso afeta 100% dos lançamentos realizados até hoje.

**Causa raiz:** O frontend envia a data como string ISO 8601 em UTC midnight (`2026-04-30T00:00:00.000Z`). O PostgreSQL armazena em UTC. Ao ler de volta, o `date` type do Python/SQLAlchemy serializa sem timezone, mas o frontend (rodando em BRT = UTC-3) interpreta o timestamp como `2026-04-29T21:00:00` → exibe 29/04.

---

## Escopo

### Backend
- [ ] Garantir que campos `due_date` e `paid_at` sejam tratados como `Date` puro (sem timestamp)
- [ ] Validar que o schema Pydantic recebe e retorna `date` (não `datetime`)
- [ ] Revisar serialização JSON dos campos de data nas responses

### Frontend
- [ ] Corrigir envio de datas: usar `YYYY-MM-DD` puro (sem conversão UTC) ao serializar para a API
- [ ] Corrigir exibição: parsear `YYYY-MM-DD` sem aplicar conversão de timezone
- [ ] Revisar todos os `dayjs()` / `new Date()` usados para formatar datas de vencimento
- [ ] Garantir que DatePicker do AntD não aplique offset de fuso ao enviar

### Migration
- [ ] Verificar se há dados corrompidos no banco (datas com 1 dia a menos)
- [ ] Script de correção opcional: `UPDATE bills SET due_date = due_date + INTERVAL '1 day'` (somente se confirmado com o cliente)

---

## Critérios de Aceite

- Lançar vencimento 30/04 → sistema exibe e armazena 30/04
- Comportamento consistente independente do fuso do navegador
- Dados históricos avaliados e corrigidos se necessário

---

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `frontend/src/components/BillForm/index.tsx` | Serialização de datas |
| `frontend/src/pages/Bills/index.tsx` | Exibição de datas |
| `frontend/src/pages/Dashboard/index.tsx` | Exibição de datas |
| `backend/app/schemas/bill.py` | Garantir tipo `date` |
| `backend/app/routers/bills.py` | Revisar serialização |

---

## Referências

- Fuso horário do ambiente: BRT (UTC-3)
- Stack: AntD DatePicker + dayjs + FastAPI + PostgreSQL
