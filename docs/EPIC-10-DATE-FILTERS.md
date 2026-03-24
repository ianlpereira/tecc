# ÉPICO 10: Filtros de Data em Contas a Pagar

**Status:** 📋 PLANEJADO  
**Prioridade:** 🟡 ALTA  
**Data de Planejamento:** 24/03/2026  
**Dependências:** nenhuma

---

## Motivação

O sistema já possui lançamentos até 2027, mas a tela de Contas a Pagar não permite filtrar por data específica nem por mês. O gestor não consegue responder perguntas como "o que vence nesta sexta?" ou "quanto tenho a pagar em abril?".

---

## Escopo

### Funcionalidade 1 — Filtro por Data Específica
Seletor de data (DatePicker) que filtra contas por `due_date == data selecionada`.

- Campo: **"Vencimento em"** com DatePicker AntD
- Limpar retorna à listagem completa
- Compatível com os filtros existentes (filial, status, fornecedor, categoria)

### Funcionalidade 2 — Filtro por Mês/Ano
Seletor de mês (MonthPicker) que filtra contas por `due_date` dentro do mês selecionado.

- Campo: **"Mês"** com `picker="month"` do AntD DatePicker
- Exemplo: selecionar "Abril 2026" → contas com vencimento entre 01/04 e 30/04
- Compatível com os demais filtros ativos

### Funcionalidade 3 — Ordenação por Vencimento
- Ordenação padrão alterada de "data de lançamento" para **vencimento ASC** (mais próxima primeiro)
- Botão de toggle ASC / DESC na coluna "Vencimento" da tabela

---

## Critérios de Aceite

- Selecionar "28/03/2026" → exibe apenas contas com `due_date = 28/03/2026`
- Selecionar "Abril/2026" → exibe contas com `due_date` entre 01/04 e 30/04
- Filtros de data combinam com filtros de filial/status/fornecedor/categoria
- Tabela ordenada por vencimento ASC por padrão
- "Limpar filtros" também limpa filtros de data

---

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `frontend/src/pages/Bills/index.tsx` | Adicionar DatePicker + MonthPicker; lógica de filtro local; ordenação padrão |
| `frontend/src/types/index.ts` | Nenhuma mudança necessária |

> **Nota:** A filtragem pode ser feita no frontend (sobre os dados já carregados) sem novos endpoints backend, já que os dados são carregados por filial e o volume é gerenciável.

---

## Design UI

```
[ Status ▼ ] [ Categoria ▼ ] [ Fornecedor ▼ ] [ Filial ▼ ] [ Data: dd/mm/aaaa ] [ Mês: mm/aaaa ] [ Limpar ]
```

Total filtrado: **X contas** | Valor total: **R$ X.XXX,XX**
