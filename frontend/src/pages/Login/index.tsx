import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button } from 'antd'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { useAuth } from '../../context/AuthContext'
import { APP_NAME } from '../../config'
import * as S from './styles'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (values: { username: string; password: string }) => {
    setLoading(true)
    setError(null)
    try {
      await login(values.username, values.password)
      navigate('/', { replace: true })
    } catch (err: any) {
      const detail = err?.response?.data?.detail
      setError(detail || 'Usuário ou senha inválidos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <S.Container>
      <S.Card>
        <S.Logo>
          <S.Title>{APP_NAME}</S.Title>
          <S.Subtitle>Sistema Financeiro de Contas a Pagar</S.Subtitle>
        </S.Logo>

        {error && <S.ErrorMessage>{error}</S.ErrorMessage>}

        <Form layout="vertical" onFinish={handleSubmit} autoComplete="off">
          <Form.Item
            label="Usuário"
            name="username"
            rules={[{ required: true, message: 'Informe o usuário.' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Usuário" size="large" />
          </Form.Item>

          <Form.Item
            label="Senha"
            name="password"
            rules={[{ required: true, message: 'Informe a senha.' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Senha" size="large" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              Entrar
            </Button>
          </Form.Item>
        </Form>
      </S.Card>
    </S.Container>
  )
}
