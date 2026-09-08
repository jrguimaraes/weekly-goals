# ---------------------------------------------------------
# Stage 1: Base com Node.js, OpenSSL e pnpm
# ---------------------------------------------------------
FROM node:22-bookworm-slim AS base

RUN apt-get update -y && \
    apt-get install -y --no-install-recommends openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm@12.3.4

WORKDIR /app

# ---------------------------------------------------------
# Stage 2: Dependências e Build da API
# ---------------------------------------------------------
FROM base AS builder

# Copia manifestos de configuração do monorepo e da API
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/api/prisma ./apps/api/prisma/

# Instala dependências do workspace filtrando para a API
RUN pnpm install --frozen-lockfile --filter api...

# Gera o Prisma Client com os engines para o ambiente Linux/Debian
RUN pnpm --filter api prisma:generate

# Copia código-fonte e configurações de compilação da API
COPY apps/api/src ./apps/api/src
COPY apps/api/tsconfig*.json ./apps/api/
COPY apps/api/nest-cli.json ./apps/api/

# Compila a aplicação NestJS
RUN pnpm --filter api build

# Remove dependências de desenvolvimento mantendo apenas runtime e cliente Prisma
RUN pnpm prune --prod

# ---------------------------------------------------------
# Stage 3: Imagem final de execução (Runtime)
# ---------------------------------------------------------
FROM node:22-bookworm-slim AS runner

RUN apt-get update -y && \
    apt-get install -y --no-install-recommends openssl ca-certificates curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Executa com usuário não-root da imagem oficial para maior segurança
USER node

# Copia dependências de produção do monorepo
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/package.json ./package.json
COPY --chown=node:node --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Copia os artefatos compilados, schema e node_modules da API
COPY --chown=node:node --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --chown=node:node --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --chown=node:node --from=builder /app/apps/api/dist ./apps/api/dist
COPY --chown=node:node --from=builder /app/apps/api/prisma ./apps/api/prisma

WORKDIR /app/apps/api

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
