# Roven Finance — Deployment Checklist

## Required configuration

- `NEXT_PUBLIC_SITE_URL=https://roven.finance`
- Dedicated, origin-restricted `NEXT_PUBLIC_ROBINHOOD_RPC_URL`
- Server-only `OPENAI_API_KEY`
- Optional `OPENAI_MODEL` override

Never expose `OPENAI_API_KEY` with a `NEXT_PUBLIC_` prefix.

## Required technical gates

- `npm run test:all`
- `npm audit --omit=dev`
- `/api/health` returns HTTP 200 and `status: "ready"`
- `/api/opportunities` reports `sourceStatus: "live"`
- Ask Roven returns `mode: "ai"` and contract source links
- Security headers are present on HTML and API responses
- Wallet tests pass with Robinhood Wallet, MetaMask and Rabby
- Wrong-network, rejected-connection and rejected-switch flows are tested
- `roven.finance`, HTTPS and social preview metadata are verified

## Required external gates

- Jurisdiction-specific Terms, Privacy and risk language reviewed by counsel
- Sanctions and regional-access policy decided
- Dedicated monitoring and incident alerts configured
- Morpho API and OpenAI API quotas and billing alerts configured
- Dependency and source-control checks enabled in CI
- Production branch protected and deployment rollback rehearsed

The active Roven product is read-only. The archived vault prototype must not be
deployed or reintroduced without a separate threat model and independent audit.
