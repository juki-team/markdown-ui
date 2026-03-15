'use client';

import { Button, Select, T, usePageStore } from '@juki-team/base-ui';
import { EditIcon } from '@juki-team/base-ui/server-components';
import { DocumentMembersButton, MdMathViewer } from 'components';
import { JUKI_SERVICE_V2_URL } from 'config/constants';
import { classNames, getUserKey } from 'helpers';
import { useUIStore, useUserStore } from 'hooks';
import { useEffect, useRef, useState } from 'react';
import { CodeEditorFiles, CodeLanguage, MarkdownResponseDTO } from 'types';

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1z" />
      <path d="M2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h-1v1H2V6h1V5z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
      <path fillRule="evenodd" d="m14.06 5.5-.53.53-4.82 4.82a1 1 0 0 1-1.42 0L2.47 6.03l-.53-.53L3 4.44l.53.53L8 9.44l4.47-4.47.53-.53z" clipRule="evenodd" />
    </svg>
  );
}

function MarkdownIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 22 16" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M19.5 2.25h-17c-.69 0-1.25.56-1.25 1.25v9c0 .69.56 1.25 1.25 1.25h17c.69 0 1.25-.56 1.25-1.25v-9c0-.69-.56-1.25-1.25-1.25M2.5 1A2.5 2.5 0 0 0 0 3.5v9A2.5 2.5 0 0 0 2.5 15h17a2.5 2.5 0 0 0 2.5-2.5v-9A2.5 2.5 0 0 0 19.5 1zM3 4.5h1.69l.3.32L7 7.02l2.01-2.2.3-.32H11v7H9V7.8L7.74 9.18l-.74.8-.74-.8L5 7.8v3.7H3v-7M15 8V4.5h2V8h2.5L17 10.5l-1 1-1-1L12.5 8z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function V0Icon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M6.1 9.46V5.52h1.52v5.03c0 .59-.48 1.07-1.07 1.07-.28 0-.56-.11-.76-.31L0 5.52h2.15zM16 10.1h-1.52V6.6l-3.5 3.5h3.5v1.52h-3.96a2.14 2.14 0 0 1-2.14-2.14V5.52H9.9v3.5l3.5-3.5H9.9V4h3.96C15.04 4 16 4.96 16 6.14z" />
    </svg>
  );
}

function ClaudeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 12 12" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.3545 7.9775L4.7145 6.654L4.7545 6.539L4.7145 6.475H4.6L4.205 6.451L2.856 6.4145L1.6865 6.366L0.5535 6.305L0.268 6.2445L0 5.892L0.0275 5.716L0.2675 5.5555L0.6105 5.5855L1.3705 5.637L2.5095 5.716L3.3355 5.7645L4.56 5.892H4.7545L4.782 5.8135L4.715 5.7645L4.6635 5.716L3.4845 4.918L2.2085 4.074L1.5405 3.588L1.1785 3.3425L0.9965 3.1115L0.9175 2.6075L1.2455 2.2465L1.686 2.2765L1.7985 2.307L2.245 2.65L3.199 3.388L4.4445 4.3045L4.627 4.4565L4.6995 4.405L4.709 4.3685L4.627 4.2315L3.9495 3.0085L3.2265 1.7635L2.9045 1.2475L2.8195 0.938C2.78711 0.819128 2.76965 0.696687 2.7675 0.5735L3.1415 0.067L3.348 0L3.846 0.067L4.056 0.249L4.366 0.956L4.867 2.0705L5.6445 3.5855L5.8725 4.0345L5.994 4.4505L6.0395 4.578H6.1185V4.505L6.1825 3.652L6.301 2.6045L6.416 1.257L6.456 0.877L6.644 0.422L7.0175 0.176L7.3095 0.316L7.5495 0.6585L7.516 0.8805L7.373 1.806L7.0935 3.2575L6.9115 4.2285H7.0175L7.139 4.1075L7.6315 3.4545L8.4575 2.4225L8.8225 2.0125L9.2475 1.5605L9.521 1.345H10.0375L10.4175 1.9095L10.2475 2.4925L9.7155 3.166L9.275 3.737L8.643 4.587L8.248 5.267L8.2845 5.322L8.3785 5.312L9.8065 5.009L10.578 4.869L11.4985 4.7115L11.915 4.9055L11.9605 5.103L11.7965 5.5065L10.812 5.7495L9.6575 5.9805L7.938 6.387L7.917 6.402L7.9415 6.4325L8.716 6.5055L9.047 6.5235H9.858L11.368 6.636L11.763 6.897L12 7.216L11.9605 7.4585L11.353 7.7685L10.533 7.574L8.6185 7.119L7.9625 6.9545H7.8715V7.0095L8.418 7.5435L9.421 8.4485L10.6755 9.6135L10.739 9.9025L10.578 10.13L10.408 10.1055L9.3055 9.277L8.88 8.9035L7.917 8.0935H7.853V8.1785L8.075 8.503L9.2475 10.2635L9.3085 10.8035L9.2235 10.98L8.9195 11.0865L8.5855 11.0255L7.8985 10.063L7.191 8.9795L6.6195 8.008L6.5495 8.048L6.2125 11.675L6.0545 11.86L5.69 12L5.3865 11.7695L5.2255 11.396L5.3865 10.658L5.581 9.696L5.7385 8.931L5.8815 7.981L5.9665 7.665L5.9605 7.644L5.8905 7.653L5.1735 8.6365L4.0835 10.109L3.2205 11.0315L3.0135 11.1135L2.655 10.9285L2.6885 10.5975L2.889 10.303L4.083 8.785L4.803 7.844L5.268 7.301L5.265 7.222H5.2375L2.066 9.28L1.501 9.353L1.2575 9.125L1.288 8.752L1.4035 8.6305L2.3575 7.9745L2.3545 7.9775Z"
      />
    </svg>
  );
}

function ChatGPTIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M6.14 5.84v-1.5q-.01-.2.16-.29l3.02-1.74q.63-.35 1.42-.35c1.9 0 3.1 1.47 3.1 3.04l-.01.37-3.14-1.84a.5.5 0 0 0-.57 0zm7.07 5.87v-3.6q0-.32-.29-.5l-3.98-2.3 1.3-.75q.16-.09.32 0L13.6 6.3c.87.51 1.46 1.59 1.46 2.64 0 1.2-.71 2.31-1.84 2.77m-8-3.17-1.3-.76q-.17-.1-.17-.29V4c0-1.7 1.3-2.98 3.06-2.98q1.02.01 1.81.62L5.5 3.44a.5.5 0 0 0-.29.5zM8 10.16 6.14 9.1V6.89L8 5.84 9.86 6.9v2.22zm1.2 4.82q-1.02-.01-1.81-.62l3.12-1.8a.5.5 0 0 0 .29-.5v-4.6l1.31.76q.17.1.16.29V12c0 1.7-1.31 2.98-3.07 2.98m-3.76-3.54L2.4 9.7A3.1 3.1 0 0 1 .95 7.06c0-1.22.73-2.31 1.86-2.77V7.9q0 .34.28.5l3.97 2.3-1.3.74a.3.3 0 0 1-.32 0m-.18 2.6c-1.79 0-3.1-1.35-3.1-3.01q0-.19.03-.38l3.12 1.8q.3.18.57 0l3.98-2.3v1.51q.01.2-.16.29l-3.02 1.74q-.63.35-1.42.35m3.94 1.89a3.96 3.96 0 0 0 3.88-3.17 3.97 3.97 0 0 0 1.59-6.79q.12-.5.12-1a3.96 3.96 0 0 0-5.21-3.76 3.97 3.97 0 0 0-6.66 2.03 3.97 3.97 0 0 0-1.59 6.79q-.12.5-.12 1a3.96 3.96 0 0 0 5.21 3.76c.72.7 1.7 1.14 2.78 1.14" />
    </svg>
  );
}

interface SplitButtonProps {
  source: string;
  fileName: string;
  rawUrl: string;
}

function SplitButton({ source, fileName, rawUrl }: SplitButtonProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const btnBase: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '32px',
    padding: '0 10px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    border: '1px solid var(--t-color-gray-4, #d1d5db)',
    background: 'var(--t-color-bg, #fff)',
    color: 'var(--t-color-text, #111)',
    transition: 'background 120ms ease',
    outline: 'none',
  };

  const menuItem: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    padding: '8px',
    borderRadius: '6px',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    border: 'none',
    background: 'transparent',
    color: 'var(--t-color-text, #111)',
    boxSizing: 'border-box',
  };

  return (
    <div ref={menuRef} style={{ position: 'relative', display: 'inline-flex' }}>
      <div style={{ display: 'flex' }}>
        <button
          style={{ ...btnBase, borderRadius: '6px 0 0 6px', borderRight: 'none', gap: '6px' }}
          onClick={() => copy(source)}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'var(--t-color-gray-1, #f5f5f5)')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'var(--t-color-bg, #fff)')}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>

        {/* divider line */}
        <div style={{ width: '1px', background: 'var(--t-color-gray-4, #d1d5db)', alignSelf: 'stretch' }} />

        <button
          style={{ ...btnBase, borderRadius: '0 6px 6px 0', borderLeft: 'none', padding: '0 8px' }}
          onClick={() => setOpen((v) => !v)}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'var(--t-color-gray-1, #f5f5f5)')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'var(--t-color-bg, #fff)')}
          aria-haspopup="true"
          aria-expanded={open}
        >
          <ChevronIcon />
        </button>
      </div>

      {/* Dropdown menu */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            width: '280px',
            background: 'var(--t-color-bg, #fff)',
            border: '1px solid var(--t-color-gray-3, #e5e7eb)',
            borderRadius: '12px',
            boxShadow: '0 8px 30px rgba(0,0,0,.12)',
            padding: '8px',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          <button
            style={menuItem}
            onClick={() => {
              copy(source);
              setOpen(false);
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'var(--t-color-gray-1, #f5f5f5)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500 }}>
              <MarkdownIcon />
              Copy Markdown
            </span>
            <span style={{ fontSize: '12px', color: 'var(--t-color-gray-6, #6b7280)', paddingLeft: '26px' }}>Copy raw source of {fileName}</span>
          </button>

          <button
            style={menuItem}
            onClick={() => {
              const blob = new Blob([source], { type: 'text/markdown' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = fileName;
              a.click();
              URL.revokeObjectURL(url);
              setOpen(false);
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'var(--t-color-gray-1, #f5f5f5)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500 }}>
              <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 12l-4-4h2.5V4h3v4H12L8 12z" />
                <path d="M2 14h12v-1.5H2V14z" />
              </svg>
              Download .md
            </span>
            <span style={{ fontSize: '12px', color: 'var(--t-color-gray-6, #6b7280)', paddingLeft: '26px' }}>Download {fileName} as a file</span>
          </button>

          <div style={{ height: '1px', background: 'var(--t-color-gray-3)', margin: '4px 0' }} />

          {[
            {
              icon: <ClaudeIcon />,
              label: 'Open in Claude',
              description: 'Ask questions about this document',
              href: `https://claude.ai/new?q=${encodeURIComponent(`Read from this URL: ${rawUrl} and explain it to me.`)}`,
            },
            {
              icon: <V0Icon />,
              label: 'Open in v0',
              description: 'Ask questions about this document',
              href: `https://v0.dev/chat?q=${encodeURIComponent(`Read from this URL: ${rawUrl} and explain it to me.`)}`,
            },
            {
              icon: <ChatGPTIcon />,
              label: 'Open in ChatGPT',
              description: 'Ask questions about this document',
              href: `https://chatgpt.com/?q=${encodeURIComponent(`Read from this URL: ${rawUrl} and explain it to me.`)}`,
            },
          ].map(({ icon, label, description, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              style={{ ...menuItem, textDecoration: 'none' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = 'var(--t-color-gray-1, #f5f5f5)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = 'transparent')}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500 }}>
                {icon}
                {label}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--t-color-gray-6, #6b7280)', paddingLeft: '24px' }}>{description}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export function MarkdownReadPage({ markdown }: { markdown: MarkdownResponseDTO }) {
  const files = markdown.files as unknown as CodeEditorFiles<CodeLanguage.MARKDOWN>;
  const fileKeys = Object.keys(files).sort((a, b) => (files[a].index ?? 0) - (files[b].index ?? 0));
  const [selected, setSelected] = useState(fileKeys[0] ?? '');
  const { Link } = useUIStore((store) => store.components);
  const user = useUserStore((store) => store.user);
  const viewPortScreen = usePageStore((store) => store.viewPort.screen);

  const isMobile = viewPortScreen === 'sm';
  const currentFile = files[selected];
  const source = currentFile?.source ?? '';
  const fileName = currentFile?.name ?? selected;
  const rawUrl = typeof window !== 'undefined' ? `${window.location.origin}/${markdown.key}/raw/${encodeURIComponent(fileName)}` : '';
  const isAdministrator = getUserKey(markdown.owner.nickname, markdown.owner.company.key) === getUserKey(user.nickname, user.company.key);

  return (
    <div className="jk-col nowrap gap stretch ht-100">
      <div className="jk-row gap space-between bc-we jk-pg-sm-tb jk-pg-lg-rl tx-l fw-br">
        {markdown.name}
        {isAdministrator && (
          <div className="jk-row gap">
            <Link href={`/e/${markdown.key}`} className="jk-row">
              <Button type="secondary" size="small" icon={<EditIcon />}>
                <T>edit</T>
              </Button>
            </Link>
            <DocumentMembersButton
              key="members"
              members={markdown.members}
              managers={{}}
              spectators={{}}
              documentOwner={markdown.owner}
              saveUrl={`${JUKI_SERVICE_V2_URL}/markdown/${markdown.key}/members`}
              isAdministrator={isAdministrator}
              documentName={markdown.name}
              copyLink={() => (typeof window !== 'undefined' ? window.location.href : '')}
              size="tiny"
            />
          </div>
        )}
      </div>
      <div className="jk-row top ht-100" style={{}}>
        {fileKeys.length > 1 && !isMobile && (
          <nav
            className="sticky-top bc-we jk-br jk-pg jk-col gap"
            style={{
              margin: 'var(--pad-sm) var(--pad-md)',
              width: '220px',
              minWidth: '220px',
              overflowY: 'auto',
            }}
          >
            <p className="tx-s fw-bd">
              <T className="tt-se">files</T>
            </p>
            {fileKeys.map((key) => {
              const isActive = selected === key;
              return (
                <Button
                  key={key}
                  type="ghost"
                  size="small"
                  onClick={() => setSelected(key)}
                  className={classNames('left', { 'fw-br bc-ht-lt cr-tx-ht': isActive })}
                  style={{
                    justifyContent: 'left',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    width: '100%',
                  }}
                >
                  {files[key].name ?? key}
                </Button>
              );
            })}
          </nav>
        )}

        <div className="ht-100 ow-ao flex-1 jk-col nowrap gap top" style={{ overflowY: 'auto', margin: 'var(--pad-sm) var(--pad-md)' }}>
          <div
            className="jk-row space-between wh-100 bc-we jk-pg-xsm jk-br sticky-top"
            style={{
              borderBottom: '1px solid var(--t-color-gray-3)',
              zIndex: 10,
              boxSizing: 'border-box',
            }}
          >
            {isMobile && fileKeys.length > 1 ? (
              <Select
                options={fileKeys.map((key) => ({ value: key, label: files[key].name ?? key }))}
                selectedOption={{ value: selected, label: files[selected]?.name ?? selected }}
                onChange={({ value }) => setSelected(value)}
              />
            ) : (
              <span style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--t-color-gray-7)' }}>{fileName}</span>
            )}
            <SplitButton source={source} fileName={fileName} rawUrl={rawUrl} />
          </div>

          <div className="read-width wh-100 jk-pg-lg bc-we jk-br-ie">
            <MdMathViewer source={source} />
          </div>
        </div>
      </div>
    </div>
  );
}
