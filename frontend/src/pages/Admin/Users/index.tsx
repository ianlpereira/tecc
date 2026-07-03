import { useState } from 'react';
import { Table, Button, Modal, Tag, Switch, message, Form, Input, Select, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Layout } from '../../../components/Layout';
import { Card } from '../../../components/Card';
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeactivateUser,
  useActivateUser,
} from '../../../hooks/useUsers';
import type { AuthUser, UserCreate, UserUpdate } from '../../../types';
import * as S from '../../../components/common/styles';

const { Option } = Select;

type ModalMode = 'create' | 'edit';

export function AdminUsersPage() {
  const { data: users, isLoading } = useUsers();
  const { mutate: createUser, isPending: creating } = useCreateUser();
  const { mutate: updateUser, isPending: updating } = useUpdateUser();
  const { mutate: deactivateUser } = useDeactivateUser();
  const { mutate: activateUser } = useActivateUser();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('create');
  const [editingUser, setEditingUser] = useState<AuthUser | null>(null);

  const [form] = Form.useForm<UserCreate & UserUpdate>();

  const handleOpenCreate = () => {
    setModalMode('create');
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({ role: 'user' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: AuthUser) => {
    setModalMode('edit');
    setEditingUser(user);
    form.resetFields();
    form.setFieldsValue({
      full_name: user.full_name ?? '',
      email: user.email ?? '',
      role: user.role,
    });
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    form.resetFields();
  };

  const handleSubmit = (values: UserCreate & UserUpdate) => {
    if (modalMode === 'create') {
      const payload: UserCreate = {
        username: values.username as string,
        password: values.password as string,
        email: values.email || null,
        full_name: values.full_name || null,
        role: values.role as 'admin' | 'user',
      };
      createUser(payload, {
        onSuccess: () => {
          message.success('Usuário criado com sucesso!');
          handleClose();
        },
        onError: (error: any) => {
          const detail = error?.response?.data?.detail;
          message.error(detail || 'Erro ao criar usuário');
        },
      });
    } else if (editingUser) {
      const payload: UserUpdate = {
        email: values.email || null,
        full_name: values.full_name || null,
        role: values.role as 'admin' | 'user',
      };
      if (values.password) payload.password = values.password as string;
      updateUser(
        { id: editingUser.id, data: payload },
        {
          onSuccess: () => {
            message.success('Usuário atualizado com sucesso!');
            handleClose();
          },
          onError: (error: any) => {
            const detail = error?.response?.data?.detail;
            message.error(detail || 'Erro ao atualizar usuário');
          },
        }
      );
    }
  };

  const handleToggleActive = (user: AuthUser) => {
    if (user.is_active) {
      deactivateUser(user.id, {
        onSuccess: () => message.success(`Usuário "${user.username}" desativado.`),
        onError: (error: any) => {
          const detail = error?.response?.data?.detail;
          message.error(detail || 'Erro ao desativar usuário');
        },
      });
    } else {
      activateUser(user.id, {
        onSuccess: () => message.success(`Usuário "${user.username}" ativado.`),
        onError: (error: any) => {
          const detail = error?.response?.data?.detail;
          message.error(detail || 'Erro ao ativar usuário');
        },
      });
    }
  };

  const columns: ColumnsType<AuthUser> = [
    {
      title: 'Usuário',
      dataIndex: 'username',
      key: 'username',
      sorter: (a, b) => a.username.localeCompare(b.username),
    },
    {
      title: 'Nome Completo',
      dataIndex: 'full_name',
      key: 'full_name',
      render: (v: string | null) => v || '-',
    },
    {
      title: 'E-mail',
      dataIndex: 'email',
      key: 'email',
      render: (v: string | null) => v || '-',
    },
    {
      title: 'Perfil',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) =>
        role === 'admin' ? (
          <Tag color="blue">Admin</Tag>
        ) : (
          <Tag color="default">Usuário</Tag>
        ),
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean, record: AuthUser) => (
        <Popconfirm
          title={isActive ? 'Desativar usuário?' : 'Ativar usuário?'}
          description={
            isActive
              ? `O usuário "${record.username}" perderá acesso ao sistema.`
              : `O usuário "${record.username}" voltará a ter acesso ao sistema.`
          }
          onConfirm={() => handleToggleActive(record)}
          okText="Confirmar"
          cancelText="Cancelar"
        >
          <Switch checked={isActive} size="small" />
        </Popconfirm>
      ),
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 80,
      render: (_: unknown, record: AuthUser) => (
        <S.TableActions>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleOpenEdit(record)}
            title="Editar"
          />
        </S.TableActions>
      ),
    },
  ];

  const isPending = creating || updating;

  return (
    <Layout title="Administração — Usuários">
      <S.PageHeader>
        <S.PageTitle>Gestão de Usuários</S.PageTitle>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
          Novo Usuário
        </Button>
      </S.PageHeader>

      <Card>
        <Table
          columns={columns}
          dataSource={users ?? []}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 20 }}
        />
      </Card>

      <Modal
        title={modalMode === 'create' ? 'Novo Usuário' : `Editar Usuário — ${editingUser?.username}`}
        open={isModalOpen}
        onCancel={handleClose}
        onOk={() => form.submit()}
        okText={modalMode === 'create' ? 'Criar' : 'Salvar'}
        cancelText="Cancelar"
        confirmLoading={isPending}
        destroyOnClose
        width={480}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
          {modalMode === 'create' && (
            <Form.Item
              name="username"
              label="Nome de usuário"
              rules={[
                { required: true, message: 'Informe o nome de usuário' },
                { min: 3, message: 'Mínimo 3 caracteres' },
              ]}
            >
              <Input autoComplete="off" />
            </Form.Item>
          )}

          <Form.Item name="full_name" label="Nome completo">
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="E-mail"
            rules={[{ type: 'email', message: 'Informe um e-mail válido' }]}
          >
            <Input autoComplete="off" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Perfil"
            rules={[{ required: true, message: 'Selecione o perfil' }]}
          >
            <Select>
              <Option value="user">Usuário</Option>
              <Option value="admin">Administrador</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="password"
            label={modalMode === 'create' ? 'Senha' : 'Nova senha (deixe em branco para não alterar)'}
            rules={
              modalMode === 'create'
                ? [
                    { required: true, message: 'Informe a senha' },
                    { min: 6, message: 'Mínimo 6 caracteres' },
                  ]
                : [{ min: 6, message: 'Mínimo 6 caracteres' }]
            }
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}

export default AdminUsersPage;
