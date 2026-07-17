import { LegalPage } from "../components/legal-page";

export default function TermsPage() {
  return <LegalPage eyebrow="Terms of use · Effective July 16, 2026" title="Research software, not an investment service." intro="These product terms describe the intended boundaries of Roven. They are a production draft and require review by qualified counsel before public availability.">
    <section><h2>Informational service</h2><p>Roven provides read-only market screening, comparisons and educational explanations. It does not provide individualized investment, legal, tax or accounting advice and does not guarantee returns, liquidity or capital preservation.</p></section>
    <section><h2>No custody or execution</h2><p>Roven does not hold assets, initiate deposits, construct financial transactions or receive token approvals. Any action on an external protocol is initiated by the user directly with that third party.</p></section>
    <section><h2>Third-party protocols</h2><p>Morpho, Robinhood Chain, Blockscout, wallet providers, RPC providers and other linked services are independent third parties. Roven does not control their contracts, interfaces, availability, security or terms.</p></section>
    <section><h2>Risk acceptance</h2><p>Digital assets and DeFi protocols may experience smart-contract failures, oracle errors, bad debt, governance changes, stablecoin depegs, liquidity shortages, loss of access and complete loss of value. Market Quality is not a security rating.</p></section>
    <section><h2>Eligibility and prohibited use</h2><p>Users are responsible for determining whether access is lawful in their jurisdiction and for complying with sanctions, tax and regulatory obligations. Roven must not be used to evade law, sanctions or third-party restrictions.</p></section>
    <section><h2>No warranty</h2><p>The service and data are provided on an “as available” basis. Data may be delayed, incomplete or inaccurate. Users must independently verify contract addresses and transaction details.</p></section>
    <section><h2>Contact</h2><p>Questions may be sent to legal@roven.finance. Public launch remains conditional on jurisdiction-specific legal and compliance review.</p></section>
  </LegalPage>;
}
