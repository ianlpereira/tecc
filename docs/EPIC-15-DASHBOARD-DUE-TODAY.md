# ÉPICO 15: Dashboard — Card "Total a Pagar Hoje"

**Status:** 📋 PLANEJADO  
**Prioridade:** 🟢 MÉDIA  
**Data de Planejamento:** 24/03/2026  
**Dependências:** Epic 9 (correção de fuso, para que as datas estejam corretas)

---

## Motivação

O gestor financeiro precisa saber, ao abrir o sistema pela manhã, **quanto precisa ser pago hoje** — incluindo contas atrasadas que ainda não foram pagas. Hoje esse número não existe de forma clara no Dashboard.

---

## Definição

**"Total a Pagar Hoje"** = soma do `amount` de todas as contas onde:
- `due_date <= hoje` (vencidas ou vencendo hoje)
- `status IN ('pending', 'approved')`
- `deleted_at IS NULL`
- Filial: considera o filtro de filial ativo no contexto global

---

## Escopo

### Backend

- [ ] Novo endpoint: `GET /api/v1/bills/summary/due-today`
  - Query param opcional: `branch_id`
  - Retorna: `{ count: int, total_amount: float, overdue_count: int, overdue_amount: float }`
  - `overdue`: `due_date < hoje` (atrasadas)
  - `due today`: `due_date == hoje`

### Frontend

- [ ] Novo card no Dashboard: **"A Pagar Hoje"**
  - Valor principal: soma total (atrasadas + hoje)
  - Subtexto: "X conta(s) — Y atrasada(s)"
  - Cor: vermelho se houver atrasadas, amarelo se só hoje, verde se zerado
- [ ] Posicionamento: primeiro card (mais destaque)
- [ ] Atualiza automaticamente com o filtro de filial do contexto global
- [ ] Hook: `useDueTodaySummary(branchId?)`

---

## Critérios de Aceite

- Card exibe R$ 0,00 quando não há contas pendentes vencidas ou com vencimento hoje
- Card exibe valor correto considerando contas de hoje + atrasadas
- Ao mudar filial no contexto global, o card atualiza
- Card não conta contas pagas ou canceladas

---

## Arquivos a Criar/Modificar

| Arquivo | Mudança |
|---------|---------|
| `backend/app/routers/bills.py` | Endpoint `GET /summary/due-today` |
| `backend/app/services/bill_service.py` | Método `get_due_today_summary()` |
| `backend/app/schemas/bill.py` | Schema `DueTodaySummary` |
| `frontend/src/pages/Dashboard/index.tsx` | Novo card "A Pagar Hoje" |
| `frontend/src/hooks/useBills.ts` | Hook `useDueTodaySummary()` |
| `frontend/src/services/api.ts` | Método `billApi.getDueTodaySummary()` |
