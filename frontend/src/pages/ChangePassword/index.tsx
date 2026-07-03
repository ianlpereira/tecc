import { useState } from 'react'
import { Form, Input, Button, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '../../services/apiClient'
import { useAuth } from '../../context/AuthContext'
import { Container, Card, Logo, Title, Subtitle } from '../Login/styles'

interface FormValues {
  current_password: string
  new_password: string
  confirm_password: string
}

export function ChangePasswordPage() {
  const { refreshUser, logout } = useAuth()
  const navigate = useNavigate()
  const [form] = Form.useForm<FormValues>()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (values: FormValues) => {
    setLoading(true)
    try {
      await apiClient.post('/api/v1/auth/change-password', {
        current_password: values.current_password,
        new_password: values.new_password,
      })
      // Refresh user in context so must_change_password becomes false
      await refreshUser()
      message.success('Senha alterada com sucesso!')
      navigate('/')
    } catch (err: any) {
      const detail = err?.response?.data?.detail
      message.error(detail || 'Erro ao alterar senha.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container>
      <Card>
        <Logo>🔒</Logo>
        <Title>Alterar Senha</Title>
        <Subtitle>Por segurança, defina uma nova senha antes de continuar.</Subtitle>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: 24 }}
        >
          <Form.Item
            name="current_password"
            label="Senha atual"
            rules={[{ required: true, message: 'Informe sua senha atual' }]}
          >
            <Input.Password autoComplete="current-password" />
          </Form.Item>

          <Form.Item
            name="new_password"
            label="Nova senha"
            rules={[
              { required: true, message: 'Informe a nova senha' },
              { min: 6, message: 'Mínimo 6 caracteres' },
            ]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>

          <Form.Item
            name="confirm_password"
            label="Confirmar nova senha"
            dependencies={['new_password']}
            rules={[
              { required: true, message: 'Confirme a nova senha' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('new_password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('As senhas não coincidem.'))
                },
              }),
            ]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Salvar nova senha
            </Button>
          </Form.Item>
        </Form>

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Button type="link" size="small" onClick={() => { logout(); navigate('/login') }}>
            Sair
          </Button>
        </div>
      </Card>
    </Container>
  )
}

export default ChangePasswordPage
