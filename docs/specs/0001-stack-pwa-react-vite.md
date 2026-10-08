# 0001. Adotar um PWA com React, Vite e Tailwind para o protótipo SEMP

**Date**: 2026-10-08
**Status**: Accepted

## Summary

O protótipo do SEMP vai ser um único app web feito em React com TypeScript, montado pelo Vite e estilizado com Tailwind. Ele vira instalável no celular como PWA (um site que o celular instala como app, sem loja). Escolhemos assim porque as telas do Stitch já são HTML com Tailwind, então a conversão é direta e cabe em menos de uma semana. O app da vítima e o painel tático moram no mesmo projeto, em rotas separadas, e por enquanto tudo roda só na máquina local.

## Context

O SEMP precisa de uma demo clicável em menos de uma semana, com todos os dados simulados e sem servidor. Ela tem que abrir no navegador do computador (inclusive no projetor) e também ser instalável no celular. O tier é `Prototype` e a abordagem é Facade: primeiro todas as telas com dados de exemplo, depois as interações por cima (ver `docs/scope/scope.md`).

O material de origem são oito exportações do Google Stitch: HTML com Tailwind carregado por CDN, um objeto de tokens no formato do Tailwind 3, a fonte Inter e os ícones Material Symbols vindos do Google Fonts. Todas as telas, inclusive a do painel tático, foram desenhadas em largura de celular. Qualquer stack que obrigue a reescrever esse HTML em outra linguagem visual custa dias que o prazo não tem.

Duas forças vêm do produto. O disfarce é o centro do app: ele abre numa calculadora e não pode mostrar nada do SEMP de fora. E a demo tem dois lados (vítima e patrulha) que precisam contar a mesma história. Como eles enxergam o mesmo alerta é decidido na feature 3, mas a estrutura do projeto não pode impedir nenhuma das respostas.

Ainda não existe código, `AGENTS.md` nem spec anterior. O projeto é de uma pessoa ou de uma equipe pequena, e roda no Windows.

## Options considered

### Option 1: PWA com React, Vite e Tailwind 4 (single page app)

Um único app React com TypeScript montado pelo Vite. As telas do Stitch viram componentes quase linha a linha, e o `vite-plugin-pwa` gera o manifest e o service worker (o script que deixa o app abrir offline).

**Pros**:
- O HTML com Tailwind do Stitch entra quase sem mudança, só trocando `class` por `className`
- Instalável no Android e no iPhone sem loja e sem build nativo
- A maior base de exemplos e de ajuda para quem trava no meio da semana

**Cons**:
- No iPhone a instalação é manual (Compartilhar, depois Adicionar à Tela de Início). Não existe botão de instalar
- Sem acesso real a SMS, gravação em segundo plano ou GPS contínuo. Isso fica para quando sair do protótipo

### Option 2: Mesmo app web embrulhado no Capacitor

O mesmo código da opção 1, empacotado como app nativo Android e iOS pelo Capacitor.

**Pros**:
- Gera um APK de verdade e abre caminho para GPS, SMS e áudio nativos depois
- Reaproveita 100% do código web

**Cons**:
- Exige Android Studio (e Xcode, que pede um Mac) e um ciclo de build nativo para cada teste
- Ganha capacidades que a demo simulada não usa

### Option 3: Expo com React Native

Um app nativo escrito com componentes do React Native, que também roda na web pelo Expo.

**Pros**:
- O caminho mais natural se o produto final for um app nativo de loja
- Boas APIs de localização, notificação e armazenamento seguro

**Cons**:
- Nenhuma tela do Stitch é aproveitável: todo o HTML vira `View` e `Text`, refeito à mão
- O Tailwind só entra por uma camada de adaptação, com diferenças em relação ao web

### Option 4: HTML e JavaScript puros

Usar as páginas do Stitch quase como estão, com um JavaScript mínimo ligando as telas.

**Pros**:
- O começo mais rápido de todos, as telas já existem
- Zero ferramenta de build

**Cons**:
- Cabeçalho, barra inferior e componentes ficam copiados em oito arquivos
- Compartilhar estado entre telas (contato novo, SOS ativo, painel tático) vira código artesanal e frágil, justamente na Fase 2

## Decision

**Chosen option**: Option 1: PWA com React, Vite e Tailwind 4

O SEMP é um único app React com TypeScript, montado pelo Vite, estilizado com Tailwind 4 e instalável como PWA, com o app da vítima em `/` e o painel tático em `/tatico`, rodando por enquanto só localmente.

**Implementation skills**: `vercel-react-best-practices` e `vercel-composition-patterns` (`vercel-labs/agent-skills`, `.agents/skills/`) · `tailwind-design-system` e `typescript-advanced-types` (`wshobson/agents`, `.agents/skills/`) · `web-routing-react-router` (`agents-inc/skills`, `.agents/skills/web-routing-react-router/`) · `zustand` (`claude-dev-suite/claude-dev-suite`, `.agents/skills/zustand/`) · `ui-ux-pro-max` (`nextlevelbuilder/ui-ux-pro-max-skill`, `.agents/skills/ui-ux-pro-max/`)

## Rationale

O prazo de menos de uma semana e o fato de o material de origem ser HTML com Tailwind decidem quase tudo. A opção 1 é a única que reaproveita as telas do Stitch e entrega instalação no celular sem ciclo nativo. O Capacitor (opção 2) é o próximo passo natural quando a demo precisar de capacidades nativas reais, e nada nesta escolha impede essa migração, porque ele embrulha exatamente este código. O Expo (opção 3) jogaria fora todo o trabalho do Stitch. O HTML puro (opção 4) economiza o primeiro dia e cobra caro na Fase 2, quando três telas precisam enxergar o mesmo estado.

Um app único com duas áreas de rota é um monolito, o padrão certo para uma pessoa e uma demo. Os dois lados compartilham dados de exemplo, componentes e tokens sem copiar nada, e a feature 3 continua livre para escolher entre "mesmo aparelho" e "aparelhos diferentes".

Você escolheu Bun no lugar do pnpm que eu recomendei. Funciona: o Bun instala pacotes e roda os scripts do Vite. O risco é pequeno e conhecido: alguns pacotes com scripts de instalação ainda têm arestas no Windows. Se um pacote falhar ao instalar, a saída é rodar só aquele passo com `npx`, ou trocar para pnpm sem mudar nada no código.

## Proposed stack

| Layer | Choice | Reason |
|---|---|---|
| Padrão | Single page app (tudo roda no navegador), um único projeto, sem servidor | Os dados são simulados, então um servidor só adicionaria peças para operar |
| Linguagem | TypeScript | Tipa os dados de exemplo (vítima, medida, ocorrência, viatura) e pega erros bobos sem custo com Vite |
| Framework de interface | React 19 | Converte o HTML do Stitch em componentes de forma direta e tem a maior base de ajuda |
| Build e servidor local | Vite 8 com `@vitejs/plugin-react` | Servidor local instantâneo e o caminho que a documentação do React indica para SPA (o create-react-app foi descontinuado) |
| Gerenciador de pacotes e scripts | Bun | Escolha sua, rápido. Instala as dependências e roda `bun run dev` e `bun run build` (o Vite continua sendo o build) |
| Estilo | Tailwind CSS 4 via `@tailwindcss/vite`, com os tokens do Stitch convertidos uma vez para `@theme` em `src/styles/theme.css` | Versão atual. O config do Tailwind 3 que vem do Stitch vira variáveis CSS, sem modo de compatibilidade |
| Fonte e ícones | `@fontsource-variable/inter` e o pacote npm `material-symbols` (Outlined), empacotados no projeto | Funcionam sem internet e não dão "piscada" de fonte na apresentação |
| Roteamento | React Router 7 em modo SPA (`createBrowserRouter`) | Simples. Cobre a calculadora como entrada, as quatro abas e a rota `/tatico` |
| Estado compartilhado | Zustand 5 | Store minúsculo sem boilerplate. Se a feature 3 pedir, persiste ou sincroniza com um middleware, sem trocar de biblioteca |
| Mapa | Leaflet 1.9 com `react-leaflet` 5 e tiles do OpenStreetMap | Mapa real sem chave de API, com marcador e trajeto animáveis na feature 18 |
| PWA | `vite-plugin-pwa` com `registerType: 'autoUpdate'` | Gera o manifest e o service worker. A versão nova entra sozinha na próxima abertura, sem aviso que quebre o disfarce |
| Identidade instalada | Nome "Calculadora", ícone neutro de calculadora, `display: standalone`, `start_url: /` | O ícone na tela inicial não revela o SEMP, coerente com o disfarce |
| Cache offline | Precache só do app (HTML, JS, CSS, fontes, ícones). Os tiles do mapa não ficam em cache | O app abre sem rede, e só o mapa precisa de internet |
| Apresentação no desktop | Abaixo de 768px, tela cheia. A partir de 768px, as duas áreas aparecem dentro de uma moldura de celular desenhada (cerca de 390 x 844), centralizada | O efeito vitrine que você escolheu. O painel tático também entra na moldura porque o Stitch o desenhou em largura de celular |
| Pastas | `src/features/<feature>/`, mais `src/components/` (base compartilhada), `src/data/` (dados de exemplo), `src/store/`, `src/styles/`, `src/app/` (rotas e layouts) | Espelha as features do escopo e a ordem do Facade |
| Testes no celular | `vite --host` na rede local, abrindo pelo IP da máquina | Abre e navega no celular. Sem HTTPS, a instalação e o service worker não funcionam ali (ver Consequences) |
| Hospedagem | Nenhuma por enquanto, só local. Candidato: Cloudflare Pages | Você pediu local primeiro. A troca é só configurar o deploy, sem mudar código |
| Banco, autenticação, observabilidade | Nenhum neste protótipo | Tudo é simulado. Persistência, login e LGPD estão em Deferred no escopo |

**Detalhes que eu decidi por você** (escolha, motivo, alternativa):
- **Tokens do Stitch**: os nomes das classes continuam os mesmos do Stitch (`bg-surface`, `text-on-surface`, `font-headline-sm`, `px-margin`, `gap-space-sm`), para que o HTML exportado funcione sem renomear nada. Alternativa: renomear para uma escala própria, o que custaria uma revisão em todas as telas.
- **Moldura no desktop**: um único layout `DeviceFrame` envolve as duas áreas de rota. Abaixo do breakpoint `md` ele não desenha nada. Alternativa: uma moldura por área, que só duplicaria código.
- **Imagens do Stitch**: o logo e as imagens que o Stitch puxa de `lh3.googleusercontent.com` são baixados para `public/` ou `src/assets/`, porque os links remotos podem expirar e não funcionam offline. Alternativa: manter os links, com o risco de a demo abrir sem imagens.
- **Formato do roteador**: `createBrowserRouter` (URLs limpas como `/tatico`). Local funciona sem configuração; no Cloudflare Pages vai precisar de uma regra de redirecionamento para SPA. Alternativa: `createHashRouter` (`/#/tatico`), que dispensa a regra mas deixa a URL feia.
- **Versões**: travar as versões principais acima no `package.json` (por exemplo `^19`, `^8`, `^4`) e conferir na instalação. Os números vieram da conferência de 2026-10-08, e esse cenário muda rápido.

## Consequences

**Positive**:
- As telas do Stitch viram componentes quase sem retrabalho, o que mantém a Fase 1 dentro do prazo
- Um projeto, um build, um conjunto de dados de exemplo e de componentes para os dois lados da demo
- O app abre sem internet (menos o mapa) e o ícone instalado preserva o disfarce
- Migrar para Capacitor depois, para ter GPS, SMS e áudio reais, reaproveita todo o código

**Negative / tradeoffs**:
- **Pela rede local, o celular abre o app mas não instala.** O navegador só registra o service worker e mostra a instalação em HTTPS (ou em `localhost`). Para mostrar a instalação de verdade no celular, você vai precisar de um túnel HTTPS (cloudflared ou ngrok) ou do deploy no Cloudflare Pages
- No iPhone a instalação é sempre manual, e o iOS limita o que um PWA pode fazer em segundo plano
- O mapa depende de internet no local da apresentação. Sem rede, ele aparece cinza
- Bun no Windows pode ter uma aresta com algum pacote. A saída é trocar aquele passo, não a stack
- Um PWA não envia SMS, não grava áudio em segundo plano e não acompanha o GPS com a tela apagada. Tudo isso continua simulado, como o escopo já prevê

**Neutral**:
- A conversão dos tokens do Stitch para `@theme` é um passo único, feito na feature 4
- O painel tático fica na mesma origem do app da vítima, o que permite à feature 3 usar estado compartilhado no navegador (por exemplo `localStorage` ou `BroadcastChannel`), se ela escolher "mesmo aparelho"
- Lint, formatação e convenções ficam para a feature 2 (`/audit`), a partir do projeto já montado

## Follow-up

- [ ] Conferir as versões exatas na instalação (`bun add`) e travar as principais no `package.json`
- [ ] Antes de apresentar a instalação no celular: criar um túnel HTTPS ou fazer o deploy no Cloudflare Pages, com a regra de redirecionamento de SPA para `/index.html`
- [ ] Criar o ícone neutro de calculadora para o manifest (192px, 512px e um maskable) e o `apple-touch-icon`
- [ ] Feature 2 (`/audit`): registrar a stack e as convenções no `AGENTS.md` da raiz. No `## Agent skills`, um item para cada skill instalada em `.agents/skills/` (as 7 listadas em Implementation skills). Na linha `Declined:`, os servidores MCP oferecidos e não escolhidos (Leaflet, Tailwind, W3C, Bun runner)
- [ ] Ao usar as skills, siga a stack deste spec quando elas divergirem: `web-routing-react-router` cobre o framework mode do React Router 7, mas aqui usamos o modo SPA, e `typescript-advanced-types` vai além do que um protótipo precisa
- [ ] Feature 3 decide se a vítima e a patrulha rodam no mesmo aparelho ou em aparelhos diferentes. Esta stack suporta as duas respostas

## References

**Project sources**:
- `docs/scope/scope.md`: prazo, tier `Prototype`, abordagem Facade, features 1 a 18 e Deferred
- `Google Stitch/*/code.html` e `Google Stitch/semp_mobile/DESIGN.md`: HTML com Tailwind, tokens, Inter e Material Symbols

**Practices & standards**:
- Monolito primeiro para equipe pequena e escopo de demo
- Tecnologia conhecida e entediante antes da nova
- Service worker e instalação de PWA exigem contexto seguro (HTTPS ou localhost)

**Links** (conferidos na verificação de 2026-10-08):
- Vite: https://vite.dev
- React: https://react.dev
- Tailwind CSS: https://tailwindcss.com
- vite-plugin-pwa: https://vite-pwa-org.netlify.app
- React Router: https://reactrouter.com
- Zustand: https://zustand.docs.pmnd.rs
- Leaflet: https://leafletjs.com
- Capacitor: https://capacitorjs.com
- Cloudflare Pages: https://pages.cloudflare.com
