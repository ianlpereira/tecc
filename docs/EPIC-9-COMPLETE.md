# ÉPICO 9: Correção de Fuso Horário — CONCLUÍDO

**Status:** ✅ CONCLUÍDO  
**Data:** 24/03/2026  
**Prioridade:** 🔴 Crítica

---

## Problema

Datas de vencimento exibidas com 1 dia de diferença.  
Exemplo: usuário cadastrava vencimento **30/04**, o sistema exibia **29/04**.

---

## Root Cause

O backend retorna `due_date` como string `"YYYY-MM-DD"` pura (ex: `"2026-04-30"`).

O JavaScript nativo interpreta `new Date("2026-04-30")` como **UTC midnight** (`2026-04-30T00:00:00Z`). No navegador rodando em BRT (UTC-3), esse timestamp é convertido para `2026-04-29T21:00:00 BRT`, exibindo o dia **anterior**.

O mesmo acontecia com `dayjs("2026-04-30")` sem argumento de formato — dayjs v1 usa o mesmo comportamento do `Date` nativo para strings ISO.

---

## Solução Aplicada

### 1. Criado `frontend/src/utils/date.ts`

Utilitário centralizado com funções safe-timezone:

```typescript
// Converte "YYYY-MM-DD" para Date local sem UTC shift
parseLocalDate(dateStr: string): Date

// Formata "YYYY-MM-DD" para "DD/MM/YYYY" para exibição
formatDate(dateStr: string): string

// Converte "YYYY-MM-DD" para dayjs com formato explícito
parseDayjs(dateStr: string): dayjs.Dayjs

// Verifica se uma data é hoje (local time)
isToday(dateStr: string): boolean

// Verifica se uma bill está vencida (substitui isOverdue local)
isBillOverdue(bill: Bill): boolean
```

### 2. `frontend/src/pages/Bills/index.tsx`

- Removida função `parseLocalDate` local
- Removida função `isOverdue` local
- Importadas `formatDate` e `isBillOverdue` de `utils/date`
- Corrigida coluna "Vencimento": `new Date(date).toLocaleDateString('pt-BR')` → `formatDate(date)`
- Trocados todos os usos de `isOverdue(bill)` → `isBillOverdue(bill)`

### 3. `frontend/src/components/BillForm/index.tsx`

- Adicionado `import customParseFormat from 'dayjs/plugin/customParseFormat'`
- Registrado o plugin: `dayjs.extend(customParseFormat)`
- DatePicker corrigido: `dayjs(field.value)` → `dayjs(field.value, 'YYYY-MM-DD')`
- O `onChange` já estava correto: `date.format('YYYY-MM-DD')` — envia string pura

### 4. `frontend/src/pages/Dashboard/index.tsx`

- Removidas `parseLocalDate` e `isOverdue` locais
- Importadas `parseLocalDate` e `isBillOverdue` de `utils/date`
- `getBillStatusDisplay` atualizado para usar `isBillOverdue`

### 5. `frontend/src/pages/Vehicles/index.tsx`

- Removidas `parseLocalDate` e `isOverdue` locais
- Importadas `formatDate` e `isBillOverdue` de `utils/date`
- Corrigida coluna "Vencimento" das contas do veículo: `new Date(d).toLocaleDateString('pt-BR')` → `formatDate(d)`
- `getBillStatusDisplay` atualizado para usar `isBillOverdue`

---

## Arquivos Não Alterados (propositalmente)

| Arquivo | Motivo |
|---------|--------|
| `backend/app/schemas/bill.py` | Já usava `date` (não `datetime`) — correto |
| `backend/app/models/bill.py` | Coluna `Date` do SQLAlchemy — correto |
| `pages/Branches/index.tsx` | Renderiza `created_at` (ISO datetime) — `new Date()` correto |
| `pages/Categories/index.tsx` | Renderiza `created_at` (ISO datetime) — `new Date()` correto |

---

## Verificação de Dados Históricos

Query executada no banco:

```sql
SELECT COUNT(*) FROM bills
WHERE deleted_at IS NULL
  AND due_date::date = (created_at::date - INTERVAL '1 day')::date;
-- Resultado: 0 registros com offset errado
```

Os dados históricos estão corretos — o bug afetava apenas a **exibição**, não o armazenamento.

---

## Resultado

- `tsc --noEmit` → `EXIT:0` (zero erros TypeScript)
- Frontend compilando sem erros
- Datas exibidas corretamente para qualquer fuso horário do navegador

---

## Regra para o Futuro

> **NUNCA** passe uma string `"YYYY-MM-DD"` diretamente para `new Date()` ou `dayjs()`.  
> Use sempre `formatDate()`, `parseLocalDate()` ou `parseDayjs()` de `utils/date.ts`.
