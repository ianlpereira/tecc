# Epic 17 — Vincular Contas a Meios de Pagamento

> **Status:** ✅ Concluído | **Commit:** `841c360`

## Objetivo

Permitir que cada conta a pagar (`bills`) seja vinculada a um meio de pagamento (ex.: Bradesco, Nubank, Cartão XYZ) da tabela `payment_methods`, já existente no sistema.

---

## O que foi implementado

### Backend

| Arquivo | Mudança |
|---|---|
| `backend/app/models/bill.py` | FK `payment_method_id → payment_methods.id` (nullable) + `relationship("PaymentMethod")` + `@property payment_method_name` |
| `backend/alembic/versions/e7c4d1ce91a8_epic17_...py` | Migração: `ALTER TABLE bills ADD COLUMN payment_method_id INTEGER REFERENCES payment_methods(id)` |
| `backend/app/schemas/bill.py` | `payment_method_id` em `BillCreate`, `BillUpdate`, `BillRecurrenceUpdate`; `payment_method_id` + `payment_method_name` em `BillResponse`; `payment_method_name` em `BillReportRow` |
| `backend/app/services/bill_service.py` | `create_bill`, `update_bill`, `update_bill_recurrence` aceitam `payment_method_id`; `get_report` aceita `payment_method_ids` |
| `backend/app/routers/bills.py` | Todos os endpoints de criação/edição passam `payment_method_id`; filtro `payment_method_id` no endpoint de relatório |
| `backend/app/repositories/bill_repository.py` | `get_by_id` com `joinedload(Bill.payment_method)`; `get_for_report` com `outerjoin(PaymentMethod)` + filtro `payment_method_ids` |

### Frontend

| Arquivo | Mudança |
|---|---|
| `frontend/src/types/index.ts` | `payment_method_id?`, `payment_method_name?` em `Bill`, `BillCreate`, `BillUpdate`, `BillRecurrenceUpdate`, `BillReportRow` |
| `frontend/src/components/BillForm/index.tsx` | Campo Select "Meio de Pagamento (opcional)" usando `useActivePaymentMethods`; integrado em criar, editar e edição em massa de recorrência |
| `frontend/src/pages/Bills/index.tsx` | Coluna "Meio de Pgto" na tabela principal |
| `frontend/src/pages/Reports/index.tsx` | Coluna "Meio de Pgto" na tabela de relatório; filtro "Meio de Pagamento" no painel de filtros; campo `Meio de Pgto` no CSV exportado |

---

## Decisões técnicas

- **Campo nullable:** `payment_method_id` é opcional — contas existentes não são afetadas.
- **`lazy="select"` + `joinedload`:** O relacionamento usa carregamento lazy por padrão, mas o repositório faz `joinedload` explícito no `get_by_id` para evitar N+1.
- **`@property payment_method_name`:** Expõe o nome via propriedade Python, lido automaticamente pelo Pydantic com `from_attributes=True`.
- **Hook reutilizado:** `useActivePaymentMethods` já existia — nenhum novo hook foi criado.
- **Campo `payment_bank` preservado:** O campo de texto livre usado ao marcar como pago não foi alterado.

---

## Como usar

1. Ao **criar ou editar** uma conta, selecione o meio de pagamento no campo "Meio de Pagamento (opcional)".
2. Na **página de Contas**, a coluna "Meio de Pgto" exibe o nome do meio vinculado.
3. Na **página de Relatórios**, use o filtro "Meio de Pagamento" para filtrar por meio; a coluna aparece na tabela e no CSV exportado.
