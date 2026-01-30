import React, { useEffect } from 'react';
import { Form, Input, Switch, Button, message } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateBranch, useUpdateBranch } from '../../hooks';
import type { Branch } from '../../types';

const branchSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  is_headquarters: z.boolean(),
});

type BranchFormData = z.infer<typeof branchSchema>;

interface BranchFormProps {
  branch?: Branch | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function BranchForm({ branch, onSuccess, onCancel }: BranchFormProps): React.ReactElement {
  const { mutate: createBranch, isPending: isCreating } = useCreateBranch();
  const { mutate: updateBranch, isPending: isUpdating } = useUpdateBranch();
  const isLoading = isCreating || isUpdating;
  const isEditing = !!branch;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BranchFormData>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      name: '',
      is_headquarters: false,
    },
  });

  useEffect(() => {
    if (branch) {
      reset({
        name: branch.name,
        is_headquarters: branch.is_headquarters,
      });
    }
  }, [branch, reset]);

  const onSubmit = (data: BranchFormData) => {
    if (isEditing && branch) {
      updateBranch(
        { id: branch.id, data },
        {
          onSuccess: () => {
            message.success('Filial atualizada com sucesso!');
            onSuccess?.();
          },
          onError: () => {
            message.error('Erro ao atualizar filial');
          },
        }
      );
    } else {
      createBranch(data, {
        onSuccess: () => {
          message.success('Filial criada com sucesso!');
          reset();
          onSuccess?.();
        },
        onError: () => {
          message.error('Erro ao criar filial');
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
            <Input {...field} placeholder="Nome da filial" />
          )}
        />
      </Form.Item>

      <Form.Item label="É Matriz?">
        <Controller
          name="is_headquarters"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Switch checked={value} onChange={onChange} />
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

export default BranchForm;
