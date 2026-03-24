# ÉPICO 12: Recorrência com Datas Manuais (Parcelas Irregulares)

**Status:** 📋 PLANEJADO  
**Prioridade:** 🟡 MÉDIA  
**Data de Planejamento:** 24/03/2026  
**Dependências:** nenhuma

---

## Motivação

O sistema atual suporta dois modos de recorrência:
- **Intervalo fixo em dias** (ex: a cada 30 dias)
- **Dia fixo do mês** (ex: todo dia 10)

Porém há boletos com prazos irregulares, como 30 + 15 + 15 dias (ex: parcela 1 vence em 30 dias, parcela 2 em +15, parcela 3 em +15). Não é possível cadastrar esse caso com os modos existentes.

---

## Escopo

### Novo Modo: "Datas Manuais" (Inserir Parcelas)

Ao criar uma conta recorrente, o usuário pode escolher o modo **"Datas Manuais"** e informar a data de vencimento de cada parcela individualmente.

#### Fluxo de uso:
1. Usuário marca "Conta Recorrente"
2. Seleciona modo: `Intervalo fixo` | `Dia fixo do mês` | **`Datas manuais`**
3. No modo "Datas manuais": aparece uma lista dinâmica de campos de data
   - Botão "+" para adicionar parcela
   - Botão "-" para remover
   - Mínimo 2 parcelas
4. Sistema cria uma conta para cada data informada, vinculadas pelo mesmo `recurrence_group_id`

---

## Backend

- [ ] `BillCreate`: novo campo opcional `recurrence_dates: list[date] | None`
- [ ] `BillService.create_bill()`: quando `recurrence_dates` está preenchido, gerar uma conta por data informada
- [ ] Validação: `recurrence_dates` exige pelo menos 2 datas; todas devem ser futuras ou iguais a hoje
- [ ] Schema: `recurrence_mode` enum expandido: `interval` | `fixed_day` | `manual_dates`

## Frontend

- [ ] `BillForm`: terceira opção no Radio Group de recorrência: **"Datas manuais"**
- [ ] Renderização condicional: quando selecionado, exibir lista de DatePickers dinâmica
  - Estado: `manualDates: Dayjs[]` com mínimo 2 items
  - Botões `+ Adicionar data` e `✕` por linha
  - Preview: "Serão criadas X parcelas"
- [ ] Validação: não permitir datas duplicadas na lista
- [ ] `types/index.ts`: adicionar `recurrence_dates?: string[]` em `BillCreate`

---

## Critérios de Aceite

- Criar conta com datas 15/04, 30/04, 15/05 → sistema gera 3 contas no mesmo grupo
- Cada conta tem `due_date` exato conforme informado
- Grupo vinculado por `recurrence_group_id` (igual ao existente)
- Modo "Datas manuais" não interfere nos modos existentes

---

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `backend/app/schemas/bill.py` | Campo `recurrence_dates` em `BillCreate` |
| `backend/app/services/bill_service.py` | Lógica de criação por lista de datas |
| `frontend/src/components/BillForm/index.tsx` | UI de datas manuais |
| `frontend/src/types/index.ts` | Campo `recurrence_dates` |
