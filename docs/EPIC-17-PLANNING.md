# Epic 17 — Vínculo de Contas a Meios de Pagamento

## Objetivo

Permitir que uma conta a pagar seja vinculada a um **Meio de Pagamento** cadastrado no sistema (ex.: Bradesco, Caixa, Nubank), tanto na criação quanto na edição.

Atualmente o campo `payment_bank` já existe como **string livre** (usado ao marcar como paga). Este epic adiciona uma FK estruturada `payment_method_id` que referencia a tabela `payment_methods`, coexistindo com o campo livre para retrocompatibilidade.

---

## Escopo

### Backend

| Camada | Mudança |
|---|---|
| `models/bill.py` | Adicionar coluna `payment_method_id` (FK nullable → `payment_methods.id`) |
| `alembic/versions/` | Migration automática |
| `schemas/bill.py` | `BillCreate`, `BillUpdate`, `BillRecurrenceUpdate`, `BillResponse` — adicionar `payment_method_id` e `payment_method_name` (read-only) |
| `services/bill_service.py` | `create_bill`, `update_bill`, `update_bill_recurrence` — aceitar e persistir `payment_method_id` |
| `routers/bills.py` | Passar `payment_method_id` ao serviço nos endpoints de criação e edição |
| `repositories/bill_repository.py` | `get_for_report()` — JOIN com `payment_methods` para trazer `payment_method_name` |

### Frontend

| Arquivo | Mudança |
|---|---|
| `types/index.ts` | `Bill`, `BillCreate`, `BillUpdate`, `BillRecurrenceUpdate`, `BillReportRow` — `payment_method_id`, `payment_method_name` |
| `services/api.ts` | Nenhuma mudança (campos novos já trafegam no payload existente) |
| `components/BillForm/index.tsx` | Novo `<Select>` de meios de pagamento (abaixo do campo Fornecedor) |
| `pages/Bills/index.tsx` | Coluna "Meio de Pagamento" na tabela |
| `pages/Reports/index.tsx` | Coluna `payment_method_name` + filtro por meio de pagamento |

---

## Modelo de Dados

```
bills
  ...
  payment_method_id  INTEGER  FK → payment_methods.id  NULLABLE
```

Relação: `Bill N:1 PaymentMethod` (uma conta tem no máximo um meio de pagamento).

---

## UI / UX

- O seletor aparece no formulário de criação **e** edição de conta (abaixo de Fornecedor)
- Campo opcional — pode ficar em branco
- Label: **"Meio de Pagamento"**
- Exibe apenas meios de pagamento com `is_active = true`
- Na tabela de contas: coluna "Meio de Pgto" (só exibida se houver valor)
- No relatório: coluna adicional "Meio de Pgto" e filtro dropdown

---

## Retrocompatibilidade

O campo `payment_bank` (string livre, usado no mark-as-paid) **é mantido** e não é removido.
`payment_method_id` é uma FK independente que pode ser preenchida separadamente.

---

## Commits planejados

- `feat(epic-17): add payment_method_id FK to bills (backend)`
- `feat(epic-17): link payment method in BillForm and Bills/Reports pages (frontend)`
- `docs(epic-17): planning and summary`
