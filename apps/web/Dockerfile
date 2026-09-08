# ---------------------------------------------------------
# Stage 1: Base com Node.js e pnpm
# ---------------------------------------------------------
FROM node:22-bookworm-slim AS base

RUN npm install -g pnpm@12.3.4

WORKDIR /app

# ---------------------------------------------------------
# Stage 2: Dependências e Build do Next.js
# ---------------------------------------------------------
FROM base AS builder

# Configuração da URL da API acessível pelo navegador
ARG NEXT_PUBLIC_API_URL=http://localhost:3000/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Copia manifestos do workspace e da aplicação web
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/

# Instala dependências do workspace filtrando para a web
RUN pnpm install --frozen-lockfile --filter web...

# Copia código-fonte e configurações de build
COPY apps/web/src ./apps/web/src
COPY apps/web/tsconfig*.json ./apps/web/
COPY apps/web/next.config.ts ./apps/web/
COPY apps/web/postcss.config.mjs ./apps/web/

# Executa o build de produção gerando a saída standalone
RUN pnpm --filter web build

# ---------------------------------------------------------
# Stage 3: Imagem final de execução (Runtime Standalone)
# ---------------------------------------------------------
FROM node:22-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

# Usuário não-root da imagem oficial para segurança
USER node

# Copia a distribuição standalone gerada pelo Next.js
COPY --chown=node:node --from=builder /app/apps/web/.next/standalone ./
COPY --chown=node:node --from=builder /app/apps/web/.next/static ./apps/web/.next/static

WORKDIR /app/apps/web

EXPOSE 3001

CMD ["node", "server.js"]
