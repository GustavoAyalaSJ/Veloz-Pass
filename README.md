# 📑 Veloz Pass V5.0.1 - Update Logs

Todo o histórico de desenvolvimento, melhorias, correções e atualizações do ecossistema Veloz Pass.

---

## [5.0.2] - 2026-06-08 /2026-06-09
### 🔄 Modificado
* **Media Queries:** Pequenos ajustes no container Left da primeira página.
* **Mint Sprites / Phrases:** Pequenos ajustes nos sprites do MINT e nas falas para todos os tipos de media queries.

### 🔧 Arrumado
* **Notificações:** Ajustes no ícone de apagar notificações e clicar para visualizar o processo.

## [5.0.1] - 2026-06-02 /2026-06-03
### 🚀 Adicionado
* **Limpeza de Dados (Carteira Digital):** O modal de pagamento da Carteira Digital remove os dados após o fechamento ou troca do modal de pagamento.

### 🔧 Arrumado
* **Cod_ID:**  Arrumando a lógica de geração de código de usuário criado no Veloz Pass.
* **Notificações:** Configurando a parte interna do back-end das notificações e a conexão com a tabela de notificações.

## [5.0.0] - 2026-05-30 / 2026-06-01

> **Nota de Versão:** Atualizado para Major devido a mudanças estruturais e refatoração semântica do HTML/CSS que impactam a estrutura global do front-end mobile.

### 🚀 Adicionado
* **Lógica de Máscara na Carteira Digital:** Adição da lógica (0000 0000 0000 0000) para a Carteira Digital, quando o usuário colocar o número do cartão.
* **Ícones:** Adição de ícones Bootstrap para sidebar mobile e troca de alguns ícones em outras páginas.
* **Mais elementos para sidebar:** Adição de funções extra do '.header-links' para o sidebar mobile em outras páginas.

### 🔧 Arrumado
* **Dark Mode (Mobile):** Correção do botão de dark-mode na sidebar de aparelhos mobiles.
* **Ajustes e organização no CSS:** Atualizações de organização de propriedades no CSS e remodelação do CSS de páginas para comportar aparelhos mobiles.
* **Redução de DIV:** Redução das tags de divs para deixar o projeto semântico novamente.

## [4.1.0] - 2026-05-28 / 2026-05-29
### 🚀 Adicionado
* **Rodapé (Introdução):** Adicionado seção FAQ no rodapé;
* **Side Bar (Mobile):** Adição de sidebar contendo as informações do header-actions para celulares pequenos.
* **Versão VP (Dashboard):** Adicionando um pequeno trecho no dashboard, mostrando a versão em que Veloz Pass está.
* **Requirements for Password:** Adicionado um trecho de requerimentos para criar senhas fortes quando cadastrar.

### 🔄 Modificado
* **Rodapé (Introdução):** Ajuste no rodapé da página introdução, reduzindo o texto do link de APP.
* **Media Queries:** Ajuste em alguns media queries nas páginas do Veloz Pass.
* **Código ID (Usuário):** Ajuste para um novo gerador de códigos pelo back-end.
* **Falas do MINT:** Melhorando a falas do MINT para serem skippable (quando ele não pede para usuário interagir) e skippable para target (quando ele pede para usuário interagir).

### 🔧 Arrumado
* **Filtro (Histórico):** Arrumando o filtro de tipo de movimentação para buscar realizados na Carteira Digital.
* **Método de Pagamento:** Ajuste nos métodos de pagamentos para validação de pagamentos.
* **Sprite MINT position:** Ajustar o posicionamento do sprite do MINT para não cobrir interações importantes.

### 🗑️ Removido
* **Rodapé (Dashboard):** Removido por inconsistência com restante da página.
* **Naturalidade (Banco de Dados):** Remoção della tabela a pedido do instrutor.
* **Antiga lógica de Código ID:** Com a remoção de naturalidade, a antiga lógica se tornou obsoleta.
* **Lógica Luhn:** Lógica quebrada para validar número de cartões durante transações.

## [4.0.0] - 2026-05-27

> **Nota de Versão:** Atualizado para Major devido à mudança estrutural profunda de pastas do projeto e testes de migração de arquitetura para React.

### 🚀 Adicionado
* **Pasta Services:** Atualizações sobre a pasta no futuros.
* **React (Temporário):** Foi adicionado React para converter a aplicação, mas, foi considerado um período de testes.

### 🔄 Modificado
* **Estrutura do Projeto:** Veloz Pass está passando por uma modificação na estrutura do projeto, incluindo novas pastas para separar arquivos corretamente e modificação nos nomes dos arquivos.
* **Design Prototype:** Alteração na demonstração do layout das páginas da aplicação.

### 🔧 Arrumado
* **Server.js:** Problemas do server.js que impossibilitavam do Deploy.

### 🗑️ Removido
* **Planos Futuros:** Arquivo removido temporariamente até a conclusão do projeto.
* **React:** Foi adicionado React para converter a aplicação, mas, foi considerado um período de testes.

## [3.1.0] - 2026-05-22 / 2026-05-27
### 🚀 Adicionado
* **CSRF:** Implementação de rotas protegidas (/login, /register e /payments).
* **Salvar N° do Cartão de Transporte (Teste):** Uma forma automática para gerar os números do cartão de passagem sem precisar de digitação manual.

### 🔄 Modificado
* **BRModelo:** Atualização no mapa conceitual do banco de dados do Veloz Pass.
* **UI:** Redução do tamanho (MBs) das imagens na estrutura do projeto e alteração em textos em algumas páginas do site.

### 🔧 Arrumado
* **Duplicidade:** Remoção de códigos duplicados no back-end.

## [3.0.3] - 2026-05-20 / 2026-05-21
### 🔄 Modificado
* **UI/UX:** Ajustes finos na interface da versão Web via Media Queries para aprimorar a responsividade.

## [3.0.2] - 2026-05-19
### 🚀 Adicionado
* **Recarga:** Adicionado um *info-card* explicativo para a modalidade de pagamento "Carteira Digital".

### 🔄 Modificado
* **Carteira Digital:** Transição dos processos internos de estáticos para totalmente dinâmicos.
* **Assistente MINT:** Atualização e refinamento das frases de interação.

### 🔧 Arrumado
* **Estilização:** Ajustes gerais de posicionamento e layout no CSS.

## [3.0.1] - 2026-05-18
### 🚀 Adicionado
* **UI/UX:** Adicionado botão de notificações na interface do usuário.

### 🔧 Arrumado
* **Back-end:** Refatoração e correção na lógica estrutural de rotas/regras de negócio.
* **Estilização:** Ajustes pontuais de layout no CSS.

## [3.0.0] - 2026-05-13

> **Nota de Versão:** Atualizado para Major devido à reestruturação completa do banco de dados/frases do assistente e remoção de fluxos críticos de autenticação nas subversões seguintes.

### 🔄 Modificado
* **Assistente MINT:** Reestruturação completa do banco de frases e inclusão de conteúdos pendentes.

## [2.2.3] - 2026-05-12
### 🔄 Modificado
* **MINT & Responsividade:** Ajustes finos no comportamento do assistente e melhorias nas Media Queries para dispositivos móveis.

### 🗑️ Removido
* **Autenticação:** Remoção do fluxo e da funcionalidade `EsqueceuEmail`.

## [2.2.2] - 2026-05-11
### 🔄 Modificado
* **Arquitetura de Código:** Unificação de arquivos CSS redundantes para otimizar o carregamento.
* **Assistente MINT:** Separação completa da lógica do MINT da configuração global do sistema, tornando-o um módulo independente.
* **Conteúdo:** Adição de textos e elementos informativos que estavam faltantes.

## [2.2.1] - 2026-05-08
### 🔄 Modificado
* **CSS Massivo:** Limpeza profunda de estilos legados, adjustments finos na paleta de cores do Dark Mode e desacoplamento de lógicas que estavam misturadas com JavaScript.
* **Refatoração:** Ajustes de semântica e organização nos arquivos HTML e scripts JS.

## [2.2.0] - 2026-05-04
### 🔄 Modificado
* **Métodos de Pagamento:** Ajustes nas regras de processing financeiro.
* **Infraestrutura:** Alterações na configuração da URL de integração.

### 🔧 Arrumado
* **Assistente MINT:** Execução de novos testes estruturais e de comportamento.
* **Estilização:** Ajustes gerais em propriedades CSS.

### 🗑️ Removido
* **Recarga:** Remoção do campo select 'Tipo Cartão' da página de recargas.

## [2.1.0] - 2026-04-30
### 🚀 Adicionado
* **Assistente Virtual:** Introdução do **MINT**, o novo assistente interativo do Veloz Pass.

### 🔄 Modificado
* **Identidade Visual:** Atualização do logotipo em sua versão para dispositivos móveis.
* **UI/UX:** Otimização de posicionamentos e inclusão de novas animações via CSS.

### 🗑️ Removido
* **Carteira Digital:** Remoção do componente de interface `dropdown-content`.

## [2.0.2] - 2026-04-23
### 🚀 Adicionado
* **Segurança:** Implementação de novas camadas de proteção contra vulnerabilidades no site.

### 🔄 Modificado
* **UI/UX:** Remoção dos `alert()` nativos do navegador e modernização dos avisos do sistema com modais customizados.
* **Marco:** Início do planejamento e desenvolvimento da versão **Veloz Pass V1.7**.

## [2.0.1] - 2026-04-22
### 🚀 Adicionado
* **Histórico Geral:** Protocolos de pagamentos recusados na Carteira Digital agora são devidamente computados e exibidos no Histórico Geral.

### 🔄 Modificado
* **DevOps:** Otimização na estratégia de commits enviados ao GitHub.
* **Back-end:** Atualização e correção nas rotas de processamento do `payment`.

### 🗑️ Removido
* **Node.js:** Limpeza de dependências e conteúdos não utilizados pelo ecossistema Node.

## [2.0.0] - 2026-04-18

> **Nota de Versão:** Atualizado para Major devido à unificação de escopo global do Back-end (Logout e Dark Mode) e quebras de compatibilidade nas revisões de regras e banco de dados que ocorreram nesta janela de Abril.

### 🔄 Modificado
* **Termos de Uso:** Escrita e revisão das regras contidas nos modais de termos de uso das páginas Introduction e Dashboard.

### 🔧 Arrumado
* **Estilização:** Correções gerais de layout no CSS.

## [1.5.4] - 2026-04-17
### 🚀 Adicionado
* **UI/UX:** Adicionadas setas indicativas que rotacionam dinamicamente ao interagir com caixas de dropdown.
* **Regras de Negócio:** Introdução de uma regra de limite máximo de saldo para as telas de Carteira Digital e Recarga.

### 🔄 Modificado
* **Arquitetura:** Unificação do back-end do modal de logout e do Dark Mode em um único arquivo de escopo global, reduzindo a duplicidade.

## [1.5.3] - 2026-04-16
### 🔄 Modificado
* **Refatoração:** Organização estrutural dos arquivos do Back-end para eliminação de funções mortas.

### 🔧 Arrumado
* **Validação:** Correções no validador de pagamentos (`PaymentValidator`).
* **Filtros:** Ajustes e tentativas de estabilização nos botões de filtragem de dados.

## [1.5.2] - 2026-04-15
### 🔧 Arrumado
* **Recarga:** Correção no algoritmo de processamento de créditos.
* **Autenticação:** Correções no fluxo de registro de novos usuários.
* **Estilização:** Correções visuais no CSS.

## [1.5.1] - 2026-04-11
### 🔄 Modificado
* **Performance:** Conversão em lote de imagens para o formato `.webp`, reduzindo drasticamente o peso do projeto.
* **Documentação:** Atualização e melhoria nos comentários internos dos códigos HTML e CSS.

### 🔧 Arrumado
* **Back-end:** Correção nas consultas de banco de dados para retornar registros baseados nos filtros selecionados.
* **Estilização:** Correções visuais na interface.

## [1.5.0] - 2026-04-04
### 🗑️ Removido
* **Limpeza:** Remoção completa e definitiva de arquivos e assets não utilizados no repositório.

## [1.4.0] - 2026-04-03
### 🔄 Modificado
* **Banco de Dados:** Reestruturação de tabelas e alterações nas regras do Back-end.

### 🔧 Arrumado
* **Estilização:** Ajustes finos de CSS e correções no comportamento do Dark Mode global.

## [1.3.0] - 2026-04-02
### 🚀 Adicionado
* **Filtros:** Adicionados botões de filtragem de resultados nas telas de Carteira Digital e Histórico Geral.
* **Formulários:** Automatização de novos campos de input para melhorar a experiência do usuário.

### 🔄 Modificado
* **UI/UX:** Redesign completo e modernização do estilo visual da página de Introdução (`Introduction`).

### 🔧 Arrumado
* **Back-end:** Implementação de novas funções de segurança e correções no `PaymentValidator`.

## [1.2.0] - 2026-03-30
### 🚀 Adicionado
* **Regras de Negócio:** Implementação de uma validação de valor mínimo exigido para a realização de recargas.

### 🔄 Modificado
* **Modelagem:** Alterações estruturais nos diagramas de tabelas dentro do brModelo.

### 🔧 Arrumado
* **Estilização:** Correções gerais de interface no CSS.

## [1.1.0] - 2026-03-27
### 🚀 Adicionado
* **UI/UX:** Implementação de um modal de confirmação de Logout para evitar saídas acidentais.

### 🔄 Modificado
* **Carteira Digital:** Ajustes visuais nos layouts e opções de pagamento.

### 🗑️ Removido
* **Métodos de Pagamento:** Remoção definitiva da opção "Boleto" nos campos de seleção da Carteira Digital e Recarga.

## [1.0.0] - 2026-03-25

> **Nota de Versão:** Primeira release estável oficial (`MAJOR 1`). Ocorre aqui a reestruturação total do ecossistema Back-end e a migração crítica de Banco de Dados do PostgreSQL local para a infraestrutura de nuvem do **Supabase**.

### 🚀 Adicionado
* **Dashboard:** Adicionado um identificador visual na tela principal referente ao CPF mascarado do usuário.
* **UX:** Automatização de inputs específicos e desabilitação do recurso de auto-completar nativo do navegador.

### 🔄 Modificado
* **Migração de Banco:** Reestruturação total do ecossistema Back-end. Migração e conversão das tabelas do PostgreSQL (pgAdmin) para a infraestrutura do **Supabase**.

### 🔧 Arrumado
* **Rotas:** Correções nas rotas de Login, Cadastro e recebimento de saldo.
* **Geral:** Correções de bugs no JavaScript corporativo e folhas de estilo CSS.

## [0.4.3] - 2026-03-17
### 🔄 Modificado
* **Performance:** Auditoria de performance com a remoção física de arquivos não utilizados e renomeação de arquivos para manter consistência.

## [0.4.2] - 2026-03-12
### 🔧 Arrumado
* **Back-end:** Correções nas requisições assíncronas via `FETCH` e ajustes na rotina de validação de pagamentos.

## [0.4.1] - 2026-03-11
### 🔒 Security
* **Middleware:** Adição de camadas de segurança (Middlewares) para proteção de rotas privadas.

### 🔄 Modificado
* **Responsividade:** Inclusão de Media Queries dedicadas para as tabelas de listagem (Carteira Digital e Histórico Geral).

### 🔧 Arrumado
* **Estilização:** Correções de bugs visuais no CSS.

## [0.4.0] - 2026-03-10
### 🔄 Modificado
* **Cabeçalho:** Alteração e padronização dos ícones e do comportamento de navegação do cabeçalho nas páginas Dashboard, Recarga, Histórico Geral e Carteira Digital.

## [0.3.0] - 2026-03-07
### 🚀 Adicionado
* **Recarga:** Reestruturação da página e aplicação do suporte ao Dark Mode.

### 🔧 Arrumado
* **Modais:** Correções de bugs e melhorias no comportamento de modais nas páginas Introduction e Dashboard.

## [0.2.0] - 2026-03-06
### 🚀 Adicionado
* **Saldo Global:** Implementação de um sistema centralizado de controle de saldo integrado em tempo real entre Dashboard, Carteira Digital e Recarga.
* **Tabelas Dinâmicas:** Desenvolvimento da função que gera tabelas dinamicamente para exibição de dados na Carteira Digital e Histórico Geral.

### 🗑️ Removido
* **Arquitetura:** Remoção da página 'Histórico de Recarga' do escopo do projeto, unificando as informações.

## [0.1.4] - 2026-02-28
### 🚀 Adicionado
* **Dark Mode Global:** Centralização do código do modo escuro em uma folha global para extinguir redundâncias no projeto.

### 🔧 Arrumado
* **Autenticação:** Correção no parâmetro de identificação do usuário logado através do ID fornecido pelo Back-end.
* **Carteira Digital:** Correção no algoritmo de geração e renderização da carteira do usuário ativo.
* **Geral:** Correções gerais de bugs de script (JS) e estilo (CSS).

## [0.1.3] - 2026-02-26
### 🚀 Adicionado
* **Segurança Back-end:** Implementação de restrições de validação rigorosas durante as etapas de cadastro e login.
* **Introduction:** Inclusão de novos componentes de assets visuais na página de introdução.

## [0.1.2] - 2026-02-23
### 🚀 Adicionado
* **Modelagem:** Criação de diagramas de tabelas no brModelo para mapear visualmente os relacionamentos e caminhos do banco de dados.

### 🔄 Modificado
* **Infraestrutura:** Ajustes de configuração na URL de produção do Render.

### 🔧 Arrumado
* **Estilização:** Correções visuais adicionadas no CSS.

## [0.1.1] - 2026-02-19
### 🔄 Modificado
* **Migração de Banco:** Conversão de tabelas locais criadas no MySQL Workbench para PostgreSQL utilizando o pgAdmin.

### 🔧 Arrumado
* **Back-end:** Pequenas correções em rotas e lógicas de resposta da API.

## [0.1.0] - 2026-02-16
### 🚀 Adicionado
* **Persistência de Dados:** Primeiros testes funcionais utilizando banco de dados físico.
* **Hospedagem:** Implantação e hospedagem da aplicação na plataforma **Render** para assegurar a conectividade do banco de dados na nuvem.

## [0.0.4] - 2026-02-06
### 🚀 Adicionado
* **Branding:** Nova variação de logotipo desenhada exclusivamente para resoluções de Computador (PC).

### 🔧 Arrumado
* **Estilização:** Correções incrementais no CSS.

## [0.0.3] - 2026-01-27
### 🚀 Adicionado
* **Interatividade:** O ecossistema JavaScript é oficialmente integrado como o motor lógico principal do projeto.
* **Assets:** Novos recursos e artes gráficas inseridos para dar suporte ao layout.

### 🔄 Modificado
* **Dark Mode:** Nova atualização e refinamento visual na inversão de cores.

## [0.0.2] - 2026-01-22
### 🚀 Adicionado
* **Dark Mode:** Adicionado o botão alternador de Modo Escuro nas telas do sistema (com exceção da página Introduction).
* **Responsividade:** Escrita dos primeiros blocos de teste de Media Query para telas menores.
* **Assets:** Adicionados pacotes de logotipos vetoriais contendo as principais bandeiras de cartão de crédito do mercado para uso no checkout.

### 🔧 Arrumado
* **Estilização:** Correções e limpezas aplicadas nas folhas de estilo CSS.

## [0.0.1] - 2025-12-31
### 🚀 Adicionado
* **Estrutura Inicial:** Arquitetura das páginas base do projeto (Introduction, Dashboard, Carteira Digital, Histórico Geral, Histórico de Recarga e Recarga).
* **Identidade Visual:** Criação dos arquivos iniciais de Background, design do logotipo oficial e favicon para o navegador.