# ÉPICO 7: Controle de Frota de Veículos — CONCLUÍDO ✅

## Status: IMPLEMENTADO E FUNCIONAL

**Data de Conclusão:** 06/03/2026  
**Branch:** `master`  
**Commit:** `52db053`

---

## Resumo Executivo

Feature completa de gestão de frota que permite:
- Cadastrar veículos com placa única por sistema, marca, modelo, ano e filial
- Associar contas a pagar a um veículo específico
- Criar contas (inclusive recorrentes) diretamente pela tela de veículos
- Visualizar todas as contas de um veículo em uma aba dedicada

---

## Motivação

Empresas com frota de veículos precisam rastrear custos específicos por veículo (combustível, manutenção, IPVA, seguro, etc.). A associação de contas a veículos permite relatórios de custo por veículo e criação de contas recorrentes vinculadas diretamente ao ativo.

---

## Componentes Implementados

### 🗄️ Backend

#### 1. Model (`backend/app/models/vehicle.py`)
Nova tabela `vehicles`:

```python
class Vehicle(BaseModel):
    __tablename__ = "vehicles"

    plate    = Column(String(20), unique=True, nullable=False)   # placa única no sistema
    brand    = Column(String(100), nullable=False)               # marca
    model    = Column(String(100), nullable=False)               # modelo
    year     = Column(Integer, nullable=True)                    # ano de fabricação
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=False)
    notes    = Column(Text, nullable=True)
```

Herda de `BaseModel` → possui `id`, `created_at`, `updated_at` automaticamente.

#### 2. Alteração no Model de Contas (`backend/app/models/bill.py`)
```python
# Campo adicionado:
vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=True)
```

#### 3. Schema (`backend/app/schemas/vehicle.py`)
```python
VehicleBase     # plate, brand, model, year, branch_id, notes
VehicleCreate   # herda VehicleBase (todos campos required exceto year/notes)
VehicleUpdate   # todos opcionais
VehicleResponse # + id, created_at, updated_at
```

Schemas `BillCreate`, `BillUpdate`, `BillResponse` receberam:
```python
vehicle_id: int | None = None
```

#### 4. Repositório (`backend/app/repositories/vehicle_repository.py`)
```python
class VehicleRepository(BaseRepository[Vehicle]):
    async def get_by_branch(self, branch_id: int) -> List[Vehicle]
    async def get_by_plate(self, plate: str) -> Vehicle | None
```

`BillRepository` recebeu:
```python
async def get_by_vehicle(self, vehicle_id: int) -> List[Bill]
```

#### 5. Service (`backend/app/services/vehicle_service.py`)
Métodos implementados:
- `get_all_vehicles()` — lista todos os veículos
- `get_vehicle(id)` — busca por ID (retorna `None` se não encontrado)
- `get_vehicles_by_branch(branch_id)` — filtra por filial
- `create_vehicle(plate, brand, model, branch_id, year, notes)` — cria com validação de placa duplicada (409 Conflict)
- `update_vehicle(id, **kwargs)` — atualiza com validação de placa se alterada
- `delete_vehicle(id)` — remove com verificação de existência (404 se não encontrado)

`BillService` recebeu:
- `create_bill(...)` agora aceita `vehicle_id` — associa ao criar (recorrente ou avulsa)
- `get_bills_by_vehicle(vehicle_id)` — lista contas do veículo

#### 6. Router (`backend/app/routers/vehicles.py`)
Endpoints registrados em `/api/v1/vehicles`:

| Método | Path | Descrição |
|--------|------|-----------|
| `GET` | `/` | Lista todos os veículos |
| `GET` | `/{id}` | Busca veículo por ID |
| `POST` | `/` | Cria novo veículo |
| `PUT` | `/{id}` | Atualiza veículo |
| `DELETE` | `/{id}` | Remove veículo |
| `GET` | `/{id}/bills` | Lista contas do veículo |
| `POST` | `/{id}/bills` | Cria conta associada ao veículo |

#### 7. Migração Alembic
**Arquivo:** `backend/alembic/versions/0f1f3b804c93_add_vehicles_table_and_vehicle_id_to_.py`

```sql
-- Cria tabela vehicles
CREATE TABLE vehicles (
    id          SERIAL PRIMARY KEY,
    plate       VARCHAR(20) UNIQUE NOT NULL,
    brand       VARCHAR(100) NOT NULL,
    model       VARCHAR(100) NOT NULL,
    year        INTEGER,
    branch_id   INTEGER REFERENCES branches(id),
    notes       TEXT,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

-- Adiciona FK em bills
ALTER TABLE bills ADD COLUMN vehicle_id INTEGER REFERENCES vehicles(id);
```

**Aplicar em produção após deploy:**
```bash
docker compose exec backend alembic upgrade head
```

---

### 🎨 Frontend

#### 1. Types (`frontend/src/types/index.ts`)
```typescript
export interface Vehicle {
  id: number;
  plate: string;
  brand: string;
  model: string;
  year?: number | null;
  branch_id: number;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface VehicleCreate {
  plate: string;
  brand: string;
  model: string;
  year?: number | null;
  branch_id: number;
  notes?: string | null;
}

export interface VehicleUpdate extends Partial<VehicleCreate> {}
```

`Bill` e `BillCreate` receberam: `vehicle_id?: number | null`

#### 2. API Service (`frontend/src/services/api.ts`)
```typescript
export const vehicleApi = {
  getAll: ()                        => apiClient.get<Vehicle[]>('/api/v1/vehicles/'),
  getById: (id: number)             => apiClient.get<Vehicle>(`/api/v1/vehicles/${id}`),
  create: (data: VehicleCreate)     => apiClient.post<Vehicle>('/api/v1/vehicles/', data),
  update: (id, data: VehicleUpdate) => apiClient.put<Vehicle>(`/api/v1/vehicles/${id}`, data),
  delete: (id: number)              => apiClient.delete(`/api/v1/vehicles/${id}`),
  getBills: (id: number)            => apiClient.get<Bill[]>(`/api/v1/vehicles/${id}/bills`),
  createBill: (vehicleId, data)     => apiClient.post<Bill>(`/api/v1/vehicles/${vehicleId}/bills`, data),
}
```

#### 3. Hooks (`frontend/src/hooks/useVehicles.ts`)
```typescript
useVehicles()             // lista todos + cache TanStack Query
useVehicle(id)            // por ID
useVehicleBills(id)       // contas do veículo
useCreateVehicle()        // mutação com invalidação de cache
useUpdateVehicle()        // mutação com invalidação
useDeleteVehicle()        // mutação com invalidação
useCreateVehicleBill()    // invalida vehicles + vehicle bills + bills
```

#### 3b. Hook FIPE (`frontend/src/hooks/useFipe.ts`)

Integração com a **Brasil API** para buscar marcas e modelos da tabela FIPE — sem autenticação, CORS habilitado, cache de 24h.

```typescript
// Retorna marcas ordenadas alfabeticamente para o tipo de veículo
useVehicleBrands(type: 'carros' | 'motos' | 'caminhoes')
// → { nome: string, valor: string }[]  (valor = código da marca na FIPE)

// Retorna modelos ordenados para marca + tipo. Desabilitado se brandCode for null.
useVehicleModels(type, brandCode: string | null)
// → { modelo: string }[]
```

**Endpoints da Brasil API utilizados:**
```
GET https://brasilapi.com.br/fipe/marcas/v1/{tipoVeiculo}
GET https://brasilapi.com.br/fipe/veiculos/v1/{tipoVeiculo}/{codigoMarca}
```

#### 4. Página (`frontend/src/pages/Vehicles/index.tsx`)

**Componente `VehiclesPage`:**
- Tabela com colunas: ID, Placa (Tag azul), Marca, Modelo, Ano, Filial, Ações
- Ações por linha: 👁 Ver Contas · ✏️ Editar · 🗑️ Excluir
- Botão "Novo Veículo" abre modal de formulário

**Modal de Formulário (criar/editar) — Selects FIPE em cascata:**
1. **Tipo de Veículo** — `carros` / `motos` / `caminhões`
2. **Marca** — Select com busca (`showSearch`), alimentado pela FIPE; ao trocar tipo reseta marca e modelo
3. **Modelo** — Select com busca, alimentado pela FIPE a partir da marca selecionada; desabilitado até marca ser escolhida
4. **Placa**, **Ano**, **Filial** (Select), **Observações**

> Ao editar um veículo existente, o formulário pré-carrega os valores salvos em Marca e Modelo como texto — o usuário pode redigitar ou selecionar da FIPE normalmente.

**Modal de Detalhe (Ver Contas):**
- Tab **Contas** (`VehicleBillsTab`):
  - Tabela com: Descrição, Valor, Vencimento, Status, Banco
  - Total consolidado das contas
  - Botão "Nova Conta" abre `BillForm` pré-preenchido com `vehicle_id` e `branch_id`
  - Suporta criação de contas recorrentes
- Tab **Informações**: exibe todos os dados cadastrais do veículo

#### 5. BillForm Atualizado (`frontend/src/components/BillForm/index.tsx`)
Campo **Veículo** adicionado ao formulário padrão de contas:
- Select opcional com `allowClear`
- Exibe: `PLACA — Marca Modelo`
- Campo `vehicle_id` incluído no payload de criação/edição

#### 6. Navegação
- **Rota:** `/vehicles` registrada em `App.tsx`
- **Menu lateral:** Item "Veículos" com ícone `<CarOutlined />` em `Layout/index.tsx`

---

## Fluxo de Uso

```
1. Acesse "Veículos" no menu lateral
2. Clique "Novo Veículo" → preencha placa, marca, modelo, filial
3. Na tabela, clique 👁 "Ver Contas" para abrir o painel do veículo
4. Tab "Contas":
   - Visualize todas as contas associadas + total
   - Clique "Nova Conta" para criar uma conta (recorrente ou avulsa) vinculada ao veículo
5. Em qualquer tela de contas, o campo "Veículo" permite associar a conta a um veículo existente
```

---

## Arquivos Modificados / Criados

### Novos arquivos
| Arquivo | Tipo |
|---------|------|
| `backend/app/models/vehicle.py` | Model SQLAlchemy |
| `backend/app/schemas/vehicle.py` | Pydantic schemas |
| `backend/app/repositories/vehicle_repository.py` | Repositório |
| `backend/app/services/vehicle_service.py` | Service |
| `backend/app/routers/vehicles.py` | Router FastAPI |
| `backend/alembic/versions/0f1f3b804c93_*.py` | Migração Alembic |
| `frontend/src/hooks/useVehicles.ts` | Hooks TanStack Query |
| `frontend/src/hooks/useFipe.ts` | Hooks Brasil API FIPE (marcas/modelos) |
| `frontend/src/pages/Vehicles/index.tsx` | Página completa |

### Arquivos modificados
| Arquivo | O que mudou |
|---------|-------------|
| `backend/app/models/bill.py` | + `vehicle_id` FK |
| `backend/app/schemas/bill.py` | + `vehicle_id` em Create/Update/Response |
| `backend/app/repositories/bill_repository.py` | + `get_by_vehicle()` |
| `backend/app/services/bill_service.py` | + `vehicle_id` em `create_bill()` + `get_bills_by_vehicle()` |
| `backend/app/routers/bills.py` | Passa `vehicle_id` ao criar |
| `backend/app/models/__init__.py` | Exporta `Vehicle` |
| `backend/app/schemas/__init__.py` | Exporta schemas de Vehicle |
| `backend/app/repositories/__init__.py` | Exporta `VehicleRepository` |
| `backend/app/services/__init__.py` | Exporta `VehicleService` |
| `backend/app/main.py` | Registra `vehicles_router` |
| `frontend/src/types/index.ts` | + interfaces Vehicle |
| `frontend/src/services/api.ts` | + `vehicleApi` |
| `frontend/src/hooks/index.ts` | Re-exporta `useVehicles` |
| `frontend/src/pages/index.ts` | Exporta `VehiclesPage` |
| `frontend/src/App.tsx` | + rota `/vehicles` |
| `frontend/src/components/Layout/index.tsx` | + item Veículos no menu |
| `frontend/src/components/BillForm/index.tsx` | + campo Veículo |

---

## Deploy em Produção

Após merge/push para o Render, executar a migração:

```bash
# Via Render Shell ou docker compose exec localmente
alembic upgrade head
```

A migration `0f1f3b804c93` é idempotente — roda apenas se ainda não foi aplicada.

---

## Possíveis Evoluções Futuras

- Relatório de custo total por veículo (soma das contas pagas)
- Filtro de contas a pagar por veículo na página de Bills
- Dashboard com KPI de gasto por frota
- Upload de documentos (CRLV, seguro) associados ao veículo
- Histórico de quilometragem / manutenções
