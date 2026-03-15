import { jukiApiManager } from 'config';
import { get } from 'helpers';
import { ContentResponse, MarkdownResponseDTO } from 'types';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ markdownKey: string; fileName: string }> }) {
  const { markdownKey, fileName } = await params;

  const res = await get<ContentResponse<MarkdownResponseDTO>>(
    jukiApiManager.API_V2.markdown.getData({ params: { key: markdownKey } }).url,
  );

  if (!res.success) {
    return new Response('Not found', { status: 404 });
  }

  const files = res.content.files as Record<string, { source: string; name?: string }>;
  const file = Object.values(files).find((f) => f.name === fileName) ?? files[fileName];

  if (!file) {
    return new Response('File not found', { status: 404 });
  }

  return new Response(file.source, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `inline; filename="${fileName}"`,
    },
  });
}