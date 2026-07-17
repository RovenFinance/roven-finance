# Roven Finance

Roven is a read-only yield intelligence product for Robinhood Chain. It screens
canonical USDG opportunities in the monitored Morpho Vault V2 set, compares net
APY, TVL, reported liquidity and observable Market Quality, and explains those
tradeoffs through Ask Roven.

## Active product boundary

- No custody or personal vault.
- No deposit, withdrawal or routing transaction flow.
- No ERC-20 token approval requests.
- Optional wallet connection reads only the public USDG balance.
- Users verify and execute directly on the underlying protocol.

## Data

`/api/opportunities` reads Robinhood Chain vault data from the official Morpho
GraphQL API. The first filter is intentionally narrow:

- Robinhood Chain mainnet (`4663`)
- canonical USDG (`0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168`)
- positive net APY
- Morpho-listed vault or at least $10M TVL

An explicitly dated stale snapshot is returned when the live source is unavailable.

## Ask Roven

Ask Roven uses the OpenAI Responses API from the server. The browser never
receives the API key. Answers are constrained to the current screened dataset,
include contract sources and must describe Market Quality as a data-screening
score rather than a security rating. Without `OPENAI_API_KEY`, the endpoint
fails closed and the interface clearly falls back to local screening rules.

## Live product

- Landing: [roven.finance](https://roven.finance/)
- Product: [roven.finance/app](https://roven.finance/app)
- Safety model: [roven.finance/security](https://roven.finance/security)

## Local development

```bash
npm install
npm run dev
```

## Verification

```bash
npm run build
npm run test:all
npm audit --omit=dev
```

`/api/health` returns `ready` only when live market data is available and Ask
Roven has a server-side API key.

## License

The source code is licensed under the
[Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0). See
[`LICENSE`](LICENSE) and [`NOTICE`](NOTICE) for the complete terms and
attributions. The license does not grant permission to use the Roven Finance
name, logos or other brand identifiers except as permitted by the license.
