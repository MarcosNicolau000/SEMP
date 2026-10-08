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
| 2 | Padrões de código e ferramentas | Foundation | planned |
| 3 | Dados de exemplo e estado compartilhado | Foundation | planned |
| 4 | Sistema visual e componentes base | Foundation | planned |
| 5 | Estrutura de navegação | Foundation | planned |
| 6 | Tela da calculadora disfarçada | Fase 1: telas clicáveis | planned |
| 7 | Tela do painel SOS | Fase 1: telas clicáveis | planned |
| 8 | Tela da medida protetiva | Fase 1: telas clicáveis | planned |
| 9 | Tela da rede de apoio | Fase 1: telas clicáveis | planned |
| 10 | Tela de novo contato | Fase 1: telas clicáveis | planned |
| 11 | Tela do histórico de ocorrências | Fase 1: telas clicáveis | planned |
| 12 | Tela do painel tático (patrulha) | Fase 1: telas clicáveis | planned |
| 13 | Calculadora funcional com PINs secretos | Fase 2: interações | planned |
| 14 | Botão Disfarçar em todas as telas | Fase 2: interações | planned |
| 15 | SOS de segurar com envio e cancelamento | Fase 2: interações | planned |
| 16 | Novo contato entra na lista | Fase 2: interações | planned |
| 17 | SOS abre a ocorrência no painel tático | Fase 2: interações | planned |
| 18 | Mapa e cronômetro animados no painel tático | Fase 2: interações | planned |

## Foundations

### 1. Stack e arquitetura · done
Decidir a base técnica que roda tanto no navegador quanto como app instalável no celular, e montar um projeto vazio que já abre.
**Done when:** a escolha está registrada num spec e o projeto vazio abre no navegador e no celular.
spec [0001](../specs/0001-stack-pwa-react-vite.md) · code in `src/`
- [x] Decide the stack (spec): `/architect stack e arquitetura`
- [x] Scaffold from the decision: `/develop stack e arquitetura`

### 2. Padrões de código e ferramentas
Registrar as convenções do projeto a partir do projeto já montado, numa versão leve, à altura de um protótipo.
**Done when:** o `AGENTS.md` da raiz reflete a stack real e a formatação roda limpa.
- [ ] Capture conventions + tooling choices: `/audit`

### 3. Dados de exemplo e estado compartilhado · needs a decision
Os dados fictícios que todas as telas usam (vítima, medida, contatos, ocorrências, agressor, viatura) e a forma como o app da vítima e o painel tático enxergam o mesmo alerta. Aqui mora a decisão mais importante da demo: os dois lados rodam no mesmo aparelho ou em aparelhos diferentes.
**Done when:** existe um conjunto único de dados de exemplo, e um alerta criado de um lado pode ser lido pelo outro do jeito que o spec definir.
- [ ] Design it (spec): `/architect dados de exemplo e estado compartilhado`

### 4. Sistema visual e componentes base
Levar as cores, tipografia, espaçamentos e cantos do `DESIGN.md` do Stitch para o projeto, junto com os componentes que se repetem (cartão, selo de status, botão em pílula, campo de formulário, chave liga e desliga) e o logo.
**Done when:** os componentes base renderizam fiéis ao Stitch, com fonte Inter e números tabulares.
- [ ] `/develop sistema visual e componentes base`

### 5. Estrutura de navegação
O esqueleto que liga tudo: cabeçalho com o botão Disfarçar, barra inferior (Alerta SOS, Medida, Contatos, Ocorrências) e as rotas para cada tela, incluindo a calculadora como porta de entrada e o painel tático separado.
**Done when:** dá para navegar entre todas as abas e telas vazias, e o app abre na calculadora.
- [ ] `/develop estrutura de navegação`

## Fase 1: telas clicáveis

Todas as telas montadas com dados de exemplo, navegáveis e com a aparência do Stitch. Nada é salvo ainda.

### 6. Tela da calculadora disfarçada
A calculadora neutra que abre o app, sem nenhuma marca do SEMP visível.
**Done when:** a tela bate com o Stitch e os botões respondem ao toque.
- [ ] `/develop tela da calculadora disfarçada`

### 7. Tela do painel SOS
O botão SOS grande, o status de proteção ativa e o resumo de quem será avisado.
**Done when:** a tela bate com o Stitch, com os contatos vindos dos dados de exemplo.
- [ ] `/develop tela do painel SOS`

### 8. Tela da medida protetiva
Número dos autos, validade, vara, regras de proteção, indivíduo notificado e o botão de apoio da Patrulha Maria da Penha.
**Done when:** a tela bate com o Stitch e o número dos autos pode ser copiado.
- [ ] `/develop tela da medida protetiva`

### 9. Tela da rede de apoio
Os códigos da calculadora (entrada normal e pânico silencioso), a chave de envio de localização e áudio, e a lista de contatos de emergência.
**Done when:** a tela bate com o Stitch, os PINs aparecem mascarados e podem ser revelados, e "Adicionar" leva ao novo contato.
- [ ] `/develop tela da rede de apoio`

### 10. Tela de novo contato
Formulário para cadastrar uma pessoa de confiança, com relação, telefone e o protocolo de acionamento.
**Done when:** a tela bate com o Stitch, os chips e chaves mudam de estado, e Cancelar volta para a rede de apoio.
- [ ] `/develop tela de novo contato`

### 11. Tela do histórico de ocorrências
A lista de ocorrências recentes com status e o botão de exportar provas (só visual por enquanto).
**Done when:** a tela bate com o Stitch, com as ocorrências vindas dos dados de exemplo.
- [ ] `/develop tela do histórico de ocorrências`

### 12. Tela do painel tático (patrulha)
A visão da viatura durante um alerta: código e prioridade, mapa com a área de risco, escuta ambiente, vítima, agressor e ações da patrulha.
**Done when:** a tela bate com o Stitch e abre por uma rota própria, separada do app da vítima.
- [ ] `/develop tela do painel tático`

## Fase 2: interações

As interações que precisam funcionar de verdade na demo, ligadas por cima das telas prontas.

### 13. Calculadora funcional com PINs secretos
A calculadora faz contas de verdade; o PIN normal seguido de `=` abre o app, e o PIN de pânico simula um erro e dispara o SOS em silêncio.
**Done when:** as contas básicas dão o resultado certo, o PIN normal abre o painel SOS, e o PIN de pânico dispara o alerta sem mudar a tela.
- [ ] `/develop calculadora funcional com PINs secretos`

### 14. Botão Disfarçar em todas as telas
Um toque em Disfarçar, em qualquer tela do app da vítima, volta na hora para a calculadora.
**Done when:** de qualquer aba, Disfarçar leva à calculadora, e voltar exige o PIN de novo.
- [ ] `/develop botão Disfarçar em todas as telas`

### 15. SOS de segurar com envio e cancelamento
Segurar o botão por 2 segundos dispara o alerta com anel de progresso; o botão vira um sinal pulsando de "enviando localização", e dá para cancelar.
**Done when:** um toque rápido não dispara nada, segurar 2s dispara com a animação, e cancelar volta ao estado pronto e registra a ocorrência como cancelada.
- [ ] `/develop SOS de segurar com envio e cancelamento`

### 16. Novo contato entra na lista
Salvar o formulário de novo contato adiciona a pessoa à rede de apoio e ao resumo do painel SOS.
**Done when:** o contato salvo aparece na lista e no painel SOS, e o formulário recusa nome ou telefone vazios.
- [ ] `/develop novo contato entra na lista`

### 17. SOS abre a ocorrência no painel tático
Fecha a história da demo: o alerta disparado pela vítima (pelo botão ou pelo PIN de pânico) aparece como ocorrência ativa no painel tático.
**Done when:** disparar o SOS faz o painel tático mostrar a nova ocorrência com os dados da vítima, do jeito definido no spec da feature 3.
- [ ] `/develop SOS abre a ocorrência no painel tático`

### 18. Mapa e cronômetro animados no painel tático
O trajeto da viatura avança no mapa, a estimativa de chegada diminui e o tempo da escuta ambiente corre.
**Done when:** com uma ocorrência ativa, o mapa, a estimativa e o cronômetro se movem sozinhos, e "Confirmar Chegada" encerra a animação.
- [ ] `/develop mapa e cronômetro animados no painel tático`

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
