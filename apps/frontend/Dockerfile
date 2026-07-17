# Build context must be the repo root (npm workspaces monorepo):
#   docker build -f apps/frontend/Dockerfile --build-arg NEXT_PUBLIC_API_URL=http://localhost:3001/api .
FROM node:20-slim AS build
WORKDIR /app
# NEXT_PUBLIC_* vars are baked into the client bundle at build time
ARG NEXT_PUBLIC_API_URL=http://localhost:3001/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY package.json package-lock.json tsconfig.base.json ./
COPY apps/frontend/package.json apps/frontend/
RUN npm ci --workspace apps/frontend
COPY apps/frontend apps/frontend
RUN npm --workspace apps/frontend run build

FROM node:20-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/apps/frontend/.next/standalone ./
COPY --from=build /app/apps/frontend/.next/static apps/frontend/.next/static
EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0
CMD ["node", "apps/frontend/server.js"]
