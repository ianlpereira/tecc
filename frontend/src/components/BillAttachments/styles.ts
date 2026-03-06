import styled from 'styled-components';

export const AttachmentsContainer = styled.div`
  margin-top: 8px;
`;

export const AttachmentItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  margin-bottom: 6px;
  background: #fafafa;
  transition: background 0.2s;

  &:hover {
    background: #f0f7ff;
    border-color: #91caff;
  }
`;

export const AttachmentInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
`;

export const AttachmentName = styled.span`
  font-size: 13px;
  color: #1677ff;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    text-decoration: underline;
  }
`;

export const AttachmentSize = styled.span`
  font-size: 11px;
  color: #999;
  flex-shrink: 0;
`;

export const AttachmentActions = styled.div`
  display: flex;
  gap: 4px;
  flex-shrink: 0;
`;

export const LimitInfo = styled.div`
  font-size: 12px;
  color: #999;
  margin-top: 4px;
  text-align: right;
`;
