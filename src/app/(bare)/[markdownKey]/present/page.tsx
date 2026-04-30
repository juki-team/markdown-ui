import { Marp } from '@marp-team/marp-core';
import { jukiApiManager } from 'config';
import { DEFAULT_METADATA } from 'config/constants';
import { get } from 'helpers';
import { type Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ContentResponse, MarkdownResponseDTO, MetadataResponseDTO } from 'types';
import { PresentClient, type PresentFileEntry } from './PresentClient';

type Props = {
  params: Promise<{ markdownKey: string }>;
  searchParams: Promise<{ file?: string }>;
};

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const markdownKey = (await params).markdownKey;

  const result = await get<ContentResponse<MetadataResponseDTO>>(jukiApiManager.API_V2.markdown.getMetadata({ params: { key: markdownKey } }).url);

  const { title, description } = result?.success ? result.content : { title: '', description: '' };

  return {
    ...DEFAULT_METADATA,
    title: title ? `${title} · present` : 'present',
    description,
  };
}

function buildFilePath(folderPath: string | undefined, name: string): string {
  const folder = (folderPath || '').replace(/^\/+|\/+$/g, '');
  return folder ? `${folder}/${name}` : name;
}

function listMarkdownFiles(files: MarkdownResponseDTO['files']): PresentFileEntry[] {
  return Object.values(files || {})
    .filter((f) => f && f.name && f.name !== 'meta.json')
    .map((f) => ({
      path: buildFilePath(f.folderPath, f.name),
      name: f.name,
      folderPath: f.folderPath || '',
    }))
    .sort((a, b) => {
      if (a.folderPath !== b.folderPath) return a.folderPath.localeCompare(b.folderPath);
      return a.name.localeCompare(b.name);
    });
}

export default async function PresentPage({ params, searchParams }: Props) {
  const { markdownKey } = await params;
  const { file: fileParam } = await searchParams;

  const res = await get<ContentResponse<MarkdownResponseDTO>>(jukiApiManager.API_V2.markdown.getData({ params: { key: markdownKey } }).url);

  console.log({ res });
  if (!res.success) return notFound();

  const entries = listMarkdownFiles(res.content.files);
  console.log({ entries });
  if (entries.length === 0) return notFound();

  const selected = (fileParam && entries.find((e) => e.path === fileParam)) || entries[0];
  const fileObj = Object.values(res.content.files).find((f) => buildFilePath(f.folderPath, f.name) === selected.path);
  const source = fileObj?.source ?? '';

  const marp = new Marp({ html: true, math: 'katex' });
  const { html, css } = marp.render(source);

  return <PresentClient key={selected.path} html={html} css={css} files={entries} currentPath={selected.path} markdownKey={markdownKey} />;
}
