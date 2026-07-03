import React from 'react';
import { Table, Button, Modal, Popconfirm, message, Switch, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, CreditCardOutlined } from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnsType } from 'antd/es/table';
import { Layout } from '../../../components/Layout';
import { Card } from '../../../components/Card';
import {
  usePaymentMethods,
  useCreatePaymentMethod,
  useUpdatePaymentMethod,
  useDeletePaymentMethod,
} from '../../../hooks';
import type { PaymentMethod } from '../../../types';
import * as S from '../../../components/common/styles';

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(255),
  is_active: z.boolean().optional().default(true),
});

type FormValues = z.infer<typeof schema>;

export function PaymentMethodsPage(): React.ReactElement {
  const { data: paymentMethods = [], isLoading } = usePaymentMethods();
  const { mutate: createPM } = useCreatePaymentMethod();
  const { mutate: updatePM } = useUpdatePaymentMethod();
  const { mutate: deletePM } = useDeletePaymentMethod();

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingPM, setEditingPM] = React.useState<PaymentMethod | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', is_active: true },
  });

  const handleCreate = () => {
    setEditingPM(null);
    reset({ name: '', is_active: true });
    setIsModalOpen(true);
  };

  const handleEdit = (pm: PaymentMethod) => {
    setEditingPM(pm);
    reset({ name: pm.name, is_active: pm.is_active });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    deletePM(id, {
      onSuccess: () => message.success('Meio de pagamento excluído!'),
      onError: (err: any) => {
        const detail = err?.response?.data?.detail;
        message.error(detail || 'Erro ao excluir');
      },
    });
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingPM(null);
    reset();
  };

  const onSubmit = (values: FormValues) => {
    if (editingPM) {
      updatePM(
        { id: editingPM.id, data: values },
        {
          onSuccess: () => {
            message.success('Meio de pagamento atualizado!');
            handleModalClose();
          },
          onError: (err: any) => {
            const detail = err?.response?.data?.detail;
            message.error(detail || 'Erro ao atualizar');
          },
        },
      );
    } else {
      createPM(values, {
        onSuccess: () => {
          message.success('Meio de pagamento criado!');
          handleModalClose();
        },
        onError: (err: any) => {
          const detail = err?.response?.data?.detail;
          message.error(detail || 'Erro ao criar');
        },
      });
    }
  };

  const columns: ColumnsType<PaymentMethod> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: 'Nome', dataIndex: 'name', key: 'name' },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 120,
      render: (active: boolean) =>
        active ? <Tag color="green">Ativo</Tag> : <Tag color="default">Inativo</Tag>,
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 120,
      render: (_: unknown, record: PaymentMethod) => (
        <S.TableActions>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          />
          <Popconfirm
            title="Excluir meio de pagamento?"
            description="Esta ação não pode ser desfeita."
            onConfirm={() => handleDelete(record.id)}
            okText="Excluir"
            cancelText="Cancelar"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" icon={<DeleteOutlined />} danger size="small" />
          </Popconfirm>
        </S.TableActions>
      ),
    },
  ];

  return (
    <Layout title="Meios de Pagamento">
      <S.PageHeader>
        <S.PageTitle>Meios de Pagamento</S.PageTitle>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Novo Meio de Pagamento
        </Button>
      </S.PageHeader>

      <Card>
        <Table
          columns={columns}
          dataSource={paymentMethods}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 20 }}
          locale={{ emptyText: 'Nenhum meio de pagamento cadastrado' }}
        />
      </Card>

      <Modal
        title={
          <span>
            <CreditCardOutlined style={{ marginRight: 8 }} />
            {editingPM ? 'Editar Meio de Pagamento' : 'Novo Meio de Pagamento'}
          </span>
        }
        open={isModalOpen}
        onCancel={handleModalClose}
        footer={null}
        destroyOnClose
      >
        <form onSubmit={handleSubmit(onSubmit)} style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              Nome <span style={{ color: 'red' }}>*</span>
            </label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  placeholder="Ex.: Bradesco, Itaú, PIX..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: errors.name ? '1px solid red' : '1px solid #d9d9d9',
                    borderRadius: 6,
                    fontSize: 14,
                    outline: 'none',
                  }}
                />
              )}
            />
            {errors.name && (
              <span style={{ color: 'red', fontSize: 12 }}>{errors.name.message}</span>
            )}
          </div>

          <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontWeight: 500 }}>Ativo</label>
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <Switch checked={field.value} onChange={field.onChange} />
              )}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button onClick={handleModalClose}>Cancelar</Button>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              {editingPM ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
