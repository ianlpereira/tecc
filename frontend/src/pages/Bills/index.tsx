import React, { useMemo, useState } from 'react';
import { Table, Button, Modal, Select, Popconfirm, message, Tooltip, Badge, Space, Form, DatePicker } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, CopyOutlined, SyncOutlined, PaperClipOutlined, FilterOutlined, CheckCircleOutlined, SwapOutlined, CloseOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { Layout } from '../../components/Layout';
import { Card } from '../../components/Card';
import { BillForm } from '../../components/BillForm';
import { useBills, useDeleteBill, useBranches, useVendors, useCategories, useMarkBillAsPaid, useActivePaymentMethods, useBatchDeleteBills, useBatchMarkPaidBills } from '../../hooks';
import { useBranchStore } from '../../context/branchStore';
import { BillStatus } from '../../types';
import type { Bill } from '../../types';
import * as S from '../../components/common/styles';
import { formatDate, isBillOverdue } from '../../utils/date';

const statusLabels: Record<BillStatus, string> = {
  [BillStatus.PENDING]: 'Pendente',
  [BillStatus.APPROVED]: 'Aprovada',
  [BillStatus.PAID]: 'Paga',
  [BillStatus.CANCELLED]: 'Cancelada',
};

const getBillStatusDisplay = (bill: Bill): { label: string; tag: string } => {
  if (isBillOverdue(bill)) return { label: 'Vencida', tag: 'overdue' };
  return { label: statusLabels[bill.status], tag: bill.status };
};

export function BillsPage(): React.ReactElement {
  const { currentBranch, includeChildren } = useBranchStore();
  const { data: bills = [], isLoading } = useBills(
    currentBranch?.id,
    currentBranch?.is_headquarters ? includeChildren : false
  );
  const { data: branches = [] } = useBranches();
  const { data: vendors = [] } = useVendors();
  const { data: categories = [] } = useCategories();
  const { mutate: deleteBill } = useDeleteBill();
  const { mutate: markAsPaid } = useMarkBillAsPaid();
  const { data: paymentMethods = [] } = useActivePaymentMethods();
  const { mutate: batchDelete, isPending: isBatchDeleting } = useBatchDeleteBills();
  const { mutate: batchMarkPaid, isPending: isBatchPaying } = useBatchMarkPaidBills();
  
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingBill, setEditingBill] = React.useState<Bill | null>(null);
  const [duplicatingBill, setDuplicatingBill] = React.useState<Bill | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<BillStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = React.useState<number | 'all'>('all');
  const [vendorFilter, setVendorFilter] = React.useState<number | 'all'>('all');
  const [branchFilter, setBranchFilter] = React.useState<number | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<dayjs.Dayjs | null>(null);
  const [monthFilter, setMonthFilter] = useState<dayjs.Dayjs | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [pageSize, setPageSize] = useState(15);

  // Pay modal state
  const [payModalBill, setPayModalBill] = useState<Bill | null>(null);
  const [payBank, setPayBank] = useState<string | undefined>(undefined);
  const [payDate, setPayDate] = useState<dayjs.Dayjs>(dayjs());

  // Epic 14: batch selection state
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [batchPayModalOpen, setBatchPayModalOpen] = useState(false);
  const [batchPayBank, setBatchPayBank] = useState<string | undefined>(undefined);
  const [batchPayDate, setBatchPayDate] = useState<dayjs.Dayjs>(dayjs());

  const branchMap = useMemo(() => {
    return new Map(branches?.map(b => [b.id, b.name]));
  }, [branches]);

  const vendorMap = useMemo(() => {
    return new Map(vendors?.map(v => [v.id, v.name]));
  }, [vendors]);

  const categoryMap = useMemo(() => {
    return new Map(categories?.map(c => [c.id, c.name]));
  }, [categories]);

  const filteredBills = useMemo(() => {
    let result = bills || [];

    if (statusFilter !== 'all') {
      if (statusFilter === 'overdue' as any) {
        result = result.filter((bill: Bill) => isBillOverdue(bill));
      } else {
        result = result.filter((bill: Bill) => bill.status === statusFilter && !isBillOverdue(bill));
      }
    }
    if (categoryFilter !== 'all') {
      result = result.filter((bill: Bill) => bill.category_id === categoryFilter);
    }
    if (vendorFilter !== 'all') {
      result = result.filter((bill: Bill) => bill.vendor_id === vendorFilter);
    }
    if (branchFilter !== 'all') {
      result = result.filter((bill: Bill) => bill.branch_id === branchFilter);
    }
    if (dateFilter) {
      const dateStr = dateFilter.format('YYYY-MM-DD');
      result = result.filter((bill: Bill) => bill.due_date === dateStr);
    }
    if (monthFilter) {
      const prefix = monthFilter.format('YYYY-MM');
      result = result.filter((bill: Bill) => bill.due_date.startsWith(prefix));
    }
    result = [...result].sort((a: Bill, b: Bill) => {
      const dateCmp = a.due_date.localeCompare(b.due_date);
      const cmp = dateCmp !== 0 ? dateCmp : a.description.localeCompare(b.description, 'pt-BR');
      return sortOrder === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [bills, statusFilter, categoryFilter, vendorFilter, branchFilter, dateFilter, monthFilter, sortOrder]);

  const totalSummary = useMemo(() => {
    const total = filteredBills.reduce((sum: number, b: Bill) => sum + b.amount, 0);
    const paid = filteredBills.filter((b: Bill) => b.status === BillStatus.PAID).reduce((sum: number, b: Bill) => sum + b.amount, 0);
    const pending = filteredBills.filter((b: Bill) => b.status === BillStatus.PENDING && !isBillOverdue(b)).reduce((sum: number, b: Bill) => sum + b.amount, 0);
    const overdue = filteredBills.filter((b: Bill) => isBillOverdue(b)).reduce((sum: number, b: Bill) => sum + b.amount, 0);
    return { total, paid, pending, overdue };
  }, [filteredBills]);

  const hasActiveFilters =
    statusFilter !== 'all' || categoryFilter !== 'all' || vendorFilter !== 'all' || branchFilter !== 'all' || !!dateFilter || !!monthFilter || sortOrder !== 'asc';

  const handleClearFilters = () => {
    setStatusFilter('all');
    setCategoryFilter('all');
    setVendorFilter('all');
    setBranchFilter('all');
    setDateFilter(null);
    setMonthFilter(null);
    setSortOrder('asc');
  };

  const handleDelete = (id: number) => {
    deleteBill(id, {
      onSuccess: () => {
        message.success('Conta excluída com sucesso!');
      },
      onError: (error: any) => {
        const detail = error?.response?.data?.detail;
        message.error(detail || 'Erro ao excluir conta');
      },
    });
  };

  const handleEdit = (bill: Bill) => {
    setEditingBill(bill);
    setDuplicatingBill(null);
    setIsModalOpen(true);
  };

  const handleDuplicate = (bill: Bill) => {
    setEditingBill(null);
    setDuplicatingBill(bill);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingBill(null);
    setDuplicatingBill(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingBill(null);
    setDuplicatingBill(null);
  };

  const handleOpenPayModal = (bill: Bill) => {
    setPayModalBill(bill);
    setPayBank(undefined);
    setPayDate(dayjs());
  };

  const handleConfirmPayment = () => {
    if (!payModalBill) return;
    markAsPaid(
      {
        id: payModalBill.id,
        payload: {
          payment_bank: payBank || null,
          paid_at: payDate ? payDate.format('YYYY-MM-DD') : null,
        },
      },
      {
        onSuccess: () => {
          message.success(`Pagamento de "${payModalBill.description}" registrado!`);
          setPayModalBill(null);
        },
        onError: () => {
          message.error('Erro ao registrar pagamento');
        },
      }
    );
  };

  // Epic 14: batch handlers
  const handleBatchDelete = () => {
    const ids = selectedRowKeys as number[];
    batchDelete(
      { ids },
      {
        onSuccess: (data) => {
          message.success(`${data.deleted} conta(s) excluída(s) com sucesso!`);
          setSelectedRowKeys([]);
        },
        onError: () => {
          message.error('Erro ao excluir contas');
        },
      }
    );
  };

  const handleBatchMarkPaid = () => {
    const ids = selectedRowKeys as number[];
    batchMarkPaid(
      {
        ids,
        payment_bank: batchPayBank || null,
        paid_at: batchPayDate ? batchPayDate.format('YYYY-MM-DD') : null,
      },
      {
        onSuccess: (data) => {
          message.success(`${data.updated} conta(s) marcada(s) como pagas. ${data.skipped > 0 ? `${data.skipped} ignorada(s).` : ''}`);
          setBatchPayModalOpen(false);
          setSelectedRowKeys([]);
          setBatchPayBank(undefined);
          setBatchPayDate(dayjs());
        },
        onError: () => {
          message.error('Erro ao marcar contas como pagas');
        },
      }
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const columns: ColumnsType<Bill> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Filial',
      dataIndex: 'branch_id',
      key: 'branch_id',
      render: (id: number) => branchMap.get(id) || id,
    },
    {
      title: 'Fornecedor',
      dataIndex: 'vendor_id',
      key: 'vendor_id',
      render: (id: number) => vendorMap.get(id) || id,
    },
    {
      title: 'Categoria',
      dataIndex: 'category_id',
      key: 'category_id',
      render: (id: number) => categoryMap.get(id) || id,
    },
    {
      title: 'Descrição',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (desc: string, record: Bill) => (
        <span>
          {record.is_recurring && (
            <Tooltip
              title={
                record.recurrence_day_of_month
                  ? `Recorrente: ocorrência ${record.recurrence_index}/${record.recurrence_total} (todo dia ${record.recurrence_day_of_month})`
                  : `Recorrente: ocorrência ${record.recurrence_index}/${record.recurrence_total} (a cada ${record.recurrence_interval_days} dia(s))`
              }
            >
              <SyncOutlined style={{ color: '#1890ff', marginRight: 6 }} />
            </Tooltip>
          )}
          {desc}
          {!!record.attachments_count && record.attachments_count > 0 && (
            <Tooltip title={`${record.attachments_count} anexo(s)`}>
              <Badge count={record.attachments_count} size="small" style={{ marginLeft: 8, backgroundColor: '#52c41a' }}>
                <PaperClipOutlined style={{ color: '#52c41a', marginLeft: 4 }} />
              </Badge>
            </Tooltip>
          )}
        </span>
      ),
    },
    {
      title: 'Valor',
      dataIndex: 'amount',
      key: 'amount',
      render: (value: number) => formatCurrency(value),
      align: 'right',
    },
    {
      title: (
        <Space>
          Vencimento
          <Button
            type="text"
            size="small"
            icon={<SwapOutlined rotate={90} />}
            onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}
            title={sortOrder === 'asc' ? 'Ordenar decrescente' : 'Ordenar crescente'}
            style={{ color: sortOrder !== 'asc' ? '#1890ff' : undefined }}
          />
        </Space>
      ),
      dataIndex: 'due_date',
      key: 'due_date',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (_: BillStatus, record: Bill) => {
        const { label, tag } = getBillStatusDisplay(record);
        return <S.StatusTag $status={tag}>{label}</S.StatusTag>;
      },
    },
    {
      title: 'Meio de Pgto',
      dataIndex: 'payment_method_name',
      key: 'payment_method_name',
      render: (name: string | null) => name || <span style={{ color: '#bbb' }}>—</span>,
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 160,
      render: (_: unknown, record: Bill) => {
        const canPay = record.status === BillStatus.PENDING || record.status === BillStatus.APPROVED;
        return (
          <S.TableActions>
            {canPay && (
              <Tooltip title="Marcar como Pago">
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleOpenPayModal(record)}
                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                />
              </Tooltip>
            )}
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
            <Button
              type="text"
              icon={<CopyOutlined />}
              onClick={() => handleDuplicate(record)}
              title="Duplicar"
            />
            <Popconfirm
              title="Excluir conta"
              description="Tem certeza que deseja excluir esta conta?"
              onConfirm={() => handleDelete(record.id)}
              okText="Sim"
              cancelText="Não"
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </S.TableActions>
        );
      },
    },
  ];

  return (
    <Layout title="Contas a Pagar">
      <S.PageHeader>
        <S.PageTitle>Gestão de Contas a Pagar</S.PageTitle>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Nova Conta
        </Button>
      </S.PageHeader>

      <S.FilterBar>
        <Select
          style={{ width: 180 }}
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'all', label: 'Todos os Status' },
            { value: BillStatus.PENDING, label: 'Pendente' },
            { value: 'overdue', label: 'Vencida' },
            { value: BillStatus.APPROVED, label: 'Aprovada' },
            { value: BillStatus.PAID, label: 'Paga' },
            { value: BillStatus.CANCELLED, label: 'Cancelada' },
          ]}
        />
        <Select
          style={{ width: 180 }}
          value={categoryFilter}
          onChange={setCategoryFilter}
          showSearch
          optionFilterProp="label"
          options={[
            { value: 'all', label: 'Todas as Categorias' },
            ...(categories?.map(c => ({ value: c.id, label: c.name })) ?? []),
          ]}
        />
        <Select
          style={{ width: 200 }}
          value={vendorFilter}
          onChange={setVendorFilter}
          showSearch
          optionFilterProp="label"
          options={[
            { value: 'all', label: 'Todos os Fornecedores' },
            ...(vendors?.map(v => ({ value: v.id, label: v.name })) ?? []),
          ]}
        />
        <Select
          style={{ width: 180 }}
          value={branchFilter}
          onChange={setBranchFilter}
          showSearch
          optionFilterProp="label"
          options={[
            { value: 'all', label: 'Todas as Filiais' },
            ...(branches?.map(b => ({
              value: b.id,
              label: b.is_headquarters ? `${b.name} (Matriz)` : b.name,
            })) ?? []),
          ]}
        />
        <DatePicker
          placeholder="Filtrar por data"
          format="DD/MM/YYYY"
          value={dateFilter}
          onChange={(d) => { setDateFilter(d); if (d) setMonthFilter(null); }}
          allowClear
          style={{ width: 160 }}
        />
        <DatePicker
          picker="month"
          placeholder="Filtrar por mês"
          format="MM/YYYY"
          value={monthFilter}
          onChange={(d) => { setMonthFilter(d); if (d) setDateFilter(null); }}
          allowClear
          style={{ width: 140 }}
        />
        {hasActiveFilters && (
          <Button onClick={handleClearFilters} icon={<FilterOutlined />}>
            Limpar Filtros
          </Button>
        )}
        <Space style={{ marginLeft: 'auto', color: '#999', fontSize: 12 }}>
          Exibindo {filteredBills.length} de {bills.length} contas
        </Space>
      </S.FilterBar>

      <S.SummaryBar>
        <S.SummaryItem>
          <span>Total ({filteredBills.length} contas)</span>
          <strong>{formatCurrency(totalSummary.total)}</strong>
        </S.SummaryItem>
        <S.SummaryItem $color="#52c41a">
          <span>Pagas</span>
          <strong>{formatCurrency(totalSummary.paid)}</strong>
        </S.SummaryItem>
        <S.SummaryItem $color="#1890ff">
          <span>Pendentes</span>
          <strong>{formatCurrency(totalSummary.pending)}</strong>
        </S.SummaryItem>
        <S.SummaryItem $color="#cf1322">
          <span>Vencidas</span>
          <strong>{formatCurrency(totalSummary.overdue)}</strong>
        </S.SummaryItem>
      </S.SummaryBar>

      <Card>
        {selectedRowKeys.length > 0 && (
          <div style={{ background: '#e6f4ff', border: '1px solid #91caff', borderRadius: 6, padding: '10px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, color: '#1677ff' }}>
              ✓ {selectedRowKeys.length} conta(s) selecionada(s)
            </span>
            <Button
              size="small"
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => { setBatchPayModalOpen(true); setBatchPayBank(undefined); setBatchPayDate(dayjs()); }}
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            >
              Marcar como pagas
            </Button>
            <Popconfirm
              title={`Excluir ${selectedRowKeys.length} conta(s)?`}
              description="Esta ação não pode ser desfeita."
              onConfirm={handleBatchDelete}
              okText="Sim, excluir"
              cancelText="Cancelar"
              okButtonProps={{ danger: true, loading: isBatchDeleting }}
            >
              <Button size="small" danger icon={<DeleteOutlined />}>
                Excluir selecionadas
              </Button>
            </Popconfirm>
            <Button
              size="small"
              icon={<CloseOutlined />}
              onClick={() => setSelectedRowKeys([])}
            >
              Cancelar seleção
            </Button>
          </div>
        )}
        <Table
          columns={columns}
          dataSource={filteredBills}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize,
            showSizeChanger: true,
            pageSizeOptions: ['10', '15', '25', '50', '100'],
            onShowSizeChange: (_current: number, size: number) => setPageSize(size),
          }}
          scroll={{ x: 1200 }}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys),
            type: 'checkbox',
          }}
        />
      </Card>

      <Modal
        title={editingBill ? 'Editar Conta' : duplicatingBill ? 'Duplicar Conta' : 'Nova Conta'}
        open={isModalOpen}
        onCancel={handleModalClose}
        footer={null}
        destroyOnClose
        width={700}
      >
        <BillForm
          bill={editingBill}
          initialValues={duplicatingBill ?? undefined}
          onSuccess={handleModalClose}
          onCancel={handleModalClose}
        />
      </Modal>

      {/* Pay modal */}
      <Modal
        title={`Registrar Pagamento — ${payModalBill?.description ?? ''}`}
        open={!!payModalBill}
        onOk={handleConfirmPayment}
        onCancel={() => setPayModalBill(null)}
        okText="Confirmar Pagamento"
        cancelText="Cancelar"
        width={420}
      >
        <Form layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="Banco / Forma de Pagamento">
            <Select
              placeholder="Selecione o banco (opcional)"
              allowClear
              value={payBank}
              onChange={(v) => setPayBank(v)}
              options={paymentMethods.map((pm) => ({ value: pm.name, label: pm.name }))}
            />
          </Form.Item>
          <Form.Item label="Data do Pagamento">
            <DatePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              value={payDate}
              onChange={(d) => d && setPayDate(d)}
              allowClear={false}
            />
          </Form.Item>
          {payModalBill && (
            <p style={{ color: '#666', fontSize: 13 }}>
              Valor: <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payModalBill.amount)}</strong>
            </p>
          )}
        </Form>
      </Modal>

      {/* Epic 14: Batch mark paid modal */}
      <Modal
        title={`Marcar ${selectedRowKeys.length} conta(s) como pagas`}
        open={batchPayModalOpen}
        onOk={handleBatchMarkPaid}
        onCancel={() => setBatchPayModalOpen(false)}
        okText="Confirmar Pagamento"
        cancelText="Cancelar"
        confirmLoading={isBatchPaying}
        width={420}
      >
        <Form layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="Banco / Forma de Pagamento">
            <Select
              placeholder="Selecione o banco (opcional)"
              allowClear
              value={batchPayBank}
              onChange={(v) => setBatchPayBank(v)}
              options={paymentMethods.map((pm) => ({ value: pm.name, label: pm.name }))}
            />
          </Form.Item>
          <Form.Item label="Data do Pagamento">
            <DatePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              value={batchPayDate}
              onChange={(d) => d && setBatchPayDate(d)}
              allowClear={false}
            />
          </Form.Item>
          <p style={{ color: '#666', fontSize: 13 }}>
            Esta ação marcará <strong>{selectedRowKeys.length}</strong> conta(s) como pagas. Contas já pagas ou canceladas serão ignoradas.
          </p>
        </Form>
      </Modal>
    </Layout>
  );
}

export default BillsPage;
