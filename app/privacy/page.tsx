import { LegalPage } from "../components/legal-page";

export default function PrivacyPage() {
  return <LegalPage eyebrow="Privacy notice · Effective July 16, 2026" title="A deliberately minimal data footprint." intro="Roven is designed to provide public-market research without taking custody of assets or requiring an account.">
    <section><h2>Wallet data</h2><p>Wallet connection is optional. When connected, the application reads the public wallet address, current chain ID and canonical USDG balance. Roven does not request seed phrases, private keys, token approvals or transaction authority.</p></section>
    <section><h2>Ask Roven</h2><p>Questions submitted to Ask Roven may be sent to the configured AI service together with the current screened market dataset. Do not include sensitive personal information, private keys, seed phrases or confidential financial information in a question.</p></section>
    <section><h2>Local activity</h2><p>Research activity shown in the current application exists only in memory for the active browser session and is cleared when the page is refreshed. Roven does not currently maintain a user account database.</p></section>
    <section><h2>Infrastructure records</h2><p>Hosting, RPC, market-data and AI providers may process standard technical information such as IP address, request time, user agent and service diagnostics under their own privacy terms.</p></section>
    <section><h2>Contact</h2><p>Privacy questions may be sent to privacy@roven.finance. This notice must be reviewed and localized by qualified counsel before a public launch in any regulated jurisdiction.</p></section>
  </LegalPage>;
}
