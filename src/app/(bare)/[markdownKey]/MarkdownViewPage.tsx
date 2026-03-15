'use client';

import {
  ArrowBackIcon,
  Button,
  DateLiteral,
  DocumentMembersButton,
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
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { CodeEditorFiles, CodeLanguage, ContentResponse, EntityMembersResponseDTO, MermaidResponseDTO, UserCodeEditorProps } from 'types';
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
            <Button key={cat} onClick={() => setActiveCategory(cat)} size="tiny" type={activeCategory === cat ? 'accent' : 'light'}>
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
                type="text"
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

const orderFiles = (files: CodeEditorFiles<CodeLanguage.MARKDOWN>) => {
  const filesArray: CodeEditorFiles<CodeLanguage.MARKDOWN> = {};
  for (const [key, file] of Object.entries(files)) {
    filesArray[key] = {
      source: file.source,
      language: file.language,
      index: file.index,
      name: file.name,
      hidden: file.hidden,
      readonly: file.readonly,
      protected: file.protected,
    };
  }
  return filesArray;
};

export function MarkdownViewPage({ markdown: fallbackData }: { markdown: MermaidResponseDTO }) {
  const {
    data,
    isLoading,
    isValidating,
    mutate: reloadMarkdown,
  } = useFetcher<ContentResponse<MermaidResponseDTO>>(jukiApiManager.API_V2.mermaid.getData({ params: { key: fallbackData.key } }).url, {
    fallbackData: JSON.stringify(contentResponse('fallback data', fallbackData)),
  });
  const markdown = data?.success ? data.content : fallbackData;
  const [files, setFiles] = useState(markdown.files as unknown as CodeEditorFiles<CodeLanguage.MARKDOWN>);

  const newBodyString = JSON.stringify({
    name: markdown.name,
    files: orderFiles(files),
    tags: [],
    members: toEntityMembersDTO(markdown.members),
  });
  const currentBodyString = JSON.stringify({
    name: markdown.name,
    files: orderFiles(markdown.files as unknown as CodeEditorFiles<CodeLanguage.MARKDOWN>),
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
      const { url, ...options } = jukiApiManager.API_V2.mermaid.updateData({
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

  const setFileCbRef = useRef<Parameters<NonNullable<UserCodeEditorProps<CodeLanguage.MARKDOWN>['setSetFile']>>[0]>(null);
  const filesRef = useStableRef(files);
  const setCode = useCallback(
    (source: string) => {
      if (filesRef.current[currentFileName]?.source !== source) {
        setFileCbRef.current?.(currentFileName, {
          ...filesRef.current[currentFileName],
          source,
        });
      }
    },
    [currentFileName, filesRef],
  );
  const setCodeRef = useStableRef(setCode);
  void setCodeRef;

  const setSetFile = useCallback((setFileCb: Parameters<NonNullable<UserCodeEditorProps<CodeLanguage.MARKDOWN>['setSetFile']>>[0]) => {
    setFileCbRef.current = setFileCb;
  }, []);

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
          saveUrl={`${JUKI_SERVICE_V2_URL}/mermaid/${markdown.key}/members`}
          isAdministrator={getUserKey(markdown.owner.nickname, markdown.owner.company.key) === getUserKey(user.nickname, user.company.key)}
          documentName={markdown.name}
          copyLink={() => (typeof window !== 'undefined' ? window.location.href : '')}
          size="tiny"
        />,
      ]}
      tabs={oneTab(
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>
          <Suspense
            fallback={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <LoadingIcon />
              </div>
            }
          >
            <UserCodeEditor<CodeLanguage.MARKDOWN>
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
                      },
                    }
              }
              setSetFile={setSetFile}
              storeKey={`markdown-${markdown.key}`}
              languages={[{ value: CodeLanguage.MARKDOWN, label: 'Markdown' }]}
              onCurrentFileNameChange={setCurrentFileName}
              onFilesChange={setFiles}
              onlyCodeEditor
              withoutRunCodeButton
            />
          </Suspense>
        </div>,
      )}
    >
      <TemplatesModal isOpen={showTemplates} onClose={() => setShowTemplates(false)} onLoad={setCode} />

      <div className="jk-row gap jk-pg-xsm">
        <Link href="/">
          <Button type="text" icon={<ArrowBackIcon />} tooltipContent="back home" />
        </Link>
        <div className="jk-row cr-at tx-l fw-br">Markdown Editor</div>

        <Button onClick={() => setShowTemplates(true)} icon={<ExpandMoreIcon size="small" />} size="small" type="light">
          <T className="tt-se">templates</T>
        </Button>

        <div className="flex-1" />

        <div style={{ width: '1px', height: '20px', background: 'var(--t-color-gray-4)' }} />
      </div>
    </TwoContentLayout>
  );
}
