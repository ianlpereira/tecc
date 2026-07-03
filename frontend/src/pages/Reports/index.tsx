import React, { useState } from 'react';
import { Table, Button, Select, DatePicker, Form, Space, Statistic, Divider } from 'antd';
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Layout } from '../../components/Layout';
import { Card } from '../../components/Card';
import { useBranches, useVendors, useCategories, useActivePaymentMethods } from '../../hooks';
import { useReport } from '../../hooks/useBills';
import { BillStatus } from '../../types';
import type { BillReportRow } from '../../types';
import * as S from '../../components/common/styles';
import { formatDate } from '../../utils/date';

const { RangePicker } = DatePicker;

const statusLabels: Record<BillStatus, string> = {
  [BillStatus.PENDING]: 'Pendente',
  [BillStatus.APPROVED]: 'Aprovada',
  [BillStatus.PAID]: 'Paga',
  [BillStatus.CANCELLED]: 'Cancelada',
};

const statusColors: Record<BillStatus, string> = {
  [BillStatus.PENDING]: '#faad14',
  [BillStatus.APPROVED]: '#1890ff',
  [BillStatus.PAID]: '#52c41a',
  [BillStatus.CANCELLED]: '#d9d9d9',
};

export function ReportsPage(): React.ReactElement {
  const { data: branches = [] } = useBranches();
  const { data: vendors = [] } = useVendors();
  const { data: categories = [] } = useCategories();
  const { data: paymentMethods = [] } = useActivePaymentMethods();

  const [filters, setFilters] = useState<Record<string, any>>({});
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [month, setMonth] = useState<dayjs.Dayjs | null>(null);
  const [selectedBranches, setSelectedBranches] = useState<number[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<BillStatus | undefined>(undefined);
  const [selectedPaymentBank, setSelectedPaymentBank] = useState<string | undefined>(undefined);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<number | undefined>(undefined);

  const { data: reportData, refetch, isFetching } = useReport(filters);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const handleSearch = () => {
    const newFilters: Record<string, any> = {};
    if (dateRange?.[0]) newFilters.due_date_from = dateRange[0].format('YYYY-MM-DD');
    if (dateRange?.[1]) newFilters.due_date_to = dateRange[1].format('YYYY-MM-DD');
    if (month) {
      newFilters.due_date_from = month.startOf('month').format('YYYY-MM-DD');
      newFilters.due_date_to = month.endOf('month').format('YYYY-MM-DD');
    }
    if (selectedBranches.length > 0) newFilters.branch_ids = selectedBranches.join(',');
    if (selectedVendors.length > 0) newFilters.vendor_ids = selectedVendors.join(',');
    if (selectedCategory) newFilters.category_id = selectedCategory;
    if (selectedStatus) newFilters.status = selectedStatus;
    if (selectedPaymentBank) newFilters.payment_bank = selectedPaymentBank;
    if (selectedPaymentMethod) newFilters.payment_method_id = selectedPaymentMethod;
    setFilters(newFilters);
    setTimeout(() => refetch(), 0);
  };

  const handleClearFilters = () => {
    setDateRange(null);
    setMonth(null);
    setSelectedBranches([]);
    setSelectedVendors([]);
    setSelectedCategory(undefined);
    setSelectedStatus(undefined);
    setSelectedPaymentBank(undefined);
    setSelectedPaymentMethod(undefined);
    setFilters({});
  };

  const handleExportCsv = () => {
    if (!reportData?.rows?.length) return;
    const headers = ['ID', 'Descrição', 'Fornecedor', 'Categoria', 'Filial', 'Veículo', 'Valor', 'Vencimento', 'Status', 'Banco', 'Pago em', 'Meio de Pgto'];
    const rows = reportData.rows.map(r => [
      r.id,
      `"${r.description.replace(/"/g, '""')}"`,
      `"${(r.vendor_name || '').replace(/"/g, '""')}"`,
      `"${(r.category_name || '').replace(/"/g, '""')}"`,
      `"${(r.branch_name || '').replace(/"/g, '""')}"`,
      r.vehicle_plate || '',
      r.amount.toFixed(2).replace('.', ','),
      r.due_date,
      statusLabels[r.status] || r.status,
      r.payment_bank || '',
      r.paid_at || '',
      r.payment_method_name || '',
    ]);
    const csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio_contas_${dayjs().format('YYYY-MM-DD')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const columns: ColumnsType<BillReportRow> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Descrição',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Fornecedor',
      dataIndex: 'vendor_name',
      key: 'vendor_name',
      render: (v: string | null) => v || <span style={{ color: '#bbb' }}>—</span>,
    },
    {
      title: 'Categoria',
      dataIndex: 'category_name',
      key: 'category_name',
      render: (v: string | null) => v || <span style={{ color: '#bbb' }}>—</span>,
    },
    {
      title: 'Filial',
      dataIndex: 'branch_name',
      key: 'branch_name',
      render: (v: string | null) => v || <span style={{ color: '#bbb' }}>—</span>,
    },
    {
      title: 'Veículo',
      dataIndex: 'vehicle_plate',
      key: 'vehicle_plate',
      render: (v: string | null) => v || <span style={{ color: '#bbb' }}>—</span>,
      width: 110,
    },
    {
      title: 'Valor',
      dataIndex: 'amount',
      key: 'amount',
      render: (v: number) => formatCurrency(v),
      align: 'right',
      width: 130,
    },
    {
      title: 'Vencimento',
      dataIndex: 'due_date',
      key: 'due_date',
      render: (v: string) => formatDate(v),
      width: 110,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (s: BillStatus) => (
        <span style={{ color: statusColors[s] || '#666', fontWeight: 600 }}>
          {statusLabels[s] || s}
        </span>
      ),
    },
    {
      title: 'Banco',
      dataIndex: 'payment_bank',
      key: 'payment_bank',
      render: (v: string | null) => v || <span style={{ color: '#bbb' }}>—</span>,
      width: 130,
    },
    {
      title: 'Pago em',
      dataIndex: 'paid_at',
      key: 'paid_at',
      render: (v: string | null) => (v ? formatDate(v) : <span style={{ color: '#bbb' }}>—</span>),
      width: 110,
    },
    {
      title: 'Meio de Pgto',
      dataIndex: 'payment_method_name',
      key: 'payment_method_name',
      render: (v: string | null) => v || <span style={{ color: '#bbb' }}>—</span>,
      width: 140,
    },
  ];

  const summary = reportData?.summary;

  const categoryChartData = (() => {
    if (!reportData?.rows?.length) return [];
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

  const statusChartData = (() => {
    if (!reportData?.rows?.length) return [];
    const map: Record<string, number> = {};
    for (const row of reportData.rows) {
      const key = statusLabels[row.status] || row.status;
      map[key] = (map[key] || 0) + row.amount;
    }
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  })();

  const branchChartData = (() => {
    if (!reportData?.rows?.length) return [];
    const map: Record<string, number> = {};
    for (const row of reportData.rows) {
      const key = row.branch_name || 'Sem filial';
      map[key] = (map[key] || 0) + row.amount;
    }
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  })();

  const vendorChartData = (() => {
    if (!reportData?.rows?.length) return [];
    const map: Record<string, number> = {};
    for (const row of reportData.rows) {
      const key = row.vendor_name || 'Sem fornecedor';
      map[key] = (map[key] || 0) + row.amount;
    }
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  })();

  const PIE_COLORS = ['#52c41a', '#faad14', '#1890ff', '#d9d9d9'];

  const currencyAxisFormatter = (value: number) =>
    new Intl.NumberFormat('pt-BR', { notation: 'compact', style: 'currency', currency: 'BRL' }).format(value);

  const currencyTooltipFormatter = (value: unknown) =>
    [formatCurrency(Number(value)), 'Valor'] as [string, string];

  return (
    <Layout title="Relatórios">
      <S.PageHeader>
        <S.PageTitle>Relatório de Contas a Pagar</S.PageTitle>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleExportCsv}
          disabled={!reportData?.rows?.length}
        >
          Exportar CSV
        </Button>
      </S.PageHeader>

      <Card title="Filtros">
        <Form layout="vertical">
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Form.Item label="Período (intervalo)">
              <RangePicker
                format="DD/MM/YYYY"
                value={dateRange as any}
                onChange={(v) => { setDateRange(v as any); if (v) setMonth(null); }}
                allowClear
                style={{ width: 260 }}
              />
            </Form.Item>
            <Form.Item label="Mês">
              <DatePicker
                picker="month"
                format="MM/YYYY"
                value={month}
                onChange={(v) => { setMonth(v); if (v) setDateRange(null); }}
                allowClear
                style={{ width: 140 }}
              />
            </Form.Item>
            <Form.Item label="Filiais">
              <Select
                mode="multiple"
                placeholder="Todas as filiais"
                allowClear
                style={{ width: 220 }}
                value={selectedBranches}
                onChange={setSelectedBranches}
                showSearch
                optionFilterProp="label"
                options={branches.map((b: any) => ({
                  value: b.id,
                  label: b.is_headquarters ? `${b.name} (Matriz)` : b.name,
                }))}
              />
            </Form.Item>
            <Form.Item label="Fornecedores">
              <Select
                mode="multiple"
                placeholder="Todos os fornecedores"
                allowClear
                style={{ width: 220 }}
                value={selectedVendors}
                onChange={setSelectedVendors}
                showSearch
                optionFilterProp="label"
                options={vendors.map((v: any) => ({ value: v.id, label: v.name }))}
              />
            </Form.Item>
            <Form.Item label="Categoria">
              <Select
                placeholder="Todas"
                allowClear
                style={{ width: 180 }}
                value={selectedCategory}
                onChange={setSelectedCategory}
                showSearch
                optionFilterProp="label"
                options={categories.map((c: any) => ({ value: c.id, label: c.name }))}
              />
            </Form.Item>
            <Form.Item label="Status">
              <Select
                placeholder="Todos"
                allowClear
                style={{ width: 150 }}
                value={selectedStatus}
                onChange={setSelectedStatus}
                options={[
                  { value: BillStatus.PENDING, label: 'Pendente' },
                  { value: BillStatus.APPROVED, label: 'Aprovada' },
                  { value: BillStatus.PAID, label: 'Paga' },
                  { value: BillStatus.CANCELLED, label: 'Cancelada' },
                ]}
              />
            </Form.Item>
            <Form.Item label="Meio de Pagamento">
              <Select
                placeholder="Todos"
                allowClear
                style={{ width: 180 }}
                value={selectedPaymentMethod}
                onChange={setSelectedPaymentMethod}
                showSearch
                optionFilterProp="label"
                options={paymentMethods.map((pm: any) => ({ value: pm.id, label: pm.name }))}
              />
            </Form.Item>
          </div>
          <Space>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch} loading={isFetching}>
              Gerar Relatório
            </Button>
            <Button onClick={handleClearFilters}>Limpar Filtros</Button>
          </Space>
        </Form>
      </Card>

      {summary && (
        <div style={{ marginTop: 16 }}>
          <Card>
            <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', padding: '8px 0' }}>
              <Statistic title="Total de Contas" value={summary.count} />
              <Statistic title="Valor Total" value={formatCurrency(summary.total_amount)} />
              <Statistic title="Valor Pago" value={formatCurrency(summary.paid_amount)} valueStyle={{ color: '#52c41a' }} />
              <Statistic title="Valor Pendente" value={formatCurrency(summary.pending_amount)} valueStyle={{ color: '#faad14' }} />
            </div>
          </Card>
        </div>
      )}

      {reportData?.rows?.length ? (
        <>
          <div style={{ marginTop: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 480px', minWidth: 0 }}>
            <Card title="Valor por Categoria (Top 10)">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={categoryChartData} margin={{ top: 4, right: 16, left: 8, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-35} textAnchor="end" interval={0} tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={currencyAxisFormatter} tick={{ fontSize: 11 }} width={80} />
                  <Tooltip formatter={currencyTooltipFormatter} />
                  <Bar dataKey="value" fill="#1890ff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
          <div style={{ flex: '1 1 320px', minWidth: 0 }}>
            <Card title="Distribuição por Status">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {statusChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={currencyTooltipFormatter} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 480px', minWidth: 0 }}>
            <Card title="Gasto por Filial">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={branchChartData} margin={{ top: 4, right: 16, left: 8, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-35} textAnchor="end" interval={0} tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={currencyAxisFormatter} tick={{ fontSize: 11 }} width={80} />
                  <Tooltip formatter={currencyTooltipFormatter} />
                  <Bar dataKey="value" fill="#722ed1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
          <div style={{ flex: '1 1 480px', minWidth: 0 }}>
            <Card title="Gasto por Fornecedor (Top 10)">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={vendorChartData} margin={{ top: 4, right: 16, left: 8, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-35} textAnchor="end" interval={0} tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={currencyAxisFormatter} tick={{ fontSize: 11 }} width={80} />
                  <Tooltip formatter={currencyTooltipFormatter} />
                  <Bar dataKey="value" fill="#fa8c16" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </div>
        </>
      ) : null}

      <div style={{ marginTop: 16 }}>
        <Card>
          {reportData?.rows?.length ? (
            <>
              <Divider orientation="left" style={{ marginTop: 0 }}>
                {reportData.rows.length} resultado(s)
              </Divider>
              <Table
                columns={columns}
                dataSource={reportData.rows}
                rowKey="id"
                loading={isFetching}
                pagination={false}
                scroll={{ x: 1400 }}
                size="small"
              />
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
              <SearchOutlined style={{ fontSize: 40, marginBottom: 12 }} />
              <p>Use os filtros acima e clique em "Gerar Relatório" para visualizar os dados.</p>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
}

export default ReportsPage;
