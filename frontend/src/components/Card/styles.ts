import styled from 'styled-components';

export const CardContainer = styled.div`
  background-color: #fff;
  border-radius: 8px;
  box-shadow: ${props => props.theme.shadows.sm};
  overflow: hidden;
`;

export const CardHeader = styled.div`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const CardTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: ${props => props.theme.colors.text};
`;

export const CardExtra = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

export const CardBody = styled.div`
  padding: ${props => props.theme.spacing.lg};
`;
