import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider } from 'antd'
import { ThemeProvider } from 'styled-components'
import ptBR from 'antd/locale/pt_BR'
import GlobalStyle from './styles/GlobalStyle'
import theme from './styles/theme'
import { queryClient } from './services/queryClient'
import { AuthProvider } from './context/AuthContext'
import { PrivateRoute, AdminRoute } from './components/PrivateRoute'
import {
  DashboardPage,
  BranchesPage,
  VendorsPage,
  CategoriesPage,
  BillsPage,
  VehiclesPage,
  NotFoundPage,
  PaymentMethodsPage,
  ReportsPage,
  LoginPage,
  AdminUsersPage,
} from './pages'

function App(): React.ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <ConfigProvider
          locale={ptBR}
          theme={{ token: { colorPrimary: theme.colors.primary } }}
        >
          <GlobalStyle />
          <Router>
            <AuthProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />

                {/* Protected routes */}
                <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
                <Route path="/bills" element={<PrivateRoute><BillsPage /></PrivateRoute>} />
                <Route path="/branches" element={<PrivateRoute><BranchesPage /></PrivateRoute>} />
                <Route path="/vendors" element={<PrivateRoute><VendorsPage /></PrivateRoute>} />
                <Route path="/categories" element={<PrivateRoute><CategoriesPage /></PrivateRoute>} />
                <Route path="/vehicles" element={<PrivateRoute><VehiclesPage /></PrivateRoute>} />
                <Route path="/settings/payment-methods" element={<PrivateRoute><PaymentMethodsPage /></PrivateRoute>} />
                <Route path="/reports" element={<PrivateRoute><ReportsPage /></PrivateRoute>} />

                {/* Admin-only routes */}
                <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />

                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </AuthProvider>
          </Router>
        </ConfigProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App

