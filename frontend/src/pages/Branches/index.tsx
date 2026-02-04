import React from 'react';
import { Table, Button, Modal, Popconfirm, message, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Layout } from '../../components/Layout';
import { Card } from '../../components/Card';
import { BranchForm } from '../../components/BranchForm';
import { useBranches, useDeleteBranch } from '../../hooks';
import type { Branch } from '../../types';
import * as S from '../../components/common/styles';

export function BranchesPage(): React.ReactElement {
  const { data: branches, isLoading } = useBranches();
  const { mutate: deleteBranch } = useDeleteBranch();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingBranch, setEditingBranch] = React.useState<Branch | null>(null);

  const handleDelete = (id: number) => {
    deleteBranch(id, {
      onSuccess: () => {
        message.success('Filial excluída com sucesso!');
      },
      onError: () => {
        message.error('Erro ao excluir filial');
      },
    });
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingBranch(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingBranch(null);
  };

  const columns: ColumnsType<Branch> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Nome',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Tipo',
      dataIndex: 'is_headquarters',
      key: 'is_headquarters',
      render: (isHq: boolean) => (
        <Tag color={isHq ? 'blue' : 'default'}>
          {isHq ? 'Matriz' : 'Filial'}
        </Tag>
      ),
    },
    {
      title: 'Criado em',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString('pt-BR'),
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <S.TableActions>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Excluir filial"
            description="Tem certeza que deseja excluir esta filial?"
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
    <Layout title="Filiais">
      <S.PageHeader>
        <S.PageTitle>Gestão de Filiais</S.PageTitle>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Nova Filial
        </Button>
      </S.PageHeader>

      <Card>
        <Table
          columns={columns}
          dataSource={branches}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingBranch ? 'Editar Filial' : 'Nova Filial'}
        open={isModalOpen}
        onCancel={handleModalClose}
        footer={null}
        destroyOnClose
      >
        <BranchForm
          branch={editingBranch}
          onSuccess={handleModalClose}
          onCancel={handleModalClose}
        />
      </Modal>
    </Layout>
  );
}

export default BranchesPage;
