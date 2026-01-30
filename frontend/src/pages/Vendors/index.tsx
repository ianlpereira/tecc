import React from 'react';
import { Table, Button, Modal, Popconfirm, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Layout } from '../../components/Layout';
import { Card } from '../../components/Card';
import { VendorForm } from '../../components/VendorForm';
import { useVendors, useDeleteVendor } from '../../hooks';
import type { Vendor } from '../../types';
import * as S from '../../components/common/styles';

export function VendorsPage(): React.ReactElement {
  const { data: vendors, isLoading } = useVendors();
  const { mutate: deleteVendor } = useDeleteVendor();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingVendor, setEditingVendor] = React.useState<Vendor | null>(null);

  const handleDelete = (id: number) => {
    deleteVendor(id, {
      onSuccess: () => {
        message.success('Fornecedor excluído com sucesso!');
      },
      onError: () => {
        message.error('Erro ao excluir fornecedor');
      },
    });
  };

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingVendor(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingVendor(null);
  };

  const columns: ColumnsType<Vendor> = [
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
      title: 'E-mail',
      dataIndex: 'email',
      key: 'email',
      render: (email: string | null) => email || '-',
    },
    {
      title: 'Telefone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string | null) => phone || '-',
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
            title="Excluir fornecedor"
            description="Tem certeza que deseja excluir este fornecedor?"
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
    <Layout title="Fornecedores">
      <S.PageHeader>
        <S.PageTitle>Gestão de Fornecedores</S.PageTitle>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Novo Fornecedor
        </Button>
      </S.PageHeader>

      <Card>
        <Table
          columns={columns}
          dataSource={vendors}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingVendor ? 'Editar Fornecedor' : 'Novo Fornecedor'}
        open={isModalOpen}
        onCancel={handleModalClose}
        footer={null}
        destroyOnClose
        width={600}
      >
        <VendorForm
          vendor={editingVendor}
          onSuccess={handleModalClose}
          onCancel={handleModalClose}
        />
      </Modal>
    </Layout>
  );
}

export default VendorsPage;
