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

// Remove characters that conflict with URLs, keeping only safe ones
function sanitizeSlug(s: string) {
  return s.replace(/[&?#%=+@!$^*()[\]{}<>|\\'"`,;]/g, '').replace(/-{2,}/g, '-');
}

function normalizeSegment(s: string) {
  return sanitizeSlug(s.toLowerCase().replace(/\s+/g, '-'));
}

function normalizeFilename(filename: string) {
  return normalizeSegment(filename).replace(/^\d+-index\./, 'index.');
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
  return toTitleCase(stripNumberPrefix(removeExtension(normalizeFilename(filename))));
}

function addFrontmatter(source: string, filename: string, description: string): string {
  const ext = filename.split('.').pop();
  if (ext !== 'md' && ext !== 'mdx') return source;

  const lines = source.split('\n');
  if (lines[0]?.trim() === '---') return source;

  let title = '';
  let bodyLines = lines;

  const firstContentIdx = lines.findIndex((l) => l.trim() !== '');
  const firstLine = lines[firstContentIdx]?.trim() ?? '';

  if (firstLine.startsWith('# ')) {
    title = firstLine.slice(2).trim();
    bodyLines = lines.slice(firstContentIdx + 1);
  } else {
    title = toTitleCase(stripNumberPrefix(removeExtension(normalizeFilename(filename))));
  }

  const frontmatter = ['---', `title: "${title}"`, description ? `description: ${description}` : '', '---']
    .filter(Boolean)
    .join('\n');

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

type FileEntry = { rawName: string; source: string; description: string };
type FolderNode = { files: FileEntry[]; subfolders: Map<string, FolderNode> };

function buildTree(files: ReturnType<typeof Object.values<MarkdownResponseDTO['files'][string]>>): FolderNode {
  const root: FolderNode = { files: [], subfolders: new Map() };

  for (const file of files) {
    const segments = (file.folderPath || '').split('/').filter(Boolean);
    let node = root;
    for (const segment of segments) {
      if (!node.subfolders.has(segment)) {
        node.subfolders.set(segment, { files: [], subfolders: new Map() });
      }
      node = node.subfolders.get(segment)!;
    }
    node.files.push({ rawName: file.name, source: file.source, description: file.description || '' });
  }

  return root;
}

function processFolder(
  node: FolderNode,
  docPath: string,
  folderTitle: string,
  zipEntries: Record<string, Uint8Array>,
) {
  // Build next-step cards from direct files (non-index)
  const nextStepCards: { title: string; href: string; description: string }[] = [];
  for (const { rawName, source, description } of node.files) {
    const filename = normalizeFilename(rawName);
    if (isIndexFile(filename)) continue;
    const hrefPath = docPath.replace(/^content/, '');
    nextStepCards.push({
      title: extractTitle(source, filename),
      href: `${hrefPath}/${removeExtension(stripNumberPrefix(filename))}`,
      description,
    });
  }

  // Write files
  for (const { rawName, source, description } of node.files) {
    const filename = normalizeFilename(rawName);
    let finalFilename = stripNumberPrefix(filename);
    let content = addFrontmatter(source.replace(/```mermaid\/\w+/g, '```mermaid'), filename, description);

    if (isIndexFile(filename) && nextStepCards.length > 0) {
      content += buildNextSteps(nextStepCards);
      finalFilename = finalFilename.replace(/\.md$/, '.mdx');
    }

    zipEntries[`${docPath}/${finalFilename}`] = strToU8(content);
  }

  // Build pages list: direct files (non-index) + direct subfolders, sorted by raw name
  const filePages = node.files
    .filter(({ rawName }) => !isIndexFile(normalizeFilename(rawName)))
    .map(({ rawName }) => {
      const filename = normalizeFilename(rawName);
      return { slug: stripNumberPrefix(removeExtension(filename)), sortKey: filename };
    });

  const subfolderPages: { slug: string; sortKey: string }[] = [];
  for (const [rawSegment, childNode] of node.subfolders.entries()) {
    const normalizedSegment = normalizeSegment(rawSegment);
    const strippedSegment = stripNumberPrefix(normalizedSegment);
    subfolderPages.push({ slug: strippedSegment, sortKey: normalizedSegment });
    processFolder(childNode, `${docPath}/${strippedSegment}`, toTitleCase(strippedSegment), zipEntries);
  }

  const pages = [...filePages, ...subfolderPages]
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .map(({ slug }) => slug);

  zipEntries[`${docPath}/meta.json`] = strToU8(JSON.stringify({ title: folderTitle, pages }, null, 2));
}

export async function GET(_req: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;

  const result = await get<ContentResponse<MarkdownResponseDTO>>(jukiApiManager.API_V2.markdown.getData({ params: { key } }).url);

  if (!result?.success) {
    return Response.json({ error: 'Not found' }, { status: 404, headers: CORS_HEADERS });
  }

  const { files, name: docName } = result.content;

  const root = buildTree(Object.values(files));
  const zipEntries: Record<string, Uint8Array> = {};

  processFolder(root, 'content/docs', toTitleCase(docName), zipEntries);

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