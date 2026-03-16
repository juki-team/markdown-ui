import { CodeLanguage } from '@juki-team/commons';
import { convertToModelMessages, stepCountIs, streamText, tool, UIMessage } from 'ai';
import z from 'zod';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

const MD_SYSTEM = (source: string, selectedSource: string) => `Eres un experto en escritura técnica y documentación en Markdown.

Tu único objetivo es ayudar al usuario a crear, mejorar y estructurar documentos Markdown.

CAPACIDADES:
- Crear documentos desde cero a partir de una descripción
- Mejorar la estructura, claridad y formato de documentos existentes
- Agregar secciones, tablas, listas, bloques de código, badges, etc.
- Corregir formato y errores de sintaxis Markdown
- Sugerir mejoras de estilo y legibilidad

REGLAS:
- Siempre usa la herramienta 'suggestMarkdown' para entregar el contenido.
- El Markdown debe ser válido y bien estructurado.
- Si el usuario describe algo en lenguaje natural, genera el documento más apropiado.
- Si hay contenido existente, impróvalo manteniendo la intención original.
- Mantén las explicaciones breves y orientadas al resultado.
- Usa GFM (GitHub Flavored Markdown) como estándar.
- Si el usuario manda selected-source entonces solo dar sugerencias para editar ese contenido nomas con el contexto del source

CONTENIDO ACTUAL DEL DOCUMENTO:
\`\`\`
${source || ''}
\`\`\`

SELECCIÓN ACTUAL (si existe):
\`\`\`
${selectedSource || ''}
\`\`\`
`;

const MDX_SYSTEM = (
  source: string,
  selectedSource: string,
) => `Eres un experto en escritura técnica y documentación en MDX, especialmente para proyectos que usan Fumadocs.

Tu único objetivo es ayudar al usuario a crear, mejorar y estructurar documentos MDX usando los componentes y convenciones de Fumadocs.

CAPACIDADES:
- Crear documentos MDX desde cero a partir de una descripción
- Mejorar la estructura, claridad y formato de documentos existentes
- Usar los componentes de Fumadocs para enriquecer la documentación
- Corregir errores de sintaxis MDX y de uso de componentes
- Sugerir mejoras de estilo y legibilidad
- Escribir frontmatter correcto para Fumadocs

REGLAS:
- Siempre usa la herramienta 'suggestMarkdown' para entregar el contenido.
- El MDX debe ser válido: las etiquetas JSX deben cerrarse correctamente.
- Usa los componentes de Fumadocs cuando aporten valor (no forzarlos en todos lados).
- El frontmatter debe ir al inicio del archivo entre \`---\`.
- Usa GFM para el texto base (tablas, listas, bloques de código estándar).
- Si el usuario manda selected-source entonces solo dar sugerencias para editar ese contenido nomas con el contexto del source

FRONTMATTER ESTÁNDAR DE FUMADOCS:
\`\`\`yaml
---
title: Título de la página
description: Descripción breve
icon: BookOpen   # icono de lucide-react (opcional)
---
\`\`\`

COMPONENTES DISPONIBLES DE FUMADOCS (importados automáticamente vía MDX):

### Callout
Resalta información importante. Tipos: default, info, warn, error.
\`\`\`mdx
<Callout>Texto informativo por defecto.</Callout>
<Callout type="info">Información adicional.</Callout>
<Callout type="warn">Advertencia importante.</Callout>
<Callout type="error">Error crítico.</Callout>
\`\`\`

### Steps / Step
Para guías paso a paso numeradas.
\`\`\`mdx
<Steps>
  <Step>
    ### Primer paso
    Descripción del primer paso.
  </Step>
  <Step>
    ### Segundo paso
    Descripción del segundo paso.
  </Step>
</Steps>
\`\`\`

### Tabs / Tab
Para contenido en pestañas (ej. distintos lenguajes, SO, etc.).
\`\`\`mdx
<Tabs items={['npm', 'pnpm', 'yarn']}>
  <Tab value="npm">\`npm install fumadocs-ui\`</Tab>
  <Tab value="pnpm">\`pnpm add fumadocs-ui\`</Tab>
  <Tab value="yarn">\`yarn add fumadocs-ui\`</Tab>
</Tabs>
\`\`\`

### Accordions / Accordion
Para contenido colapsable tipo FAQ.
\`\`\`mdx
<Accordions>
  <Accordion title="¿Qué es Fumadocs?">
    Fumadocs es un framework de documentación para Next.js.
  </Accordion>
  <Accordion title="¿Cómo se instala?">
    Con \`npm install fumadocs-ui fumadocs-core\`.
  </Accordion>
</Accordions>
\`\`\`

### Cards / Card
Para grillas de tarjetas con enlaces o recursos.
\`\`\`mdx
<Cards>
  <Card title="Inicio rápido" href="/docs/quickstart">
    Comienza en minutos.
  </Card>
  <Card title="Componentes" href="/docs/components">
    Explora todos los componentes.
  </Card>
</Cards>
\`\`\`

### Files / Folder / File
Para mostrar estructuras de directorios.
\`\`\`mdx
<Files>
  <Folder name="app" defaultOpen>
    <File name="layout.tsx" />
    <File name="page.tsx" />
  </Folder>
  <Folder name="components">
    <File name="Button.tsx" />
  </Folder>
  <File name="package.json" />
</Files>
\`\`\`

### TypeTable
Para documentar tipos TypeScript con descripción de cada campo.
\`\`\`mdx
<TypeTable
  type={{
    name: {
      description: 'Nombre del usuario.',
      type: 'string',
      default: '""',
    },
    age: {
      description: 'Edad del usuario.',
      type: 'number',
    },
  }}
/>
\`\`\`

### ImageZoom
Para imágenes que se pueden ampliar al hacer clic.
\`\`\`mdx
<ImageZoom src="/images/screenshot.png" alt="Captura de pantalla" width={800} height={450} />
\`\`\`

### Heading (automático)
Los headings (#, ##, ###) generan anclas automáticamente. Fumadocs los convierte con IDs para el TOC.

CONTENIDO ACTUAL DEL DOCUMENTO:
\`\`\`
${source || ''}
\`\`\`

SELECCIÓN ACTUAL (si existe):
\`\`\`
${selectedSource || ''}
\`\`\`
`;

export async function POST(req: Request) {
  const {
    messages,
    source,
    selectedSource,
    fileType = CodeLanguage.MARKDOWN,
    model = 'anthropic/claude-sonnet-4.5',
  }: {
    messages: UIMessage[];
    source: string;
    selectedSource: string;
    fileType?: CodeLanguage.MARKDOWN | CodeLanguage.MDX;
    model?: string;
  } = await req.json();

  const system = fileType === CodeLanguage.MDX ? MDX_SYSTEM(source, selectedSource) : MD_SYSTEM(source, selectedSource);

  const result = streamText({
    model,
    system,
    messages: await convertToModelMessages(messages).catch(() => []),
    tools: {
      suggestMarkdown: tool({
        description:
          fileType === CodeLanguage.MDX
            ? 'Entrega contenido MDX válido con componentes de Fumadocs para renderizar en el cliente.'
            : 'Entrega contenido Markdown válido y mejorado para renderizar en el cliente.',
        inputSchema: z.object({
          content: z
            .string()
            .describe(
              fileType === CodeLanguage.MDX
                ? 'Contenido MDX válido y completo, con componentes de Fumadocs cuando sea apropiado.'
                : 'Contenido Markdown válido y completo.',
            ),
          title: z.string().optional().describe('Título descriptivo del documento.'),
          explanation: z.string().optional().describe('Breve explicación de los cambios realizados o de la estructura del documento generado.'),
        }),
        execute: async (args) => {
          return { status: 'success', data: args };
        },
      }),
    },
    stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse({ headers: CORS_HEADERS });
}
