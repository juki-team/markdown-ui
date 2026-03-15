import { Metadata } from 'next';

export const DEFAULT_METADATA: Metadata = {
  title: {
    template: 'Juki Markdown | %s',
    default: 'Juki Markdown',
  },
  description: 'Create and share markdown documents with Juki Markdown.',
  applicationName: 'Juki Markdown',
  keywords: ['Juki Markdown', 'markdown', 'editor', 'documents', 'juki'],
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    title: 'Juki Markdown',
    description: 'Create and share markdown documents with Juki Markdown.',
    siteName: 'Juki Markdown',
    url: 'https://markdown.juki.app',
    images: [
      {
        url: 'https://images.juki.pub/assets/juki-judge-court.png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Juki Markdown',
    description: 'Create and share markdown documents with Juki Markdown.',
    creator: '@oscar_gauss',
    images: ['https://images.juki.pub/assets/juki-judge-court.png'],
  },
  verification: {
    google: 'google',
    yandex: 'yandex',
    yahoo: 'yahoo',
    other: {
      me: ['oscargauss@juki.app', 'https://www.oscargauss.com'],
    },
  },
  appleWebApp: {
    capable: true,
    title: 'Juki Markdown',
    statusBarStyle: 'default',
    startupImage: ['/icons/apple-touch-icon.png'],
  },
};
