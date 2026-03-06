# 📋 Épico 6 — Produtividade Avançada

> **Status:** 🚧 Em Desenvolvimento
> **Criado em:** 06 de Março de 2026
> **Prioridade:** Alta

---

## 🎯 Objetivos

Quatro melhorias focadas em agilidade operacional no dia a dia de pagamentos:

| ID | Feature | Impacto |
|----|---------|---------|
| F1 | Anexar arquivos a uma conta (ex: boleto PDF) | Alto — elimina busca manual no momento do pagamento |
| F2 | Selecionar banco usado no pagamento ao dar baixa | Médio — rastreabilidade financeira |
| F3 | Recorrência por dia fixo do mês (ex: todo dia 10) | Alto — mais preciso que intervalo em dias |
| F4 | Filtros avançados em Contas a Pagar | Médio — pesquisa mais rápida com muitos lançamentos |

---

## F1 — Anexo de Arquivo em Conta

### Descrição
Ao visualizar/editar uma conta, o usuário pode anexar arquivos (PDF de boleto, NF-e, etc.). No momento do pagamento, o arquivo fica acessível para facilitar a quitação.

### Modelo de Dados

Nova tabela `bill_attachments`:

```sql
CREATE TABLE bill_attachments (
    id          SERIAL PRIMARY KEY,
    bill_id     INTEGER NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    filename    VARCHAR(255) NOT NULL,   -- nome original do arquivo
    file_path   VARCHAR(500) NOT NULL,   -- path no storage (ou base64 para MVP)
    file_size   INTEGER,                 -- bytes
    mime_type   VARCHAR(100),            -- application/pdf, image/jpeg, etc.
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);
```

### Estratégia de Storage (MVP)

Armazenar o arquivo em **base64 no próprio banco** (campo `file_data TEXT`). Simples para MVP, sem dependência de S3/Cloudflare.

Limite: 5MB por arquivo, máximo 3 anexos por conta.

### Backend

- `models/bill_attachment.py` — model `BillAttachment`
- `schemas/bill_attachment.py` — `BillAttachmentCreate`, `BillAttachmentResponse`
- `repositories/bill_attachment_repository.py` — `get_by_bill`, `create`, `delete`
- `services/bill_attachment_service.py` — validação de tamanho/tipo, encoding base64
- `routers/bill_attachments.py` — endpoints:
  - `POST /bills/{bill_id}/attachments` — upload (multipart/form-data)
  - `GET /bills/{bill_id}/attachments` — listar anexos da conta
  - `GET /bills/{bill_id}/attachments/{attachment_id}` — download
  - `DELETE /bills/{bill_id}/attachments/{attachment_id}` — remover

### Frontend

- `api.ts` — `billAttachmentApi`: `upload`, `list`, `download`, `delete`
- `hooks/useBillAttachments.ts` — hooks React Query
- `components/BillAttachments/` — componente com:
  - `Upload` do AntD (tipo dragger, aceita PDF/imagem)
  - Lista de anexos com botão download e delete
  - Badge no botão da tabela quando conta tem anexos (`PaperClipOutlined`)

### Critérios de Aceite

- [ ] Upload de PDF/imagem (máx. 5MB) em uma conta
- [ ] Lista de anexos exibida no form da conta (edição)
- [ ] Download do arquivo pelo nome original
- [ ] Exclusão individual de anexo
- [ ] Badge `PaperClipOutlined` na tabela quando `attachments_count > 0`
- [ ] Limite de 3 anexos por conta com mensagem de erro clara

---

## F2 — Banco de Pagamento ao Dar Baixa

### Descrição
Ao clicar em "Pago" no Dashboard (ou na tela de Contas), antes de confirmar, uma pequena seleção permite indicar em qual banco/conta o pagamento foi realizado.

### Modelo de Dados

Dois novos campos na tabela `bills`:

```sql
ALTER TABLE bills ADD COLUMN payment_bank VARCHAR(100);   -- nome do banco (livre)
ALTER TABLE bills ADD COLUMN paid_at DATE;                -- data efetiva do pagamento
```

> Não criamos uma tabela de bancos — o campo é texto livre para máxima flexibilidade. O usuário digita ou escolhe de uma lista de bancos comuns pré-definida no frontend.

### Backend

- `schemas/bill.py` — adicionar `payment_bank` e `paid_at` em `BillUpdate` e `BillResponse`
- `models/bill.py` — adicionar campos
- `services/bill_service.py` — `mark_bill_paid(bill_id, payment_bank, paid_at)` atualizado

### Frontend

**Fluxo atual:** `Popconfirm` direto → marca pago

**Fluxo novo:**
```
Clica "Pago"
  → Abre Modal pequeno com:
    - Select: "Banco utilizado" (lista pré-definida + opção "Outro")
    - DatePicker: "Data do pagamento" (default: hoje)
    - Botão: "Confirmar Pagamento"
```

Lista de bancos pré-definida (frontend):
```typescript
const BANKS = [
  'Bradesco', 'Itaú', 'Santander', 'Caixa', 'Banco do Brasil',
  'Nubank', 'Inter', 'C6', 'Sicredi', 'Sicoob', 'Outro'
]
```

- `hooks/useBills.ts` — `useMarkBillAsPaid` recebe `{ id, payment_bank, paid_at }`
- `Dashboard/index.tsx` — substituir `Popconfirm` por `Modal` de confirmação com campos
- `Bills/index.tsx` — mesmo modal reutilizado

### Critérios de Aceite

- [ ] Modal abre ao clicar "Pago" com campo banco + data
- [ ] Campo banco não obrigatório (pode confirmar sem)
- [ ] Data do pagamento tem default = hoje
- [ ] `payment_bank` e `paid_at` salvos no banco
- [ ] Coluna "Banco" visível na tabela de Contas Pagas (opcional)

---

## F3 — Recorrência por Dia Fixo do Mês

### Descrição
Complementa a feature de recorrência existente. Além do intervalo em dias, o usuário pode marcar "Dia fixo do mês" e informar o dia (ex: 10). O sistema então gera as contas para os meses subsequentes sempre com `due_date` no dia escolhido.

### Modelo de Dados

Novo campo na tabela `bills`:

```sql
ALTER TABLE bills ADD COLUMN recurrence_day_of_month INTEGER;  -- 1-28
```

> Limitamos a 28 para garantir que funcione em fevereiro.

### Lógica de Geração

```python
# Se recurrence_day_of_month = 10 e due_date = 2026-03-01 com 6 ocorrências:
# Mês base: mês da due_date (março)
# Bill 1: 2026-03-10
# Bill 2: 2026-04-10
# Bill 3: 2026-05-10
# Bill 4: 2026-06-10
# Bill 5: 2026-07-10
# Bill 6: 2026-08-10
```

```python
from dateutil.relativedelta import relativedelta

if recurrence_day_of_month:
    base_month = due_date.replace(day=recurrence_day_of_month)
    for i in range(recurrence_occurrences):
        occurrence_due_date = base_month + relativedelta(months=i)
```

> Adicionar `python-dateutil` ao `requirements.txt` (já vem como dep transitiva do Alembic, mas é melhor explicitar).

### Backend

- `models/bill.py` — `recurrence_day_of_month = Column(Integer, nullable=True)`
- `schemas/bill.py` — `recurrence_day_of_month: int | None = None` em `BillCreate` e `BillResponse`
- `services/bill_service.py` — lógica de geração condicional: se `recurrence_day_of_month` → usa `relativedelta`, senão → usa `timedelta(days=interval)`
- Migration Alembic: novo campo

### Frontend

**UI no BillForm** (painel de recorrência):

```
[x] Conta Recorrente
  ┌─ Tipo de recorrência ──────────────────────────┐
  │  ○ Intervalo em dias   ● Dia fixo do mês        │
  └────────────────────────────────────────────────┘
  
  [Dia fixo do mês: 10 ▲▼]   [Nº de Ocorrências: 6 ▲▼]
  
  ℹ️ Serão criadas 6 contas, todo dia 10 de cada mês
```

- `BillCreate` — adicionar `recurrence_day_of_month?: number | null`
- `types/index.ts` — `recurrence_day_of_month` em `Bill` e `BillCreate`
- `BillForm/index.tsx` — Radio "Intervalo em dias" vs "Dia fixo do mês", condicional

### Critérios de Aceite

- [ ] Radio selecionável entre "Intervalo em dias" e "Dia fixo do mês"
- [ ] Campo "Dia fixo" aceita 1-28
- [ ] Datas geradas sempre no dia correto para cada mês
- [ ] Preview atualizado: "Serão criadas N contas, todo dia X de cada mês"
- [ ] Modo intervalo em dias continua funcionando normalmente

---

## F4 — Filtros Avançados em Contas a Pagar

### Descrição
A tela de Contas a Pagar atualmente só filtra por Status. Com muitos lançamentos, é difícil encontrar contas específicas. Adicionar filtros por Categoria, Fornecedor e Filial.

### UI

```
┌─ Filtros ───────────────────────────────────────────────────────────┐
│  [Status ▼]  [Filial ▼]  [Categoria ▼]  [Fornecedor ▼]  [Limpar]   │
└─────────────────────────────────────────────────────────────────────┘
```

- Todos os filtros são opcionais e cumulativos (AND logic)
- Filtro de Fornecedor tem pesquisa (showSearch)
- Botão "Limpar Filtros" reseta todos
- Contagem de resultados: "Exibindo X de Y contas"

### Frontend (apenas)

Não requer mudanças no backend — todos os dados já são carregados, filtros aplicados no `useMemo`.

- `Bills/index.tsx` — adicionar estados `categoryFilter`, `vendorFilter`, `branchFilter`
- `filteredBills` — lógica AND com todos os filtros ativos
- `FilterBar` styled component — expandir para acomodar 4 filtros
- Botão "Limpar" reseta todos os estados

### Critérios de Aceite

- [ ] Filtro por Filial (Select com todas as filiais)
- [ ] Filtro por Categoria (Select com todas as categorias)
- [ ] Filtro por Fornecedor (Select com busca)
- [ ] Filtros são cumulativos (AND)
- [ ] Botão "Limpar Filtros" funcional
- [ ] Contagem "Exibindo X de Y" visível

---

## 📁 Arquivos a Modificar

### Backend

| Arquivo | Feature | Tipo |
|---------|---------|------|
| `models/bill_attachment.py` | F1 | Novo |
| `schemas/bill_attachment.py` | F1 | Novo |
| `repositories/bill_attachment_repository.py` | F1 | Novo |
| `services/bill_attachment_service.py` | F1 | Novo |
| `routers/bill_attachments.py` | F1 | Novo |
| `models/bill.py` | F2, F3 | Modificar (+3 campos) |
| `schemas/bill.py` | F2, F3 | Modificar |
| `services/bill_service.py` | F2, F3 | Modificar |
| `alembic/versions/c3d4e5f6a7b8_epic6_fields.py` | F1, F2, F3 | Novo |
| `requirements.txt` | F3 | Modificar (+python-dateutil) |

### Frontend

| Arquivo | Feature | Tipo |
|---------|---------|------|
| `types/index.ts` | F1, F2, F3 | Modificar |
| `services/api.ts` | F1, F2 | Modificar |
| `hooks/useBillAttachments.ts` | F1 | Novo |
| `hooks/useBills.ts` | F2 | Modificar |
| `components/BillAttachments/index.tsx` | F1 | Novo |
| `components/BillAttachments/styles.ts` | F1 | Novo |
| `components/BillForm/index.tsx` | F1, F3 | Modificar |
| `pages/Bills/index.tsx` | F4 | Modificar |
| `pages/Dashboard/index.tsx` | F2 | Modificar |

---

## 🏁 Ordem de Implementação

1. **Backend F2 + F3** (campos simples em `bills`) → migration única
2. **Backend F1** (nova tabela `bill_attachments`) → migration + novos arquivos
3. **Frontend F4** (só frontend, zero risco)
4. **Frontend F2** (modal de banco no dashboard)
5. **Frontend F3** (radio no BillForm)
6. **Frontend F1** (componente de upload)

---

**Criado em:** 06 de Março de 2026
