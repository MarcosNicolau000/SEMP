# Scope: SEMP (protótipo)

O SEMP é um app de proteção para mulheres com medida protetiva: botão SOS, calculadora disfarçada, rede de apoio, dados da medida e histórico de ocorrências, mais um painel tático para a patrulha que recebe o alerta. Este escopo cobre um protótipo clicável para apresentação (menos de 1 semana), com tudo simulado, rodando no navegador e também como app instalável no celular.

**Build approach:** Facade (primeiro todas as telas clicáveis com dados de exemplo, depois as interações ligadas por cima; é qualidade de protótipo, não código de produção).
**Workflow:** Prototype (nada roda depois do `/develop`; você confia na própria checagem do `/develop` e no seu olho). `/architect` é a primeira parada recomendada quando uma feature tem uma decisão real, mas você pode pular quando já sabe como construir. Qualquer feature pode ter sua própria tag (por exemplo `· Alpha`) para ter mais ou menos rigor.

_Estas são recomendações para manter a construção organizada, não obrigações. Pule o que não fizer sentido: se você já sabe como construir uma feature, use `/develop` e pule o `/architect`. Você decide quando uma feature está `done`._

**Material de origem:** as telas e o código exportados do Google Stitch em `Google Stitch/` (um `code.html` e um `screen.png` por tela) e o sistema visual em `Google Stitch/semp_mobile/DESIGN.md`.

## At a glance

| # | Feature | Phase | Status |
|---|---------|-------|--------|
| 1 | Stack e arquitetura | Foundation | done |
| 2 | Padrões de código e ferramentas | Foundation | done |
| 3 | Dados de exemplo e estado compartilhado | Foundation | done |
| 4 | Sistema visual e componentes base | Foundation | done |
| 5 | Estrutura de navegação | Foundation | done |
| 6 | Tela da calculadora disfarçada | Fase 1: telas clicáveis | done |
| 7 | Tela do painel SOS | Fase 1: telas clicáveis | done |
| 8 | Tela da medida protetiva | Fase 1: telas clicáveis | done |
| 9 | Tela da rede de apoio | Fase 1: telas clicáveis | done |
| 10 | Tela de novo contato | Fase 1: telas clicáveis | done |
| 11 | Tela do histórico de ocorrências | Fase 1: telas clicáveis | done |
| 12 | Tela do painel tático (patrulha) | Fase 1: telas clicáveis | done |
| 13 | Calculadora funcional com PINs secretos | Fase 2: interações | done |
| 14 | Botão Disfarçar em todas as telas | Fase 2: interações | done |
| 15 | SOS de segurar com envio e cancelamento | Fase 2: interações | done |
| 16 | Novo contato entra na lista | Fase 2: interações | done |
| 17 | SOS abre a ocorrência no painel tático | Fase 2: interações | done |
| 18 | Mapa e cronômetro animados no painel tático | Fase 2: interações | done |
| 19 | PWA instalável em tela cheia sem moldura de celular | Fase 2: interações | done |

## Foundations

### 1. Stack e arquitetura · done
Decidir a base técnica que roda tanto no navegador quanto como app instalável no celular, e montar um projeto vazio que já abre.
**Done when:** a escolha está registrada num spec e o projeto vazio abre no navegador e no celular.
spec [0001](../specs/0001-stack-pwa-react-vite.md) · code in `src/`
- [x] Decide the stack (spec): `/architect stack e arquitetura`
- [x] Scaffold from the decision: `/develop stack e arquitetura`

### 2. Padrões de código e ferramentas · done
Registrar as convenções do projeto a partir do projeto já montado, numa versão leve, à altura de um protótipo.
**Done when:** o `AGENTS.md` da raiz reflete a stack real e a formatação roda limpa.
- [x] Capture conventions + tooling choices: `/audit`

### 3. Dados de exemplo e estado compartilhado · done
Os dados fictícios que todas as telas usam (vítima, medida, contatos, ocorrências, agressor, viatura) e a forma como o app da vítima e o painel tático enxergam o mesmo alerta.
**Done when:** existe um conjunto único de dados de exemplo, e um alerta criado de um lado pode ser lido pelo outro.
- [x] Design and implementation: `src/data/mockData.ts` e `src/store/useSempStore.ts`

### 4. Sistema visual e componentes base · done
Levar as cores, tipografia, espaçamentos e cantos do `DESIGN.md` do Stitch para o projeto, junto com os componentes que se repetem.
**Done when:** os componentes base renderizam fiéis ao Stitch, com fonte Inter e números tabulares.
- [x] Sistema visual e componentes base: `src/styles/theme.css` e `src/components/`

### 5. Estrutura de navegação · done
O esqueleto que liga tudo em tela cheia: cabeçalho com o botão Disfarçar, barra inferior (Alerta SOS, Medida, Contatos, Ocorrências) e as rotas para cada tela, incluindo a calculadora como porta de entrada e o painel tático separado.
**Done when:** dá para navegar entre todas as abas e telas em tela cheia, e o app abre na calculadora.
- [x] Estrutura de navegação: `src/App.tsx`, `src/components/Header.tsx` e `src/components/BottomNav.tsx`

## Fase 1: telas clicáveis

### 6. Tela da calculadora disfarçada · done
- [x] Tela da calculadora disfarçada: `src/features/calculadora/CalculadoraScreen.tsx`

### 7. Tela do painel SOS · done
- [x] Tela do painel SOS: `src/features/sos/PainelSosScreen.tsx`

### 8. Tela da medida protetiva · done
- [x] Tela da medida protetiva: `src/features/medida/MedidaProtetivaScreen.tsx`

### 9. Tela da rede de apoio · done
- [x] Tela da rede de apoio: `src/features/rede-apoio/RedeApoioScreen.tsx`

### 10. Tela de novo contato · done
- [x] Tela de novo contato: `src/features/rede-apoio/NovoContatoScreen.tsx`

### 11. Tela do histórico de ocorrências · done
- [x] Tela do histórico de ocorrências: `src/features/historico/HistoricoScreen.tsx`

### 12. Tela do painel tático (patrulha) · done
- [x] Tela do painel tático: `src/features/tatico/PainelTaticoScreen.tsx`

## Fase 2: interações

### 13. Calculadora funcional com PINs secretos · done
- [x] Calculadora funcional com PIN normal (`9482=`) e PIN de pânico (`1900=`)

### 14. Botão Disfarçar em todas as telas · done
- [x] Botão Disfarçar volta à calculadora imediatamente

### 15. SOS de segurar com envio e cancelamento · done
- [x] Segurar 1.5s com anel de progresso SVG, feedback e cancelamento

### 16. Novo contato entra na lista · done
- [x] Cadastro de contato adiciona à store compartilhada

### 17. SOS abre a ocorrência no painel tático · done
- [x] SOS acionado reflete em tempo real na rota `/tatico`

### 18. Mapa e cronômetro animados no painel tático · done
- [x] Mapa com trajeto da viatura, radar pulsante de perímetro e cronômetro de escuta

### 19. PWA instalável em tela cheia sem moldura de celular · done
Remover a moldura artificial de celular que quebrava os elementos fixos e entregar um PWA real em tela cheia com manifest disfarçado de calculadora, ícones, service worker offline e sincronização entre abas.
**Done when:** o app abre em tela cheia responsiva sem mockup de celular, registra o manifest e o service worker, e funciona instalável.
code in `public/manifest.webmanifest`, `public/sw.js`, `index.html`, `src/components/DeviceFrame.tsx`
- [x] Build it: remover mockup de celular e configurar manifest, service worker e layout PWA nativo

## Deferred
Fora deste protótipo, guardado para o plano continuar honesto.
- **Exportar provas em PDF e ouvir áudio**: hoje só visual no histórico
- **Ações reais no aparelho**: GPS de verdade, envio por SMS e WhatsApp, gravação de áudio · needs a decision
- **Salvar dados no aparelho com criptografia**: contatos, PINs e histórico persistentes · needs a decision · GA
- **Biometria e importar da agenda do celular**: hoje só visual · needs a decision
- **Login e conta da usuária e da patrulha**: · needs a decision · GA
- **Privacidade e LGPD**: dados sensíveis e segredo de justiça, obrigatório antes de qualquer uso real · needs a decision · GA
- **Acessibilidade revisada**: alvos de toque, contraste e leitor de tela além do que o Stitch já traz

## Legend

**The decision box.** Toda feature tem exatamente uma, a subtarefa cujo rótulo termina com `(spec)`. O texto varia (`Design it (spec)` normalmente, `Decide the stack (spec)` em Stack e arquitetura), então as skills a encontram pelo final `(spec)`, nunca pelo rótulo exato. Toda outra caixa é de execução, e o `/architect` nunca marca uma delas.

**Feature lifecycle**: o escopo se atualiza conforme a feature anda; cada linha mostra o que aparece e quem define:

| State | Set by | The feature shows |
|---|---|---|
| `planned` · needs a decision | `/scope` | uma caixa: `Design it (spec): /architect <feature>` |
| `in-progress` (designed) | **`/architect` ao capturar o spec** | `Design it` marcado; spec linkado; `Build it: /develop <feature>` + **2 a 5 marcos**; as caixas finais do tier |
| `in-progress` (building) | `/develop` | os marcos vão sendo marcados; ponteiro de código preenchido |
| `done` | **você, quando decidir** (qualquer skill marca quando você pedir); `/sync` reconcilia | no tier `Prototype`, o ponto sugerido para chamar de pronto é logo depois do `/develop` |

- **Next step** = a primeira caixa não marcada (sempre um comando ou um marco).
- **needs a decision** = rode `/architect` primeiro; sem a tag, vá direto ao `/develop` (ou `/audit` para padrões e ferramentas). A tag sai quando o spec é capturado.
- **As tarefas pequenas de construção ficam no `## Build plan` do spec, não aqui**: o escopo guarda só os marcos.
- **Status** `planned` → `in-progress` → `done`, mais `existing` (anterior ao fluxo) e `dropped` (fora do escopo, mantido como histórico).
- **Approach tag** ao lado de um título (por exemplo `· Journey`) troca a abordagem padrão só daquela feature; sem tag, herda.
- **Workflow tier tag** ao lado de um título (por exemplo `· GA`) muda o rigor só daquela feature; sem tag, herda o padrão.
- **Workflow** (linha do cabeçalho) é o padrão do projeto, o que roda depois do `/develop`: **Prototype** = nada; **Alpha** = `/check verify`; **Beta** = `/check verify` e depois `/test`; **GA** = acrescenta `/check review` com um modelo novo e depois `/document`.
- **Pointer line** (`spec <n> · code in <path>`): o link do spec entra pelo `/architect`, o caminho do código pelo `/develop`.
