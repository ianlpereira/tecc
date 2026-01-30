import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider } from 'antd'
import { ThemeProvider } from 'styled-components'
import ptBR from 'antd/locale/pt_BR'
import GlobalStyle from './styles/GlobalStyle'
import theme from './styles/theme'
import { queryClient } from './services/queryClient'
import {
  DashboardPage,
  BranchesPage,
  VendorsPage,
  CategoriesPage,
  BillsPage,
  NotFoundPage,
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
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/bills" element={<BillsPage />} />
              <Route path="/branches" element={<BranchesPage />} />
              <Route path="/vendors" element={<VendorsPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Router>
        </ConfigProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
