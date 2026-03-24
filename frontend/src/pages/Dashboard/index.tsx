import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin, Button, Table, Modal, Select, message, Tooltip, Form, DatePicker } from 'antd';
import {
  FileTextOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  AlertOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { Layout } from '../../components/Layout';
import { Card } from '../../components/Card';
import { useBills, useBranches, useVendors, useCategories, useMarkBillAsPaid, useActivePaymentMethods, useDueTodaySummary } from '../../hooks';
import { useBranchStore } from '../../context/branchStore';
import { BillStatus } from '../../types';
import type { Bill } from '../../types';
import * as S from '../../components/common/styles';
import { parseLocalDate, isBillOverdue } from '../../utils/date';

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

export function DashboardPage(): React.ReactElement {
  const navigate = useNavigate();
  const { currentBranch, includeChildren } = useBranchStore();
  const { data: bills = [], isLoading: billsLoading } = useBills(
    currentBranch?.id,
    currentBranch?.is_headquarters ? includeChildren : false
  );
  const { data: branches = [], isLoading: branchesLoading } = useBranches();
  const { data: vendors = [] } = useVendors();
  const { data: categories = [] } = useCategories();
  const { mutate: markAsPaid } = useMarkBillAsPaid();
  const { data: paymentMethods = [] } = useActivePaymentMethods();

  // Epic 15: due today summary
  const { data: dueTodaySummary } = useDueTodaySummary(currentBranch?.id);

  // F2: Pay modal state
  const [payModalBill, setPayModalBill] = useState<Bill | null>(null);
  const [payBank, setPayBank] = useState<string | undefined>(undefined);
  const [payDate, setPayDate] = useState<dayjs.Dayjs>(dayjs());

  const branchMap = useMemo(() => {
    return new Map(branches?.map((b: any) => [b.id, b.name]));
  }, [branches]);

  const vendorMap = useMemo(() => {
    return new Map(vendors?.map((v: any) => [v.id, v.name]));
  }, [vendors]);

  const categoryMap = useMemo(() => {
    return new Map(categories?.map((c: any) => [c.id, c.name]));
  }, [categories]);

  const filteredBills = useMemo(() => {
    return bills.filter((bill: Bill) => bill.status !== BillStatus.CANCELLED);
  }, [bills]);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pending = filteredBills.filter((b: Bill) => b.status === BillStatus.PENDING);
    const overdue = pending.filter((b: Bill) => parseLocalDate(b.due_date) < today);
    const dueToday = filteredBills.filter((b: Bill) => {
      const dueDate = parseLocalDate(b.due_date);
      return (
        dueDate.getTime() === today.getTime() &&
        (b.status === BillStatus.PENDING || b.status === BillStatus.APPROVED)
      );
    });
    const totalPending = pending.reduce((sum: number, b: Bill) => sum + b.amount, 0);
    const totalOverdue = overdue.reduce((sum: number, b: Bill) => sum + b.amount, 0);

    return {
      total: filteredBills.length,
      pending: pending.length,
      overdue: overdue.length,
      dueToday: dueToday.length,
      totalPending,
      totalOverdue,
    };
  }, [filteredBills]);

  // Contas de hoje (due_date == hoje, qualquer status exceto CANCELLED)
  const todayBills = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return filteredBills.filter((b: Bill) => {
      const dueDate = parseLocalDate(b.due_date);
      return dueDate.getTime() === today.getTime();
    });
  }, [filteredBills]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleMarkAsPaid = (bill: Bill) => {
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

  const columns: ColumnsType<Bill> = [
    {
      title: 'Filial',
      dataIndex: 'branch_id',
      key: 'branch_id',
      render: (id: number) => branchMap.get(id) || '-',
      ellipsis: true,
    },
    {
      title: 'Categoria',
      dataIndex: 'category_id',
      key: 'category_id',
      render: (id: number) => categoryMap.get(id) || '-',
      ellipsis: true,
    },
    {
      title: 'Fornecedor',
      dataIndex: 'vendor_id',
      key: 'vendor_id',
      render: (id: number) => vendorMap.get(id) || '-',
      ellipsis: true,
    },
    {
      title: 'Descrição',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Valor',
      dataIndex: 'amount',
      key: 'amount',
      render: (value: number) => formatCurrency(value),
      align: 'right',
      width: 130,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (_: BillStatus, record: Bill) => {
        const { label, tag } = getBillStatusDisplay(record);
        return <S.StatusTag $status={tag}>{label}</S.StatusTag>;
      },
    },
    {
      title: 'Ação',
      key: 'action',
      width: 90,
      render: (_, record) => {
        const canPay = record.status === BillStatus.PENDING || record.status === BillStatus.APPROVED;
        if (!canPay) return null;
        return (
          <Tooltip title="Marcar como Pago">
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleMarkAsPaid(record)}
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            >
              Pago
            </Button>
          </Tooltip>
        );
      },
    },
  ];

  if (billsLoading || branchesLoading) {
    return (
      <Layout title="Dashboard">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <S.PageHeader>
        <S.PageTitle>
          Dashboard {currentBranch ? `- ${currentBranch.name}` : '- Todas as Filiais'}
        </S.PageTitle>
      </S.PageHeader>

      <S.StatsGrid>
        {/* Epic 15: A Pagar Hoje card with dynamic color */}
        <S.StatCard>
          <S.StatIcon $bg={
            dueTodaySummary?.overdue_count && dueTodaySummary.overdue_count > 0
              ? '#f5222d'
              : dueTodaySummary?.due_today_count && dueTodaySummary.due_today_count > 0
              ? '#faad14'
              : '#52c41a'
          }>
            <AlertOutlined />
          </S.StatIcon>
          <S.StatLabel>A Pagar Hoje</S.StatLabel>
          <S.StatValue $color={
            dueTodaySummary?.overdue_count && dueTodaySummary.overdue_count > 0
              ? '#f5222d'
              : dueTodaySummary?.due_today_count && dueTodaySummary.due_today_count > 0
              ? '#faad14'
              : undefined
          }>
            {formatCurrency(dueTodaySummary?.total_amount ?? 0)}
          </S.StatValue>
          {dueTodaySummary && (
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
              {dueTodaySummary.count} conta(s)
              {dueTodaySummary.overdue_count > 0 && ` — ${dueTodaySummary.overdue_count} atrasada(s)`}
            </div>
          )}
        </S.StatCard>

        <S.StatCard>
          <S.StatIcon $bg="#1890ff">
            <FileTextOutlined />
          </S.StatIcon>
          <S.StatLabel>Total de Contas</S.StatLabel>
          <S.StatValue>{stats.total}</S.StatValue>
        </S.StatCard>

        <S.StatCard>
          <S.StatIcon $bg="#13c2c2">
            <CalendarOutlined />
          </S.StatIcon>
          <S.StatLabel>Vence Hoje</S.StatLabel>
          <S.StatValue $color={stats.dueToday > 0 ? '#13c2c2' : undefined}>
            {stats.dueToday}
          </S.StatValue>
        </S.StatCard>

        <S.StatCard>
          <S.StatIcon $bg="#faad14">
            <ClockCircleOutlined />
          </S.StatIcon>
          <S.StatLabel>Contas Pendentes</S.StatLabel>
          <S.StatValue $color="#faad14">{stats.pending}</S.StatValue>
        </S.StatCard>

        <S.StatCard>
          <S.StatIcon $bg="#f5222d">
            <ExclamationCircleOutlined />
          </S.StatIcon>
          <S.StatLabel>Contas Vencidas</S.StatLabel>
          <S.StatValue $color="#f5222d">{stats.overdue}</S.StatValue>
        </S.StatCard>

        <S.StatCard>
          <S.StatIcon $bg="#52c41a">
            <DollarOutlined />
          </S.StatIcon>
          <S.StatLabel>Total Pendente</S.StatLabel>
          <S.StatValue>{formatCurrency(stats.totalPending)}</S.StatValue>
        </S.StatCard>
      </S.StatsGrid>

      <Card
        title="📅 Contas de Hoje"
        extra={
          <Button type="link" onClick={() => navigate('/bills')}>
            Ver todas
          </Button>
        }
      >
        {todayBills.length > 0 ? (
          <Table
            columns={columns}
            dataSource={todayBills}
            rowKey="id"
            pagination={false}
            size="small"
            scroll={{ x: 900 }}
          />
        ) : (
          <S.EmptyState>
            <p>🎉 Nenhuma conta vence hoje.</p>
            <Button type="link" onClick={() => navigate('/bills')}>
              Ver todas as contas
            </Button>
          </S.EmptyState>
        )}
      </Card>

      <div style={{ marginTop: 24 }}>
        <S.StatsGrid>
          <Card title="Resumo">
            <p><strong>Filiais cadastradas:</strong> {branches?.length || 0}</p>
            <p><strong>Fornecedores:</strong> {vendors?.length || 0}</p>
            <p><strong>Categorias:</strong> {categories?.length || 0}</p>
          </Card>

          {stats.totalOverdue > 0 && (
            <Card title="⚠️ Atenção">
              <p style={{ color: '#f5222d' }}>
                <strong>Total vencido: {formatCurrency(stats.totalOverdue)}</strong>
              </p>
              <p>Você tem {stats.overdue} conta(s) vencida(s) que precisam de atenção.</p>
              <Button type="primary" danger onClick={() => navigate('/bills')}>
                Ver contas vencidas
              </Button>
            </Card>
          )}
        </S.StatsGrid>
      </div>

      {/* F2: Payment modal */}
      <Modal
        title={`Registrar Pagamento — ${payModalBill?.description ?? ''}`}
        open={!!payModalBill}
        onOk={handleConfirmPayment}
        onCancel={() => setPayModalBill(null)}
        okText="Confirmar Pagamento"
        cancelText="Cancelar"
        confirmLoading={false}
        width={420}
      >
        <Form layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="Banco / Forma de Pagamento">
            <Select
              placeholder="Selecione o banco (opcional)"
              allowClear
              value={payBank}
              onChange={(v) => setPayBank(v)}
              options={paymentMethods.map((pm: any) => ({ value: pm.name, label: pm.name }))}
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
              Valor: <strong>{formatCurrency(payModalBill.amount)}</strong>
            </p>
          )}
        </Form>
      </Modal>
    </Layout>
  );
}

export default DashboardPage;
