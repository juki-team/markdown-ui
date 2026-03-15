import { TwoContentLayout } from 'components';
import { jukiApiManager } from 'config';
import { DEFAULT_METADATA } from 'config/constants';
import { get, oneTab } from 'helpers';
import { type Metadata } from 'next';
import { ContentResponse, MarkdownResponseDTO, MetadataResponseDTO } from 'types';
import { MarkdownNotFoundCard } from './MarkdownNotFoundCard';
import { MarkdownViewPage } from './MarkdownViewPage';

type Props = {
  params: Promise<{ markdownKey: string }>;
};

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const markdownKey = (await params).markdownKey;

  const result = await get<ContentResponse<MetadataResponseDTO>>(jukiApiManager.API_V2.markdown.getMetadata({ params: { key: markdownKey } }).url);

  const { title, description } = result?.success ? result.content : { title: '', description: '' };

  return {
    ...DEFAULT_METADATA,
    title,
    description,
    openGraph: {
      ...DEFAULT_METADATA.openGraph,
      title,
      description,
    },
    twitter: {
      ...DEFAULT_METADATA.twitter,
      title,
      description,
    },
  };
}

export default async function MarkdownDocumentPage({ params }: Props) {
  const markdownKey = (await params).markdownKey;

  const markdownResponse = await get<ContentResponse<MarkdownResponseDTO>>(jukiApiManager.API_V2.markdown.getData({ params: { key: markdownKey } }).url);

  if (markdownResponse.success) {
    return <MarkdownViewPage markdown={markdownResponse.content} />;
  }

  return <TwoContentLayout tabs={oneTab(<MarkdownNotFoundCard />)} />;
}
