# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

ar.io Verify — cryptographic data verification for Arweave. Proves existence, authenticity, and authorship of data stored on the Arweave blockweave via ar.io gateways.

## Commands

```bash
pnpm install                 # Install all dependencies
pnpm run build              # Build server + web
pnpm run dev                # Dev server with hot reload
pnpm run test               # Run tests
pnpm run format             # Format code (run before commit)

# Deploy alongside an ar.io gateway
cd deploy && bash start.sh
```

## Architecture

```
packages/
  server/    Express server: verification pipeline, PDF certificates, SQLite cache
  web/       React 19 + Vite frontend: verification UI (Tailwind CSS, served at /verify/)
deploy/      Standalone Docker Compose deployment
```

**Verification pipeline** (in `packages/server/src/pipeline/orchestrator.ts`):
1. HEAD /raw/ + GraphQL — in parallel (~50ms)
2. Determine L1 tx vs ANS-104 data item
3. Download raw data + fetch binary header
4. RSA-PSS signature verification via deep hash
5. Level 3 (signature) / Level 2 (hash) / Level 1 (existence only)

**Key files:**
- `server/src/utils/crypto.ts` — deep hash, RSA-PSS, Avro tag serialization
- `server/src/utils/ans104-parser.ts` — ANS-104 binary header parser
- `server/src/gateway/client.ts` — gateway API client (HEAD, GET, GraphQL, range requests)

## Critical Notes

1. Run `pnpm run format` before every commit
2. The server's only unique value is **PDF signing** — everything else can run client-side
3. `/tx/` via Envoy always 404s for data items — use GraphQL + /raw/ headers instead
4. Tags from HTTP headers are alphabetical (wrong order) — use GraphQL or binary header for sig verification
