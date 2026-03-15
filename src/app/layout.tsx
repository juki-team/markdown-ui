import { JukiI18nInitializer, StylesLazy } from 'components';
import './styles.scss';
import { DEFAULT_METADATA } from 'config/constants';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ReactNode } from 'react';
import '@juki-team/base-ui/styles.scss';

const inter = Inter({
  weight: ['100', '200', '300', '500', '700'],
  subsets: ['latin'],
  variable: '--font-primary',
  display: 'swap',
});

export const metadata: Metadata = DEFAULT_METADATA;

export default async function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="jk-theme-light">
        {children}
        <JukiI18nInitializer />
        <StylesLazy />
      </body>
    </html>
  );
}
