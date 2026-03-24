# ÉPICO 11: Meios de Pagamento (CRUD)

**Status:** 📋 PLANEJADO  
**Prioridade:** 🟡 ALTA  
**Data de Planejamento:** 24/03/2026  
**Dependências:** nenhuma (Epic 14 depende deste)

---

## Motivação

O campo "banco de pagamento" ao marcar contas como pagas é atualmente um campo de texto livre com opções hardcoded genéricas. Isso gera inconsistência nos dados. A solução é um CRUD gerenciável de Meios de Pagamento com a lista real de bancos da empresa.

---

## Lista Inicial de Meios de Pagamento

Pré-carregados na migration:

1. Bradesco Viana
2. Bradesco Matinha
3. Bradesco V. de Almeida
4. Bradesco Maracacumé
5. BNB SLZ
6. BNB V. de Almeida
7. BB Junco
8. BB SLZ
9. Caixa Econômica SLZ
10. Caixa Econômica Arari

---

## Escopo

### Backend

- [ ] Nova entidade `PaymentMethod` (`id`, `name`, `is_active`, `created_at`, `updated_at`, `deleted_at`)
- [ ] Migration: criar tabela `payment_methods` + inserir os 10 registros iniciais
- [ ] Repository `PaymentMethodRepository` com `get_all_active()` e CRUD
- [ ] Service `PaymentMethodService` com validação de nome duplicado
- [ ] Router `/api/v1/payment-methods` — GET, POST, PUT, DELETE
- [ ] Schema `PaymentMethodCreate`, `PaymentMethodUpdate`, `PaymentMethodResponse`

### Frontend

- [ ] Nova página **Configurações > Meios de Pagamento**
  - Tabela com colunas: Nome, Status (ativo/inativo), Ações (editar, ativar/desativar)
  - Botão "Novo Meio de Pagamento"
  - Modal de criação/edição com campo Nome
- [ ] Hook `usePaymentMethods`, `useCreatePaymentMethod`, `useUpdatePaymentMethod`, `useDeletePaymentMethod`
- [ ] Substituir campo `payment_bank` (texto livre) por **Select vinculado ao CRUD**
  - No modal "Marcar como Pago" do Dashboard
  - No formulário de edição de conta
- [ ] Adicionar item "Configurações" no menu lateral (ícone ⚙️) com subrotas
- [ ] Rota: `/settings/payment-methods`

---

## Critérios de Aceite

- Administrador consegue criar, editar e desativar meios de pagamento
- Meios inativos não aparecem no select ao marcar conta como paga
- Os 10 bancos listados estão disponíveis após a migration
- Campo `payment_bank` das contas existentes é mantido (compatibilidade retroativa)

---

## Modelo de Dados

```python
class PaymentMethod(BaseModel):
    __tablename__ = "payment_methods"

    id        = Column(Integer, primary_key=True)
    name      = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
```

---

## Migration

- Criar tabela `payment_methods`
- INSERT dos 10 bancos com `is_active = true`
- Campo `payment_bank` em `bills` mantido como String (sem FK) para compatibilidade com dados históricos

---

## Arquivos a Criar

- `backend/app/models/payment_method.py`
- `backend/app/schemas/payment_method.py`
- `backend/app/repositories/payment_method_repository.py`
- `backend/app/services/payment_method_service.py`
- `backend/app/routers/payment_methods.py`
- `backend/alembic/versions/XXXX_add_payment_methods.py`
- `frontend/src/hooks/usePaymentMethods.ts`
- `frontend/src/pages/Settings/PaymentMethods/index.tsx`
