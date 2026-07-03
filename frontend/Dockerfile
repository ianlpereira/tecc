# ── base: instala dependências (cached enquanto package*.json não muda) ─────
FROM node:20-alpine AS base

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install --prefer-offline

# ── development ─────────────────────────────────────────────────────────────
FROM base AS development

ENV NODE_ENV=development

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ── builder: gera o dist estático ───────────────────────────────────────────
FROM base AS builder

ARG VITE_API_URL=http://localhost:8000
ENV NODE_ENV=production
ENV VITE_API_URL=$VITE_API_URL

COPY . .

RUN npm run build

# ── production: imagem mínima só com o dist ──────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

RUN npm install -g serve --prefer-offline

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
