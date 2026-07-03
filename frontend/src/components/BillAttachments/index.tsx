import React from 'react';
import { Button, Upload, Tooltip, Spin, Typography, Divider, message } from 'antd';
import {
  PaperClipOutlined,
  DeleteOutlined,
  DownloadOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { useBillAttachments, useUploadAttachment, useDeleteAttachment } from '../../hooks';
import { billAttachmentApi } from '../../services/api';
import * as S from './styles';

const { Dragger } = Upload;
const { Text } = Typography;

const MAX_ATTACHMENTS = 3;
const MAX_SIZE_MB = 5;

function formatBytes(bytes: number | null | undefined): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface BillAttachmentsProps {
  billId: number;
}

export function BillAttachments({ billId }: BillAttachmentsProps): React.ReactElement {
  const { data: attachments = [], isLoading } = useBillAttachments(billId);
  const { mutate: uploadFile, isPending: isUploading } = useUploadAttachment(billId);
  const { mutate: deleteFile, isPending: isDeleting } = useDeleteAttachment(billId);

  const atLimit = attachments.length >= MAX_ATTACHMENTS;

  const handleDownload = async (attachmentId: number, filename: string) => {
    try {
      const blob = await billAttachmentApi.download(billId, attachmentId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      message.error('Erro ao baixar arquivo');
    }
  };

  const draggerProps: UploadProps = {
    name: 'file',
    multiple: false,
    showUploadList: false,
    accept: '.pdf,.jpg,.jpeg,.png,.webp',
    beforeUpload: (file) => {
      if (atLimit) {
        message.warning(`Limite de ${MAX_ATTACHMENTS} anexos atingido`);
        return Upload.LIST_IGNORE;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        message.error(`Arquivo muito grande. Máximo: ${MAX_SIZE_MB}MB`);
        return Upload.LIST_IGNORE;
      }
      uploadFile(file, {
        onSuccess: () => message.success('Arquivo anexado com sucesso!'),
        onError: (err: any) => {
          const detail = err?.response?.data?.detail || 'Erro ao anexar arquivo';
          message.error(detail);
        },
      });
      return Upload.LIST_IGNORE;
    },
    disabled: atLimit || isUploading,
  };

  if (isLoading) {
    return <Spin size="small" />;
  }

  return (
    <S.AttachmentsContainer>
      {!atLimit && (
        <Dragger {...draggerProps} style={{ padding: '8px 0' }}>
          <p style={{ margin: 0 }}>
            {isUploading ? (
              <Spin size="small" />
            ) : (
              <InboxOutlined style={{ fontSize: 20, color: '#1677ff' }} />
            )}
          </p>
          <p style={{ fontSize: 13, color: '#666', margin: '4px 0 0' }}>
            Clique ou arraste um arquivo (PDF, JPG, PNG · máx. {MAX_SIZE_MB}MB)
          </p>
        </Dragger>
      )}

      {attachments.length > 0 && (
        <>
          <Divider style={{ margin: '10px 0' }} />
          {attachments.map((att) => (
            <S.AttachmentItem key={att.id}>
              <S.AttachmentInfo>
                <PaperClipOutlined style={{ color: '#1677ff', flexShrink: 0 }} />
                <Tooltip title={att.filename}>
                  <S.AttachmentName onClick={() => handleDownload(att.id, att.filename)}>
                    {att.filename}
                  </S.AttachmentName>
                </Tooltip>
                <S.AttachmentSize>{formatBytes(att.file_size)}</S.AttachmentSize>
              </S.AttachmentInfo>
              <S.AttachmentActions>
                <Tooltip title="Baixar">
                  <Button
                    type="text"
                    size="small"
                    icon={<DownloadOutlined />}
                    onClick={() => handleDownload(att.id, att.filename)}
                  />
                </Tooltip>
                <Tooltip title="Excluir">
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    loading={isDeleting}
                    onClick={() =>
                      deleteFile(att.id, {
                        onSuccess: () => message.success('Anexo removido'),
                        onError: () => message.error('Erro ao remover anexo'),
                      })
                    }
                  />
                </Tooltip>
              </S.AttachmentActions>
            </S.AttachmentItem>
          ))}
        </>
      )}

      <S.LimitInfo>
        <Text type="secondary">
          {attachments.length}/{MAX_ATTACHMENTS} anexos
        </Text>
      </S.LimitInfo>
    </S.AttachmentsContainer>
  );
}

export default BillAttachments;
