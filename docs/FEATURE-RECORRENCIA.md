# 🔄 Feature: Contas Recorrentes

> **Status:** 🚧 Em Desenvolvimento  
> **Prioridade:** Alta  
> **Criado em:** 27 de Fevereiro de 2026  
> **Estimativa:** ~4 horas

---

## 🎯 Objetivo

Permitir que ao criar uma conta a pagar, o usuário possa marcá-la como **recorrente**, definindo:

- **Intervalo** em dias entre cada ocorrência
- **Quantidade** de repetições (ocorrências)

O sistema então cria automaticamente **N contas** espaçadas pelo intervalo definido, todas vinculadas entre si pelo campo `recurrence_group_id`.

---

## 📋 Requisitos Funcionais

### RF1: Criação de Conta Recorrente

Ao criar uma conta com `is_recurring = true`:

- `recurrence_interval_days` — intervalo em dias entre ocorrências (mín. 1)
- `recurrence_occurrences` — quantidade total de contas a gerar (mín. 2, máx. 60)

O sistema cria **N contas independentes** onde:
- A data de vencimento de cada uma é: `due_date + (index * recurrence_interval_days)`
- Todas compartilham o mesmo `recurrence_group_id` (UUID)
- Cada conta recebe um `recurrence_index` (1, 2, 3... N)
- Todos os outros campos (valor, filial, fornecedor, categoria, etc.) são idênticos

### RF2: Independência das Ocorrências

Cada ocorrência é uma conta **independente**:

- Pode ser paga, cancelada ou editada individualmente
- Excluir uma não exclui as demais
- Não existe "conta pai" — todas são iguais em nível hierárquico
- `recurrence_group_id` serve apenas para agrupamento visual

### RF3: Indicador Visual

Na tabela de Contas a Pagar:

- Ícone 🔄 ao lado da descrição para contas recorrentes
- Tooltip exibindo: `"Recorrente: ocorrência X de N (a cada Y dias)"`

---

## 🗄️ Modelo de Dados

### Campos Adicionados ao Model `Bill`

```python
# Novo campo: marca se a conta é parte de um grupo recorrente
is_recurring = Column(Boolean, default=False, nullable=False)

# ID do grupo — todas as ocorrências de um mesmo conjunto compartilham este valor
recurrence_group_id = Column(String(36), nullable=True, index=True)  # UUID

# Intervalo em dias entre ocorrências
recurrence_interval_days = Column(Integer, nullable=True)

# Total de ocorrências no grupo (ex: 12 meses = 12)
recurrence_total = Column(Integer, nullable=True)

# Índice desta ocorrência (começa em 1)
recurrence_index = Column(Integer, nullable=True)
```

### Exemplo de Dados

Conta de aluguel, mensal, por 6 meses:

```
recurrence_group_id = "550e8400-e29b-41d4-a716-446655440000"
recurrence_interval_days = 30
recurrence_total = 6

Bill 1: due_date = 2026-03-01, recurrence_index = 1
Bill 2: due_date = 2026-03-31, recurrence_index = 2
Bill 3: due_date = 2026-04-30, recurrence_index = 3
Bill 4: due_date = 2026-05-30, recurrence_index = 4
Bill 5: due_date = 2026-06-29, recurrence_index = 5
Bill 6: due_date = 2026-07-29, recurrence_index = 6
```

---

## 🔧 Implementação Técnica

### Backend

#### 1. Model (`backend/app/models/bill.py`)

Adicionar 5 campos ao model `Bill`:

```python
from sqlalchemy import Boolean, String
import uuid

is_recurring = Column(Boolean, default=False, nullable=False)
recurrence_group_id = Column(String(36), nullable=True, index=True)
recurrence_interval_days = Column(Integer, nullable=True)
recurrence_total = Column(Integer, nullable=True)
recurrence_index = Column(Integer, nullable=True)
```

#### 2. Schemas (`backend/app/schemas/bill.py`)

**BillBase** — campos opcionais:
```python
is_recurring: bool = False
recurrence_interval_days: Optional[int] = None
recurrence_occurrences: Optional[int] = None  # renamed for UX clarity
```

**BillResponse** — campos de leitura:
```python
is_recurring: bool
recurrence_group_id: Optional[str] = None
recurrence_interval_days: Optional[int] = None
recurrence_total: Optional[int] = None
recurrence_index: Optional[int] = None
```

#### 3. Service (`backend/app/services/bill_service.py`)

Lógica em `create_bill()`:

```python
if is_recurring:
    # Validar parâmetros
    if not recurrence_interval_days or recurrence_interval_days < 1:
        raise ValueError("Intervalo de recorrência deve ser maior que 0")
    if not recurrence_occurrences or not (2 <= recurrence_occurrences <= 60):
        raise ValueError("Número de ocorrências deve ser entre 2 e 60")

    group_id = str(uuid.uuid4())
    bills = []
    for i in range(recurrence_occurrences):
        occurrence_due_date = due_date + timedelta(days=i * recurrence_interval_days)
        bill = Bill(
            ...,
            is_recurring=True,
            recurrence_group_id=group_id,
            recurrence_interval_days=recurrence_interval_days,
            recurrence_total=recurrence_occurrences,
            recurrence_index=i + 1,
        )
        bills.append(bill)

    # Criar todas de uma vez
    for b in bills:
        await self.repository.create(b)
    await self.repository.commit()
    return bills[0]  # Retorna a primeira para manter compatibilidade de API
```

#### 4. Router — novo endpoint (`backend/app/routers/bills.py`)

```python
@router.get("/group/{group_id}", response_model=List[BillResponse])
async def get_bills_by_group(group_id: str, db: AsyncSession = Depends(get_db)):
    """Get all bills belonging to a recurrence group."""
    service = BillService(db)
    return await service.get_bills_by_recurrence_group(group_id)
```

#### 5. Migration Alembic

```python
# backend/alembic/versions/xxxx_add_recurrence_fields.py
def upgrade():
    op.add_column('bills', sa.Column('is_recurring', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('bills', sa.Column('recurrence_group_id', sa.String(36), nullable=True))
    op.add_column('bills', sa.Column('recurrence_interval_days', sa.Integer(), nullable=True))
    op.add_column('bills', sa.Column('recurrence_total', sa.Integer(), nullable=True))
    op.add_column('bills', sa.Column('recurrence_index', sa.Integer(), nullable=True))
    op.create_index('ix_bills_recurrence_group_id', 'bills', ['recurrence_group_id'])
```

---

### Frontend

#### 1. Types (`frontend/src/types/index.ts`)

```typescript
export interface Bill {
  // ... campos existentes ...
  is_recurring: boolean;
  recurrence_group_id?: string | null;
  recurrence_interval_days?: number | null;
  recurrence_total?: number | null;
  recurrence_index?: number | null;
}

export interface BillCreate {
  // ... campos existentes ...
  is_recurring?: boolean;
  recurrence_interval_days?: number | null;
  recurrence_occurrences?: number | null;
}
```

#### 2. BillForm (`frontend/src/components/BillForm/index.tsx`)

Adicionar ao formulário:

```tsx
{/* Checkbox de Recorrência */}
<Form.Item>
  <Controller
    name="is_recurring"
    render={({ field }) => (
      <Checkbox checked={field.value} onChange={e => field.onChange(e.target.checked)}>
        Conta Recorrente
      </Checkbox>
    )}
  />
</Form.Item>

{/* Painel expansível — só aparece quando is_recurring = true */}
{isRecurring && (
  <div style={{ background: '#f6f8fa', padding: 16, borderRadius: 8, marginBottom: 16 }}>
    <Row gutter={16}>
      <Col span={12}>
        <Form.Item label="Intervalo (dias)">
          <Controller
            name="recurrence_interval_days"
            render={({ field }) => (
              <InputNumber min={1} max={365} placeholder="Ex: 30" style={{ width: '100%' }} {...field} />
            )}
          />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item label="Número de Ocorrências">
          <Controller
            name="recurrence_occurrences"
            render={({ field }) => (
              <InputNumber min={2} max={60} placeholder="Ex: 12" style={{ width: '100%' }} {...field} />
            )}
          />
        </Form.Item>
      </Col>
    </Row>
    <Alert
      type="info"
      message={`Serão criadas ${occurrences || '?'} contas, a cada ${interval || '?'} dias`}
      showIcon
    />
  </div>
)}
```

#### 3. Bills Page (`frontend/src/pages/Bills/index.tsx`)

Na coluna Descrição:
```tsx
render: (desc: string, record: Bill) => (
  <span>
    {record.is_recurring && (
      <Tooltip title={`Recorrente: ${record.recurrence_index}/${record.recurrence_total} (a cada ${record.recurrence_interval_days} dias)`}>
        <SyncOutlined style={{ color: '#1890ff', marginRight: 6 }} />
      </Tooltip>
    )}
    {desc}
  </span>
)
```

---

## 📁 Arquivos a Modificar

| Arquivo | Tipo de Mudança |
|---------|----------------|
| `backend/app/models/bill.py` | +5 campos |
| `backend/app/schemas/bill.py` | +5 campos em BillBase/BillResponse |
| `backend/app/services/bill_service.py` | Lógica de geração em loop |
| `backend/app/repositories/bill_repository.py` | +`get_by_recurrence_group()` |
| `backend/app/routers/bills.py` | +endpoint `/group/{group_id}` |
| `backend/alembic/versions/xxxx_add_recurrence_fields.py` | Nova migration |
| `frontend/src/types/index.ts` | +campos em Bill, BillCreate |
| `frontend/src/components/BillForm/index.tsx` | +campos no formulário |
| `frontend/src/pages/Bills/index.tsx` | +ícone 🔄 na tabela |
| `frontend/src/services/api.ts` | +`getByGroup()` |

---

## ✅ Critérios de Aceite

- [ ] Criar conta com `is_recurring=true` gera N contas no banco
- [ ] Todas as ocorrências compartilham `recurrence_group_id`
- [ ] Datas calculadas corretamente (offset por dias)
- [ ] Formulário exibe painel de recorrência ao marcar checkbox
- [ ] Preview mostra quantas contas serão criadas
- [ ] Tabela de contas exibe ícone 🔄 com tooltip para recorrentes
- [ ] Cada ocorrência pode ser paga/cancelada individualmente
- [ ] Migration aplicada sem erros

---

**Criado em:** 27 de Fevereiro de 2026
