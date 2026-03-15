import { T } from 'components';
import Image from 'next/image';
import { PropsWithChildren } from 'react';
import { ButtonLogin } from './ButtonLogin';

interface NotFoundCardProps {
  title: string;
  description: string;
}

export const NotFoundCard = ({ title, description, children }: PropsWithChildren<NotFoundCardProps>) => (
  <div className="jk-row ht-100">
    <div className="jk-col jk-br gap bc-we jk-pg">
      <h3 className="tt-se">
        <T>{title}</T>
      </h3>
      <Image
        alt="Juki surprised image"
        className="image-border"
        height={140}
        width={280}
        style={{ objectFit: 'contain' }}
        src="https://images.juki.pub/assets/juki-image-surprised.png"
      />
      <T className="tt-se">{description}</T>
      {children}
      <ButtonLogin />
    </div>
  </div>
);
