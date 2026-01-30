import styled from 'styled-components';

export const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: ${props => props.theme.colors.surface};
`;

export const Sidebar = styled.aside`
  width: 240px;
  background-color: #001529;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 100;
`;

export const Logo = styled.div`
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
  font-weight: bold;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

export const NavMenu = styled.nav`
  flex: 1;
  padding: ${props => props.theme.spacing.md} 0;
  overflow-y: auto;
`;

export const NavItem = styled.a<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  color: ${props => props.$active ? '#fff' : 'rgba(255, 255, 255, 0.65)'};
  background-color: ${props => props.$active ? props.theme.colors.primary : 'transparent'};
  text-decoration: none;
  transition: all 0.3s;
  cursor: pointer;

  &:hover {
    color: #fff;
    background-color: ${props => props.$active ? props.theme.colors.primary : 'rgba(255, 255, 255, 0.1)'};
  }

  svg {
    font-size: 18px;
  }
`;

export const MainArea = styled.div`
  flex: 1;
  margin-left: 240px;
  display: flex;
  flex-direction: column;
`;

export const Header = styled.header`
  height: 64px;
  background-color: #fff;
  padding: 0 ${props => props.theme.spacing.lg};
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: ${props => props.theme.shadows.sm};
  position: sticky;
  top: 0;
  z-index: 50;
`;

export const HeaderTitle = styled.h1`
  font-size: 18px;
  font-weight: 500;
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

export const Content = styled.main`
  flex: 1;
  padding: ${props => props.theme.spacing.lg};
`;

export const BranchSelectorWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  font-size: 14px;
  color: ${props => props.theme.colors.textSecondary};
`;
