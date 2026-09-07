# Weekly Goals — Web

Interface web da aplicação **Weekly Goals**, desenvolvida com [Next.js 16](https://nextjs.com/) (App Router), [React 19](https://react.dev/) e [Tailwind CSS v4](https://tailwindcss.com/).

---

## 🛠️ Tecnologias

- **Framework:** Next.js 16 (App Router com Turbopack)
- **Biblioteca de UI:** React 19
- **Estilização:** Tailwind CSS v4
- **Cliente HTTP:** Fetch nativo tipado com tratamento padronizado de erros
- **Testes:** Vitest

---

## 🚀 Como Executar

### 1. Configurar Variáveis de Ambiente
Copie o arquivo de exemplo:
```bash
cp .env.example .env.local
```
Configuração padrão:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 2. Iniciar Servidor de Desenvolvimento
```bash
pnpm dev
```
Acesse a aplicação no navegador em `http://localhost:3001` (ou `http://localhost:3000`).

---

## 🧪 Testes

```bash
# Executar testes dos componentes e serviços
pnpm test
```

---

## 🗺️ Rotas da Aplicação

- `/`: Dashboard da semana ativa com atualização ágil de progresso e indicadores.
- `/categories`: Gestão completa de categorias (criação, edição, arquivamento).
- `/weeks`: Planejamento semanal (criação de semanas em `DRAFT`, ativação de ciclo).
- `/weeks/[id]`: Gestão de metas da semana (adicionar, editar, progredir, encerrar).
- `/weeks/[id]/report`: Visualização do relatório consolidado e imutável (com suporte a impressão `@media print`).
- `/history`: Histórico cronológico de semanas anteriores e consulta a relatórios arquivados.
