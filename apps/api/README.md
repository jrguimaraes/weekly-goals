# Weekly Goals — API

Módulo backend da aplicação **Weekly Goals**, desenvolvido com [NestJS](https://nestjs.com/) (TypeScript) e [Prisma ORM](https://www.prisma.io/) sobre banco relacional PostgreSQL.

---

## 🛠️ Tecnologias & Bibliotecas

- **Framework:** NestJS 12
- **Linguagem:** TypeScript
- **ORM:** Prisma 6
- **Banco de Dados:** PostgreSQL 16
- **Validação de Entrada:** `class-validator` / `class-transformer`
- **Documentação de API:** OpenAPI / Swagger
- **Testes:** Vitest + Supertest

---

## 🚀 Como Executar

### 1. Configurar Variáveis de Ambiente
Copie o arquivo de exemplo e ajuste se necessário:
```bash
cp .env.example .env
```

### 2. Executar Migrations do Prisma
```bash
pnpm exec prisma migrate deploy
```

### 3. Iniciar Servidor de Desenvolvimento
```bash
pnpm start:dev
```
A API iniciará por padrão na porta `3000`:
- Base URL: `http://localhost:3000/api`
- Swagger UI: `http://localhost:3000/api/docs`
- Healthcheck: `http://localhost:3000/api/health`

---

## 🧪 Testes

```bash
# Testes unitários e de integração
pnpm test

# Testes com cobertura
pnpm test:cov

# Testes end-to-end
pnpm test:e2e
```

---

## 📦 Estrutura de Módulos

- `src/categories/`: CRUD e arquivamento de categorias de metas.
- `src/weeks/`: Ciclo de vida semanal (`DRAFT` → `ACTIVE` → `CLOSED`).
- `src/goals/`: Criação, atualização de metas e controle de progresso.
- `src/metrics/`: Cálculos determinísticos de progresso e taxas de conclusão.
- `src/reports/`: Consulta de relatórios congelados no encerramento.
- `src/health/`: Indicador de status da API e conexão com banco.
