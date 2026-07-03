import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Select, DatePicker, Button, message, Checkbox, Row, Col, Alert, Radio, Divider, Modal, Space } from 'antd';
import { PaperClipOutlined, PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useCreateBill, useUpdateBill, useUpdateBillRecurrence, useBranches, useVendors, useCategories, useVehicles, useActivePaymentMethods } from '../../hooks';
import { useBranchStore } from '../../context/branchStore';
import { BillStatus } from '../../types';
import type { Bill } from '../../types';
import { BillAttachments } from '../BillAttachments';

dayjs.extend(customParseFormat);

const billSchema = z.object({
  branch_id: z.number().min(1, 'Filial é obrigatória'),
  vendor_id: z.number().min(1, 'Fornecedor é obrigatório'),
  category_id: z.number().min(1, 'Categoria é obrigatória'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  amount: z.number().min(0.01, 'Valor deve ser maior que zero'),
  due_date: z.string().min(1, 'Data de vencimento é obrigatória'),
  invoice_number: z.string().optional().nullable().or(z.literal('')),
  notes: z.string().optional().nullable().or(z.literal('')),
  status: z.nativeEnum(BillStatus).optional(),
  is_recurring: z.boolean().optional().default(false),
  recurrence_type: z.enum(['interval', 'fixed_day', 'manual_dates']).optional().default('interval'),
  recurrence_interval_days: z.number().min(1).nullable().optional(),
  recurrence_occurrences: z.number().min(2).max(60).nullable().optional(),
  recurrence_day_of_month: z.number().min(1).max(28).nullable().optional(),
  vehicle_id: z.number().nullable().optional(),
  payment_method_id: z.number().nullable().optional(),  // Epic 17
});

type BillFormData = z.infer<typeof billSchema>;

interface BillFormProps {
  bill?: Bill | null;
  initialValues?: Partial<Bill> | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function BillForm({ bill, initialValues, onSuccess, onCancel }: BillFormProps): React.ReactElement {
  const { mutate: createBill, isPending: isCreating } = useCreateBill();
  const { mutate: updateBill, isPending: isUpdating } = useUpdateBill();
  const { mutate: updateRecurrence, isPending: isUpdatingRecurrence } = useUpdateBillRecurrence();
  const { data: branches } = useBranches();
  const { data: vendors } = useVendors();
  const { data: categories } = useCategories();
  const { data: vehicles } = useVehicles();
  const { data: paymentMethods = [] } = useActivePaymentMethods();
  const { currentBranch } = useBranchStore();

  // Epic 12: manual dates state
  const [manualDates, setManualDates] = useState<Dayjs[]>([dayjs(), dayjs().add(1, 'month')]);

  // Epic 13: scope modal state
  const [scopeModalOpen, setScopeModalOpen] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<BillFormData | null>(null);
  const [selectedScope, setSelectedScope] = useState<'this' | 'this_and_next' | 'all'>('this');

  const isLoading = isCreating || isUpdating || isUpdatingRecurrence;
  const isEditing = !!bill;

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BillFormData>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      branch_id: initialValues?.branch_id || currentBranch?.id || 0,
      vendor_id: initialValues?.vendor_id || 0,
      category_id: initialValues?.category_id || 0,
      description: initialValues?.description || '',
      amount: initialValues?.amount || 0,
      due_date: '',
      invoice_number: initialValues?.invoice_number || '',
      notes: initialValues?.notes || '',
      status: BillStatus.PENDING,
      is_recurring: false,
      recurrence_type: 'interval' as const,
      recurrence_interval_days: null,
      recurrence_occurrences: null,
      recurrence_day_of_month: null,
      payment_method_id: initialValues?.payment_method_id ?? null,
    },
  });

  const isRecurring = watch('is_recurring');
  const recurrenceType = watch('recurrence_type');
  const intervalDays = watch('recurrence_interval_days');
  const occurrences = watch('recurrence_occurrences');
  const dayOfMonth = watch('recurrence_day_of_month');

  useEffect(() => {
    if (bill) {
      reset({
        branch_id: bill.branch_id,
        vendor_id: bill.vendor_id,
        category_id: bill.category_id,
        description: bill.description,
        amount: bill.amount,
        due_date: bill.due_date,
        invoice_number: bill.invoice_number || '',
        notes: bill.notes || '',
        status: bill.status,
        payment_method_id: bill.payment_method_id ?? null,
      });
    } else if (currentBranch) {
      setValue('branch_id', currentBranch.id);
    }
  }, [bill, currentBranch, reset, setValue]);

  const onSubmit = (data: BillFormData) => {
    // Epic 13: if editing a recurring bill, show scope modal
    if (isEditing && bill?.recurrence_group_id) {
      setPendingFormData(data);
      setSelectedScope('this');
      setScopeModalOpen(true);
      return;
    }
    submitBill(data);
  };

  const submitBill = (data: BillFormData) => {
    const useFixedDay = data.is_recurring && data.recurrence_type === 'fixed_day';
    const useManualDates = data.is_recurring && data.recurrence_type === 'manual_dates';

    const payload: any = {
      ...data,
      invoice_number: data.invoice_number || null,
      notes: data.notes || null,
      is_recurring: data.is_recurring || false,
      recurrence_interval_days: (!useFixedDay && !useManualDates && data.is_recurring) ? data.recurrence_interval_days : null,
      recurrence_occurrences: (data.is_recurring && !useManualDates) ? data.recurrence_occurrences : null,
      recurrence_day_of_month: useFixedDay ? data.recurrence_day_of_month : null,
      vehicle_id: data.vehicle_id || null,
      payment_method_id: data.payment_method_id ?? null,
    };

    if (useManualDates) {
      payload.recurrence_dates = manualDates.map(d => d.format('YYYY-MM-DD'));
      delete payload.recurrence_interval_days;
      delete payload.recurrence_day_of_month;
      delete payload.recurrence_occurrences;
    }

    if (isEditing && bill) {
      updateBill(
        { id: bill.id, data: payload },
        {
          onSuccess: () => {
            message.success('Conta atualizada com sucesso!');
            onSuccess?.();
          },
          onError: () => {
            message.error('Erro ao atualizar conta');
          },
        }
      );
    } else {
      createBill(payload, {
        onSuccess: () => {
          message.success('Conta criada com sucesso!');
          reset();
          onSuccess?.();
        },
        onError: () => {
          message.error('Erro ao criar conta');
        },
      });
    }
  };

  // Epic 13: confirm scope and call recurrence update endpoint
  const handleScopeConfirm = () => {
    if (!bill || !pendingFormData) return;
    updateRecurrence(
      {
        id: bill.id,
        data: {
          scope: selectedScope,
          description: pendingFormData.description,
          amount: pendingFormData.amount,
          due_date: pendingFormData.due_date,
          notes: pendingFormData.notes || null,
          vendor_id: pendingFormData.vendor_id,
          category_id: pendingFormData.category_id,
          branch_id: pendingFormData.branch_id,
          vehicle_id: pendingFormData.vehicle_id ?? null,
          payment_method_id: pendingFormData.payment_method_id ?? null,
        },
      },
      {
        onSuccess: () => {
          message.success('Conta(s) recorrente(s) atualizada(s)!');
          setScopeModalOpen(false);
          setPendingFormData(null);
          onSuccess?.();
        },
        onError: () => {
          message.error('Erro ao atualizar recorrência');
        },
      }
    );
  };

  const statusOptions = [
    { value: BillStatus.PENDING, label: 'Pendente' },
    { value: BillStatus.APPROVED, label: 'Aprovada' },
    { value: BillStatus.PAID, label: 'Paga' },
    { value: BillStatus.CANCELLED, label: 'Cancelada' },
  ];

  return (
    <>
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
      <Form.Item
        label="Filial"
        validateStatus={errors.branch_id ? 'error' : ''}
        help={errors.branch_id?.message}
      >
        <Controller
          name="branch_id"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              placeholder="Selecione a filial"
              options={branches?.map(b => ({
                value: b.id,
                label: b.is_headquarters ? `${b.name} (Matriz)` : b.name,
              }))}
            />
          )}
        />
      </Form.Item>

      <Form.Item
        label="Fornecedor"
        validateStatus={errors.vendor_id ? 'error' : ''}
        help={errors.vendor_id?.message}
      >
        <Controller
          name="vendor_id"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              placeholder="Digite para pesquisar o fornecedor..."
              showSearch
              optionFilterProp="label"
              filterOption={(input: string, option: any) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              notFoundContent="Fornecedor não encontrado"
              options={vendors?.map((v: any) => ({
                value: v.id,
                label: v.name,
              }))}
            />
          )}
        />
      </Form.Item>

      <Form.Item
        label="Categoria"
        validateStatus={errors.category_id ? 'error' : ''}
        help={errors.category_id?.message}
      >
        <Controller
          name="category_id"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              placeholder="Selecione a categoria"
              options={categories?.map(c => ({
                value: c.id,
                label: c.name,
              }))}
            />
          )}
        />
      </Form.Item>

      <Form.Item
        label="Descrição"
        validateStatus={errors.description ? 'error' : ''}
        help={errors.description?.message}
      >
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Input {...field} placeholder="Descrição da conta" />
          )}
        />
      </Form.Item>

      <Form.Item
        label="Valor (R$)"
        validateStatus={errors.amount ? 'error' : ''}
        help={errors.amount?.message}
      >
        <Controller
          name="amount"
          control={control}
          render={({ field }) => (
            <InputNumber
              {...field}
              style={{ width: '100%' }}
              min={0}
              step={0.01}
              precision={2}
              placeholder="0,00"
              decimalSeparator=","
              formatter={(value: number | string | undefined) => {
                if (value === undefined || value === null || value === '') return '';
                const parts = `${value}`.split('.');
                parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                return parts.join(',');
              }}
              parser={(value: string | undefined) => {
                if (!value) return 0;
                // Remove separadores de milhar (ponto), troca vírgula decimal por ponto
                const cleaned = value.replace(/\./g, '').replace(',', '.');
                return parseFloat(cleaned) || 0;
              }}
            />
          )}
        />
      </Form.Item>

      <Form.Item
        label="Data de Vencimento"
        validateStatus={errors.due_date ? 'error' : ''}
        help={errors.due_date?.message}
      >
        <Controller
          name="due_date"
          control={control}
          render={({ field }) => (
            <DatePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              value={field.value ? dayjs(field.value, 'YYYY-MM-DD') : null}
              onChange={(date) => field.onChange(date ? date.format('YYYY-MM-DD') : '')}
              placeholder="Selecione a data"
            />
          )}
        />
      </Form.Item>

      <Form.Item label="Número da Nota/Fatura">
        <Controller
          name="invoice_number"
          control={control}
          render={({ field }) => (
            <Input {...field} value={field.value || ''} placeholder="NF-e 000000" />
          )}
        />
      </Form.Item>

      {isEditing && (
        <Form.Item label="Status">
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select {...field} options={statusOptions} />
            )}
          />
        </Form.Item>
      )}

      <Form.Item label="Observações">
        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <Input.TextArea {...field} value={field.value || ''} placeholder="Observações adicionais" rows={3} />
          )}
        />
      </Form.Item>

      <Form.Item label="Veículo (opcional)">
        <Controller
          name="vehicle_id"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              allowClear
              placeholder="Associar a um veículo"
              showSearch
              optionFilterProp="label"
              options={[
                { value: null, label: 'Nenhum' },
                ...(vehicles?.map((v: any) => ({
                  value: v.id,
                  label: `${v.plate.toUpperCase()} — ${v.brand} ${v.model}`,
                })) ?? []),
              ]}
            />
          )}
        />
      </Form.Item>

      <Form.Item label="Meio de Pagamento (opcional)">
        <Controller
          name="payment_method_id"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              allowClear
              placeholder="Selecione o meio de pagamento"
              showSearch
              optionFilterProp="label"
              options={[
                { value: null, label: 'Nenhum' },
                ...(paymentMethods.map((pm: any) => ({
                  value: pm.id,
                  label: pm.name,
                }))),
              ]}
            />
          )}
        />
      </Form.Item>

      {!isEditing && (
        <>
          <Form.Item>
            <Controller
              name="is_recurring"
              control={control}
              render={({ field }) => (
                <Checkbox
                  checked={field.value || false}
                  onChange={(e) => field.onChange(e.target.checked)}
                >
                  Conta Recorrente
                </Checkbox>
              )}
            />
          </Form.Item>

          {isRecurring && (
            <div style={{ background: '#f6f8fa', padding: 16, borderRadius: 8, marginBottom: 16, border: '1px solid #d9d9d9' }}>
              {/* F3: type selector */}
              <Form.Item label="Tipo de Recorrência">
                <Controller
                  name="recurrence_type"
                  control={control}
                  render={({ field }) => (
                    <Radio.Group {...field}>
                      <Radio value="interval">Intervalo em dias</Radio>
                      <Radio value="fixed_day">Dia fixo do mês</Radio>
                      <Radio value="manual_dates">Datas manuais</Radio>
                    </Radio.Group>
                  )}
                />
              </Form.Item>

              {recurrenceType === 'manual_dates' ? (
                <>
                  <Form.Item label="Datas de Vencimento">
                    {manualDates.map((date, idx) => (
                      <Space key={idx} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                        <DatePicker
                          format="DD/MM/YYYY"
                          value={date}
                          onChange={(d) => {
                            if (d) {
                              const next = [...manualDates];
                              next[idx] = d;
                              setManualDates(next);
                            }
                          }}
                          placeholder="Selecione a data"
                        />
                        {manualDates.length > 2 && (
                          <MinusCircleOutlined
                            style={{ color: '#ff4d4f', cursor: 'pointer' }}
                            onClick={() => setManualDates(manualDates.filter((_, i) => i !== idx))}
                          />
                        )}
                      </Space>
                    ))}
                    <Button
                      type="dashed"
                      onClick={() => setManualDates([...manualDates, dayjs().add(manualDates.length, 'month')])}
                      icon={<PlusOutlined />}
                      style={{ width: 200 }}
                    >
                      Adicionar data
                    </Button>
                  </Form.Item>
                  <Alert
                    type="info"
                    showIcon
                    message={`Serão criadas ${manualDates.length} parcelas nas datas selecionadas`}
                  />
                </>
              ) : (
                <Row gutter={16}>
                  {recurrenceType === 'interval' ? (
                    <Col span={12}>
                      <Form.Item
                        label="Intervalo (dias)"
                        validateStatus={errors.recurrence_interval_days ? 'error' : ''}
                        help={errors.recurrence_interval_days?.message}
                      >
                        <Controller
                          name="recurrence_interval_days"
                          control={control}
                          render={({ field }) => (
                            <InputNumber
                              {...field}
                              min={1}
                              max={365}
                              placeholder="Ex: 30"
                              style={{ width: '100%' }}
                              value={field.value ?? undefined}
                            />
                          )}
                        />
                      </Form.Item>
                    </Col>
                  ) : (
                    <Col span={12}>
                      <Form.Item
                        label="Dia do mês (1–28)"
                        validateStatus={errors.recurrence_day_of_month ? 'error' : ''}
                        help={errors.recurrence_day_of_month?.message}
                      >
                        <Controller
                          name="recurrence_day_of_month"
                          control={control}
                          render={({ field }) => (
                            <InputNumber
                              {...field}
                              min={1}
                              max={28}
                              placeholder="Ex: 10"
                              style={{ width: '100%' }}
                              value={field.value ?? undefined}
                            />
                          )}
                        />
                      </Form.Item>
                    </Col>
                  )}
                  <Col span={12}>
                    <Form.Item
                      label="Número de Ocorrências"
                      validateStatus={errors.recurrence_occurrences ? 'error' : ''}
                      help={errors.recurrence_occurrences?.message}
                    >
                      <Controller
                        name="recurrence_occurrences"
                        control={control}
                        render={({ field }) => (
                          <InputNumber
                            {...field}
                            min={2}
                            max={60}
                            placeholder="Ex: 12"
                            style={{ width: '100%' }}
                            value={field.value ?? undefined}
                          />
                        )}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              )}
              {recurrenceType !== 'manual_dates' && (
                <Alert
                  type="info"
                  showIcon
                  message={
                    recurrenceType === 'fixed_day'
                      ? occurrences && dayOfMonth
                        ? `Serão criadas ${occurrences} contas, todo dia ${dayOfMonth} de cada mês`
                        : 'Preencha o dia do mês e o número de ocorrências'
                      : occurrences && intervalDays
                      ? `Serão criadas ${occurrences} contas, a cada ${intervalDays} dia(s) a partir da data de vencimento`
                      : 'Preencha o intervalo e o número de ocorrências'
                  }
                />
              )}
            </div>
          )}
        </>
      )}

      {isEditing && bill?.id && (
        <>
          <Divider orientation="left">
            <PaperClipOutlined /> Anexos
          </Divider>
          <BillAttachments billId={bill.id} />
        </>
      )}

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={isLoading}>
          {isEditing ? 'Atualizar' : 'Criar'}
        </Button>
        {onCancel && (
          <Button style={{ marginLeft: 8 }} onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </Form.Item>
    </Form>

    {/* Epic 13: Scope modal for recurring bill edits */}
    <Modal
      title="Editar conta recorrente"
      open={scopeModalOpen}
      onOk={handleScopeConfirm}
      onCancel={() => { setScopeModalOpen(false); setPendingFormData(null); }}
      okText="Confirmar"
      cancelText="Cancelar"
      confirmLoading={isUpdatingRecurrence}
    >
      <p style={{ marginBottom: 16 }}>Esta conta faz parte de uma série recorrente. Como deseja aplicar as alterações?</p>
      <Radio.Group
        value={selectedScope}
        onChange={(e) => setSelectedScope(e.target.value)}
        style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
      >
        <Radio value="this">Somente esta conta</Radio>
        <Radio value="this_and_next">Esta e as próximas parcelas</Radio>
        <Radio value="all">Todas as parcelas da série</Radio>
      </Radio.Group>
    </Modal>
  </>
  );
}

export default BillForm;
