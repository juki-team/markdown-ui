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

function toTitleCase(str: string) {
  return str.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function normalizeFilename(filename: string) {
  return filename
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/^\d+-index\./, 'index.');
}

function removeExtension(filename: string) {
  const dot = filename.lastIndexOf('.');
  return dot !== -1 ? filename.slice(0, dot) : filename;
}

function stripNumberPrefix(str: string) {
  return str.replace(/^\d+[-\s]+/, '');
}

function isIndexFile(filename: string) {
  const slug = removeExtension(filename);
  return slug === 'index' || slug === '0-index';
}

function extractTitle(source: string, filename: string): string {
  const lines = source.split('\n');
  const firstContentIdx = lines.findIndex((l) => l.trim() !== '');
  const firstLine = lines[firstContentIdx]?.trim() ?? '';
  if (firstLine.startsWith('# ')) return firstLine.slice(2).trim();
  const base = removeExtension(normalizeFilename(filename));
  return toTitleCase(stripNumberPrefix(base));
}

function addFrontmatter(source: string, filename: string, description: string): string {
  const ext = filename.split('.').pop();
  if (ext !== 'md' && ext !== 'mdx') return source;

  const lines = source.split('\n');

  // Already has frontmatter
  if (lines[0]?.trim() === '---') return source;

  let title = '';
  let bodyLines = lines;

  const firstContentIdx = lines.findIndex((l) => l.trim() !== '');
  const firstLine = lines[firstContentIdx]?.trim() ?? '';

  if (firstLine.startsWith('# ')) {
    title = firstLine.slice(2).trim();
    bodyLines = lines.slice(firstContentIdx + 1);
  } else {
    const base = removeExtension(normalizeFilename(filename));
    title = toTitleCase(stripNumberPrefix(base));
  }

  const frontmatter = ['---', `title: "${title}"`, description ? `description: ${description}` : '', '---'].filter(Boolean).join('\n');

  return `${frontmatter}\n\n${bodyLines.join('\n').trimStart()}`;
}

function buildNextSteps(cards: { title: string; href: string; description: string }[]): string {
  const cardLines = cards
    .map(({ title, href, description }) => {
      const descAttr = description ? ` description="${description}"` : '';
      return `  <Card title="${title}" href="${href}"${descAttr} />`;
    })
    .join('\n');

  return `\n\n---\n\n## Next Steps\n\n<Cards>\n${cardLines}\n</Cards>`;
}

export async function GET(_req: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;

  const result = await get<ContentResponse<MarkdownResponseDTO>>(jukiApiManager.API_V2.markdown.getData({ params: { key } }).url);

  if (!result?.success) {
    return Response.json({ error: 'Not found' }, { status: 404, headers: CORS_HEADERS });
  }

  const { files, name: docName } = result.content;

  type FileEntry = { filename: string; source: string; index: number; description: string; folder: string };

  // Collect and normalize all file entries
  const allFiles: FileEntry[] = Object.values(files).map((file) => ({
    filename: normalizeFilename(file.name),
    source: file.source,
    index: file.index,
    description: file.description || '',
    folder: normalizeFilename(file.folderPath || ''),
  }));

  // Build card metadata per folder for Next Steps
  const nextStepCardsByFolder = new Map<string, { title: string; href: string; description: string }[]>();
  for (const { filename, source, description, folder } of allFiles) {
    if (isIndexFile(filename)) continue;
    if (!nextStepCardsByFolder.has(folder)) nextStepCardsByFolder.set(folder, []);
    nextStepCardsByFolder.get(folder)!.push({
      title: extractTitle(source, filename),
      href: folder ? `/docs/${folder}/${removeExtension(filename)}` : `/docs/${removeExtension(filename)}`,
      description,
    });
  }

  // Group by folder
  const folderMap = new Map<string, FileEntry[]>();
  for (const entry of allFiles) {
    if (!folderMap.has(entry.folder)) folderMap.set(entry.folder, []);
    folderMap.get(entry.folder)!.push(entry);
  }

  const zipEntries: Record<string, Uint8Array> = {};

  for (const [folder, folderFiles] of folderMap.entries()) {
    const finalFolder = stripNumberPrefix(folder);
    for (const { filename, source, description } of folderFiles) {
      let content = addFrontmatter(source.replace(/```mermaid\/\w+/g, '```mermaid'), filename, description);

      let finalFilename = stripNumberPrefix(filename);
      const folderCards = nextStepCardsByFolder.get(folder) ?? [];
      if (isIndexFile(filename) && folderCards.length > 0) {
        content += buildNextSteps(folderCards);
        finalFilename = stripNumberPrefix(filename.replace(/\.md$/, '.mdx'));
      }

      const path = finalFolder ? `content/docs/${finalFolder}/${finalFilename}` : `content/docs/${finalFilename}`;
      zipEntries[path] = strToU8(content);
    }

    const fileEntries = folderFiles
      .filter(({ filename }) => !isIndexFile(filename))
      .map(({ filename }) => ({ slug: stripNumberPrefix(removeExtension(filename)), sortKey: filename }));
    const folderEntries = folder ? [] : [...folderMap.keys()].filter((f) => f !== '').map((f) => ({ slug: stripNumberPrefix(f), sortKey: f }));
    const pages = [...fileEntries, ...folderEntries].sort((a, b) => a.sortKey.localeCompare(b.sortKey)).map(({ slug }) => slug);
    const metaTitle = stripNumberPrefix(finalFolder ? toTitleCase(finalFolder) : toTitleCase(docName));
    const meta = { title: metaTitle, pages };
    const metaPath = finalFolder ? `content/docs/${finalFolder}/meta.json` : `content/docs/meta.json`;
    zipEntries[metaPath] = strToU8(JSON.stringify(meta, null, 2));
  }

  const zip = zipSync(zipEntries);
  const slug = docName.toLowerCase().replace(/\s+/g, '-') || key;

  return new Response(zip.buffer as ArrayBuffer, {
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${slug}.zip"`,
    },
  });
}
