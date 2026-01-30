import React, { useMemo } from 'react';
import { Table, Button, Modal, Select, Popconfirm, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Layout } from '../../components/Layout';
import { Card } from '../../components/Card';
import { BillForm } from '../../components/BillForm';
import { useBills, useDeleteBill, useBranches, useVendors, useCategories } from '../../hooks';
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

export function BillsPage(): React.ReactElement {
  const { data: bills, isLoading } = useBills();
  const { data: branches } = useBranches();
  const { data: vendors } = useVendors();
  const { data: categories } = useCategories();
  const { mutate: deleteBill } = useDeleteBill();
  const { currentBranch } = useBranchStore();
  
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingBill, setEditingBill] = React.useState<Bill | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<BillStatus | 'all'>('all');

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

    if (currentBranch) {
      result = result.filter(bill => bill.branch_id === currentBranch.id);
    }

    if (statusFilter !== 'all') {
      result = result.filter(bill => bill.status === statusFilter);
    }

    return result;
  }, [bills, currentBranch, statusFilter]);

  const handleDelete = (id: number) => {
    deleteBill(id, {
      onSuccess: () => {
        message.success('Conta excluída com sucesso!');
      },
      onError: () => {
        message.error('Erro ao excluir conta');
      },
    });
  };

  const handleEdit = (bill: Bill) => {
    setEditingBill(bill);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingBill(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingBill(null);
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
    },
    {
      title: 'Valor',
      dataIndex: 'amount',
      key: 'amount',
      render: (value: number) => formatCurrency(value),
      align: 'right',
    },
    {
      title: 'Vencimento',
      dataIndex: 'due_date',
      key: 'due_date',
      render: (date: string) => new Date(date).toLocaleDateString('pt-BR'),
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
    {
      title: 'Ações',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <S.TableActions>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
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
      ),
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
          style={{ width: 200 }}
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'all', label: 'Todos os Status' },
            { value: BillStatus.PENDING, label: 'Pendente' },
            { value: BillStatus.APPROVED, label: 'Aprovada' },
            { value: BillStatus.PAID, label: 'Paga' },
            { value: BillStatus.CANCELLED, label: 'Cancelada' },
          ]}
        />
      </S.FilterBar>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredBills}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 15 }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title={editingBill ? 'Editar Conta' : 'Nova Conta'}
        open={isModalOpen}
        onCancel={handleModalClose}
        footer={null}
        destroyOnClose
        width={700}
      >
        <BillForm
          bill={editingBill}
          onSuccess={handleModalClose}
          onCancel={handleModalClose}
        />
      </Modal>
    </Layout>
  );
}

export default BillsPage;
