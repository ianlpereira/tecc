import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider } from 'antd'
import { ThemeProvider } from 'styled-components'
import GlobalStyle from './styles/GlobalStyle'
import theme from './styles/theme'
import { queryClient } from './services/queryClient'

function App(): React.ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <ConfigProvider theme={{ token: { colorPrimary: theme.colors.primary } }}>
          <GlobalStyle />
          <Router>
            <Routes>
              <Route path="/" element={<div>Welcome to TECC</div>} />
            </Routes>
          </Router>
        </ConfigProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
