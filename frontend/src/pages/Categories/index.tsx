import React from 'react';
import { Table, Button, Modal, Popconfirm, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Layout } from '../../components/Layout';
import { Card } from '../../components/Card';
import { CategoryForm } from '../../components/CategoryForm';
import { useCategories, useDeleteCategory } from '../../hooks';
import type { Category } from '../../types';
import * as S from '../../components/common/styles';

export function CategoriesPage(): React.ReactElement {
  const { data: categories, isLoading } = useCategories();
  const { mutate: deleteCategory } = useDeleteCategory();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);

  const handleDelete = (id: number) => {
    deleteCategory(id, {
      onSuccess: () => {
        message.success('Categoria excluída com sucesso!');
      },
      onError: () => {
        message.error('Erro ao excluir categoria');
      },
    });
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const columns: ColumnsType<Category> = [
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
      title: 'Descrição',
      dataIndex: 'description',
      key: 'description',
      render: (desc: string | null) => desc || '-',
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
            title="Excluir categoria"
            description="Tem certeza que deseja excluir esta categoria?"
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
    <Layout title="Categorias">
      <S.PageHeader>
        <S.PageTitle>Gestão de Categorias</S.PageTitle>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Nova Categoria
        </Button>
      </S.PageHeader>

      <Card>
        <Table
          columns={columns}
          dataSource={categories}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
        open={isModalOpen}
        onCancel={handleModalClose}
        footer={null}
        destroyOnClose
      >
        <CategoryForm
          category={editingCategory}
          onSuccess={handleModalClose}
          onCancel={handleModalClose}
        />
      </Modal>
    </Layout>
  );
}

export default CategoriesPage;
