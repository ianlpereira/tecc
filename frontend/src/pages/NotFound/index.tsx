import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Result } from 'antd';
import { Layout } from '../../components/Layout';

export function NotFoundPage(): React.ReactElement {
  const navigate = useNavigate();

  return (
    <Layout title="Página não encontrada">
      <Result
        status="404"
        title="404"
        subTitle="Desculpe, a página que você está procurando não existe."
        extra={
          <Button type="primary" onClick={() => navigate('/')}>
            Voltar para Home
          </Button>
        }
      />
    </Layout>
  );
}

export default NotFoundPage;
