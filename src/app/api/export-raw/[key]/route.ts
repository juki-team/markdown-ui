import { jukiApiManager } from 'config';
import { strToU8, zipSync } from 'fflate';
import { get } from 'helpers';
import { ContentResponse, MarkdownResponseDTO } from 'types';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(_req: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;

  const result = await get<ContentResponse<MarkdownResponseDTO>>(jukiApiManager.API_V2.markdown.getData({ params: { key } }).url);

  if (!result?.success) {
    return Response.json({ error: 'Not found' }, { status: 404, headers: CORS_HEADERS });
  }

  const { files, name: docName } = result.content;

  const zipEntries: Record<string, Uint8Array> = {};

  for (const file of Object.values(files)) {
    const folder = file.folderPath || '';
    const path = folder ? `${folder}/${file.name}` : file.name;
    zipEntries[path] = strToU8(file.source);
  }

  const zip = zipSync(zipEntries);
  const slug = docName.toLowerCase().replace(/\s+/g, '-') || key;

  return new Response(zip.buffer as ArrayBuffer, {
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${slug}-raw.zip"`,
    },
  });
}