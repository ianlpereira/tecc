# ÉPICO 16: Relatórios

**Status:** 📋 PLANEJADO  
**Prioridade:** 🟢 MÉDIA-ALTA  
**Data de Planejamento:** 24/03/2026  
**Dependências:** Epic 10 (filtros de data), Epic 11 (meios de pagamento)

---

## Motivação

O financeiro precisa emitir relatórios analíticos a pedido do gestor. Exemplo real:
> "O que foi pago de manutenção de moto em Viana no mês de maio?"

Hoje o único recurso é exportar manualmente os dados da tela, sem filtros combinados e sem exportação.

---

## Escopo

### Nova Página: Relatórios

Rota: `/reports`  
Menu: item "Relatórios" com ícone 📊

---

### Filtros disponíveis

Todos opcionais e combináveis:

| Filtro | Tipo | Campo filtrado |
|--------|------|----------------|
| Período (de/até) | DatePicker range | `due_date` |
| Mês | MonthPicker | `due_date` |
| Filial | Select múltiplo | `branch_id` |
| Fornecedor | Select múltiplo | `vendor_id` |
| Categoria | Select múltiplo | `category_id` |
| Veículo | Select múltiplo | `vehicle_id` |
| Status | Select múltiplo | `status` |
| Meio de Pagamento | Select múltiplo | `payment_bank` |

---

### Colunas do Relatório

| Coluna | Campo |
|--------|-------|
| # | `id` |
| Descrição | `description` |
| Fornecedor | `vendor.name` |
| Categoria | `category.name` |
| Filial | `branch.name` |
| Veículo | `vehicle.plate` (se houver) |
| Valor | `amount` |
| Vencimento | `due_date` |
| Status | `status` |
| Banco Pagamento | `payment_bank` |
| Data Pagamento | `paid_at` |

---

### Totalizadores

Abaixo da tabela, painel de resumo:
- **Total geral:** soma de `amount` das contas no resultado
- **Total pago:** soma de `amount` onde `status = paid`
- **Total a pagar:** soma de `amount` onde `status in (pending, approved)`
- **Quantidade de contas:** contagem total

---

### Exportação

- [ ] Botão **"Exportar CSV"** — gera arquivo `.csv` com todas as colunas
- [ ] Botão **"Exportar PDF"** (fase 2, opcional) — relatório formatado

---

## Backend

- [ ] Novo endpoint: `GET /api/v1/bills/report`
  - Query params: `date_from`, `date_to`, `month`, `branch_ids`, `vendor_ids`, `category_ids`, `vehicle_ids`, `statuses`, `payment_banks`
  - Retorna lista completa + objeto `summary` com totalizadores
- [ ] `BillRepository.get_for_report(filters)` — query com joins em `vendors`, `categories`, `branches`, `vehicles`
- [ ] Schema `BillReportResponse` com campos join + `BillReportSummary`

## Frontend

- [ ] Nova página `src/pages/Reports/index.tsx`
- [ ] Componente de filtros com todos os seletores
- [ ] Tabela com colunas do relatório (sem paginação, scroll)
- [ ] Painel de totalizadores
- [ ] Botão CSV (export client-side via `blob` + `<a download>`)
- [ ] Hook `useReport(filters)`
- [ ] Rota `/reports` no `App.tsx`
- [ ] Item de menu no `Layout`

---

## Critérios de Aceite

- Filtrar por categoria "Manutenção" + filial "Viana" + mês "Maio/2026" → retorna apenas contas que atendem a todos os critérios
- Totalizadores refletem apenas os dados filtrados
- CSV exportado contém exatamente as colunas da tabela
- Filtros funcionam de forma independente e combinada
- Sem filtros → retorna todos os registros (com aviso de volume se > 1000)

---

## Arquivos a Criar

- `backend/app/routers/bills.py` — endpoint `/report`
- `backend/app/repositories/bill_repository.py` — método `get_for_report()`
- `backend/app/schemas/bill.py` — `BillReportResponse`, `BillReportSummary`
- `frontend/src/pages/Reports/index.tsx`
- `frontend/src/hooks/useBills.ts` — hook `useReport()`
- `frontend/src/services/api.ts` — método `billApi.getReport()`
