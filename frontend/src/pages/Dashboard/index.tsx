import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin, Button, Table, Popconfirm, message, Tooltip } from 'antd';
import {
  FileTextOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Layout } from '../../components/Layout';
import { Card } from '../../components/Card';
import { useBills, useBranches, useVendors, useCategories, useMarkBillAsPaid } from '../../hooks';
import { useBranchStore } from '../../context/branchStore';
import { BillStatus } from '../../types';
import type { Bill } from '../../types';
import * as S from '../../components/common/styles';

const statusLabels: Record<BillStatus, string> = {
  [BillStatus.PENDING]: 'Pendente',
  [BillStatus.APPROVED]: 'Aprovada',
  [BillStatus.PAID]: 'Paga',
  [BillStatus.CANCELLED]: 'Cancelada',
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
  const { mutate: markAsPaid, isPending: isMarkingPaid } = useMarkBillAsPaid();

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

  // Normaliza uma string YYYY-MM-DD para início do dia local (sem offset de timezone)
  const parseLocalDate = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

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
    markAsPaid(bill.id, {
      onSuccess: () => {
        message.success(`Pagamento de "${bill.description}" registrado!`);
      },
      onError: () => {
        message.error('Erro ao registrar pagamento');
      },
    });
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
      render: (status: BillStatus) => (
        <S.StatusTag $status={status}>
          {statusLabels[status]}
        </S.StatusTag>
      ),
    },
    {
      title: 'Ação',
      key: 'action',
      width: 90,
      render: (_, record) => {
        const canPay = record.status === BillStatus.PENDING || record.status === BillStatus.APPROVED;
        if (!canPay) return null;
        return (
          <Popconfirm
            title="Confirmar pagamento"
            description={`Registrar pagamento de "${record.description}" (${formatCurrency(record.amount)})?`}
            onConfirm={() => handleMarkAsPaid(record)}
            okText="Confirmar"
            cancelText="Cancelar"
          >
            <Tooltip title="Marcar como Pago">
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                loading={isMarkingPaid}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              >
                Pago
              </Button>
            </Tooltip>
          </Popconfirm>
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
    </Layout>
  );
}

export default DashboardPage;
