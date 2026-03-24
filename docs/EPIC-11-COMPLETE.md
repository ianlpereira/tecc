# ✅ ÉPICO 11 — Meios de Pagamento CRUD (COMPLETO)

> **Concluído em:** 25/03/2026  
> **Branch:** master  
> **Migration:** `59d4b9c9a4ad`

---

## Objetivo

Substituir o array hardcoded `BANKS` (Bradesco, Itaú, ...) por uma entidade real persistida no banco de dados, com CRUD completo de Meios de Pagamento acessível via menu.

---

## Backend

### Model `backend/app/models/payment_method.py`
```python
class PaymentMethod(BaseModel):
    __tablename__ = "payment_methods"
    id          = Column(Integer, primary_key=True, autoincrement=True)
    name        = Column(String(255), nullable=False, unique=True)
    is_active   = Column(Boolean, default=True, nullable=False)
    # + created_at, updated_at, deleted_at herdados de BaseModel
```

### Repository `backend/app/repositories/payment_method_repository.py`
- Herda `BaseRepository[PaymentMethod]`
- Método extra: `get_active(db)` → filtra `is_active == True`

### Service `backend/app/services/payment_method_service.py`
- `get_all()`, `get_active()`, `get_by_id()`, `create()`, `update()`, `delete()`
- `create/update`: valida unicidade de `name` (409 se duplicado)

### Schemas `backend/app/schemas/payment_method.py`
- `PaymentMethodCreate(name, is_active?)`
- `PaymentMethodUpdate(name?, is_active?)`
- `PaymentMethodResponse(id, name, is_active, created_at, updated_at)`

### Router `backend/app/routers/payment_methods.py`
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/payment-methods/` | Listar todos |
| GET | `/api/v1/payment-methods/active` | Listar ativos (para dropdowns) |
| GET | `/api/v1/payment-methods/{id}` | Obter por ID |
| POST | `/api/v1/payment-methods/` | Criar |
| PUT | `/api/v1/payment-methods/{id}` | Atualizar |
| DELETE | `/api/v1/payment-methods/{id}` | Deletar (soft delete) |

### Migration `59d4b9c9a4ad_add_payment_methods`
```
alembic upgrade head → 59d4b9c9a4ad
```

### Seed — 10 bancos iniciais
```sql
INSERT INTO payment_methods (name, is_active) VALUES
  ('Bradesco', true), ('Itaú', true), ('Santander', true),
  ('Caixa Econômica', true), ('Banco do Brasil', true),
  ('Nubank', true), ('Inter', true), ('C6 Bank', true),
  ('Sicredi', true), ('Sicoob', true);
```

---

## Frontend

### Tipos `frontend/src/types/index.ts`
```typescript
export interface PaymentMethod {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
export interface PaymentMethodCreate { name: string; is_active?: boolean; }
export interface PaymentMethodUpdate { name?: string; is_active?: boolean; }
```

### API `frontend/src/services/api.ts`
```typescript
export const paymentMethodApi = {
  getAll:    () => apiClient.get<PaymentMethod[]>('/payment-methods/'),
  getActive: () => apiClient.get<PaymentMethod[]>('/payment-methods/active'),
  getById:   (id) => apiClient.get<PaymentMethod>(`/payment-methods/${id}`),
  create:    (data) => apiClient.post<PaymentMethod>('/payment-methods/', data),
  update:    (id, data) => apiClient.put<PaymentMethod>(`/payment-methods/${id}`, data),
  delete:    (id) => apiClient.delete(`/payment-methods/${id}`),
};
```

### Hooks `frontend/src/hooks/usePaymentMethods.ts`
- `usePaymentMethods()` — lista todos (cache `payment-methods`)
- `useActivePaymentMethods()` — lista ativos (cache `payment-methods-active`)
- `useCreatePaymentMethod()`, `useUpdatePaymentMethod()`, `useDeletePaymentMethod()`
- Todos com invalidação automática do cache ao mutar

### Página `frontend/src/pages/Settings/PaymentMethods/index.tsx`
- Tabela com colunas: ID, Nome, Status (Tag Ativo/Inativo), Ações
- Modal de criação/edição com React Hook Form + Zod
- Popconfirm na exclusão
- Rota: `/settings/payment-methods`

### Layout `frontend/src/components/Layout/index.tsx`
- Item adicionado ao sidebar: "Meios de Pagamento" com ícone `CreditCardOutlined`

### Substituição de BANKS
- `Bills/index.tsx`: `const BANKS = [...]` removido → `useActivePaymentMethods()`
- `Dashboard/index.tsx`: idem
- Select de pagamento agora lista os bancos do banco de dados dinamicamente

---

## Arquivos Modificados

| Arquivo | Operação |
|---------|----------|
| `backend/app/models/payment_method.py` | ✅ Criado |
| `backend/app/models/__init__.py` | ✅ Atualizado |
| `backend/app/repositories/payment_method_repository.py` | ✅ Criado |
| `backend/app/repositories/__init__.py` | ✅ Atualizado |
| `backend/app/services/payment_method_service.py` | ✅ Criado |
| `backend/app/services/__init__.py` | ✅ Atualizado |
| `backend/app/schemas/payment_method.py` | ✅ Criado |
| `backend/app/schemas/__init__.py` | ✅ Atualizado |
| `backend/app/routers/payment_methods.py` | ✅ Criado |
| `backend/app/main.py` | ✅ Atualizado (router registrado) |
| `backend/alembic/versions/59d4b9c9a4ad_add_payment_methods.py` | ✅ Criado e aplicado |
| `frontend/src/types/index.ts` | ✅ Atualizado |
| `frontend/src/services/api.ts` | ✅ Atualizado |
| `frontend/src/hooks/usePaymentMethods.ts` | ✅ Criado |
| `frontend/src/hooks/index.ts` | ✅ Atualizado |
| `frontend/src/pages/Settings/PaymentMethods/index.tsx` | ✅ Criado |
| `frontend/src/pages/index.ts` | ✅ Atualizado |
| `frontend/src/App.tsx` | ✅ Atualizado (rota adicionada) |
| `frontend/src/components/Layout/index.tsx` | ✅ Atualizado (menu item) |
| `frontend/src/pages/Bills/index.tsx` | ✅ BANKS removido → hook |
| `frontend/src/pages/Dashboard/index.tsx` | ✅ BANKS removido → hook |

---

## Verificação

```bash
# TypeScript
docker exec tecc_frontend sh -c "cd /app && npx tsc --noEmit; echo EXIT:$?"
# EXIT:0 ✅

# API
curl http://localhost:8000/api/v1/payment-methods/
# → [{"id":1,"name":"Bradesco",...}, ... 10 bancos] ✅
```

**Status: ✅ CONCLUÍDO**
