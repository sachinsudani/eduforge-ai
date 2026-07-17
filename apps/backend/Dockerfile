# Build context must be the repo root (npm workspaces monorepo):
#   docker build -f apps/backend/Dockerfile .
FROM node:20-slim AS build
WORKDIR /app
COPY package.json package-lock.json tsconfig.base.json ./
COPY apps/backend/package.json apps/backend/
RUN npm ci --workspace apps/backend
COPY apps/backend apps/backend
RUN npm --workspace apps/backend run build

FROM node:20-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/backend/package.json apps/backend/
RUN npm ci --workspace apps/backend --omit=dev
COPY --from=build /app/apps/backend/dist apps/backend/dist
EXPOSE 3001
CMD ["node", "apps/backend/dist/main.js"]
