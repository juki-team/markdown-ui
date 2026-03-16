import { jukiApiManager } from 'config';
import { POLLAR_MARKDOWN_KEYS } from 'config/constants';
import { get } from 'helpers';
import { ContentResponse, MarkdownResponseDTO } from 'types';
import { PollarPage } from './PollarPage';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const results = await Promise.all(
    POLLAR_MARKDOWN_KEYS.map((key) => get<ContentResponse<MarkdownResponseDTO>>(jukiApiManager.API_V2.markdown.getData({ params: { key } }).url)),
  );

  const documents = results.flatMap((r) => (r.success ? [r.content] : []));

  return <PollarPage documents={documents} />;
}