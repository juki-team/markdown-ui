# Juki Markdown

A **Markdown editor** built as part of the [Juki](http://juki.app/) platform. Write, preview, and share Markdown
documents with multi-file support and an AI writing assistant powered by Claude.

## Features

- **Multi-file documents** — Organize content across multiple `.md` files per document
- **Live preview** — Rendered Markdown with math (KaTeX) support via `MdMathViewer`
- **AI assistant** — Generate, improve, and edit Markdown from natural language, with selection-aware context
- **Read view** — Clean reading layout at optimal line width, with file navigation sidebar
- **Raw endpoint** — Serve file content as plain text (`/[key]/raw/[fileName]`)
- **Open in AI** — Deep-link current file directly into Claude, v0, or ChatGPT
- **Collaboration** — Document member management with role-based access control
- **Templates** — Start from pre-built document templates
- **Auto-save** — Changes persist automatically with debounced sync to the Juki API

## Tech Stack

| Category        | Technology                           |
|-----------------|--------------------------------------|
| Framework       | Next.js 16 + React 19                |
| Language        | TypeScript 5                         |
| AI              | Claude (Anthropic) via Vercel AI SDK |
| Base UI         | `@juki-team/base-ui`                 |
| Data fetching   | SWR                                  |
| Package manager | pnpm                                 |

## Project Structure

```
src/
├── app/
│   ├── (bare)/
│   │   ├── page.tsx                        # Home / document list
│   │   ├── [markdownKey]/                  # Read view
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   ├── MarkdownReadPage.tsx
│   │   │   └── raw/[fileName]/route.ts     # Plain-text file endpoint
│   │   └── e/[markdownKey]/                # Editor view
│   │       ├── page.tsx
│   │       ├── loading.tsx
│   │       └── MarkdownViewPage.tsx
│   └── api/
│       └── chat/
│           ├── markdown/route.ts           # AI endpoint (generic)
│           └── md-math/route.ts            # AI endpoint (editor-aware)
├── components/                             # Shared UI components
├── config/                                 # API manager and constants
├── helpers/                                # Utility functions
├── hooks/                                  # Custom React hooks
└── types/                                  # TypeScript type definitions
```

## Routes

| Path                            | Description                  |
|---------------------------------|------------------------------|
| `/`                             | Home page                    |
| `/[markdownKey]`                | Read view with file selector |
| `/e/[markdownKey]`              | Editor with AI chat panel    |
| `/[markdownKey]/raw/[fileName]` | Raw plain-text file content  |

## Getting Started

### Prerequisites

- Node.js ≥ 24
- pnpm

### Install

```bash
pnpm install
```

### Development

```bash
pnpm dev        # starts on port 3077
pnpm caddy      # reverse proxy via Caddyfile (optional)
```

### Production

```bash
pnpm build
pnpm start
```

## Scripts

| Script       | Description                            |
|--------------|----------------------------------------|
| `pnpm dev`   | Development server on port 3077        |
| `pnpm build` | Production build                       |
| `pnpm start` | Start production server                |
| `pnpm lint`  | Run ESLint                             |
| `pnpm pull`  | Update `@juki-team` packages to latest |
| `pnpm push`  | Bump patch version and push to origin  |
| `pnpm caddy` | Start Caddy reverse proxy              |

## Version

**v0.1.2**

## Related

- [Juki](http://juki.app/) — Main platform
- [Juki Judge](https://judge.juki.app) - Platform for online programming competitions
- [Juki Coach](https://coach.juki.app/) - AI-powered programming coach
- [Juki Utils](https://utils.juki.app/) - Utilities
- [Juki IDE](https://ide.juki.app/) - Online code editor
- [Juki Excalidraw](https://excalidraw.juki.app/) - Whiteboard
- [Juki Mermaid](https://mermaid.juki.app/) - Mermaid editor
- [@juki-team/base-ui](https://www.npmjs.com/package/@juki-team/base-ui) - Shared UI library

## License

This project is part of the Juki ecosystem.
