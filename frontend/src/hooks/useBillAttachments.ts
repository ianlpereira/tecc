/**
 * Custom hooks for Bill Attachment operations (F1)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billAttachmentApi } from '../services/api';

const ATTACHMENT_KEY = 'bill-attachments';

export function useBillAttachments(billId: number | null | undefined) {
  return useQuery({
    queryKey: [ATTACHMENT_KEY, billId],
    queryFn: () => billAttachmentApi.list(billId!),
    enabled: !!billId,
  });
}

export function useUploadAttachment(billId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => billAttachmentApi.upload(billId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ATTACHMENT_KEY, billId] });
      // Also refresh bills so attachments_count updates
      queryClient.invalidateQueries({ queryKey: ['bills'] });
    },
  });
}

export function useDeleteAttachment(billId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (attachmentId: number) => billAttachmentApi.delete(billId, attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ATTACHMENT_KEY, billId] });
      queryClient.invalidateQueries({ queryKey: ['bills'] });
    },
  });
}
