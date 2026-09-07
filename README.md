# Weekly Goals

> **Sistema de planejamento, acompanhamento semanal e geração de relatórios consolidados e imutáveis de metas.**

O **Weekly Goals** é uma aplicação completa (monorepo full-stack) projetada para estruturar o ciclo de produtividade pessoal em intervalos estritos de 7 dias. O sistema combina categorização temática, derivação automática de status de metas, indicadores consolidados em tempo real (`Completion Rate` e `Progress Rate`) e um mecanismo ACID de fechamento semanal com persistência de snapshot imutável de relatório.

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
| **Infraestrutura Local**| [Docker Compose](https://www.docker.com/) | Container PostgreSQL 16 Alpine com healthcheck e volume persistente |

---

## 📐 Arquitetura do Software

O projeto adota uma **arquitetura monolítica modular**, dividida em workspaces claros:

```text
weekly-goals/
├── apps/
│   ├── api/                   # Backend NestJS
│   │   ├── prisma/            # Schema do Prisma e migrations SQL
│   │   └── src/
│   │       ├── categories/    # Módulo de gestão de categorias
│   │       ├── weeks/         # Módulo de ciclos semanais (DRAFT, ACTIVE, CLOSED)
│   │       ├── goals/         # Módulo de metas e progresso
│   │       ├── metrics/       # Serviço de domínio para cálculos determinísticos
│   │       ├── reports/       # Consulta e persistência de snapshots
│   │       ├── health/        # Healthcheck e liveness da aplicação
│   │       └── prisma/        # PrismaService com shutdown hooks
│   └── web/                   # Frontend Next.js
│       └── src/
│           ├── app/           # App Router (/, /categories, /weeks, /weeks/[id], /history)
│           ├── components/    # Componentes modulares (dashboard, goals, weeks, reports)
│           ├── services/      # Camada de comunicação com a API REST
│           ├── types/         # Definições de tipagem TypeScript compartilhadas
│           └── lib/           # Utilitários (api-client, date-utils)
└── docker-compose.yml         # Instância local do PostgreSQL
```

### Regras de Negócio e Princípios Centrais
- **Controllers Finos**: Os controllers apenas validam as entradas (via DTOs e `class-validator`) e delegam a lógica para os services. Nenhum controller acessa o Prisma diretamente.
- **Intervalo de 7 dias**: O backend calcula automaticamente `endDate = startDate + 6 dias` com precisão de data e valida se há colisões com semanas existentes.
- **Transições Permitidas**:
  - `DRAFT → ACTIVE`: Somente se nenhuma outra semana estiver com status `ACTIVE`.
  - `ACTIVE → CLOSED`: Executado em transação única (`prisma.$transaction`), congelando o ciclo e gravando o `WeekReport`.
- **Tipos de Metas**:
  - `BINARY`: Meta binária (0 ou 1). Conclusão automática ao atingir 1.
  - `QUANTITY`: Meta numérica com `targetValue > 0`. Atualizações de progresso refletem em status automático (`PENDING` se 0, `IN_PROGRESS` se parcial, `COMPLETED` se atingir a meta).
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
git clone https://github.com/seu-usuario/weekly-goals.git
cd weekly-goals

# Instala todas as dependências do monorepo
pnpm install
```

---

### 3. Iniciar o Banco de Dados PostgreSQL

Suba o container do PostgreSQL em segundo plano:

```bash
pnpm db:up
```

*Para verificar os logs do banco:* `pnpm db:logs`  
*Para encerrar o banco:* `pnpm db:down`

---

### 4. Configurar Variáveis de Ambiente

Crie os arquivos `.env` na API e no Web a partir dos modelos `.env.example`:

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

---

### 5. Executar as Migrations do Banco

Execute as migrations do Prisma para estruturar as tabelas e índices no PostgreSQL:

```bash
pnpm --filter api exec prisma migrate deploy
```

*(Opcional) Para visualizar o banco no Prisma Studio:*
```bash
pnpm --filter api exec prisma studio
```

---

### 6. Iniciar a Aplicação

Em terminais separados (ou utilizando scripts do monorepo):

**Iniciar API (Backend):**
```bash
pnpm start:api
```
> A API estará disponível em: `http://localhost:3000/api`  
> Documentação OpenAPI / Swagger: `http://localhost:3000/api/docs`  
> Healthcheck: `http://localhost:3000/api/health`

**Iniciar Web (Frontend):**
```bash
pnpm start:web
```
> A interface web estará disponível em: `http://localhost:3001` (ou `http://localhost:3000` conforme porta livre)

---

## 🧪 Testes Automatizados & Qualidade de Código

O repositório possui uma suíte abrangente de testes automatizados unitários, de integração e end-to-end com cobertura rigorosa das regras de negócio.

### Executar Testes
```bash
# Executa todos os testes do monorepo (API + Web)
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

A documentação interativa completa com exemplos de payloads pode ser acessada em `/api/docs`.

### Categorias (`/api/categories`)
- `POST /api/categories` — Cadastra nova categoria com validação de unicidade e ordenação.
- `GET /api/categories` — Lista categorias (suporta filtro `?includeInactive=true`).
- `PATCH /api/categories/:id` — Atualiza nome, descrição ou posição.
- `PATCH /api/categories/:id/archive` — Arquiva categoria (`isActive = false`).

### Semanas (`/api/weeks`)
- `POST /api/weeks` — Cria semana em status `DRAFT` com cálculo de 7 dias e checagem de sobreposição.
- `GET /api/weeks` — Lista semanas cadastradas em ordem decrescente (suporta filtro `?status=`).
- `GET /api/weeks/:id` — Retorna detalhes da semana.
- `GET /api/weeks/:id/summary` — Retorna cálculo consolidado em tempo real (`Completion Rate`, `Progress Rate`, métricas por categoria).
- `POST /api/weeks/:id/activate` — Ativa semana em planejamento (`DRAFT → ACTIVE`).
- `POST /api/weeks/:id/close` — Encerra semana ativa, congela metas e gera snapshot atômico (`ACTIVE → CLOSED`).

### Metas (`/api/goals`)
- `POST /api/goals` — Cria meta vinculada a semana e categoria ativas.
- `GET /api/weeks/:id/goals` — Lista metas de uma semana específica.
- `PATCH /api/goals/:id` — Atualiza título, descrição ou categoria da meta.
- `PATCH /api/goals/:id/progress` — Registra progresso com recálculo automático de status e `completedAt`.
- `DELETE /api/goals/:id` — Remove meta (bloqueado se a semana estiver fechada).

### Relatórios (`/api/weeks/:id/report`)
- `GET /api/weeks/:id/report` — Retorna snapshot imutável do relatório consolidado para semanas fechadas.

---

## ⚖️ Decisões Técnicas & Limitações Deliberadas do MVP

Para assegurar foco, entrega ágil e máxima robustez nas funcionalidades essenciais, as seguintes decisões foram adotadas:

1. **Mono-usuário Local**: O MVP foi desenhado para uso individual. Não inclui autenticação JWT, múltiplos usuários ou isolamento multi-tenant.
2. **Monolito Modular vs. Mensageria**: Não foram incluídos corretores de mensageria (RabbitMQ, Kafka) nem cache distribuído (Redis). As transações ACID do PostgreSQL suprem com folga as necessidades de concorrência e integridade do MVP.
3. **Snapshot Imediato**: A consolidação e persistência do relatório ocorrem na mesma transação atômica do endpoint de encerramento (`close`), dispensando workers ou filas em segundo plano.
4. **Tipos de Metas no MVP**: Foco em metas `BINARY` e `QUANTITY`. Metas de limite de teto (`LIMIT`) ou hábitos contínuos (`HABIT`) ficam reservadas para versões futuras.
5. **Relatório em Impressão Nativa**: O formato de exportação de relatórios adota estilos CSS de impressão (`@media print` com layout otimizado para PDF/impressão física), sem acoplar bibliotecas pesadas de geração de PDF no servidor.

---

## 📄 Licença

Este projeto está sob a licença [MIT](./LICENSE).
