# ÉPICO 13: Edição em Massa de Recorrência

**Status:** 📋 PLANEJADO  
**Prioridade:** 🟡 ALTA — corrige lançamentos errados em produção  
**Data de Planejamento:** 24/03/2026  
**Dependências:** nenhuma

---

## Motivação

Existem lançamentos recorrentes (ex: 12 parcelas) cadastrados com categoria errada. Ao corrigir a categoria de uma parcela, o usuário quer que a correção se propague para todas as parcelas do grupo. Hoje cada parcela precisa ser editada individualmente.

---

## Comportamento Atual

Ao editar qualquer conta recorrente, o sistema edita apenas aquela parcela.

## Comportamento Esperado

Ao clicar em "Editar" em uma conta que pertence a um grupo recorrente, o sistema exibe um modal de confirmação antes de salvar:

```
┌─────────────────────────────────────────────┐
│  Editar conta recorrente                    │
│                                             │
│  Esta conta faz parte de uma recorrência.  │
│  O que deseja editar?                       │
│                                             │
│  ○ Somente esta parcela                    │
│  ● Esta e as próximas                      │
│  ○ Todas as parcelas do grupo              │
│                                             │
│              [ Cancelar ] [ Confirmar ]     │
└─────────────────────────────────────────────┘
```

---

## Regras de Propagação

### "Somente esta parcela"
- Edita apenas a conta selecionada
- Comportamento igual ao atual

### "Esta e as próximas"
- Edita a conta selecionada e todas com `recurrence_index >= índice atual` no mesmo grupo
- Campos propagados: todos (descrição, valor, fornecedor, categoria, notas)
- Datas: recalculadas a partir da nova data informada, mantendo os intervalos originais

### "Todas as parcelas do grupo"
- Edita todas as contas do mesmo `recurrence_group_id`
- Campos propagados: todos exceto `due_date` (cada parcela mantém sua data)
- **Exceção:** se a data foi editada, recalcula todas as datas mantendo o mesmo intervalo entre parcelas

---

## Escopo

### Backend

- [ ] Novo endpoint: `PUT /api/v1/bills/{id}/recurrence`
  - Body: dados da edição + `scope: "this" | "this_and_next" | "all"`
- [ ] `BillService.update_bill_recurrence(bill_id, data, scope)`:
  - `"this"` → chama `update_bill()` existente
  - `"this_and_next"` → busca grupo, filtra por `recurrence_index >= atual`, atualiza em loop
  - `"all"` → busca grupo completo, atualiza todos os campos não-data; reconstrói datas se mudaram
- [ ] Lógica de recálculo de datas: `nova_data_base + (índice - índice_atual) * intervalo`
- [ ] Schema: `BillRecurrenceUpdate` com campo `scope`

### Frontend

- [ ] Detectar se conta editada tem `recurrence_group_id`
- [ ] Antes de submeter o formulário de edição, exibir Modal de escopo (se recorrente)
- [ ] Três opções em Radio Group: "Somente esta" / "Esta e as próximas" / "Todas"
- [ ] Enviar para o endpoint correto conforme escopo selecionado
- [ ] Invalidar queries `['bills']` após sucesso

---

## Critérios de Aceite

- Editar categoria de todas as 12 parcelas de uma vez → 1 operação resolve
- Ao escolher "Esta e as próximas" na parcela 5 de 12 → parcelas 5-12 são atualizadas
- Ao escolher "Somente esta" → comportamento idêntico ao atual
- Contas já pagas ou canceladas dentro do grupo **não** são sobrescritas
- Data de vencimento das pagas/canceladas é preservada

---

## Arquivos a Criar/Modificar

| Arquivo | Mudança |
|---------|---------|
| `backend/app/services/bill_service.py` | Método `update_bill_recurrence()` |
| `backend/app/routers/bills.py` | Endpoint `PUT /{id}/recurrence` |
| `backend/app/schemas/bill.py` | Schema `BillRecurrenceUpdate` |
| `frontend/src/components/BillForm/index.tsx` | Modal de escopo + lógica condicional |
| `frontend/src/services/api.ts` | Método `updateRecurrence()` |
| `frontend/src/hooks/useBills.ts` | Hook `useUpdateBillRecurrence()` |
