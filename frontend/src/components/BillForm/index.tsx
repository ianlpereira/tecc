import React, { useEffect } from 'react';
import { Form, Input, InputNumber, Select, DatePicker, Button, message } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs from 'dayjs';
import { useCreateBill, useUpdateBill, useBranches, useVendors, useCategories } from '../../hooks';
import { useBranchStore } from '../../context/branchStore';
import { BillStatus } from '../../types';
import type { Bill } from '../../types';

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
});

type BillFormData = z.infer<typeof billSchema>;

interface BillFormProps {
  bill?: Bill | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function BillForm({ bill, onSuccess, onCancel }: BillFormProps): React.ReactElement {
  const { mutate: createBill, isPending: isCreating } = useCreateBill();
  const { mutate: updateBill, isPending: isUpdating } = useUpdateBill();
  const { data: branches } = useBranches();
  const { data: vendors } = useVendors();
  const { data: categories } = useCategories();
  const { currentBranch } = useBranchStore();
  
  const isLoading = isCreating || isUpdating;
  const isEditing = !!bill;

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BillFormData>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      branch_id: currentBranch?.id || 0,
      vendor_id: 0,
      category_id: 0,
      description: '',
      amount: 0,
      due_date: '',
      invoice_number: '',
      notes: '',
      status: BillStatus.PENDING,
    },
  });

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
      });
    } else if (currentBranch) {
      setValue('branch_id', currentBranch.id);
    }
  }, [bill, currentBranch, reset, setValue]);

  const onSubmit = (data: BillFormData) => {
    const payload = {
      ...data,
      invoice_number: data.invoice_number || null,
      notes: data.notes || null,
    };

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

  const statusOptions = [
    { value: BillStatus.PENDING, label: 'Pendente' },
    { value: BillStatus.APPROVED, label: 'Aprovada' },
    { value: BillStatus.PAID, label: 'Paga' },
    { value: BillStatus.CANCELLED, label: 'Cancelada' },
  ];

  return (
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
              placeholder="Selecione o fornecedor"
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={vendors?.map(v => ({
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
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
              parser={value => value?.replace(/\./g, '').replace(',', '.') as unknown as number}
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
              value={field.value ? dayjs(field.value) : null}
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
  );
}

export default BillForm;
