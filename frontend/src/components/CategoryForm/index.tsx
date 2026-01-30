import React, { useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateCategory, useUpdateCategory } from '../../hooks';
import type { Category } from '../../types';

const categorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional().nullable().or(z.literal('')),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  category?: Category | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CategoryForm({ category, onSuccess, onCancel }: CategoryFormProps): React.ReactElement {
  const { mutate: createCategory, isPending: isCreating } = useCreateCategory();
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory();
  const isLoading = isCreating || isUpdating;
  const isEditing = !!category;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        description: category.description || '',
      });
    }
  }, [category, reset]);

  const onSubmit = (data: CategoryFormData) => {
    const payload = {
      ...data,
      description: data.description || null,
    };

    if (isEditing && category) {
      updateCategory(
        { id: category.id, data: payload },
        {
          onSuccess: () => {
            message.success('Categoria atualizada com sucesso!');
            onSuccess?.();
          },
          onError: () => {
            message.error('Erro ao atualizar categoria');
          },
        }
      );
    } else {
      createCategory(payload, {
        onSuccess: () => {
          message.success('Categoria criada com sucesso!');
          reset();
          onSuccess?.();
        },
        onError: () => {
          message.error('Erro ao criar categoria');
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
            <Input {...field} placeholder="Nome da categoria" />
          )}
        />
      </Form.Item>

      <Form.Item label="Descrição">
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Input.TextArea {...field} value={field.value || ''} placeholder="Descrição da categoria" rows={3} />
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

export default CategoryForm;
