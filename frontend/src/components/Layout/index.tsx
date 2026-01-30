import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  BankOutlined,
  ShopOutlined,
  TagsOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { BranchSelector } from '../BranchSelector';
import * as S from './styles';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const menuItems = [
  { path: '/', label: 'Dashboard', icon: <DashboardOutlined /> },
  { path: '/bills', label: 'Contas a Pagar', icon: <FileTextOutlined /> },
  { path: '/branches', label: 'Filiais', icon: <BankOutlined /> },
  { path: '/vendors', label: 'Fornecedores', icon: <ShopOutlined /> },
  { path: '/categories', label: 'Categorias', icon: <TagsOutlined /> },
];

export function Layout({ children, title = 'TECC' }: LayoutProps): React.ReactElement {
  const location = useLocation();

  return (
    <S.LayoutContainer>
      <S.Sidebar>
        <S.Logo>TECC</S.Logo>
        <S.NavMenu>
          {menuItems.map((item) => (
            <Link key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
              <S.NavItem $active={location.pathname === item.path}>
                {item.icon}
                {item.label}
              </S.NavItem>
            </Link>
          ))}
        </S.NavMenu>
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
