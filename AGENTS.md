# SEMP

## Stack

- **Language / Runtime**: TypeScript 5.7, Node / Bun
- **Framework**: React 19, Vite 6
- **Key dependencies**: Tailwind CSS 4, React Router 7, Zustand 5, Leaflet 1.9
- **Package manager**: bun (ou npm)

## Build approach

Facade (primeiro todas as telas clicáveis com dados de exemplo, depois as interações ligadas por cima; qualidade de protótipo).

## Commands

```bash
# Install
bun install

# Dev server
bun run dev

# Build
bun run build

# Test
bun run test
```

## Specs

Stored in `docs/specs/`. Format: `docs/specs/NNNN-title.md`.

## Git

- integration: on
- branch prefix: feat/
- commit: per-milestone

## Tooling

- Linter e formatador: ESLint e Prettier para React 19 e TypeScript (instalação no `/develop tooling`)
- Checagens: lint, formatação e verificação de tipos (tsc) antes do commit
- Testes: Vitest para testes unitários e de integração

## Rules

- Funções puras por padrão, sem efeitos colaterais e com dados imutáveis.
- Componentes e hooks enxutos; empurrar efeitos para as bordas do sistema.
- Evitar classes quando funções e composição resolverem.
- Tipagem estrita: sem any, tipos explícitos para dados de domínio.
- Organização por funcionalidade (folder-by-feature em `src/features/`).
- Nomenclatura consistente: PascalCase para componentes e tipos, camelCase para funções e hooks.
- Tratamento consistente de erros com retornos explícitos.
- Acessibilidade básica de interface (WCAG AA para contraste e leitores de tela).
- Mensagens de commit no padrão Conventional Commits.

## Agent skills

- [vercel-react-best-practices](.agents/skills/vercel-react-best-practices/): `vercel-labs/agent-skills`, React and Next.js performance and patterns
- [vercel-composition-patterns](.agents/skills/vercel-composition-patterns/): `vercel-labs/agent-skills`, React component composition patterns
- [tailwind-design-system](.agents/skills/tailwind-design-system/): `wshobson/agents`, Tailwind CSS design systems and tokens
- [typescript-advanced-types](.agents/skills/typescript-advanced-types/): `wshobson/agents`, TypeScript advanced types and type safety
- [web-routing-react-router](.agents/skills/web-routing-react-router/): `agents-inc/skills`, React Router client routing and data patterns
- [zustand](.agents/skills/zustand/): `claude-dev-suite/claude-dev-suite`, Zustand state management and stores
- [ui-ux-pro-max](.agents/skills/ui-ux-pro-max/): `nextlevelbuilder/ui-ux-pro-max-skill`, UI and UX design guidelines and palettes
Declined: additional Agent Skills and MCP servers sweep

## Context files

<!-- Nested AGENTS.md files are listed here as they are created -->

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
