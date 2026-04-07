# ar.io Verify

Verify and attest to data stored on Arweave via ar.io gateways.

Produces cryptographic proof of existence, authenticity, and authorship for any Arweave transaction — including ANS-104 bundled data items.

## Features

- **RSA-PSS signature verification** — proves data is exactly what the owner signed
- **Independent SHA-256 hash** — downloads and re-hashes raw data
- **ANS-104 binary header parsing** — extracts exact tag bytes for 100% accurate deep hash
- **PDF attestation certificate** — downloadable proof document
- **ar.io branded UI** — React frontend with provenance chain, file comparison, image preview

## Quick Start

```bash
# Clone and install
git clone https://github.com/ar-io/ar-io-verify.git
cd ar-io-verify
pnpm install

# Development
pnpm run dev

# Deploy alongside your ar.io gateway
cd deploy
cp .env.example .env   # edit GATEWAY_URL
bash start.sh
```

## Deployment

Requires an ar.io gateway running on the same Docker network (`ar-io-network`).

```bash
cd deploy
bash start.sh
```

The UI will be available at `http://localhost:4001/verify/`.

To expose via your domain, add to your nginx config:

```nginx
location /local/verify/ {
    proxy_pass http://your-server:4001/verify/;
    proxy_set_header Host $host;
    proxy_read_timeout 120s;
}
```

## Architecture

```
packages/
  server/    Express API — verification pipeline, PDF certificates, SQLite cache
  web/       React frontend — Vite, Tailwind CSS, served at /verify/
deploy/      Docker Compose + nginx reverse proxy
```

## Verification Levels

| Level | Name | What it proves |
|-------|------|----------------|
| 3 | Verified | Digital signature confirmed — data is authentic and untampered |
| 2 | Partially Verified | Data fingerprint confirmed, signature could not be checked |
| 1 | Pending | Data found on the network, full verification pending gateway indexing |

## License

AGPL-3.0
