'use client';

import { MdMathViewer } from 'components';
import { classNames } from 'helpers';
import { useMemo, useState } from 'react';
import { CodeEditorFiles, CodeLanguage, MarkdownResponseDTO } from 'types';

function PollarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 3h2v18H3V3zm4 7h2v11H7V10zm4-4h2v15h-2V6zm4 6h2v9h-2v-9zm4-3h2v12h-2V9z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

interface FileMatch {
  docKey: string;
  docName: string;
  fileKey: string;
  fileName: string;
  snippet: string;
}

function getSnippet(source: string, query: string, contextChars = 80): string {
  const idx = source.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return source.slice(0, contextChars * 2) + (source.length > contextChars * 2 ? '…' : '');
  const start = Math.max(0, idx - contextChars);
  const end = Math.min(source.length, idx + query.length + contextChars);
  return (start > 0 ? '…' : '') + source.slice(start, end) + (end < source.length ? '…' : '');
}

export function PollarPage({ documents }: { documents: MarkdownResponseDTO[] }) {
  const [activeDocKey, setActiveDocKey] = useState<string>(documents[0]?.key ?? '');
  const [activeFileKeys, setActiveFileKeys] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const doc of documents) {
      const files = doc.files as unknown as CodeEditorFiles<CodeLanguage.MARKDOWN>;
      const sorted = Object.keys(files).sort((a, b) => (files[a].index ?? 0) - (files[b].index ?? 0));
      initial[doc.key] = sorted[0] ?? '';
    }
    return initial;
  });
  const [search, setSearch] = useState('');

  const activeDoc = documents.find((d) => d.key === activeDocKey);
  const activeFiles = activeDoc ? (activeDoc.files as unknown as CodeEditorFiles<CodeLanguage.MARKDOWN>) : {};
  const activeFileKeysSorted = Object.keys(activeFiles).sort((a, b) => (activeFiles[a].index ?? 0) - (activeFiles[b].index ?? 0));
  const selectedFileKey = activeFileKeys[activeDocKey] ?? activeFileKeysSorted[0] ?? '';
  const selectedFile = activeFiles[selectedFileKey];

  const searchResults = useMemo<FileMatch[]>(() => {
    const q = search.trim();
    if (!q) return [];
    const results: FileMatch[] = [];
    for (const doc of documents) {
      const files = doc.files as unknown as CodeEditorFiles<CodeLanguage.MARKDOWN>;
      for (const [fk, fv] of Object.entries(files)) {
        if ((fv.source ?? '').toLowerCase().includes(q.toLowerCase())) {
          results.push({
            docKey: doc.key,
            docName: doc.name,
            fileKey: fk,
            fileName: fv.name ?? fk,
            snippet: getSnippet(fv.source ?? '', q),
          });
        }
      }
    }
    return results;
  }, [search, documents]);

  return (
    <div className="jk-col nowrap ht-100" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div
        className="bc-we"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '10px 20px',
          borderBottom: '1px solid var(--t-color-gray-3)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '18px', whiteSpace: 'nowrap' }}>
          <PollarIcon />
          Pollar
        </div>

        <div
          style={{
            flex: 1,
            maxWidth: '480px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: '1px solid var(--t-color-gray-4)',
            borderRadius: '8px',
            padding: '6px 12px',
            background: 'var(--t-color-gray-1)',
          }}
        >
          <span style={{ color: 'var(--t-color-gray-6)', flexShrink: 0 }}>
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Buscar en todos los archivos…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '14px',
              color: 'var(--t-color-text)',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t-color-gray-6)', padding: 0, lineHeight: 1 }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div
        className="bc-we"
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '2px',
          padding: '0 20px',
          borderBottom: '1px solid var(--t-color-gray-3)',
          flexShrink: 0,
          overflowX: 'auto',
        }}
      >
        {documents.map((doc) => {
          const isActive = doc.key === activeDocKey && !search;
          return (
            <button
              key={doc.key}
              onClick={() => {
                setActiveDocKey(doc.key);
                setSearch('');
              }}
              style={{
                padding: '8px 16px',
                fontSize: '13.5px',
                fontWeight: isActive ? 600 : 400,
                background: 'none',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--t-color-highlight, #3b82f6)' : '2px solid transparent',
                cursor: 'pointer',
                color: isActive ? 'var(--t-color-highlight, #3b82f6)' : 'var(--t-color-gray-7)',
                whiteSpace: 'nowrap',
                transition: 'color 120ms, border-color 120ms',
              }}
            >
              {doc.name}
            </button>
          );
        })}
      </div>

      {/* Body */}
      {search ? (
        /* Search results panel */
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {searchResults.length === 0 ? (
            <div style={{ color: 'var(--t-color-gray-6)', fontSize: '14px', textAlign: 'center', paddingTop: '40px' }}>
              Sin resultados para <strong>{search}</strong>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '800px', margin: '0 auto' }}>
              <div style={{ fontSize: '13px', color: 'var(--t-color-gray-6)' }}>
                {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''} para <strong>{search}</strong>
              </div>
              {searchResults.map((r, i) => (
                <div
                  key={i}
                  className="bc-we jk-br"
                  style={{ padding: '14px 16px', borderRadius: '8px', cursor: 'pointer', border: '1px solid var(--t-color-gray-3)' }}
                  onClick={() => {
                    setActiveDocKey(r.docKey);
                    setActiveFileKeys((prev) => ({ ...prev, [r.docKey]: r.fileKey }));
                    setSearch('');
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
                    {r.docName} &rsaquo; {r.fileName}
                  </div>
                  <div style={{ fontSize: '12.5px', color: 'var(--t-color-gray-6)', fontFamily: 'monospace', lineHeight: 1.5 }}>{r.snippet}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeDoc ? (
        /* Main content: sidebar + markdown viewer */
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Left sidebar - files */}
          {activeFileKeysSorted.length > 1 && (
            <nav
              className="bc-we"
              style={{
                width: '220px',
                minWidth: '220px',
                flexShrink: 0,
                borderRight: '1px solid var(--t-color-gray-3)',
                overflowY: 'auto',
                padding: '16px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--t-color-gray-6)', letterSpacing: '0.06em', marginBottom: '4px', padding: '0 8px' }}>
                Archivos
              </div>
              {activeFileKeysSorted.map((fk) => {
                const isActive = selectedFileKey === fk;
                return (
                  <button
                    key={fk}
                    onClick={() => setActiveFileKeys((prev) => ({ ...prev, [activeDocKey]: fk }))}
                    className={classNames({ 'bc-ht-lt cr-tx-ht fw-br': isActive })}
                    style={{
                      textAlign: 'left',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      border: 'none',
                      background: isActive ? undefined : 'transparent',
                      cursor: 'pointer',
                      fontSize: '13px',
                      color: isActive ? undefined : 'var(--t-color-gray-8)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      width: '100%',
                    }}
                  >
                    {activeFiles[fk]?.name ?? fk}
                  </button>
                );
              })}
            </nav>
          )}

          {/* Markdown content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
            {selectedFile ? (
              <>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: 'var(--t-color-gray-6)',
                    marginBottom: '16px',
                    paddingBottom: '12px',
                    borderBottom: '1px solid var(--t-color-gray-3)',
                  }}
                >
                  {selectedFile.name ?? selectedFileKey}
                </div>
                <div className="read-width bc-we jk-br-ie jk-pg-lg">
                  <MdMathViewer source={selectedFile.source ?? ''} />
                </div>
              </>
            ) : (
              <div style={{ color: 'var(--t-color-gray-6)', fontSize: '14px' }}>No hay archivos en este documento.</div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t-color-gray-6)', fontSize: '14px' }}>
          No hay documentos disponibles.
        </div>
      )}
    </div>
  );
}