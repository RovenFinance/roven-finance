# Roven Finance — Active Product Architecture

## Product decision

Roven is a yield discovery and decision-support layer, not an asset manager.
The application reads public market and wallet data, ranks screened
opportunities and explains tradeoffs. It never receives financial authority.

## Active flow

1. Fetch public vault data from a supported protocol source.
2. Restrict results to Robinhood Chain and canonical USDG.
3. Exclude negative-yield and very small results while visibly marking unlisted vaults.
4. Normalize net APY, TVL, available liquidity and listing status.
5. Calculate a transparent Market Quality score that is explicitly not a security rating.
6. Present comparisons and Ask Roven explanations.
7. Link the user to Blockscout and the underlying protocol for independent
   verification and direct execution.

## Trust boundaries

- Wallet connection is optional and read-only.
- The only wallet RPC used for portfolio data is `eth_call`.
- The interface does not construct approvals or financial transactions.
- Ask Roven provides educational comparisons, not guaranteed outcomes.
- Ask Roven runs server-side through the OpenAI Responses API, fails closed
  without its secret and receives only the current screened evidence.
- External protocol contracts retain their own smart-contract, curator,
  collateral, oracle, liquidity and market risks.

## Current sources and assets

- Network: Robinhood Chain mainnet, chain ID `4663`
- Asset: canonical USDG
- Opportunity source: Morpho GraphQL API
- Verification: Robinhood Chain Blockscout
- AI default: `gpt-5.6-luna`, configurable with `OPENAI_MODEL`
