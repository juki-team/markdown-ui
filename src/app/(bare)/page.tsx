'use client';

export const dynamic = 'force-dynamic';

import { Button, LoginUser, ShareIcon, SmartToyIcon, T } from 'components';
import { useRouterStore, useUIStore, useUserStore } from 'hooks';
import { QueryParamKey } from 'types';

const FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    title: 'markdown editor',
    description: 'Clean, distraction-free editor with live preview and syntax highlighting.',
  },
  {
    icon: <SmartToyIcon size="small" />,
    title: 'AI assistant',
    description: 'Ask questions, generate content, and refine your writing with built-in AI.',
  },
  {
    icon: <ShareIcon size="small" />,
    title: 'share & collaborate',
    description: 'Share with a link or invite collaborators to view and edit in real time.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    title: 'multi-file docs',
    description: 'Organize content across multiple files with a built-in navigation tree.',
  },
];

export default function Page() {
  const setSearchParams = useRouterStore((state) => state.setSearchParams);
  const { isLogged } = useUserStore((store) => store.user);
  const { Link } = useUIStore((store) => store.components);

  return (
    <div className="jk-col top nowrap wh-100 stretch ow-ao ht-100" style={{ background: 'linear-gradient(150deg, var(--cr-io-lt) 0%, var(--bc-sf) 55%)' }}>
      {/* Header */}
      <header
        className="jk-row nowrap jk-pg-lg-rl jk-pg-sm-tb"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 2,
          backdropFilter: 'blur(12px)',
          background: 'color-mix(in srgb, var(--bc-sf) 80%, transparent)',
          borderBottom: '1px solid var(--cr-ht-lt)',
          justifyContent: 'space-between',
        }}
      >
        <span className="fw-bd cr-io" style={{ fontSize: '1.1rem', letterSpacing: '-0.01em' }}>
          md·ui
        </span>
        <div>
          <LoginUser withLabel />
        </div>
      </header>

      {/* Hero */}
      <section
        className="jk-col center ta-cr jk-pg-lg"
        style={{
          gap: 'var(--pad-md)',
        }}
      >
        <div
          className="dy-if cr-we bc-io-lt tx-t fw-bd tt-ue"
          style={{
            alignItems: 'center',
            gap: 6,
            padding: '4px 14px',
            borderRadius: 999,
            letterSpacing: '0.07em',
            border: '1px solid var(--cr-io)',
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
          <T>markdown made simple</T>
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            lineHeight: 1.1,
            color: 'var(--body-tx-cr)',
          }}
        >
          <T>Write. Share.</T>
          <span className="cr-io dy-bk">
            <T>Collaborate.</T>
          </span>
        </h1>

        <p
          className="cr-tx-mt"
          style={{
            margin: 0,
            maxWidth: 520,
          }}
        >
          <T>A fast, focused markdown editor with AI assistance, real-time collaboration, and instant sharing.</T>
        </p>

        <div className="jk-row gap" style={{ marginTop: 'var(--pad-sm)' }}>
          {isLogged ? (
            <Link href="/list">
              <Button size="large">
                <T className="tt-se">go to my documents</T>
              </Button>
            </Link>
          ) : (
            <Button size="large" onClick={() => setSearchParams({ name: QueryParamKey.SIGN_IN, value: 'true' })}>
              <T className="tt-se">get started</T>
            </Button>
          )}
        </div>
      </section>

      {/* Features */}
      <section
        className="jk-col center"
        style={{
          padding: 'calc(var(--pad-lg) * 2) var(--pad-lg)',
          gap: 'calc(var(--pad-lg) * 1.5)',
        }}
      >
        <div className="ta-cr">
          <div className="tx-t fw-bd tt-ue cr-io" style={{ letterSpacing: '0.08em', marginBottom: 8 }}>
            <T>features</T>
          </div>
          <h2
            className="fw-bd"
            style={{
              margin: 0,
              fontSize: 'clamp(1.4rem, 3vw, 2rem)',
              letterSpacing: '-0.01em',
              color: 'var(--body-tx-cr)',
            }}
          >
            <T>Everything you need to write great docs</T>
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: 'var(--pad-md)',
            width: '100%',
            maxWidth: 900,
          }}
        >
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="jk-br jk-pg"
              style={{
                border: '1px solid var(--cr-gy-6)',
                background: 'var(--cr-we)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--pad-sm)',
                transition: 'box-shadow var(--transition-duration-fast), border-color var(--transition-duration-fast)',
                cursor: 'default',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px var(--cr-sw-lt)';
                (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--cr-io)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--cr-gy-6)';
              }}
            >
              <div
                className="jk-row center bc-io-lt cr-we"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  flexShrink: 0,
                }}
              >
                {f.icon}
              </div>
              <div className="fw-bd tx-l">
                <T>{f.title}</T>
              </div>
              <div className="tx-s cr-tx-mt" style={{ lineHeight: 1.6 }}>
                <T>{f.description}</T>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
