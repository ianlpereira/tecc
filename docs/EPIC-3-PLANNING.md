# 🎨 Épico 3 - Planning (Frontend)

## 📋 Épico 3: Frontend Implementation

Agora que todos os endpoints backend estão funcionando, vamos construir a interface frontend com React + TypeScript.

---

## 🏗️ Fase 3.1: Setup de Hooks & Services

**Objetivo:** Criar custom hooks e serviços para consumir API backend

### Tasks:

#### 3.1.1 - Setup React Query
- [ ] Já instalado (verificar `package.json`)
- [ ] Criar `src/services/queryClient.ts` - instância do QueryClient
- [ ] Configurar cache patterns
- [ ] Implementar refetch intervals

**Arquivo a criar:**
```typescript
// src/services/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos
    },
  },
});

export default queryClient;
```

#### 3.1.2 - Criar Custom Hooks
- [ ] `src/hooks/useBranches.ts` - Listar, criar, atualizar, deletar branches
- [ ] `src/hooks/useVendors.ts` - Listar, criar, atualizar, deletar vendors
- [ ] `src/hooks/useCategories.ts` - Listar, criar, atualizar, deletar categories
- [ ] `src/hooks/useBills.ts` - Listar bills com paginação, criar, atualizar, deletar

**Padrão esperado:**

```typescript
// src/hooks/useBranches.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/apiClient';

export function useBranches() {
  return useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/branches');
      return response.data;
    },
  });
}

export function useCreateBranch() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: BranchCreate) => {
      const response = await apiClient.post('/api/v1/branches', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    },
  });
}

// ... useUpdateBranch, useDeleteBranch, etc
```

#### 3.1.3 - API Client Utilities
- [ ] Melhorar `src/services/apiClient.ts` com:
  - [ ] Error handling padronizado
  - [ ] Loading states
  - [ ] Retry logic
  - [ ] Timeout configuration

**Padrão esperado:**

```typescript
// src/services/apiClient.ts
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);
```

---

## 🎯 Fase 3.2: Componentes UI

**Objetivo:** Criar componentes reutilizáveis para a aplicação

### Tasks:

#### 3.2.1 - BranchSelector Component
- [ ] Dropdown com lista de branches
- [ ] Seleção de branch padrão
- [ ] Store em `branchStore` (contexto global)
- [ ] Integrar no header da aplicação

**Arquivo a criar:**
```typescript
// src/components/BranchSelector.tsx
import { useQuery } from '@tanstack/react-query';
import { useBranchStore } from '../context/branchStore';

export function BranchSelector() {
  const { data: branches, isLoading } = useBranches();
  const { selectedBranch, setSelectedBranch } = useBranchStore();

  if (isLoading) return <div>Carregando filiais...</div>;

  return (
    <select 
      value={selectedBranch?.id || ''} 
      onChange={(e) => {
        const branch = branches?.find(b => b.id === Number(e.target.value));
        setSelectedBranch(branch);
      }}
    >
      {branches?.map(branch => (
        <option key={branch.id} value={branch.id}>
          {branch.name}
        </option>
      ))}
    </select>
  );
}
```

#### 3.2.2 - BranchForm Component
- [ ] Formulário com validação (Zod)
- [ ] Campos: name, is_headquarters
- [ ] Modo create e update
- [ ] Submit com loading state
- [ ] Success/Error notifications

**Arquivo a criar:**
```typescript
// src/components/BranchForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateBranch, useUpdateBranch } from '../hooks/useBranches';

const branchSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  is_headquarters: z.boolean(),
});

type BranchFormData = z.infer<typeof branchSchema>;

export function BranchForm({ onSuccess }: { onSuccess?: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<BranchFormData>({
    resolver: zodResolver(branchSchema),
  });
  const { mutate: createBranch, isPending } = useCreateBranch();

  const onSubmit = (data: BranchFormData) => {
    createBranch(data, {
      onSuccess: onSuccess,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Campos de formulário */}
    </form>
  );
}
```

#### 3.2.3 - VendorSelector Component
- [ ] Dropdown com lista de vendors
- [ ] Busca/filtro de vendors
- [ ] Exibir email ou telefone como hint

#### 3.2.4 - BillForm Component
- [ ] Formulário completo para lançamento de contas
- [ ] Campos: branch_id, vendor_id, category_id, description, amount, due_date, invoice_number, notes, status
- [ ] Auto-preenchimento de branch_id (da seleção global)
- [ ] Date picker para due_date
- [ ] Status selector (dropdown)
- [ ] Validação com Zod

#### 3.2.5 - BillTable Component
- [ ] Tabela paginada de contas
- [ ] Colunas: Invoice, Vendor, Category, Amount, Due Date, Status
- [ ] Ações: Edit, Delete
- [ ] Sorting por coluna
- [ ] Filtro por status
- [ ] Responsive design

---

## 🖼️ Fase 3.3: Pages

**Objetivo:** Criar as páginas principais da aplicação

### Tasks:

#### 3.3.1 - Dashboard Page
- [ ] Home page com resumo
- [ ] Estatísticas: Total de contas, Total pendente, Vencidas
- [ ] Gráfico de contas por categoria
- [ ] Últimas contas lançadas
- [ ] Link para gestão

**Arquivo a criar:**
```typescript
// src/pages/Dashboard.tsx
import { useBills } from '../hooks/useBills';

export function Dashboard() {
  const { data: bills } = useBills();

  const stats = {
    total: bills?.length || 0,
    pending: bills?.filter(b => b.status === 'pending').length || 0,
    overdue: bills?.filter(b => new Date(b.due_date) < new Date()).length || 0,
  };

  return (
    <div>
      {/* Layout com cards de estatísticas */}
      {/* Gráfico */}
      {/* Lista de últimas contas */}
    </div>
  );
}
```

#### 3.3.2 - Branches Page
- [ ] Tabela de branches
- [ ] Botão "Nova Filial"
- [ ] Modal ou form inline para criar
- [ ] Edit inline
- [ ] Delete com confirmação

**Arquivo a criar:**
```typescript
// src/pages/Branches.tsx
import { useState } from 'react';
import { useBranches } from '../hooks/useBranches';
import { BranchForm } from '../components/BranchForm';

export function Branches() {
  const { data: branches, isLoading } = useBranches();
  const [showForm, setShowForm] = useState(false);

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div>
      <button onClick={() => setShowForm(true)}>Nova Filial</button>
      {showForm && <BranchForm onSuccess={() => setShowForm(false)} />}
      {/* Tabela de branches */}
    </div>
  );
}
```

#### 3.3.3 - Vendors Page
- [ ] Tabela de vendors
- [ ] Criar, editar, deletar vendors
- [ ] Campos visíveis: name, email, phone
- [ ] Busca por nome

#### 3.3.4 - Categories Page
- [ ] Tabela de categorias
- [ ] Criar, editar, deletar categorias
- [ ] Simples (apenas name e description)

#### 3.3.5 - Bills Page
- [ ] Layout principal com BranchSelector no topo
- [ ] BillTable com paginação
- [ ] Botão "Nova Conta" abre modal com BillForm
- [ ] Filtro por status
- [ ] Exportar para CSV (futuro)

**Arquivo a criar:**
```typescript
// src/pages/Bills.tsx
import { useState } from 'react';
import { BranchSelector } from '../components/BranchSelector';
import { BillForm } from '../components/BillForm';
import { BillTable } from '../components/BillTable';
import { useBills } from '../hooks/useBills';
import { useBranchStore } from '../context/branchStore';

export function Bills() {
  const { selectedBranch } = useBranchStore();
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { data: bills, isLoading } = useBills();

  const filteredBills = bills?.filter(bill => {
    if (statusFilter !== 'all' && bill.status !== statusFilter) return false;
    if (selectedBranch && bill.branch_id !== selectedBranch.id) return false;
    return true;
  });

  return (
    <div>
      <BranchSelector />
      <button onClick={() => setShowForm(true)}>Nova Conta</button>
      {showForm && <BillForm onSuccess={() => setShowForm(false)} />}
      <BillTable bills={filteredBills} isLoading={isLoading} />
    </div>
  );
}
```

#### 3.3.6 - NotFound Page
- [ ] Página 404
- [ ] Link para home

---

## 🎨 Fase 3.4: Styling & Layout

**Objetivo:** Aplicar estilos consistentes em toda aplicação

### Tasks:

- [ ] Revisar `src/styles/theme.ts` (cores, tipografia)
- [ ] Revisar `src/styles/GlobalStyle.ts` (reset global)
- [ ] Criar componentes styled para:
  - [ ] `src/components/Layout.tsx` - Header, Sidebar, Main
  - [ ] `src/components/Card.tsx` - Card reutilizável
  - [ ] `src/components/Button.tsx` - Button com variantes
  - [ ] `src/components/Input.tsx` - Input styled
  - [ ] `src/components/Modal.tsx` - Modal reutilizável
- [ ] Implementar responsive design
- [ ] Testes visuais em diferentes telas

---

## 📦 Fase 3.5: Routing & Navigation

**Objetivo:** Configurar navegação entre páginas

### Tasks:

- [ ] Setup React Router:
  - [ ] `src/routes/index.ts` - Definição de rotas
  - [ ] `src/App.tsx` - BrowserRouter setup
- [ ] Criar rotas:
  - [ ] `/` → Dashboard
  - [ ] `/branches` → Branches
  - [ ] `/vendors` → Vendors
  - [ ] `/categories` → Categories
  - [ ] `/bills` → Bills
  - [ ] `*` → NotFound
- [ ] Sidebar com navegação
- [ ] Breadcrumbs (opcional)
- [ ] Active route highlighting

**Arquivo a criar:**
```typescript
// src/routes/index.ts
import { RouteObject } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Branches from '../pages/Branches';
import Vendors from '../pages/Vendors';
import Categories from '../pages/Categories';
import Bills from '../pages/Bills';
import NotFound from '../pages/NotFound';

export const routes: RouteObject[] = [
  { path: '/', element: <Dashboard /> },
  { path: '/branches', element: <Branches /> },
  { path: '/vendors', element: <Vendors /> },
  { path: '/categories', element: <Categories /> },
  { path: '/bills', element: <Bills /> },
  { path: '*', element: <NotFound /> },
];
```

---

## 🧪 Fase 3.6: Testes & QA

**Objetivo:** Garantir qualidade e confiabilidade

### Tasks:

- [ ] Setup Vitest + React Testing Library
- [ ] Testes para hooks:
  - [ ] `useBranches.test.ts`
  - [ ] `useVendors.test.ts`
  - [ ] `useCategories.test.ts`
  - [ ] `useBills.test.ts`
- [ ] Testes para componentes:
  - [ ] `BranchForm.test.tsx`
  - [ ] `BillTable.test.tsx`
  - [ ] `BranchSelector.test.tsx`
- [ ] Testes para páginas:
  - [ ] `Bills.test.tsx`
  - [ ] `Branches.test.tsx`
- [ ] Coverage target: 70%+

---

## 📊 Estimativa de Tempo

| Fase | Tarefas | Tempo |
| ---- | ------- | ----- |
| 3.1 Hooks & Services | 8 tasks | 3-4h |
| 3.2 Componentes UI | 5 tasks | 6-8h |
| 3.3 Pages | 6 tasks | 6-8h |
| 3.4 Styling | 7 tasks | 4-5h |
| 3.5 Routing | 5 tasks | 2-3h |
| 3.6 Testes | 10 tasks | 5-6h |
| **TOTAL ÉPICO 3** | **41 tasks** | **~26-34h** |

---

## 🎯 Prioridades

### P0 (CRÍTICO) - Bloqueador para uso básico
1. Fase 3.1: Hooks & Services (necessário para tudo)
2. Fase 3.3: Bills Page (funcionalidade principal)
3. Fase 3.5: Routing (navegação)

### P1 (ALTA) - MVP
4. Fase 3.2: Componentes UI (UX mínima)
5. Fase 3.4: Styling (design básico)

### P2 (MÉDIA) - Polish
6. Fase 3.6: Testes (qualidade)
7. Melhorias de UX (loading states, validações)

---

## 📝 Dependências

- ✅ Backend Épico 2 concluído
- ✅ Todos os endpoints funcionando
- ✅ Docker rodando localmente
- ✅ Environment variables configuradas

---

## 🔗 Dependências Necessárias

Verificar se estão instaladas:

```bash
# Frontend dependencies
npm list react-query @tanstack/react-query
npm list react-router-dom
npm list zod @hookform/resolvers
npm list axios
npm list styled-components

# Dev dependencies
npm list vitest @testing-library/react
```

---

## ✅ Checklist Pré-Épico 3

Antes de começar, confirme:

- [ ] Backend Épico 2 completamente funcional
- [ ] Todos os 4 endpoints (branches, vendors, categories, bills) retornam dados
- [ ] Swagger UI mostrando todos os endpoints
- [ ] Frontend conectado e consegue fazer requisições
- [ ] Axios/apiClient funcionando com CORS
- [ ] Environment variable `VITE_API_URL` configurada
- [ ] React Query instalado e funcionando
- [ ] Node/npm versões atualizadas

---

## 🚀 Próximas Ações

1. Iniciar Fase 3.1 (Hooks & Services)
2. Validar que React Query está funcionando
3. Implementar useBranches como teste
4. Expandir para outros recursos
5. Construir componentes incrementalmente
6. Integrar tudo em rotas

---

**Status:** Pronto para iniciar  
**Prioridade:** ALTA  
**Data de início:** Assim que Épico 2 for validado ✅  
**Estimativa:** 26-34 horas de trabalho
