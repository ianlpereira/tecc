import React from 'react';
import * as S from './styles';

interface CardProps {
  title?: string;
  extra?: React.ReactNode;
  children: React.ReactNode;
}

export function Card({ title, extra, children }: CardProps): React.ReactElement {
  return (
    <S.CardContainer>
      {title && (
        <S.CardHeader>
          <S.CardTitle>{title}</S.CardTitle>
          {extra && <S.CardExtra>{extra}</S.CardExtra>}
        </S.CardHeader>
      )}
      <S.CardBody>{children}</S.CardBody>
    </S.CardContainer>
  );
}

export default Card;
