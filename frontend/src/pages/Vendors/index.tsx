import React from 'react';
import { Table, Button, Modal, Popconfirm, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, CopyOutlined } from '@ant-design/icons';
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
  const [duplicatingVendor, setDuplicatingVendor] = React.useState<Vendor | null>(null);

  const handleDelete = (id: number) => {
    deleteVendor(id, {
      onSuccess: () => {
        message.success('Fornecedor excluído com sucesso!');
      },
      onError: (error: any) => {
        const detail = error?.response?.data?.detail;
        message.error(detail || 'Erro ao excluir fornecedor');
      },
    });
  };

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setDuplicatingVendor(null);
    setIsModalOpen(true);
  };

  const handleDuplicate = (vendor: Vendor) => {
    setEditingVendor(null);
    setDuplicatingVendor(vendor);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingVendor(null);
    setDuplicatingVendor(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingVendor(null);
    setDuplicatingVendor(null);
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
      width: 130,
      render: (_: unknown, record: Vendor) => (
        <S.TableActions>
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
        title={editingVendor ? 'Editar Fornecedor' : duplicatingVendor ? 'Duplicar Fornecedor' : 'Novo Fornecedor'}
        open={isModalOpen}
        onCancel={handleModalClose}
        footer={null}
        destroyOnClose
        width={600}
      >
        <VendorForm
          vendor={editingVendor}
          initialValues={duplicatingVendor ?? undefined}
          onSuccess={handleModalClose}
          onCancel={handleModalClose}
        />
      </Modal>
    </Layout>
  );
}

export default VendorsPage;
