import React, { useMemo, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, InputNumber, Select,
  Popconfirm, message, Tooltip, Tag, Tabs, Divider, Spin,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  CarOutlined, FileTextOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Layout } from '../../components/Layout';
import { Card } from '../../components/Card';
import { BillForm } from '../../components/BillForm';
import {
  useVehicles, useCreateVehicle, useUpdateVehicle, useDeleteVehicle,
  useBranches, useVehicleBills,
} from '../../hooks';
import {
  useVehicleBrands, useVehicleModels,
} from '../../hooks/useFipe';
import type { FipeVehicleType } from '../../hooks/useFipe';
import { BillStatus } from '../../types';
import type { Vehicle, Bill } from '../../types';
import * as S from '../../components/common/styles';

const VEHICLE_TYPE_OPTIONS: { value: FipeVehicleType; label: string }[] = [
  { value: 'carros', label: 'Carro' },
  { value: 'motos', label: 'Moto' },
  { value: 'caminhoes', label: 'Caminhão' },
];

// ── helpers ──────────────────────────────────────────────────────────────────

const parseLocalDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const isOverdue = (bill: Bill): boolean => {
  if (bill.status !== BillStatus.PENDING) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parseLocalDate(bill.due_date) < today;
};

const statusLabels: Record<BillStatus, string> = {
  [BillStatus.PENDING]: 'Pendente',
  [BillStatus.APPROVED]: 'Aprovada',
  [BillStatus.PAID]: 'Paga',
  [BillStatus.CANCELLED]: 'Cancelada',
};

const getBillStatusDisplay = (bill: Bill) => {
  if (isOverdue(bill)) return { label: 'Vencida', tag: 'overdue' };
  return { label: statusLabels[bill.status], tag: bill.status };
};

// ── sub-component: bills tab for a single vehicle ────────────────────────────

function VehicleBillsTab({ vehicle }: { vehicle: Vehicle }) {
  const { data: bills = [], isLoading } = useVehicleBills(vehicle.id);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const billColumns: ColumnsType<Bill> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Descrição', dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: 'Valor',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      render: (v: number) => formatCurrency(v),
    },
    {
      title: 'Vencimento',
      dataIndex: 'due_date',
      key: 'due_date',
      render: (d: string) => new Date(d).toLocaleDateString('pt-BR'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (_: BillStatus, record: Bill) => {
        const { label, tag } = getBillStatusDisplay(record);
        return <S.StatusTag $status={tag}>{label}</S.StatusTag>;
      },
    },
    {
      title: 'Banco',
      dataIndex: 'payment_bank',
      key: 'payment_bank',
      render: (bank: string | null) => bank || <span style={{ color: '#bbb' }}>—</span>,
    },
  ];

  const total = bills.reduce((s, b) => s + b.amount, 0);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ color: '#555' }}>
          {bills.length} conta(s) · Total: <strong>{formatCurrency(total)}</strong>
        </span>
        <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => setIsBillModalOpen(true)}>
          Nova Conta
        </Button>
      </div>

      <Table
        columns={billColumns}
        dataSource={bills}
        rowKey="id"
        loading={isLoading}
        size="small"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={`Nova Conta — ${vehicle.brand} ${vehicle.model} (${vehicle.plate})`}
        open={isBillModalOpen}
        onCancel={() => setIsBillModalOpen(false)}
        footer={null}
        destroyOnClose
        width={700}
      >
        <BillForm
          initialValues={{ branch_id: vehicle.branch_id, vehicle_id: vehicle.id }}
          onSuccess={() => setIsBillModalOpen(false)}
          onCancel={() => setIsBillModalOpen(false)}
        />
      </Modal>
    </>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────

interface VehicleFormValues {
  plate: string;
  brand: string;
  model: string;
  year?: number | null;
  branch_id: number;
  notes?: string | null;
}

export function VehiclesPage(): React.ReactElement {
  const { data: vehicles = [], isLoading } = useVehicles();
  const { data: branches = [] } = useBranches();
  const { mutate: createVehicle } = useCreateVehicle();
  const { mutate: updateVehicle } = useUpdateVehicle();
  const { mutate: deleteVehicle } = useDeleteVehicle();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [detailVehicle, setDetailVehicle] = useState<Vehicle | null>(null);

  // FIPE cascade state
  const [vehicleType, setVehicleType] = useState<FipeVehicleType>('carros');
  const [selectedBrandCode, setSelectedBrandCode] = useState<string | null>(null);

  const { data: fipeBrands = [], isFetching: loadingBrands } = useVehicleBrands(vehicleType);
  const { data: fipeModels = [], isFetching: loadingModels } = useVehicleModels(vehicleType, selectedBrandCode);

  const [form] = Form.useForm<VehicleFormValues>();

  const branchMap = useMemo(
    () => new Map(branches.map(b => [b.id, b.name])),
    [branches],
  );

  const handleOpenCreate = () => {
    setEditingVehicle(null);
    form.resetFields();
    setVehicleType('carros');
    setSelectedBrandCode(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    // Reset FIPE cascade — will be typed manually when editing since we don't
    // know the FIPE brand code from a free-text brand stored in the DB.
    setVehicleType('carros');
    setSelectedBrandCode(null);
    form.setFieldsValue({
      plate: vehicle.plate,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      branch_id: vehicle.branch_id,
      notes: vehicle.notes,
    });
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = () => {
    form.validateFields().then((values) => {
      if (editingVehicle) {
        updateVehicle(
          { id: editingVehicle.id, data: values },
          {
            onSuccess: () => {
              message.success('Veículo atualizado com sucesso!');
              setIsFormModalOpen(false);
            },
            onError: (err: any) => {
              message.error(err?.response?.data?.detail || 'Erro ao atualizar veículo');
            },
          },
        );
      } else {
        createVehicle(values, {
          onSuccess: () => {
            message.success('Veículo cadastrado com sucesso!');
            setIsFormModalOpen(false);
          },
          onError: (err: any) => {
            message.error(err?.response?.data?.detail || 'Erro ao cadastrar veículo');
          },
        });
      }
    });
  };

  const handleDelete = (id: number) => {
    deleteVehicle(id, {
      onSuccess: () => message.success('Veículo excluído!'),
      onError: (error: any) => {
        const detail = error?.response?.data?.detail;
        message.error(detail || 'Erro ao excluir veículo');
      },
    });
  };

  const columns: ColumnsType<Vehicle> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    {
      title: 'Placa',
      dataIndex: 'plate',
      key: 'plate',
      render: (plate: string) => <Tag color="blue">{plate.toUpperCase()}</Tag>,
    },
    { title: 'Marca', dataIndex: 'brand', key: 'brand' },
    { title: 'Modelo', dataIndex: 'model', key: 'model' },
    { title: 'Ano', dataIndex: 'year', key: 'year', width: 80 },
    {
      title: 'Filial',
      dataIndex: 'branch_id',
      key: 'branch_id',
      render: (id: number) => branchMap.get(id) || id,
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 130,
      render: (_: unknown, record: Vehicle) => (
        <S.TableActions>
          <Tooltip title="Ver contas">
            <Button
              type="text"
              icon={<FileTextOutlined />}
              onClick={() => setDetailVehicle(record)}
            />
          </Tooltip>
          <Tooltip title="Editar">
            <Button type="text" icon={<EditOutlined />} onClick={() => handleOpenEdit(record)} />
          </Tooltip>
          <Popconfirm
            title="Excluir veículo"
            description="Tem certeza que deseja excluir este veículo?"
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
    <Layout title="Veículos">
      <S.PageHeader>
        <S.PageTitle>Gestão de Frota</S.PageTitle>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
          Novo Veículo
        </Button>
      </S.PageHeader>

      <Card>
        <Table
          columns={columns}
          dataSource={vehicles}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 15 }}
        />
      </Card>

      {/* Create / Edit modal */}
      <Modal
        title={editingVehicle ? 'Editar Veículo' : 'Novo Veículo'}
        open={isFormModalOpen}
        onOk={handleFormSubmit}
        onCancel={() => setIsFormModalOpen(false)}
        okText={editingVehicle ? 'Salvar' : 'Cadastrar'}
        cancelText="Cancelar"
        destroyOnClose
        width={500}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="Placa" name="plate" rules={[{ required: true, message: 'Informe a placa' }]}>
            <Input placeholder="ABC-1234" style={{ textTransform: 'uppercase' }} />
          </Form.Item>

          {/* FIPE cascade: Type → Brand → Model */}
          <Form.Item label="Tipo de Veículo">
            <Select
              value={vehicleType}
              options={VEHICLE_TYPE_OPTIONS}
              onChange={(val: FipeVehicleType) => {
                setVehicleType(val);
                setSelectedBrandCode(null);
                form.setFieldsValue({ brand: undefined, model: undefined });
              }}
            />
          </Form.Item>

          <Form.Item label="Marca" name="brand" rules={[{ required: true, message: 'Informe a marca' }]}>
            <Select
              showSearch
              allowClear
              placeholder={loadingBrands ? 'Carregando marcas...' : 'Selecione ou digite a marca'}
              loading={loadingBrands}
              optionFilterProp="label"
              options={fipeBrands.map(b => ({ value: b.nome, label: b.nome, code: b.valor }))}
              onChange={(_value: string, option: any) => {
                const code = Array.isArray(option) ? option[0]?.code : option?.code;
                setSelectedBrandCode(code ?? null);
                form.setFieldsValue({ model: undefined });
              }}
              notFoundContent={loadingBrands ? <Spin size="small" /> : 'Nenhuma marca encontrada'}
            />
          </Form.Item>

          <Form.Item label="Modelo" name="model" rules={[{ required: true, message: 'Informe o modelo' }]}>
            <Select
              showSearch
              allowClear
              placeholder={
                !selectedBrandCode
                  ? 'Selecione uma marca primeiro'
                  : loadingModels
                  ? 'Carregando modelos...'
                  : 'Selecione ou digite o modelo'
              }
              loading={loadingModels}
              disabled={!selectedBrandCode && !editingVehicle}
              optionFilterProp="label"
              options={fipeModels.map(m => ({ value: m.modelo, label: m.modelo }))}
              notFoundContent={loadingModels ? <Spin size="small" /> : 'Nenhum modelo encontrado'}
            />
          </Form.Item>

          <Form.Item label="Ano" name="year">
            <InputNumber style={{ width: '100%' }} min={1950} max={2030} placeholder="Ex: 2022" />
          </Form.Item>
          <Form.Item label="Filial" name="branch_id" rules={[{ required: true, message: 'Selecione a filial' }]}>
            <Select
              placeholder="Selecione a filial"
              options={branches.map(b => ({
                value: b.id,
                label: b.is_headquarters ? `${b.name} (Matriz)` : b.name,
              }))}
            />
          </Form.Item>
          <Form.Item label="Observações" name="notes">
            <Input.TextArea rows={3} placeholder="Observações sobre o veículo" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail modal — vehicle info + bills tab */}
      <Modal
        title={
          detailVehicle
            ? `${detailVehicle.brand} ${detailVehicle.model} — ${detailVehicle.plate.toUpperCase()}`
            : ''
        }
        open={!!detailVehicle}
        onCancel={() => setDetailVehicle(null)}
        footer={null}
        destroyOnClose
        width={820}
      >
        {detailVehicle && (
          <Tabs
            defaultActiveKey="bills"
            items={[
              {
                key: 'bills',
                label: (
                  <span><FileTextOutlined /> Contas</span>
                ),
                children: <VehicleBillsTab vehicle={detailVehicle} />,
              },
              {
                key: 'info',
                label: (
                  <span><CarOutlined /> Informações</span>
                ),
                children: (
                  <div style={{ padding: '8px 0' }}>
                    <Divider orientation="left" plain>Dados do Veículo</Divider>
                    <p><strong>Placa:</strong> {detailVehicle.plate.toUpperCase()}</p>
                    <p><strong>Marca:</strong> {detailVehicle.brand}</p>
                    <p><strong>Modelo:</strong> {detailVehicle.model}</p>
                    <p><strong>Ano:</strong> {detailVehicle.year ?? '—'}</p>
                    <p><strong>Filial:</strong> {branchMap.get(detailVehicle.branch_id) ?? detailVehicle.branch_id}</p>
                    {detailVehicle.notes && <p><strong>Obs:</strong> {detailVehicle.notes}</p>}
                  </div>
                ),
              },
            ]}
          />
        )}
      </Modal>
    </Layout>
  );
}
