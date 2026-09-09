# Weekly Goals

> **Sistema de planejamento, acompanhamento semanal e geração de relatórios consolidados e imutáveis de metas.**

O **Weekly Goals** é uma aplicação para planejamento e acompanhamento de metas semanais, com categorias, métricas de progresso, relatórios e histórico.

A ideia surgiu a partir de uma rotina pessoal de planejamento e acompanhamento semanal, com o objetivo de transformar esse processo em uma ferramenta simples e útil para o dia a dia.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia | Descrição |
|---|---|---|
| **Monorepo** | [pnpm Workspaces](https://pnpm.io/) | Gerenciamento de dependências e scripts unificados do repositório |
| **Backend** | [NestJS 12](https://nestjs.com/) • TypeScript | Arquitetura modular em camadas, injeção de dependência e pipes de validação |
| **Persistência** | [PostgreSQL 16](https://www.postgresql.org/) • [Prisma ORM 6](https://www.prisma.io/) | Modelagem relacional, migrations versionadas e transações ACID |
| **Documentação API** | [OpenAPI / Swagger](https://swagger.io/) | Documentação interativa de rotas, esquemas e respostas HTTP |
| **Frontend** | [Next.js 16](https://nextjs.com/) (App Router) • [React 19](https://react.dev/) | Renderização moderna (Server & Client Components) com roteamento de arquivos |
| **Estilização** | [Tailwind CSS v4](https://tailwindcss.com/) | Design responsivo, paleta refinada e suporte nativo a impressão (`@media print`) |
| **Testes** | [Vitest](https://vitest.dev/) • Supertest | Execução ultra-rápida de testes unitários, integração e ponta a ponta |
| **Linters & Qualidade**| [Oxlint](https://oxc.rs/) • ESLint | Validação estática de código no backend e frontend |
| **Infraestrutura** | [Docker Compose](https://www.docker.com/) | Orquestração completa de contêineres: PostgreSQL 16 Alpine, API NestJS e Web Next.js com builds multi-stage |

---

## 📐 Arquitetura do Software

O projeto adota uma **arquitetura monolítica modular**, dividida em workspaces claros:

```text
weekly-goals/
├── apps/
│   ├── api/                   # Backend NestJS (Dockerfile multi-stage)
│   │   ├── prisma/            # Schema do Prisma e migrations SQL
│   │   └── src/
│   │       ├── categories/    # Módulo de gestão de categorias
│   │       ├── weeks/         # Módulo de ciclos semanais (DRAFT, ACTIVE, CLOSED)
│   │       ├── goals/         # Módulo de metas e progresso
│   │       ├── metrics/       # Serviço de domínio para cálculos determinísticos
│   │       ├── reports/       # Consulta e persistência de snapshots
│   │       ├── health/        # Healthcheck e liveness da aplicação
│   │       └── prisma/        # PrismaService com shutdown hooks
│   └── web/                   # Frontend Next.js (Dockerfile multi-stage)
│       └── src/
│           ├── app/           # App Router (/, /categories, /weeks, /weeks/[id], /history)
│           ├── components/    # Componentes modulares (dashboard, goals, weeks, reports)
│           ├── services/      # Camada de comunicação com a API REST
│           ├── types/         # Definições de tipagem TypeScript compartilhadas
│           └── lib/           # Utilitários (api-client, date-utils, goal-utils)
└── docker-compose.yml         # Orquestração completa: PostgreSQL + API + Web
```

### Regras de Negócio e Princípios Centrais
- **Controllers Finos**: Os controllers apenas validam as entradas (via DTOs e `class-validator`) e delegam a lógica para os services. Nenhum controller acessa o Prisma diretamente.
- **Intervalo de 7 dias**: O backend calcula automaticamente `endDate = startDate + 6 dias` com precisão de data e valida se há colisões com semanas existentes.
- **Transições Permitidas**:
  - `DRAFT → ACTIVE`: Somente se nenhuma outra semana estiver com status `ACTIVE`.
  - `ACTIVE → CLOSED`: Executado em transação única (`prisma.$transaction`), congelando o ciclo e gravando o `WeekReport`.
- **Tipos de Metas**:
  - `BINARY`: Meta binária (0 ou 1). Conclusão automática ao atingir 1.
  - `QUANTITY`: Meta numérica com `targetValue > 0`. Atualizações de progresso refletem em status automático (`PENDING` se 0, `IN_PROGRESS` se parcial, `COMPLETED` se atingir a meta, permitindo superação).
- **Snapshot Imutável**: O endpoint `GET /weeks/:id/report` retorna estritamente a versão congelada do relatório consolidado para ciclos fechados.

---

## 🚀 Como Executar o Projeto Localmente

### 1. Pré-requisitos
Certifique-se de possuir instalado em sua máquina:
- [Node.js](https://nodejs.org/) versão **20 LTS** ou superior
- [pnpm](https://pnpm.io/) versão **10** ou superior
- [Docker](https://www.docker.com/) e Docker Compose

---

### 2. Clonar e Instalar Dependências

```bash
git clone https://github.com/jrguimaraes/weekly-goals.git
cd weekly-goals

# Instala todas as dependências do monorepo
pnpm install
```

---

### 3. Execução via Docker Compose (Recomendado)

O projeto possui orquestração completa com Docker Compose para subir toda a aplicação (PostgreSQL + NestJS API + Next.js Web) com um único comando na raiz:

```bash
# Sobe a aplicação completa em segundo plano com build e migrations automáticas
pnpm app:up
```

#### Comandos de Ciclo de Vida da Aplicação:
| Comando | Descrição |
|---|---|
| `pnpm app:up` | Compila e sobe PostgreSQL, API e Web com healthchecks automáticos |
| `pnpm app:status` | Exibe o status de todos os contêineres (`docker compose ps -a`) |
| `pnpm app:logs` | Acompanha os logs unificados de todos os serviços em tempo real |
| `pnpm app:restart` | Reinicia todos os serviços da aplicação |
| `pnpm app:stop` | Pausa a execução dos contêineres sem removê-los |
| `pnpm app:down` | Encerra e remove contêineres e redes (mantendo dados do banco preservados) |

#### Endereços de Acesso:
- **Frontend Web:** `http://localhost:3001`
- **Backend API:** `http://localhost:3000/api`
- **Documentação Swagger:** `http://localhost:3000/api/docs`
- **Healthcheck:** `http://localhost:3000/api/health`

---

### 4. Execução Manual para Desenvolvimento Local (Alternativa)

Caso deseje executar os serviços diretamente no ambiente do host com hot-reload ativo:

#### A. Iniciar o Banco de Dados PostgreSQL
```bash
pnpm db:up
```
*Para acompanhar logs do banco:* `pnpm db:logs`  
*Para pausar o banco:* `pnpm db:down`

#### B. Configurar Variáveis de Ambiente
Crie os arquivos `.env` a partir dos modelos `.env.example`:

**API (`apps/api/.env`):**
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/weekly_goals?schema=public
```

**Web (`apps/web/.env`):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

#### C. Executar Migrations do Banco
```bash
pnpm --filter api exec prisma migrate deploy
```
*(Opcional) Visualizar banco no Prisma Studio:* `pnpm --filter api exec prisma studio`

#### D. Iniciar os Serviços
Em terminais separados:

```bash
# Terminal 1 — Inicia API NestJS em modo de desenvolvimento
pnpm start:api

# Terminal 2 — Inicia Frontend Next.js em modo de desenvolvimento
pnpm start:web
```

---

## 🧪 Testes Automatizados & Qualidade de Código

O repositório possui uma suíte abrangente de testes automatizados unitários, de integração e end-to-end com cobertura rigorosa das regras de negócio.

### Executar Testes
```bash
# Executa todos os testes unitários do monorepo (API + Web)
pnpm test

# Executar apenas testes do backend (NestJS / Vitest)
pnpm test:api

# Executar apenas testes do frontend (Next.js / Vitest)
pnpm test:web

# Executar testes end-to-end (E2E) da API
pnpm test:e2e
```

### Linters & Verificação Estática
```bash
# Executa oxlint na API e eslint no Web
pnpm lint
```

### Build de Produção
```bash
# Compila todos os pacotes do monorepo
pnpm build
```

---

## 📑 Principais Endpoints da API (REST)

A documentação interativa completa com esquemas JSON e exemplos pode ser acessada em `/api/docs`.

### Categorias (`/api/categories`)
- `POST /api/categories` — Cadastra nova categoria com validação de unicidade de nome (*case-insensitive*) e ordenação (`201 Created` ou `409 Conflict` se nome já existir).
- `GET /api/categories` — Lista categorias cadastradas ordenadas por posição e data de criação (suporta filtro `?isActive=true` ou `?isActive=false`).
- `GET /api/categories/:id` — Retorna dados da categoria pelo seu UUID.
- `PATCH /api/categories/:id` — Atualiza nome, descrição, posição ou status ativo (com validação de unicidade de nome, retornando `409 Conflict`).
- `DELETE /api/categories/:id` — Arquiva a categoria via soft delete (`isActive = false`).

### Semanas (`/api/weeks`)
- `POST /api/weeks` — Cria semana em status `DRAFT` com cálculo automático de 7 dias (`endDate = startDate + 6 dias`) e validação de sobreposição com semanas existentes (`409 Conflict`).
- `GET /api/weeks` — Lista semanas cadastradas em ordem decrescente de início (suporta filtro `?status=DRAFT|ACTIVE|CLOSED`).
- `GET /api/weeks/:id` — Retorna detalhes da semana pelo seu UUID.
- `GET /api/weeks/:id/summary` — Retorna cálculo consolidado em tempo real (`Completion Rate`, `Progress Rate` e métricas gerais e por categoria).
- `POST /api/weeks/:id/activate` — Ativa semana em planejamento (`DRAFT → ACTIVE`). Rejeita se já houver outra semana ativa (`409 Conflict`).
- `POST /api/weeks/:id/close` — Encerra semana ativa atomicamente (`ACTIVE → CLOSED`), congela status das metas e persiste o snapshot imutável do relatório.

### Metas (`/api/goals` e `/api/weeks/:weekId/goals`)
- `POST /api/weeks/:weekId/goals` — Cria meta vinculada à semana e categoria informadas (`BINARY` com alvo fixado em 1 ou `QUANTITY` com alvo numérico > 0).
- `GET /api/weeks/:weekId/goals` — Lista metas de uma semana específica (suporta filtros `?categoryId=` e `?status=PENDING|IN_PROGRESS|COMPLETED`).
- `GET /api/goals/:id` — Retorna dados detalhados de uma meta individual pelo seu UUID.
- `PATCH /api/goals/:id` — Edita atributos permitidos da meta (`title`, `description`, `priority`, `targetValue`, `categoryId`). **O tipo `Goal.type` é estritamente imutável após a criação**. Bloqueado se a semana estiver fechada (`409 Conflict`).
- `PATCH /api/goals/:id/progress` — Registra progresso numérico com recálculo automático de status (`PENDING`, `IN_PROGRESS`, `COMPLETED`) e `completedAt`. Bloqueado se a semana estiver fechada (`409 Conflict`).
- `DELETE /api/goals/:id` — Remove meta (bloqueado se a semana estiver fechada com `409 Conflict`).

### Relatórios (`/api/weeks/:id/report`)
- `GET /api/weeks/:id/report` — Retorna o snapshot imutável do relatório consolidado para semanas fechadas (`400 Bad Request` se a semana ainda não foi encerrada).

### Saúde da Aplicação (`/api/health`)
- `GET /api/health` — Retorna status operacional da API e conectividade com o banco de dados PostgreSQL (`200 OK` ou `503 Service Unavailable`).

---

## 🚦 Códigos de Resposta HTTP Padronizados

| Código | Significado | Aplicação no Weekly Goals |
|---|---|---|
| `200 OK` | Sucesso | Consulta de dados ou atualização de recursos existentes executada com êxito. |
| `201 Created` | Criado | Criação de semana, categoria ou meta realizada com sucesso. |
| `400 Bad Request` | Requisição Inválida | Falha de validação nos dados de entrada (DTOs), formato inválido de data ou consulta de relatório em semana aberta. |
| `404 Not Found` | Não Encontrado | Recurso (categoria, semana, meta ou relatório) inexistente para o UUID informado. |
| `409 Conflict` | Conflito de Domínio | Violação de regra de negócio: categoria duplicada, períodos de semana sobrepostos, semana fechada imutável ou tentativa de ativar mais de uma semana ao mesmo tempo. |
| `503 Service Unavailable` | Indisponível | Falha na verificação de saúde ou indisponibilidade de conexão com o banco de dados. |

---

## ⚖️ Decisões Técnicas & Limitações Deliberadas do MVP

Para assegurar foco, entrega ágil e máxima robustez nas funcionalidades essenciais, as seguintes decisões foram adotadas:

1. **Mono-usuário Local**: O MVP foi desenhado para uso individual. Não inclui autenticação JWT, múltiplos usuários ou isolamento multi-tenant.
2. **Monolito Modular vs. Mensageria**: Não foram incluídos corretores de mensageria (RabbitMQ, Kafka) nem cache distribuído (Redis). As transações ACID do PostgreSQL suprem com folga as necessidades de concorrência e integridade do MVP.
3. **Snapshot Imediato**: A consolidação e persistência do relatório ocorrem na mesma transação atômica do endpoint de encerramento (`close`), dispensando workers ou filas em segundo plano.
4. **Tipos de Metas no MVP**: Foco em metas `BINARY` e `QUANTITY`. Metas de limite de teto (`LIMIT`) ou hábitos contínuos (`HABIT`) ficam reservadas para versões futuras.
5. **Relatório em Impressão Nativa**: O formato de exportação de relatórios adota estilos CSS de impressão (`@media print` com layout otimizado para PDF/impressão física), sem acoplar bibliotecas pesadas de geração de PDF no servidor.

---

## 🤖 Desenvolvimento Assistido por IA

Este projeto é desenvolvido com apoio de um agente de IA em um fluxo incremental e supervisionado.

As etapas de desenvolvimento possuem escopo previamente definido. Ao finalizar cada etapa, o agente executa as validações aplicáveis (lint, testes unitários, testes de integração/E2E e compilação) e apresenta um resumo estruturado das alterações realizadas.

Nenhum commit é criado automaticamente. As alterações são revisadas e aprovadas antes de serem registradas no histórico do projeto.

As decisões de produto, arquitetura, regras de negócio e aprovação das implementações permanecem sob constante revisão humana.

---

## 📄 Licença

Este projeto está sob a licença [MIT](./LICENSE).
