import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { APP_NAME } from '../../config';
import {
  DashboardOutlined,
  BankOutlined,
  ShopOutlined,
  TagsOutlined,
  FileTextOutlined,
  CarOutlined,
  CreditCardOutlined,
  BarChartOutlined,
  TeamOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { BranchSelector } from '../BranchSelector';
import { useAuth } from '../../context/AuthContext';
import * as S from './styles';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

const menuItems = [
  { path: '/', label: 'Dashboard', icon: <DashboardOutlined /> },
  { path: '/bills', label: 'Contas a Pagar', icon: <FileTextOutlined /> },
  { path: '/reports', label: 'Relatórios', icon: <BarChartOutlined /> },
  { path: '/branches', label: 'Filiais', icon: <BankOutlined /> },
  { path: '/vendors', label: 'Fornecedores', icon: <ShopOutlined /> },
  { path: '/categories', label: 'Categorias', icon: <TagsOutlined /> },
  { path: '/vehicles', label: 'Veículos', icon: <CarOutlined /> },
  { path: '/settings/payment-methods', label: 'Meios de Pagamento', icon: <CreditCardOutlined /> },
];

const adminMenuItems = [
  { path: '/admin/users', label: 'Usuários', icon: <TeamOutlined /> },
];

export function Layout({ children, title = APP_NAME }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin, logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <S.LayoutContainer>
      <S.Sidebar>
        <S.Logo>{APP_NAME}</S.Logo>
        <S.NavMenu>
          {menuItems.map((item) => (
            <Link key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
              <S.NavItem $active={location.pathname === item.path}>
                {item.icon}
                {item.label}
              </S.NavItem>
            </Link>
          ))}

          {isAdmin && (
            <>
              <S.NavSectionLabel>Administração</S.NavSectionLabel>
              {adminMenuItems.map((item) => (
                <Link key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
                  <S.NavItem $active={location.pathname === item.path}>
                    {item.icon}
                    {item.label}
                  </S.NavItem>
                </Link>
              ))}
            </>
          )}
        </S.NavMenu>

        <S.SidebarFooter>
          {user && (
            <S.SidebarUser>
              <span>{user.username}</span>
            </S.SidebarUser>
          )}
          <S.LogoutButton onClick={handleLogout} title="Sair">
            <LogoutOutlined />
            Sair
          </S.LogoutButton>
        </S.SidebarFooter>
      </S.Sidebar>

      <S.MainArea>
        <S.Header>
          <S.HeaderTitle>{title}</S.HeaderTitle>
          <S.HeaderActions>
            <S.BranchSelectorWrapper>
              <BankOutlined />
              <BranchSelector />
            </S.BranchSelectorWrapper>
          </S.HeaderActions>
        </S.Header>

        <S.Content>{children}</S.Content>
      </S.MainArea>
    </S.LayoutContainer>
  );
}

export default Layout;

