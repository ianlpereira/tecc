# 🚀 ÉPICO 5 — UX & Bug Fixes

> **Status:** 📋 Planejamento  
> **Prioridade:** Alta  
> **Criado em:** 27 de Fevereiro de 2026  
> **Estimativa Total:** ~10–14 horas  

---

## 📋 Visão Geral

Este épico agrupa **9 itens** de melhoria e correção de bugs identificados pelo usuário após o uso real do sistema. Os itens foram classificados por tipo e prioridade:

| # | Feature/Bug | Tipo | Prioridade | Estimativa |
|---|-------------|------|-----------|-----------|
| F1 | Múltiplas Matrizes | Feature | 🔴 Alta | 1h |
| F2 | Botão Duplicar (Contas + Fornecedores) | Feature | 🟡 Média | 2h |
| F3 | Fix campo Valor (decimais/vírgula) | Bug 🐛 | 🔴 Alta | 0.5h |
| F4 | Card "Vence Hoje" no Dashboard | Feature | 🟡 Média | 1h |
| F5 | Email opcional no Fornecedor | Bug 🐛 | 🔴 Alta | 0.5h |
| F6 | Bug limite ~2 Fornecedores | Bug 🐛 | 🔴 Alta | 1h |
| F7 | Pesquisa no Select de Fornecedor | Feature | 🟢 Baixa | 0.5h |
| F8 | Dashboard: Contas de Hoje | Feature | 🟡 Média | 1.5h |
| F9 | Botão "Pago" no Dashboard | Feature | 🟡 Média | 2h |

---

## 🔴 BUGS CRÍTICOS (Resolver Primeiro)

---

### F3 — Bug: Campo Valor não aceita decimais com vírgula

**Descrição:**  
No formulário de Contas a Pagar, o campo **Valor (R$)** não processa corretamente números com casas decimais. Ao digitar `1.500,75`, o sistema interpreta como `150075` (número inteiro de milhar) ao invés de `1500.75`.

**Causa Raiz:**  
O `parser` do `InputNumber` do Ant Design remove os pontos (separador de milhar) mas não converte a vírgula em ponto para o formato float JavaScript. A sequência de replace está invertida/incorreta.

**Arquivo Afetado:**
- `frontend/src/components/BillForm/index.tsx`

**Código Atual (com bug):**
```tsx
formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
parser={value => value?.replace(/\./g, '').replace(',', '.') as unknown as number}
```

**Problema:**  
O `formatter` usa **ponto** como separador de milhar, mas quando o usuário digita com **vírgula decimal** (padrão pt-BR), o `parser` remove todos os pontos (inclui o decimal) antes de converter a vírgula. Isso resulta em perda da precisão decimal.

**Solução:**
```tsx
// Usar vírgula como separador decimal e ponto como milhar (padrão pt-BR)
formatter={(value) => {
  if (!value) return '';
  return `${value}`.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}}
parser={(value) => {
  if (!value) return 0;
  // Remove separadores de milhar (ponto), troca vírgula decimal por ponto
  const cleaned = value.replace(/\./g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}}
```

**Critério de Aceite:**
- [ ] Digitar `1500,75` salva o valor `1500.75` no banco
- [ ] Digitar `1.500,75` (com milhar) salva `1500.75`
- [ ] Digitar `0,50` salva `0.50`
- [ ] Campo exibe valores existentes corretamente formatados em pt-BR

---

### F5 — Bug: Email exigido na criação de Fornecedor

**Descrição:**  
O formulário de criação de Fornecedor apresenta validação de formato de e-mail mesmo quando o campo está vazio, bloqueando a criação sem e-mail.

**Causa Raiz:**  
O schema Zod do `VendorForm` usa `.email()` que valida o formato antes de checar se o campo é opcional. O encadeamento `.optional().nullable().or(z.literal(''))` não é suficiente — ao receber uma string não-vazia inválida, o Zod rejeita antes de atingir os modificadores.

**Arquivo Afetado:**
- `frontend/src/components/VendorForm/index.tsx`

**Código Atual (com bug):**
```typescript
const vendorSchema = z.object({
  email: z.string().email('E-mail inválido').optional().nullable().or(z.literal('')),
});
```

**Solução:**
```typescript
const vendorSchema = z.object({
  email: z.union([
    z.string().email('E-mail inválido'),
    z.literal(''),
    z.null(),
  ]).optional().transform(val => val || null),
});
```
Ou mais simplesmente:
```typescript
email: z.string().optional().nullable()
  .refine(val => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
    message: 'E-mail inválido',
  }).or(z.literal('')),
```

**Critério de Aceite:**
- [ ] Criar fornecedor sem e-mail: funciona normalmente
- [ ] Criar fornecedor com e-mail válido: funciona normalmente
- [ ] Criar fornecedor com e-mail inválido: exibe mensagem de erro
- [ ] Campo e-mail é sempre opcional

---

### F6 — Bug: Limite de ~2 Fornecedores criados

**Descrição:**  
Ao tentar criar o 3º (ou mais) fornecedor, o sistema retorna erro e bloqueia a criação. Aparentemente há uma regra de unicidade sendo violada ou um conflito de validação de e-mail.

**Causa Raiz Provável:**  
No `VendorService.create_vendor()`, há validação de e-mail duplicado:
```python
if email:
    existing_email = await self.repository.get_by_email(email)
    if existing_email:
        raise ValueError(f"Vendor with email '{email}' already exists")
```
Se múltiplos fornecedores forem criados **sem e-mail** (campo `None`/vazio), e o banco retornar um registro com `email = NULL` para a query `get_by_email(None)`, a unicidade seria violada para todos os fornecedores sem e-mail.

**Hipótese Alternativa:** A query `get_by_email` pode estar retornando resultados incorretos para `email = NULL` (no SQL, `WHERE email = NULL` não funciona — precisa ser `WHERE email IS NULL`).

**Arquivo Afetado:**
- `backend/app/repositories/vendor_repository.py`
- `backend/app/services/vendor_service.py`

**Solução:**
```python
# vendor_repository.py - garantir que não busca NULL via =
async def get_by_email(self, email: str) -> Optional[Vendor]:
    if not email:
        return None  # Nunca buscar por email vazio/nulo
    result = await self.db.execute(
        select(Vendor).where(Vendor.email == email)
    )
    return result.scalar_one_or_none()
```

```python
# vendor_service.py - só validar email duplicado se email foi fornecido
async def create_vendor(self, name, email=None, ...):
    if email and email.strip():  # Só valida se email não-vazio
        existing_email = await self.repository.get_by_email(email)
        if existing_email:
            raise ValueError(...)
```

**Critério de Aceite:**
- [ ] Criar 5+ fornecedores sem e-mail: funciona sem erro
- [ ] Criar fornecedor com e-mail já existente: retorna erro correto
- [ ] Criar fornecedores com e-mails diferentes: todos criados com sucesso

---

## 🟡 FEATURES DE MÉDIA PRIORIDADE

---

### F1 — Feature: Múltiplas Matrizes

**Descrição:**  
O sistema atualmente restringe a criação de apenas **1 Matriz** (`is_headquarters = True`). O negócio pode ter múltiplas matrizes independentes (ex: regionais distintas).

**Regra de Negócio Atual (a ser removida):**
```python
# branch_service.py - REMOVER esta verificação:
if is_headquarters:
    hq = await self.repository.get_headquarters()
    if hq:
        raise HTTPException(status_code=400, detail="Headquarters branch already exists")
```

**Nova Regra de Negócio:**
- Uma **Matriz** (`is_headquarters=True`) pode existir em quantidade ilimitada
- Uma **Filial** só pode ter **1 pai**, e esse pai deve ser uma Matriz
- Hierarquia: `Matriz → Filiais` (máx. 1 nível)
- Ao filtrar por Matriz, traz somente as filiais daquela matriz específica

**Arquivos Afetados:**
- `backend/app/services/branch_service.py` — remover validação de HQ única
- `backend/app/repositories/branch_repository.py` — `get_headquarters()` pode retornar lista

**Critério de Aceite:**
- [ ] Criar 2+ matrizes sem erro
- [ ] Filial pode ser associada a qualquer das matrizes
- [ ] Filtro por Matriz X só traz filiais de X (não de Y)
- [ ] Interface lista múltiplas matrizes com ícone 📍

---

### F2 — Feature: Botão Duplicar

**Descrição:**  
Adicionar botão **"Duplicar"** nas tabelas de **Contas a Pagar** e **Fornecedores**, permitindo criar uma cópia do registro com os mesmos dados (formulário pré-preenchido).

**Comportamento Esperado:**

**Contas a Pagar:**
- Clicar em "Duplicar" abre o modal de **Nova Conta** com todos os campos pré-preenchidos
- Campos copiados: `branch_id`, `vendor_id`, `category_id`, `description`, `amount`, `invoice_number`, `notes`
- Campo **NÃO copiado**: `due_date` (deve ser preenchida manualmente — evita duplicar data passada), `status` (sempre inicia como `PENDING`)
- O registro original **não é alterado**

**Fornecedores:**
- Clicar em "Duplicar" abre modal de **Novo Fornecedor** com dados pré-preenchidos
- Campos copiados: `email`, `phone`, `address`
- Campo **NÃO copiado**: `name` (obrigatório ser único — usuário deve ajustar)
- Prefixar nome com `"Cópia de "` para indicar origem

**Arquivos Afetados:**
- `frontend/src/pages/Bills/index.tsx` — adicionar coluna/botão duplicar
- `frontend/src/pages/Vendors/index.tsx` — adicionar coluna/botão duplicar
- `frontend/src/components/BillForm/index.tsx` — aceitar `initialValues` para pré-preencher sem `id`
- `frontend/src/components/VendorForm/index.tsx` — aceitar `initialValues`

**UI:**
```
| ... | Ações       |
|     | ✏️ 🗒️ 🗑️  |  (editar | duplicar | excluir)
```
- Ícone: `CopyOutlined` do AntD

**Critério de Aceite:**
- [ ] Botão duplicar visível na tabela de contas
- [ ] Modal abre com dados pré-preenchidos (exceto data e status)
- [ ] Salvar cria novo registro, não altera o original
- [ ] Botão duplicar visível na tabela de fornecedores
- [ ] Nome do fornecedor duplicado prefixado com "Cópia de"

---

### F4 — Feature: Card "Vence Hoje" no Dashboard

**Descrição:**  
Adicionar dois novos cards de KPI no Dashboard:
1. **"Vence Hoje"** — quantidade de contas com `due_date = hoje` e status `PENDING` ou `APPROVED`
2. **"Contas Hoje"** — valor total das contas que vencem hoje

**Layout Atual (4 cards):**
```
[ Total de Contas ] [ Pendentes ] [ Vencidas ] [ Total Pendente ]
```

**Novo Layout (5 cards ou reorganizado):**
```
[ Total de Contas ] [ Vence Hoje ] [ Pendentes ] [ Vencidas ] [ Total Pendente ]
```
ou compactar o layout para 3 colunas na primeira linha e 2 na segunda.

**Cálculo:**
```typescript
const today = new Date();
today.setHours(0, 0, 0, 0);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

const dueTodayBills = filteredBills.filter(b => {
  const dueDate = new Date(b.due_date);
  dueDate.setHours(0, 0, 0, 0);
  return (
    dueDate.getTime() === today.getTime() &&
    (b.status === BillStatus.PENDING || b.status === BillStatus.APPROVED)
  );
});
```

**Arquivos Afetados:**
- `frontend/src/pages/Dashboard/index.tsx`

**Critério de Aceite:**
- [ ] Card "Vence Hoje" exibe quantidade de contas com vencimento hoje
- [ ] Cards existentes continuam funcionando
- [ ] Layout não quebra visualmente

---

### F8 — Feature: Dashboard exibe Contas de Hoje

**Descrição:**  
Substituir a tabela "Últimas Contas Lançadas" (ordenada por `created_at`) por **"Contas de Hoje"** — contas com `due_date = hoje`.

**Nova Ordem das Colunas:**
```
Filial | Categoria | Fornecedor | Descrição | Valor | Status
```
(Remover coluna de data, pois todas já são de hoje)

**Comportamento:**
- Exibir contas com `due_date = data de hoje` (qualquer status exceto `CANCELLED`)
- Se não houver contas hoje, exibir mensagem: _"Nenhuma conta vence hoje. 🎉"_
- Manter botão "Ver todas" que navega para `/bills`

**Arquivos Afetados:**
- `frontend/src/pages/Dashboard/index.tsx`

**Critério de Aceite:**
- [ ] Tabela exibe apenas contas com `due_date = hoje`
- [ ] Colunas na ordem: Filial | Categoria | Fornecedor | Descrição | Valor | Status
- [ ] Mensagem de lista vazia quando não há contas hoje
- [ ] F4 e F8 são implementados juntos (mesma lógica de filtro por data)

---

### F9 — Feature: Botão "Pago" direto no Dashboard

**Descrição:**  
Adicionar na tabela do Dashboard um botão de ação rápida **"Pago"** que altera o `status` da conta para `PAID` sem precisar abrir o formulário de edição.

**Comportamento:**
- Botão só aparece para contas com status `PENDING` ou `APPROVED`
- Ao clicar, exibe confirmação: _"Confirmar pagamento de [descrição] - [valor]?"_
- Se confirmado, chama `PUT /api/v1/bills/{id}` com `{ status: "PAID" }`
- Atualiza a tabela imediatamente (React Query invalidate)
- Toast de sucesso: _"Pagamento registrado com sucesso!"_

**UI na tabela:**
```
| ... | Status    | Ações        |
|     | Pendente  | [✓ Pago]    |
|     | Paga      | (sem botão)  |
```

**Arquivos Afetados:**
- `frontend/src/pages/Dashboard/index.tsx`
- `frontend/src/hooks/useBills.ts` — adicionar `useMarkBillAsPaid` (mutation)

**Novo hook:**
```typescript
export function useMarkBillAsPaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => billApi.update(id, { status: BillStatus.PAID }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
    },
  });
}
```

**Critério de Aceite:**
- [ ] Botão "Pago" visível para contas `PENDING`/`APPROVED`
- [ ] Confirmação antes de registrar pagamento
- [ ] Status atualizado no backend e refletido na UI sem recarregar
- [ ] Botão não aparece para contas já `PAID` ou `CANCELLED`

---

## 🟢 FEATURES DE BAIXA PRIORIDADE

---

### F7 — Feature: Pesquisa no Select de Fornecedor

**Descrição:**  
O campo **Fornecedor** no formulário de Contas a Pagar já possui `showSearch`, mas pode ser melhorado com:
- Placeholder de pesquisa: _"Digite para filtrar..."_
- Filtro case-insensitive e por substring (já existe, confirmar)
- Opção `optionFilterProp="label"` para garantir busca pelo nome

**Observação:**  
Analisando o `BillForm/index.tsx`, o campo Fornecedor **já possui** `showSearch` e `filterOption`. A feature pode já estar implementada. Verificar em runtime se está funcionando corretamente com muitos registros.

**Melhoria Adicional (se necessário):**
```tsx
<Select
  showSearch
  optionFilterProp="label"
  filterOption={(input, option) =>
    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
  }
  placeholder="Selecione ou pesquise o fornecedor"
  notFoundContent="Fornecedor não encontrado"
/>
```

**Arquivos Afetados:**
- `frontend/src/components/BillForm/index.tsx`

**Critério de Aceite:**
- [ ] Digitar parte do nome filtra a lista de fornecedores em tempo real
- [ ] Pesquisa é case-insensitive
- [ ] Funciona com 50+ fornecedores sem lentidão

---

## 📁 Mapa Completo de Arquivos Afetados

### Backend

| Arquivo | Features | Tipo de Mudança |
|---------|----------|-----------------|
| `backend/app/services/branch_service.py` | F1 | Remover validação HQ única |
| `backend/app/repositories/vendor_repository.py` | F6 | Fix query email NULL |
| `backend/app/services/vendor_service.py` | F6 | Guard email vazio |

### Frontend

| Arquivo | Features | Tipo de Mudança |
|---------|----------|-----------------|
| `frontend/src/components/BillForm/index.tsx` | F3, F7 | Fix parser/formatter + melhoria select |
| `frontend/src/components/VendorForm/index.tsx` | F5 | Fix schema Zod email |
| `frontend/src/pages/Bills/index.tsx` | F2 | Botão duplicar |
| `frontend/src/pages/Vendors/index.tsx` | F2 | Botão duplicar |
| `frontend/src/pages/Dashboard/index.tsx` | F4, F8, F9 | Cards + tabela hoje + botão pago |
| `frontend/src/hooks/useBills.ts` | F9 | Novo hook useMarkBillAsPaid |

---

## 🗓️ Ordem de Execução Recomendada

### Sprint 1 — Bugs Críticos (Prioridade Máxima) ~2h
1. **F6** — Fix limite fornecedores (bug bloqueante)
2. **F5** — Fix email obrigatório (bug bloqueante)
3. **F3** — Fix campo valor decimais (bug bloqueante)

### Sprint 2 — Dashboard (Alto Impacto Visual) ~4h
4. **F8** — Contas de Hoje na tabela
5. **F4** — Card "Vence Hoje"
6. **F9** — Botão "Pago" no Dashboard

### Sprint 3 — Features de Produtividade ~4h
7. **F1** — Múltiplas Matrizes
8. **F2** — Botão Duplicar (Contas + Fornecedores)

### Sprint 4 — UX Polish ~0.5h
9. **F7** — Confirmar/melhorar pesquisa de fornecedor

---

## ✅ Critérios de Conclusão do Épico 5

- [ ] Todos os 9 itens implementados e testados
- [ ] Nenhum bug novo introduzido
- [ ] TypeScript build sem erros (`npm run build`)
- [ ] Docker Compose sobe sem erros
- [ ] Fluxo completo testado manualmente

---

## 📝 Notas Técnicas

### Padrão de Duplicação
A duplicação não cria uma rota no backend — é puramente frontend. O formulário recebe um `initialValues` (dados do original sem `id`) e ao salvar chama normalmente `POST /bills` ou `POST /vendors`.

### Lógica de "Hoje" no Frontend
Comparações de data devem normalizar para início do dia (`setHours(0,0,0,0)`) para evitar problemas de horário. O campo `due_date` vem como string `YYYY-MM-DD` do backend e deve ser parseado corretamente com `new Date(date + 'T00:00:00')` para evitar offset de timezone.

### Múltiplas Matrizes — Impacto no BranchSelector
O componente `BranchSelector` precisa continuar listando todas as matrizes com ícone 📍 e suas respectivas filiais indentadas com ↳.

---

**Documento criado em:** 27 de Fevereiro de 2026  
**Próxima revisão após:** Conclusão do Épico 5
