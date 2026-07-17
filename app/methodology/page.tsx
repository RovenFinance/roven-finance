import { LegalPage } from "../components/legal-page";

export default function MethodologyPage() {
  return <LegalPage eyebrow="Methodology · Version 2026-07-16.1" title="What Roven measures—and what it does not." intro="Roven is a read-only screening and comparison layer. Its Market Quality score summarizes observable market data; it is not a security rating, audit, endorsement or prediction of loss.">
    <section><h2>Current scope</h2><p>The monitored set currently includes Morpho Vault V2 opportunities on Robinhood Chain using the canonical USDG contract. Roven does not currently claim to cover every yield source or protocol on Robinhood Chain.</p></section>
    <section><h2>Eligibility screen</h2><p>A result must use canonical USDG, report a positive average net APY and either be Morpho-listed or report at least $10 million in TVL. Unlisted opportunities remain visibly marked as unlisted.</p></section>
    <section><h2>Market Quality</h2><p>The score uses Morpho listing status, TVL, reported available liquidity relative to TVL and a basic APY sanity check. These factors describe data depth and market conditions only.</p><ul><li>Morpho listing: up to 30 points</li><li>TVL scale: up to 25 points</li><li>Reported liquidity ratio: up to 25 points</li><li>Canonical asset and APY sanity checks: up to 20 points</li></ul></section>
    <section><h2>Excluded risks</h2><p>The score does not evaluate curator behavior, adapters, underlying markets, collateral quality, oracle design, governance, timelocks, audits, upgradeability, bad debt, legal claims, stablecoin redemption or future smart-contract vulnerabilities.</p></section>
    <section><h2>Data timing</h2><p>APY values are variable rolling averages reported by the source. Every application response includes a snapshot timestamp and source status. If the live source fails, Roven shows an explicitly dated stale snapshot and disables any claim that the data is live.</p></section>
    <section><h2>Independent verification</h2><p>Users should verify the exact vault contract on Robinhood Chain Blockscout, review the underlying protocol documentation and understand every wallet transaction before taking action.</p></section>
  </LegalPage>;
}
