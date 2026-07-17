# EduForge AI

An AI tutor for video-based courses. Instructors upload subtitle files (SRT/VTT) for their lectures; students chat with an AI that answers questions **grounded only in that course content** — every answer cites the exact source passage with video timestamps, so students can jump straight to the relevant moment.

Built as a from-scratch RAG (Retrieval-Augmented Generation) pipeline — no LangChain or framework abstractions.

## Features

- **Grounded AI chat** — questions are answered from uploaded course content only, with `[#n]` citations and timestamps; answers stream token-by-token with multi-turn conversation memory
- **Async ingestion pipeline** — uploads are parsed in background workers (Bull/Redis), never blocking the API
- **Semantic windowing** — subtitle cues are merged into ~45-second overlapping windows before embedding, dramatically improving retrieval over cue-level chunks
- **Role-based access** — student / instructor / admin roles enforced by JWT guards; instructors manage their own content, admins manage everything
- **Consistent vector store** — deleting a file removes both its MongoDB chunks and its Pinecone vectors; re-ingestion is idempotent
- **Admin dashboards** — user management (role changes, deletes), content management (re-index, delete), upload monitoring with live job progress

## Architecture

```mermaid
flowchart LR
    subgraph Frontend [Next.js 14]
        UI[Chat UI]
        ADM[Admin / Instructor dashboards]
    end

    subgraph Backend [NestJS API]
        AUTH[Auth JWT + roles]
        UP[Upload controller]
        RAG[RAG service]
    end

    subgraph Workers [Bull queue]
        W[Parse + window + embed]
    end

    UI -->|ask question| RAG
    ADM -->|upload SRT/VTT| UP
    UP -->|enqueue job| W
    W -->|store chunks| M[(MongoDB)]
    W -->|upsert vectors| P[(Pinecone)]
    RAG -->|embed query + top-K search| P
    RAG -->|grounded completion| O[OpenAI GPT-4o-mini]
```

### The RAG flow

**Ingestion** (automatic on upload):

1. Instructor uploads an `.srt`/`.vtt` file → job queued to Redis (API responds immediately)
2. Worker parses the file into timestamped cues, stores them in MongoDB (`subtitle_chunks`)
3. Cues are merged into ~800-char / 45-second **overlapping windows** — single cues are too small to carry semantic signal, windows fix that
4. Windows are embedded with OpenAI `text-embedding-3-small` (batched, 1024 dims) and upserted to Pinecone with text + timestamp metadata

**Query**:

1. Student's question is embedded with the same model
2. Pinecone returns the top-K most similar windows
3. GPT-4o-mini answers using **only** the retrieved context, citing sources as `[#n]`
4. UI renders the answer plus source cards with timestamps

### Design decisions worth noting

- **MongoDB is the source of truth; Pinecone is a rebuildable index.** Chunks live in Mongo (queryable, owned, durable); vectors can always be regenerated from them — enabling embedding-model swaps without re-uploading files.
- **Window vector IDs are drawn from chunk Mongo IDs**, so deleting a file's chunk IDs from Pinecone always removes its window vectors too — no orphaned vectors, no metadata-filter deletes needed.
- **Embeddings are requested at 1024 dimensions** (native shortening supported by `text-embedding-3-small`) to match the Pinecone index dimension.

## Tech stack

**Backend:** NestJS 10 · Mongoose 8 · Bull 4 (Redis) · Passport JWT · OpenAI SDK · Pinecone SDK · Joi env validation · class-validator DTOs · @nestjs/throttler rate limiting

**Frontend:** Next.js 14 (App Router) · React Query 5 · Tailwind CSS · Radix UI (shadcn-style components) · next-themes (dark mode) · sonner

**Infra:** Docker Compose (MongoDB 7, Redis 7) · npm workspaces monorepo

## Getting started

### Prerequisites

- Node.js 20+, Docker Desktop
- OpenAI API key and a Pinecone index (1024 dimensions, cosine) — optional; without them uploads still parse, but AI indexing/chat are disabled

### Local development

```bash
# 1. Install dependencies
npm install

# 2. Start Redis (and MongoDB, unless you run one locally)
docker compose --profile db up -d     # Redis + MongoDB in Docker
# docker compose up -d                # Redis only, if MongoDB is installed locally

# 3. Configure the backend
cp apps/backend/.env.example apps/backend/.env
#    then edit apps/backend/.env — set JWT_SECRET, API keys,
#    and MONGO_URI=mongodb://root:rootpassword@localhost:27017/?authSource=admin

# 4. Run both apps (frontend :3000, backend :3001)
npm run dev
```

To bootstrap an admin account, set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env` before first boot — an admin is seeded automatically if none exists. Public signup always creates `student` accounts; admins promote users from the dashboard.

### Full stack in Docker

```bash
JWT_SECRET=<random-string> OPENAI_API_KEY=... PINECONE_API_KEY=... \
  docker compose --profile full up --build
```

Frontend at `http://localhost:3000`, API at `http://localhost:3001/api`.

## API overview

| Endpoint | Auth | Description |
|---|---|---|
| `POST /api/auth/signup` | public | Register (always as student) |
| `POST /api/auth/login` | public | Login → JWT |
| `GET /api/users/me` | any user | Current profile |
| `GET /api/users` · `PATCH /api/users/:id/role` · `DELETE /api/users/:id` | admin | User management |
| `POST /api/upload/subtitles` | any user | Upload SRT/VTT (≤10 MB) → queued parse + auto-index |
| `GET /api/upload/jobs` | any user | Processing job status |
| `GET /api/upload/chunks` · `DELETE /api/upload/chunks/:fileKey` | owner (admin: all) | Browse / delete parsed content + its vectors |
| `POST /api/rag/ingest` | instructor/admin | Re-index a file's chunks into Pinecone |
| `POST /api/rag/ask/stream` | any user | Ask a question → streamed grounded answer (NDJSON: sources, then token deltas) with chat history |

Global rate limit: 60 requests/minute per IP.

## Project structure

```
apps/
├── backend/              # NestJS API
│   └── src/
│       ├── auth/         # JWT auth, signup/login, admin seeding
│       ├── users/        # User management (admin)
│       ├── upload/       # File upload, SRT/VTT parsers, Bull processor
│       ├── rag/          # Windowing, embeddings, Pinecone, grounded chat
│       ├── content/      # Course/content records (WIP)
│       ├── analytics/    # Usage stats
│       └── common/       # Guards, role decorator, enums
└── frontend/             # Next.js app
    └── src/
        ├── app/          # Routes: chat (/), /admin/*, /instructor/*
        ├── components/   # Chat, upload, dashboards, shadcn-style UI kit
        ├── contexts/     # Auth context (JWT + profile)
        └── lib/          # Typed API client
```

## Roadmap

- [ ] Query logging → real analytics dashboard
- [ ] Link uploads to content records (titles/descriptions instead of filenames)
- [ ] WebSocket gateway for live job updates (currently polling)
