FROM node:20-slim AS base

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

# Development stage
FROM base AS development

ENV NODE_ENV=development

EXPOSE 5173

CMD ["npm", "run", "dev"]

# Build stage
FROM base AS builder

ENV NODE_ENV=production

RUN npm run build

# Production stage
FROM node:20-slim AS production

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
