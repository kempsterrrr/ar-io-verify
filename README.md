# ar.io Verify

Verify and attest to data stored on Arweave via ar.io gateways.

Produces cryptographic proof of existence, authenticity, and authorship for any Arweave transaction — including ANS-104 bundled data items. Gateway operators sign attestations with their Arweave wallet, creating accountable, verifiable certificates.

## Features

- **Digital signature verification** — RSA-PSS, ED25519, and Ethereum ECDSA via deep hash
- **Independent SHA-256 hash** — downloads and re-hashes raw data
- **ANS-104 binary header parsing** — extracts exact tag bytes for 100% accurate verification
- **Operator attestation** — gateway operator signs results with their Arweave wallet
- **PDF certificates** — downloadable proof documents with full attestation
- **OpenAPI docs** — interactive Swagger UI at `/api-docs/`
- **Parallel pipeline** — HEAD + GraphQL in parallel, 1-3 second verification

## Quick Start

```bash
git clone https://github.com/ar-io/ar-io-verify.git
cd ar-io-verify
pnpm install
pnpm run dev
```

## Deployment

Requires an ar.io gateway running on the same Docker network (`ar-io-network`).

```bash
cd deploy
cp .env.example .env   # edit GATEWAY_URL, SIGNING_KEY_PATH
bash start.sh
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `GATEWAY_URL` | `http://localhost:3000` | ar.io gateway URL |
| `GATEWAY_HOST` | (empty) | Gateway hostname for attestation payload |
| `SIGNING_KEY_PATH` | (empty) | Path to Arweave JWK wallet for signing attestations |
| `PORT` | `4001` | Server port |
| `SQLITE_PATH` | `./data/verify.db` | Cache database path |
| `GATEWAY_TIMEOUT_MS` | `10000` | Gateway request timeout |

### Nginx Configuration

To expose via your domain:

```nginx
location /local/verify/ {
    proxy_pass http://your-server:4001/verify/;
    proxy_set_header Host $host;
    proxy_read_timeout 120s;
}
```

## API

Interactive docs: `/api-docs/`

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/verify` | Verify a transaction |
| `GET` | `/api/v1/verify/:id` | Get cached result |
| `GET` | `/api/v1/verify/tx/:txId` | Get history for a transaction |
| `GET` | `/api/v1/verify/:id/pdf` | Download PDF certificate |
| `GET` | `/api/v1/verify/:id/attestation` | Get attestation for programmatic verification |
| `GET` | `/raw/:txId` | Proxy raw data from gateway |
| `GET` | `/health` | Health check |
| `GET` | `/api-docs/` | Swagger UI |

## Verification Levels

| Level | Name | What it proves |
|-------|------|----------------|
| 3 | Verified | Digital signature confirmed — data is authentic and untampered |
| 2 | Partially Verified | Data fingerprint confirmed, signature could not be checked |
| 1 | Pending | Data found on the network, full verification pending |

## Architecture

```
packages/
  server/    Express API — verification pipeline, PDF certificates, SQLite cache
  web/       React frontend — Vite, Tailwind CSS, served at /verify/
deploy/      Docker Compose + nginx reverse proxy
```

### Verification Pipeline

```
1. HEAD /raw/{txId} + GraphQL    — parallel (~50ms)
2. Determine L1 tx vs data item
3. Download raw data + binary header fetch
4. Deep hash → RSA-PSS/ED25519/ECDSA verify
5. Operator attestation (if signing key configured)
```

### Attestation

When `SIGNING_KEY_PATH` is set, the operator's wallet signs a canonical attestation payload:

```json
{
  "version": 1,
  "txId": "...",
  "dataHash": "...",
  "signatureVerified": true,
  "ownerAddress": "...",
  "blockHeight": 888672,
  "operator": "7p90oVDW...",
  "gateway": "vilenarios.com",
  "attestedAt": "2026-04-08T..."
}
```

Anyone can verify: `SHA-256(payload) → RSA-PSS verify against operator's public key`.

## Testing

```bash
pnpm run test    # 46 tests
```

## Console Integration

The verify feature is also available as a tool in the [ar.io Console](https://github.com/ar-io/ar-io-console) at `/verify`.

## License

AGPL-3.0
