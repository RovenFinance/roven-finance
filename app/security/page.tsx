import { ArrowLeft, Check, CircleAlert, ExternalLink, Eye, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function SecurityPage() {
  return <main className="security-page">
    <header>
      <Link href="/"><span className="security-logo"><Image src="/roven-mark-v2.png" width={34} height={34} alt="" unoptimized /></span><strong>Roven<span>Finance</span></strong></Link>
      <Link href="/app">Open app</Link>
    </header>
    <section className="security-hero">
      <Link href="/app"><ArrowLeft size={13} />Back to Roven</Link>
      <span>Safety model</span>
      <h1>Information, never custody.</h1>
      <p>Roven compares public yield data and explains tradeoffs. It does not hold funds, request token approvals or construct financial transactions.</p>
    </section>
    <section className="security-principles">
      <div><Eye size={22} /><h2>Read-only wallet access</h2><p>Wallet connection is optional and used only to read public balances. No signature is needed to view canonical USDG.</p></div>
      <div><ShieldCheck size={22} /><h2>Transparent screening</h2><p>Roven filters for the official Robinhood Chain USDG asset and clearly distinguishes Morpho-listed and unlisted results.</p></div>
      <div><CircleAlert size={22} /><h2>Limits stay visible</h2><p>APY, TVL, liquidity, listing status, snapshot time and methodology remain visible before any external destination.</p></div>
    </section>
    <section className="launch-gate">
      <div><span>Application boundaries</span><h2>Roven helps you decide. You remain the only executor.</h2></div>
      <div>{[
        "No deposit or withdrawal transaction flow",
        "No ERC-20 approval requests",
        "No private keys or seed phrases",
        "Canonical USDG contract only",
        "Direct protocol and explorer verification",
      ].map(item => <p key={item}><i><Check size={12} /></i>{item}<strong>Enforced</strong></p>)}</div>
    </section>
    <section className="security-disclosure">
      <h2>Discovery does not remove protocol risk.</h2>
      <p>APYs are variable and no return is guaranteed. If you continue to an external protocol, smart-contract, curator, oracle, collateral, liquidity and market risks remain subject to that protocol’s contracts and terms.</p>
      <a href="https://docs.robinhood.com/chain/" target="_blank" rel="noreferrer">Robinhood Chain documentation <ExternalLink size={13} /></a>
    </section>
  </main>;
}
