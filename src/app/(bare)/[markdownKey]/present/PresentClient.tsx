'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

export interface PresentFileEntry {
  path: string;
  name: string;
  folderPath: string;
}

interface PresentClientProps {
  html: string;
  css: string;
  files: PresentFileEntry[];
  currentPath: string;
  markdownKey: string;
}

export function PresentClient({ html, css, files, currentPath, markdownKey }: PresentClientProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const slidesRef = useRef<HTMLElement[]>([]);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const slides = Array.from(containerRef.current.querySelectorAll<HTMLElement>('svg[data-marpit-svg]'));
    slidesRef.current = slides;
    if (slides.length !== total) setTotal(slides.length);
    if (slides.length === 0) return;
    const safeCurrent = Math.min(current, slides.length - 1);
    slides.forEach((s, i) => {
      s.style.setProperty('display', i === safeCurrent ? 'block' : 'none', 'important');
    });
  });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (menuOpen && e.key === 'Escape') {
        e.preventDefault();
        setMenuOpen(false);
        return;
      }
      if (menuOpen) return;
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case 'PageDown':
        case ' ':
        case 'Enter':
          e.preventDefault();
          setCurrent((c) => (total === 0 ? c : Math.min(total - 1, c + 1)));
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
        case 'Backspace':
          e.preventDefault();
          setCurrent((c) => Math.max(0, c - 1));
          break;
        case 'Home':
          e.preventDefault();
          setCurrent(0);
          break;
        case 'End':
          e.preventDefault();
          setCurrent(total === 0 ? 0 : total - 1);
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            document.documentElement.requestFullscreen();
          }
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          setMenuOpen(true);
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [total, menuOpen]);

  const onClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (menuOpen) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const goPrev = e.clientX - rect.left < rect.width / 2;
      setCurrent((c) => {
        if (total === 0) return c;
        const next = c + (goPrev ? -1 : 1);
        if (next < 0) return 0;
        if (next >= total) return total - 1;
        return next;
      });
    },
    [menuOpen, total],
  );

  const selectFile = useCallback(
    (path: string) => {
      setMenuOpen(false);
      const qs = path === files[0]?.path ? '' : `?file=${encodeURIComponent(path)}`;
      router.push(`/${markdownKey}/present${qs}`);
    },
    [files, markdownKey, router],
  );

  const wrapperStyle = useMemo<React.CSSProperties>(
    () => ({
      position: 'fixed',
      inset: 0,
      width: '100vw',
      height: '100vh',
      background: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      zIndex: 9999,
      cursor: 'pointer',
    }),
    [],
  );

  const presentCss = `
    .marp-present .marpit { display: contents; }
    .marp-present svg[data-marpit-svg] { display: none; width: 100vw; height: 100vh; max-width: 100vw; max-height: 100vh; }
    .marp-present svg[data-marpit-svg]:first-of-type { display: block; }
    .marp-pager { position: fixed; bottom: 12px; right: 16px; padding: 4px 10px; border-radius: 999px; background: rgba(0,0,0,0.5); color: rgba(255,255,255,0.85); font-family: ui-sans-serif, system-ui, sans-serif; font-size: 12px; user-select: none; pointer-events: none; z-index: 10000; }
    .marp-files-btn { position: fixed; top: 12px; left: 16px; padding: 6px 12px; border-radius: 8px; background: rgba(0,0,0,0.5); color: rgba(255,255,255,0.85); border: 1px solid rgba(255,255,255,0.15); font-family: ui-sans-serif, system-ui, sans-serif; font-size: 12px; cursor: pointer; z-index: 10000; opacity: 0.35; transition: opacity 150ms ease; }
    .marp-files-btn:hover { opacity: 1; }
    .marp-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 10001; display: flex; align-items: center; justify-content: center; }
    .marp-overlay-panel { background: #111; color: #fff; border: 1px solid rgba(255,255,255,0.15); border-radius: 12px; padding: 12px; min-width: 320px; max-width: 80vw; max-height: 80vh; overflow: auto; font-family: ui-sans-serif, system-ui, sans-serif; }
    .marp-overlay-title { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: rgba(255,255,255,0.6); padding: 4px 8px 8px; }
    .marp-overlay-item { display: block; width: 100%; text-align: left; background: transparent; color: #fff; border: none; border-radius: 8px; padding: 8px 12px; cursor: pointer; font-size: 14px; }
    .marp-overlay-item:hover { background: rgba(255,255,255,0.08); }
    .marp-overlay-item.active { background: rgba(255,255,255,0.12); font-weight: 600; }
    .marp-overlay-item .folder { color: rgba(255,255,255,0.5); font-size: 12px; margin-right: 6px; }
  `;
  console.log({ files });
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <style dangerouslySetInnerHTML={{ __html: presentCss }} />
      <div ref={containerRef} className="marp-present" style={wrapperStyle} onClick={onClick} dangerouslySetInnerHTML={{ __html: html }} />
      <div className="marp-pager">{total === 0 ? '—' : `${current + 1} / ${total}`}</div>

      {files?.length > 1 && (
        <button
          type="button"
          className="marp-files-btn"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(true);
          }}
          title="Cambiar archivo (M)"
        >
          {currentPath} ▾
        </button>
      )}

      {menuOpen && (
        <div className="marp-overlay" onClick={() => setMenuOpen(false)}>
          <div className="marp-overlay-panel" onClick={(e) => e.stopPropagation()}>
            <div className="marp-overlay-title">Archivos</div>
            {files.map((f) => (
              <button key={f.path} type="button" className={`marp-overlay-item${f.path === currentPath ? ' active' : ''}`} onClick={() => selectFile(f.path)}>
                {f.folderPath && <span className="folder">{f.folderPath}/</span>}
                {f.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
