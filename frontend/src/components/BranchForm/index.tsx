import React, { useEffect } from 'react';
import { Form, Input, Switch, Button, message, Select } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateBranch, useUpdateBranch, useBranches } from '../../hooks';
import type { Branch } from '../../types';

const branchSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  is_headquarters: z.boolean(),
  parent_branch_id: z.number().nullable().optional(),
}).refine(
  (data) => {
    // Se é matriz, não pode ter parent
    if (data.is_headquarters && data.parent_branch_id) {
      return false;
    }
    return true;
  },
  {
    message: 'Matriz não pode ter filial pai',
    path: ['parent_branch_id'],
  }
);

type BranchFormData = z.infer<typeof branchSchema>;

interface BranchFormProps {
  branch?: Branch | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function BranchForm({ branch, onSuccess, onCancel }: BranchFormProps): React.ReactElement {
  const { mutate: createBranch, isPending: isCreating } = useCreateBranch();
  const { mutate: updateBranch, isPending: isUpdating } = useUpdateBranch();
  const { data: branches, isLoading: isLoadingBranches } = useBranches(false);
  const isLoading = isCreating || isUpdating;
  const isEditing = !!branch;

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<BranchFormData>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      name: '',
      is_headquarters: false,
      parent_branch_id: null,
    },
  });

  const isHeadquarters = watch('is_headquarters');

  useEffect(() => {
    if (branch) {
      reset({
        name: branch.name,
        is_headquarters: branch.is_headquarters,
        parent_branch_id: branch.parent_branch_id || null,
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
          onError: (error: any) => {
            const errorMessage = error?.response?.data?.detail || 'Erro ao atualizar filial';
            message.error(errorMessage);
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
        onError: (error: any) => {
          const errorMessage = error?.response?.data?.detail || 'Erro ao criar filial';
          message.error(errorMessage);
        },
      });
    }
  };

  // Filtra apenas matrizes para o campo de seleção
  const availableParents = branches?.filter(
    (b) => b.is_headquarters && b.id !== branch?.id
  ) || [];

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
            <Switch 
              checked={value} 
              onChange={onChange}
              checkedChildren="Sim"
              unCheckedChildren="Não"
            />
          )}
        />
      </Form.Item>

      {!isHeadquarters && (
        <Form.Item
          label="Matriz (opcional)"
          validateStatus={errors.parent_branch_id ? 'error' : ''}
          help={errors.parent_branch_id?.message}
        >
          <Controller
            name="parent_branch_id"
            control={control}
            render={({ field: { value, onChange } }) => (
              <Select
                placeholder="Selecione uma matriz"
                value={value}
                onChange={onChange}
                allowClear
                loading={isLoadingBranches}
                disabled={isHeadquarters}
                options={[
                  { value: null, label: 'Nenhuma (filial independente)' },
                  ...availableParents.map((b) => ({
                    value: b.id,
                    label: `📍 ${b.name}`,
                  })),
                ]}
              />
            )}
          />
        </Form.Item>
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
  );
}

export default BranchForm;
