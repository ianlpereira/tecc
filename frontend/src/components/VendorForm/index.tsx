import React, { useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateVendor, useUpdateVendor } from '../../hooks';
import type { Vendor } from '../../types';

const vendorSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido').optional().nullable().or(z.literal('')),
  phone: z.string().optional().nullable().or(z.literal('')),
  address: z.string().optional().nullable().or(z.literal('')),
});

type VendorFormData = z.infer<typeof vendorSchema>;

interface VendorFormProps {
  vendor?: Vendor | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function VendorForm({ vendor, onSuccess, onCancel }: VendorFormProps): React.ReactElement {
  const { mutate: createVendor, isPending: isCreating } = useCreateVendor();
  const { mutate: updateVendor, isPending: isUpdating } = useUpdateVendor();
  const isLoading = isCreating || isUpdating;
  const isEditing = !!vendor;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
    },
  });

  useEffect(() => {
    if (vendor) {
      reset({
        name: vendor.name,
        email: vendor.email || '',
        phone: vendor.phone || '',
        address: vendor.address || '',
      });
    }
  }, [vendor, reset]);

  const onSubmit = (data: VendorFormData) => {
    const payload = {
      ...data,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
    };

    if (isEditing && vendor) {
      updateVendor(
        { id: vendor.id, data: payload },
        {
          onSuccess: () => {
            message.success('Fornecedor atualizado com sucesso!');
            onSuccess?.();
          },
          onError: () => {
            message.error('Erro ao atualizar fornecedor');
          },
        }
      );
    } else {
      createVendor(payload, {
        onSuccess: () => {
          message.success('Fornecedor criado com sucesso!');
          reset();
          onSuccess?.();
        },
        onError: () => {
          message.error('Erro ao criar fornecedor');
        },
      });
    }
  };

  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
      <Form.Item
        label="Nome"
        validateStatus={errors.name ? 'error' : ''}
        help={errors.name?.message}
      >
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Input {...field} placeholder="Nome do fornecedor" />
          )}
        />
      </Form.Item>

      <Form.Item
        label="E-mail"
        validateStatus={errors.email ? 'error' : ''}
        help={errors.email?.message}
      >
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Input {...field} value={field.value || ''} placeholder="email@exemplo.com" type="email" />
          )}
        />
      </Form.Item>

      <Form.Item label="Telefone">
        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <Input {...field} value={field.value || ''} placeholder="(00) 00000-0000" />
          )}
        />
      </Form.Item>

      <Form.Item label="Endereço">
        <Controller
          name="address"
          control={control}
          render={({ field }) => (
            <Input.TextArea {...field} value={field.value || ''} placeholder="Endereço completo" rows={3} />
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

export default VendorForm;
