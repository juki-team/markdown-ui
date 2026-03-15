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

export async function POST(req: Request) {
  const {
    messages,
    source,
    selectedSource,
    model = 'anthropic/claude-sonnet-4.5',
  }: { messages: UIMessage[]; source: string; selectedSource: string; model?: string } = await req.json();

  const result = streamText({
    model,
    system: `Eres un experto en escritura técnica y documentación en Markdown.

Tu único objetivo es ayudar al usuario a crear, mejorar y estructurar documentos Markdown.

CAPACIDADES:
- Crear documentos desde cero a partir de una descripción
- Mejorar la estructura, claridad y formato de documentos existentes
- Agregar secciones, tablas, listas, bloques de código, badges, etc.
- Corregir formato y errores de sintaxis Markdown
- Sugerir mejoras de estilo y legibilidad

REGLAS:
- Siempre usa la herramienta 'suggestMarkdown' para entregar el contenido Markdown.
- El Markdown debe ser válido y bien estructurado.
- Si el usuario describe algo en lenguaje natural, genera el documento más apropiado.
- Si hay contenido existente, impróvalo manteniendo la intención original.
- Mantén las explicaciones breves y orientadas al resultado.
- Usa GFM (GitHub Flavored Markdown) como estándar.
- Si el usuario manda selected-source entonces solo dar sugerencias para editar ese contenido nomas con el contexto del source

CONTENIDO ACTUAL DEL DOCUMENTO:
<source>${source || ''}</source>

<selected-source>${selectedSource || ''}</selected-source>
`,
    messages: await convertToModelMessages(messages).catch(() => []),
    tools: {
      suggestMarkdown: tool({
        description: 'Entrega contenido Markdown válido y mejorado para renderizar en el cliente.',
        inputSchema: z.object({
          content: z.string().describe('Contenido Markdown válido y completo.'),
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
