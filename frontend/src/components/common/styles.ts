import styled from 'styled-components';

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

export const StatCard = styled.div`
  background-color: #fff;
  border-radius: 8px;
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.sm};
`;

export const StatLabel = styled.div`
  font-size: 14px;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

export const StatValue = styled.div<{ $color?: string }>`
  font-size: 28px;
  font-weight: 600;
  color: ${props => props.$color || props.theme.colors.text};
`;

export const StatIcon = styled.div<{ $bg?: string }>`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background-color: ${props => props.$bg || props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${props => props.theme.spacing.md};

  svg {
    font-size: 24px;
    color: #fff;
  }
`;

export const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

export const PageTitle = styled.h2`
  margin: 0;
  font-size: 24px;
  font-weight: 500;
  color: ${props => props.theme.colors.text};
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xl} 0;
  color: ${props => props.theme.colors.textSecondary};
`;

export const TableActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
`;

export const FilterBar = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.lg};
  flex-wrap: wrap;
`;

export const StatusTag = styled.span<{ $status: string }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background-color: ${props => {
    switch (props.$status) {
      case 'pending':
        return '#fff7e6';
      case 'approved':
        return '#e6f7ff';
      case 'paid':
        return '#f6ffed';
      case 'cancelled':
        return '#fff1f0';
      default:
        return '#f5f5f5';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'pending':
        return '#d48806';
      case 'approved':
        return '#0958d9';
      case 'paid':
        return '#389e0d';
      case 'cancelled':
        return '#cf1322';
      default:
        return '#666';
    }
  }};
`;
