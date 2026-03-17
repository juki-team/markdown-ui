'use client';

import { AiChatPanel } from '@juki-team/base-ui';
import { CODE_LANGUAGE } from '@juki-team/commons';
import { UIMessage } from 'ai';
import {
  ArrowBackIcon,
  Button,
  DateLiteral,
  DocumentMembersButton,
  DownloadIcon,
  ExpandMoreIcon,
  InfoIIcon,
  LoadingIcon,
  Modal,
  SpinIcon,
  T,
  TwoContentLayout,
  UserCodeEditor,
} from 'components';
import { jukiApiManager } from 'config';
import { JUKI_SERVICE_V2_URL } from 'config/constants';
import { authorizedRequest, classNames, cleanRequest, contentResponse, getUserKey, oneTab } from 'helpers';
import { useFetcher, useStableRef, useUIStore, useUserStore } from 'hooks';
import { CSSProperties, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import type { UserCodeEditorHandle } from 'types';
import { CodeEditorFiles, CodeLanguage, ContentResponse, EntityMembersResponseDTO, MarkdownResponseDTO } from 'types';
import { DEFAULT_MARKDOWN_CODE, MARKDOWN_TEMPLATES } from './markdown-templates';

const TEMPLATE_CATEGORIES = ['All', ...Array.from(new Set(MARKDOWN_TEMPLATES.map((t) => t.category)))];

function TemplatesModal({ isOpen, onClose, onLoad }: { isOpen: boolean; onClose: () => void; onLoad: (code: string) => void }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = MARKDOWN_TEMPLATES.filter((t) => {
    const matchesCategory = activeCategory === 'All' || t.category === activeCategory;
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} closeIcon closeOnKeyEscape closeOnClickOverlay className="jk-pg">
      <div className="jk-col stretch gap nowrap wh-100">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0 }}>
            <T className="tt-se">document templates</T>
          </h3>
        </div>

        <input
          type="text"
          placeholder="Search templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '6px 10px',
            border: '1px solid var(--t-color-gray-4)',
            borderRadius: '4px',
            fontSize: '0.875rem',
            outline: 'none',
            background: 'var(--t-color-bg)',
            color: 'var(--t-color-text)',
          }}
        />

        <div className="jk-row gap">
          {TEMPLATE_CATEGORIES.map((cat) => (
            <Button key={cat} onClick={() => setActiveCategory(cat)} size="tiny" type={activeCategory === cat ? 'primary' : 'secondary'}>
              {cat}
            </Button>
          ))}
        </div>

        <div style={{ overflow: 'auto', flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '8px' }}>
            {filtered.map((template) => (
              <Button
                key={template.name}
                onClick={() => {
                  onLoad(template.code);
                  onClose();
                }}
                type="ghost"
                className="jk-br-ie"
                style={{
                  textAlign: 'left',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  transition: 'all 0.15s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <span>{template.name}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--t-color-gray-6)', fontWeight: 400 }}>{template.category}</span>
              </Button>
            ))}
          </div>
          {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--t-color-gray-6)' }}>No templates found</div>}
        </div>
      </div>
    </Modal>
  );
}

const toEntityMembersDTO = (members: EntityMembersResponseDTO) => {
  return {
    rankAdministrators: members.rankAdministrators,
    administrators: Object.keys(members.administrators),
    rankManagers: members.rankManagers,
    managers: Object.keys(members.managers),
    rankParticipants: members.rankParticipants,
    participants: Object.keys(members.participants),
    rankGuests: members.rankGuests,
    guests: Object.keys(members.guests),
    rankSpectators: members.rankSpectators,
    spectators: Object.keys(members.spectators),
  };
};

type CodeLanguages = CodeLanguage.MARKDOWN | CodeLanguage.MDX;

const orderFiles = (files: CodeEditorFiles<CodeLanguages>) => {
  const filesArray: CodeEditorFiles<CodeLanguages> = {};
  for (const [key, file] of Object.entries(files)) {
    filesArray[key] = {
      source: file.source || '',
      language: file.language,
      index: file.index,
      name: file.name || '',
      hidden: file.hidden ?? false,
      readonly: file.readonly ?? false,
      protected: file.protected ?? false,
      folderPath: file.folderPath || '',
      description: file.description || '',
    };
  }
  return filesArray;
};

export function MarkdownViewPage({ markdown: fallbackData }: { markdown: MarkdownResponseDTO }) {
  const {
    data,
    isLoading,
    isValidating,
    mutate: reloadMarkdown,
  } = useFetcher<ContentResponse<MarkdownResponseDTO>>(jukiApiManager.API_V2.markdown.getData({ params: { key: fallbackData.key } }).url, {
    fallbackData: JSON.stringify(contentResponse('fallback data', fallbackData)),
  });
  const markdown = data?.success ? data.content : fallbackData;
  const [files, setFiles] = useState(markdown.files as unknown as CodeEditorFiles<CodeLanguages>);
  const [name, setName] = useState(markdown.name);

  const newBodyString = JSON.stringify({
    name,
    files: orderFiles(files),
    tags: [],
    members: toEntityMembersDTO(markdown.members),
  });
  const currentBodyString = JSON.stringify({
    name: markdown.name,
    files: orderFiles(markdown.files as unknown as CodeEditorFiles<CodeLanguages>),
    tags: [],
    members: toEntityMembersDTO(markdown.members),
  });

  const timeoutRef = useRef<NodeJS.Timeout>(null);
  useEffect(() => {
    const body = JSON.parse(newBodyString);
    if (isLoading || body.files?.length === 0) {
      return;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(async () => {
      const { url, ...options } = jukiApiManager.API_V2.markdown.updateData({
        params: { key: fallbackData.key },
        body: body as never,
      });
      cleanRequest<ContentResponse<{ key: string }>>(await authorizedRequest(url, options));
      await reloadMarkdown();
      timeoutRef.current = null;
    }, 400);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [fallbackData.key, isLoading, newBodyString, reloadMarkdown]);

  const { Link } = useUIStore((store) => store.components);
  const user = useUserStore((store) => store.user);
  const [currentFileName, setCurrentFileName] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [editorWidth, setEditorWidth] = useState<string>('');
  const userCodeEditorRef = useRef<UserCodeEditorHandle<CodeLanguages> | null>(null);
  const filesRef = useStableRef(files);
  const currentFileNameRef = useStableRef(currentFileName);

  const setCode = useCallback(
    (source: string) => {
      if (filesRef.current[currentFileNameRef.current]?.source !== source) {
        userCodeEditorRef.current?.setFile({
          ...filesRef.current[currentFileNameRef.current],
          source,
        });
      }
    },
    [currentFileNameRef, filesRef],
  );

  const getBodyRef = useRef(() => {
    const { language, source } = filesRef.current[currentFileNameRef.current] || { source: '', language: CodeLanguage.MARKDOWN };
    if (language === CodeLanguage.MARKDOWN) {
      const selectedSource = userCodeEditorRef.current?.markdownGetSelection() ?? '';
      if (selectedSource) {
        userCodeEditorRef.current?.markdownHighlightSelectionNodes('jk-md-math-node-highlighted');
      }
      return { source, selectedSource, fileType: CodeLanguage.MARKDOWN };
    } else if (language === CodeLanguage.MDX) {
      return { source, fileType: CodeLanguage.MDX };
    }
    return {};
  });

  const appliedPartsRef = useRef<Set<string>>(new Set());
  const onMessagesChangeRef = useRef((messages: UIMessage[]) => {
    for (const message of messages) {
      (
        message.parts as {
          type: string;
          output: { data: { content: string } };
          state: string;
        }[]
      ).forEach((part, i) => {
        if (part?.type === 'tool-suggestMarkdown' && part?.state === 'output-available') {
          const key = `${message.id}-${i}`;
          if (!appliedPartsRef.current.has(key) && typeof part?.output?.data?.content === 'string') {
            appliedPartsRef.current.add(key);
            const content = part.output?.data?.content || '';
            const file = filesRef.current[currentFileNameRef.current];
            if (file?.language === CodeLanguage.MARKDOWN) {
              userCodeEditorRef.current?.markdownReplaceSelectionWithMarkdown(content);
              userCodeEditorRef.current?.markdownHighlightSelectionNodes('jk-md-math-node-highlighted');
            } else if (file?.language === CodeLanguage.MDX) {
              userCodeEditorRef.current?.setFile({
                ...file,
                source: content,
              });
            }
          }
        }
      });
    }
  });
  const storeKey = `markdown-${markdown.key}`;

  return (
    <TwoContentLayout
      tabButtons={[
        <div key="state" className="tx-t jk-row gap" style={{ opacity: 0.6 }}>
          {isLoading || isValidating ? (
            <SpinIcon />
          ) : (
            <InfoIIcon
              filledCircle
              size="tiny"
              className={classNames({
                'cr-wg': currentBodyString !== newBodyString,
                'cr-ss': currentBodyString === newBodyString,
              })}
              data-tooltip-id="jk-tooltip"
              data-tooltip-content={currentBodyString !== newBodyString ? 'changes not saved' : 'changes saved'}
            />
          )}
          <DateLiteral date={new Date(markdown.updatedAt)} />
        </div>,
        <DocumentMembersButton
          key="members"
          members={markdown.members}
          managers={{}}
          spectators={{}}
          documentOwner={markdown.owner}
          saveUrl={`${JUKI_SERVICE_V2_URL}/markdown/${markdown.key}/members`}
          isAdministrator={getUserKey(markdown.owner.nickname, markdown.owner.company.key) === getUserKey(user.nickname, user.company.key)}
          documentName={markdown.name}
          copyLink={() => (typeof window !== 'undefined' ? window.location.href : '')}
          size="tiny"
        />,
      ]}
      tabs={oneTab(
        <div className="jk-row nowrap gap top ht-100" style={{ '--chat-right-panel-width': 'calc(100vw / 3.5)' } as CSSProperties}>
          <div className="flex-1 ht-100" style={{ maxWidth: editorWidth }}>
            <Suspense
              fallback={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <LoadingIcon />
                </div>
              }
            >
              <UserCodeEditor<CodeLanguages>
                ref={userCodeEditorRef}
                initialFiles={
                  fallbackData.files && Object.keys(fallbackData.files).length > 0
                    ? (fallbackData.files as unknown as CodeEditorFiles<CodeLanguage.MARKDOWN>)
                    : {
                        'document.md': {
                          source: DEFAULT_MARKDOWN_CODE,
                          language: CodeLanguage.MARKDOWN,
                          index: 0,
                          name: 'document.md',
                          hidden: false,
                          readonly: false,
                          protected: false,
                          folderPath: '',
                          description: '',
                        },
                      }
                }
                storeKey={storeKey}
                languages={[
                  { value: CodeLanguage.MARKDOWN, label: 'Markdown' },
                  { value: CodeLanguage.MDX, label: 'MDX' },
                ]}
                onCurrentFileNameChange={setCurrentFileName}
                onFilesChange={setFiles}
                withoutRunCodeButton
              />
            </Suspense>
          </div>
          <AiChatPanel
            getBodyRef={getBodyRef}
            onMessagesChangeRef={onMessagesChangeRef}
            api="/api/chat/md"
            storeKey={storeKey}
            onWidthChange={(width) => setEditorWidth(`calc(100% - ${width}px)`)}
            actions={({ setPendingParts }) => {
              return [
                <Button
                  key="load-all-files"
                  type="ghost"
                  size="tiny"
                  onClick={() => {
                    const parts = Object.values(files).map((file) => ({
                      type: 'file' as const,
                      name: file.name,
                      mediaType: CODE_LANGUAGE[file.language]?.mime || 'text/plain',
                      url: `data:text/plain;base64,${btoa(String.fromCharCode(...new TextEncoder().encode(file.source)))}`,
                    }));
                    setPendingParts(parts);
                  }}
                >
                  load all files
                </Button>,
              ];
            }}
          />
        </div>,
      )}
    >
      <TemplatesModal isOpen={showTemplates} onClose={() => setShowTemplates(false)} onLoad={setCode} />

      <div className="jk-row gap jk-pg-xsm wh-100">
        <Link href="/">
          <Button type="ghost" icon={<ArrowBackIcon />} tooltipContent="back home" />
        </Link>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: '1px solid transparent',
            outline: 'none',
            fontWeight: 'bold',
            fontSize: 'inherit',
            color: 'var(--t-color-primary)',
            minWidth: '120px',
            width: `${Math.max(name.length, 8)}ch`,
            padding: '0 2px',
            transition: 'border-color 150ms',
          }}
          onFocus={(e) => (e.currentTarget.style.borderBottomColor = 'var(--t-color-primary)')}
          onBlur={(e) => (e.currentTarget.style.borderBottomColor = 'transparent')}
        />
        <div className="flex-1" />
        <Button
          size="small"
          type="ghost"
          icon={<DownloadIcon size="small" />}
          onClick={() => {
            const a = document.createElement('a');
            a.href = `/api/export/${fallbackData.key}`;
            a.click();
          }}
          tooltipContent="download as zip"
        />
        <Link href={`/${fallbackData.key}`}>
          <Button size="small" type="ghost">
            <T className="tt-se">view document</T>
          </Button>
        </Link>
        <Button onClick={() => setShowTemplates(true)} icon={<ExpandMoreIcon size="small" />} size="small" type="secondary">
          <T className="tt-se">templates</T>
        </Button>
      </div>
    </TwoContentLayout>
  );
}
