import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin, Button, Table } from 'antd';
import {
  FileTextOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Layout } from '../../components/Layout';
import { Card } from '../../components/Card';
import { useBills, useBranches, useVendors, useCategories } from '../../hooks';
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

  const vendorMap = useMemo(() => {
    return new Map(vendors?.map((v: any) => [v.id, v.name]));
  }, [vendors]);

  const categoryMap = useMemo(() => {
    return new Map(categories?.map((c: any) => [c.id, c.name]));
  }, [categories]);

  const filteredBills = useMemo(() => {
    // Bills are already filtered by the API with branch hierarchy
    return bills.filter((bill: Bill) => bill.status !== BillStatus.CANCELLED);
  }, [bills]);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pending = filteredBills.filter((b: Bill) => b.status === BillStatus.PENDING);
    const overdue = pending.filter((b: Bill) => new Date(b.due_date) < today);
    const totalPending = pending.reduce((sum: number, b: Bill) => sum + b.amount, 0);
    const totalOverdue = overdue.reduce((sum: number, b: Bill) => sum + b.amount, 0);

    return {
      total: filteredBills.length,
      pending: pending.length,
      overdue: overdue.length,
      totalPending,
      totalOverdue,
    };
  }, [filteredBills]);

  const recentBills = useMemo(() => {
    return [...filteredBills]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [filteredBills]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const columns: ColumnsType<Bill> = [
    {
      title: 'Descrição',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
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
      title: 'Valor',
      dataIndex: 'amount',
      key: 'amount',
      render: (value: number) => formatCurrency(value),
      align: 'right',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: BillStatus) => (
        <S.StatusTag $status={status}>
          {statusLabels[status]}
        </S.StatusTag>
      ),
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
        title="Últimas Contas Lançadas"
        extra={
          <Button type="link" onClick={() => navigate('/bills')}>
            Ver todas
          </Button>
        }
      >
        {recentBills.length > 0 ? (
          <Table
            columns={columns}
            dataSource={recentBills}
            rowKey="id"
            pagination={false}
            size="small"
          />
        ) : (
          <S.EmptyState>
            <p>Nenhuma conta lançada ainda.</p>
            <Button type="primary" onClick={() => navigate('/bills')}>
              Lançar primeira conta
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
