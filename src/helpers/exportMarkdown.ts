import { MarkdownResponseDTO } from 'types';

export type FileTree = {
  [name: string]: string | FileTree;
};

export function toTitleCase(str: string) {
  return str.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function sanitizeSlug(s: string) {
  return s.replace(/[&?#%=+@!$^*()[\]{}<>|\\'"`,;]/g, '').replace(/-{2,}/g, '-');
}

function normalizeSegment(s: string) {
  return sanitizeSlug(s.toLowerCase().replace(/\s+/g, '-'));
}

function normalizeFilename(filename: string) {
  return normalizeSegment(filename).replace(/^\d+-index\./, 'index.');
}

export function removeExtension(filename: string) {
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

export function extractTitle(source: string, filename: string): { title: string; body: string } {
  const lines = source.split('\n');
  const firstContentIdx = lines.findIndex((l) => l.trim() !== '');
  const firstLine = lines[firstContentIdx]?.trim() ?? '';
  if (firstLine.startsWith('# ')) {
    return { title: firstLine.slice(2).trim(), body: lines.slice(firstContentIdx + 1).join('\n') };
  }
  return { title: toTitleCase(stripNumberPrefix(removeExtension(normalizeFilename(filename)))), body: lines.join('\n') };
}

function addFrontmatter(source: string, filename: string, description: string): string {
  const ext = filename.split('.').pop();
  if (ext !== 'md' && ext !== 'mdx') return source;

  const lines = source.split('\n');
  if (lines[0]?.trim() === '---') return source;

  const { title, body } = extractTitle(source, filename);

  const frontmatter = ['---', `title: "${title}"`, description ? `description: ${description}` : '', '---'].filter(Boolean).join('\n');

  return `${frontmatter}\n\n${body.trimStart()}`;
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

function processNode(node: FolderNode, folderTitle: string, hrefBase: string): FileTree {
  const tree: FileTree = {};

  // Extract existing meta.json if present (don't write it as a content file)
  const existingMetaEntry = node.files.find(({ rawName }) => rawName === 'meta.json');
  const contentFiles = node.files.filter(({ rawName }) => rawName !== 'meta.json');

  // Build next-step cards from direct files (non-index)
  const nextStepCards: { title: string; href: string; description: string }[] = [];
  for (const { rawName, source, description } of contentFiles) {
    const filename = normalizeFilename(rawName);
    if (isIndexFile(filename)) continue;
    nextStepCards.push({
      title: extractTitle(source, filename).title,
      href: `${hrefBase}/${removeExtension(stripNumberPrefix(filename))}`,
      description,
    });
  }

  // Write files
  for (const { rawName, source, description } of contentFiles) {
    const filename = normalizeFilename(rawName);
    let finalFilename = stripNumberPrefix(filename);
    let content = addFrontmatter(source.replace(/```mermaid\/\w+/g, '```mermaid'), filename, description);

    if (isIndexFile(filename) && nextStepCards.length > 0) {
      content += buildNextSteps(nextStepCards);
      finalFilename = finalFilename.replace(/\.md$/, '.mdx');
    }

    tree[finalFilename] = content;
  }

  // Build pages list: direct files (non-index) + direct subfolders, sorted by raw name
  const filePages = contentFiles
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
    tree[strippedSegment] = processNode(childNode, toTitleCase(strippedSegment), `${hrefBase}/${strippedSegment}`);
  }

  const computedPages = [...filePages, ...subfolderPages].sort((a, b) => a.sortKey.localeCompare(b.sortKey)).map(({ slug }) => slug);

  let metaTitle = folderTitle;
  let metaDescription = '';
  let metaPages = computedPages;

  if (existingMetaEntry) {
    try {
      const existingMeta = JSON.parse(existingMetaEntry.source);
      if (existingMeta.title !== undefined) metaTitle = existingMeta.title;
      if (existingMeta.description !== undefined) metaDescription = existingMeta.description;
      if (Array.isArray(existingMeta.pages)) metaPages = existingMeta.pages;
    } catch {
      // ignore malformed meta.json, fall back to computed values
    }
  }

  tree['meta.json'] = JSON.stringify({ title: metaTitle, description: metaDescription, pages: metaPages }, null, 2);

  return tree;
}

export function filesToFileTree(files: ReturnType<typeof Object.values<MarkdownResponseDTO['files'][string]>>, docName: string): FileTree {
  const root = buildTree(files);
  return processNode(root, toTitleCase(docName), '/docs');
}

/**
 * Returns a map from normalized tree path (e.g. "getting-started/intro") to the original file data.
 * The path logic mirrors what processNode uses, so tree keys can be resolved back to original files.
 */
export function filesToNavMap(files: MarkdownResponseDTO['files']): Map<string, MarkdownResponseDTO['files'][string]> {
  const map = new Map<string, MarkdownResponseDTO['files'][string]>();
  for (const file of Object.values(files)) {
    const folderSegments = (file.folderPath || '')
      .split('/')
      .filter(Boolean)
      .map((s) => stripNumberPrefix(normalizeSegment(s)));
    const slug = removeExtension(stripNumberPrefix(normalizeFilename(file.name)));
    const path = [...folderSegments, slug].join('/');
    map.set(path, file);
  }
  return map;
}
