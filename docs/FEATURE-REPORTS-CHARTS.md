# FEATURE: Visualização em Gráficos no Relatório

**Status:** ✅ CONCLUÍDO  
**Data de Implementação:** 29/04/2026  
**Dependências:** Épico 16 (Relatórios), Épico 17 (Meios de Pagamento)

---

## Motivação

A página de Relatórios exibia apenas tabela e totalizadores numéricos. Para facilitar a análise financeira visual, foi adicionada a capacidade de visualizar os dados em gráficos após a geração do relatório.

---

## Escopo

### Gráficos Adicionados

#### 1. Gráfico de Barras — "Valor por Categoria (Top 10)"
- Agrupa o valor total (`amount`) por categoria das contas filtradas
- Exibe as **10 categorias com maior valor** (ordenadas de forma decrescente)
- Eixo Y formatado em moeda compacta (ex: `R$ 1,5k`)
- Tooltip com valor completo em BRL ao passar o mouse
- Categorias sem nome exibidas como `"Sem categoria"`

#### 2. Gráfico de Pizza — "Distribuição por Status"
- Exibe a proporção do **valor total** agrupado por status da conta
- Status exibidos em português: `Paga`, `Pendente`, `Aprovada`, `Cancelada`
- Cores consistentes com as cores de status da tabela:
  - 🟢 Paga: `#52c41a`
  - 🟡 Pendente: `#faad14`
  - 🔵 Aprovada: `#1890ff`
  - ⚪ Cancelada: `#d9d9d9`
- Rótulo mostra nome e percentual (ex: `Paga (65%)`)
- Legenda abaixo do gráfico

---

## Comportamento

- Os gráficos **só aparecem** após clicar em "Gerar Relatório" e quando há resultados (`reportData.rows.length > 0`)
- Os gráficos ficam posicionados entre o **painel de totalizadores** e a **tabela de resultados**
- Layout responsivo: em telas largas os dois gráficos ficam lado a lado (`flex-wrap`); em telas menores empilham verticalmente
- Os gráficos são calculados **client-side** a partir dos dados já retornados pela API, sem chamadas adicionais

---

## Implementação

### Dependência Adicionada

```bash
npm install recharts
```

**Biblioteca:** [`recharts`](https://recharts.org) — biblioteca de gráficos declarativa para React baseada em D3.js.

### Arquivo Modificado

`frontend/src/pages/Reports/index.tsx`

### Novos Imports

```tsx
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
```

### Cálculo dos Dados

```tsx
// Agrupa valor por categoria (Top 10)
const categoryChartData = (() => {
  const map: Record<string, number> = {};
  for (const row of reportData.rows) {
    const key = row.category_name || 'Sem categoria';
    map[key] = (map[key] || 0) + row.amount;
  }
  return Object.entries(map)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
})();

// Agrupa valor por status
const statusChartData = (() => {
  const map: Record<string, number> = {};
  for (const row of reportData.rows) {
    const key = statusLabels[row.status] || row.status;
    map[key] = (map[key] || 0) + row.amount;
  }
  return Object.entries(map).map(([name, value]) => ({ name, value }));
})();
```

---

## Layout da Página (Ordem dos Elementos)

```
[Filtros]
[Totalizadores: Total de Contas | Valor Total | Valor Pago | Valor Pendente]
[Gráfico Barras: Valor por Categoria] [Gráfico Pizza: Distribuição por Status]
[Tabela de Resultados]
```

---

## Nenhuma Mudança no Backend

Esta feature é **100% client-side**. Nenhum endpoint novo, migration ou schema foi necessário. Os dados já retornados pelo `GET /api/v1/bills/report` são suficientes.

---

## Checklist

- [x] Instalar `recharts` via npm
- [x] Calcular `categoryChartData` (Top 10 por valor)
- [x] Calcular `statusChartData` (agrupado por status)
- [x] Renderizar `BarChart` com `ResponsiveContainer`
- [x] Renderizar `PieChart` com `Cell` por status
- [x] Exibir gráficos condicionalmente (só com dados)
- [x] Layout responsivo com `flex-wrap`
- [x] Cores de status consistentes com a tabela
- [x] Tooltip formatado em BRL
- [x] Zero erros TypeScript (`tsc --noEmit`)

**Status: ✅ CONCLUÍDO**
