# ÉPICO 14: Ações em Lote (Excluir / Marcar como Pago)

**Status:** 📋 PLANEJADO  
**Prioridade:** 🟡 MÉDIA  
**Data de Planejamento:** 24/03/2026  
**Dependências:** Epic 11 (Meios de Pagamento) para seleção do banco no lote

---

## Motivação

Operações repetitivas como excluir ou dar baixa em várias contas exigem N cliques individuais. A seleção em lote reduz o esforço operacional significativamente, especialmente para regularizar contas do mesmo pagamento (ex: várias parcelas pagas no mesmo dia pelo mesmo banco).

---

## Escopo

### Funcionalidade 1 — Seleção em Lote

- Adicionar **checkbox** na primeira coluna da tabela de Contas a Pagar
- Checkbox no cabeçalho para selecionar/desselecionar tudo (respeitando filtros ativos)
- Contador de selecionados: "X conta(s) selecionada(s)"

### Funcionalidade 2 — Excluir em Lote

- Botão **"Excluir selecionadas"** aparece na barra contextual ao selecionar
- Modal de confirmação: "Deseja excluir X conta(s)? Esta ação não pode ser desfeita."
- Soft delete aplicado a todas as contas selecionadas
- Após confirmar: limpar seleção + recarregar lista

### Funcionalidade 3 — Marcar como Pagas em Lote

- Botão **"Marcar como pagas"** na barra contextual
- Modal de confirmação com:
  - Seletor de **Meio de Pagamento** (CRUD do Epic 11)
  - Seletor de **Data de Pagamento** (padrão: hoje)
- Aplica `status = PAID`, `payment_bank = selecionado`, `paid_at = data selecionada` em todas
- Contas já pagas ou canceladas no lote são ignoradas silenciosamente

---

## Backend

- [ ] Novo endpoint: `POST /api/v1/bills/batch-delete`
  - Body: `{ "ids": [1, 2, 3] }`
  - Soft delete em todas; retorna `{ deleted: N }`
- [ ] Novo endpoint: `POST /api/v1/bills/batch-mark-paid`
  - Body: `{ "ids": [1, 2, 3], "payment_bank": "Bradesco Viana", "paid_at": "2026-03-24" }`
  - Atualiza todas; ignora pagas/canceladas; retorna `{ updated: N, skipped: N }`

### Frontend

- [ ] Coluna de checkbox na tabela (`rowSelection` do AntD Table)
- [ ] Estado `selectedRowKeys: number[]`
- [ ] Barra contextual condicional (aparece quando `selectedRowKeys.length > 0`):
  ```
  ✓ 5 contas selecionadas   [ Marcar como pagas ] [ Excluir ] [ Cancelar seleção ]
  ```
- [ ] Modal "Excluir em lote" com confirmação
- [ ] Modal "Marcar como pagas em lote" com seletor de banco + data
- [ ] Hooks: `useBatchDeleteBills()`, `useBatchMarkPaidBills()`

---

## Critérios de Aceite

- Selecionar 10 contas → excluir → todas soft-deletadas em 1 operação
- Selecionar 5 contas → marcar pagas com "Bradesco Viana" em 24/03 → todas com `status=PAID`, `payment_bank="Bradesco Viana"`, `paid_at=2026-03-24`
- Contas já pagas/canceladas no lote são silenciosamente ignoradas (sem erro)
- Seleção é limpa após qualquer operação em lote
- Checkbox "selecionar tudo" seleciona apenas as contas visíveis (filtros ativos)

---

## Arquivos a Criar/Modificar

| Arquivo | Mudança |
|---------|---------|
| `backend/app/routers/bills.py` | Endpoints `batch-delete` e `batch-mark-paid` |
| `backend/app/services/bill_service.py` | Métodos `batch_soft_delete()` e `batch_mark_paid()` |
| `backend/app/schemas/bill.py` | Schemas `BatchDeleteRequest`, `BatchMarkPaidRequest` |
| `frontend/src/pages/Bills/index.tsx` | rowSelection, barra contextual, modais de lote |
| `frontend/src/services/api.ts` | Métodos de batch |
| `frontend/src/hooks/useBills.ts` | Hooks de batch |
