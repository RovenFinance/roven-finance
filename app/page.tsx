"use client";

import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Check, ChevronDown, CircleAlert, ExternalLink, Gauge, Menu, Search, ShieldCheck, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { FALLBACK_OPPORTUNITIES, type OpportunityResponse, type YieldOpportunity } from "./lib/opportunities";

function RovenMark({ size = 36 }: { size?: number }) {
  return <span className="roven-logo" style={{ width: size, height: size }} role="img" aria-label="Roven Finance"><Image src="/roven-mark-v2.png" width={size} height={size} alt="" priority unoptimized /></span>;
}

function compactMoney(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export default function Home() {
  const [markets, setMarkets] = useState<YieldOpportunity[]>(FALLBACK_OPPORTUNITIES);
  const [sourceStatus, setSourceStatus] = useState<OpportunityResponse["sourceStatus"]>("stale");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/opportunities")
      .then((response) => {
        if (!response.ok) throw new Error("Opportunity API unavailable");
        return response.json();
      })
      .then((data: OpportunityResponse) => {
        setMarkets(data.opportunities);
        setSourceStatus(data.sourceStatus);
      })
      .catch(() => undefined);
  }, []);

  return <main className="roven-landing">
    <header className="topbar">
      <a className="wordmark" href="#top"><RovenMark /><strong>Roven<span>Finance</span></strong></a>
      <nav className={menuOpen ? "open" : ""} aria-label="Primary navigation">
        <a href="#how">How it works</a>
        <a href="#markets">Opportunities</a>
        <a href="#method">Methodology</a>
        <a href="/security">Safety</a>
        <a href="#about">About</a>
      </nav>
      <div className="top-actions">
        <span className="chain"><i />Robinhood Chain <ChevronDown size={13} /></span>
        <button className="launch" onClick={() => window.location.assign("/app")}>Open Roven <ArrowRight size={15} /></button>
        <button className="mobile-menu" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={19} /> : <Menu size={19} />}</button>
      </div>
    </header>

    <section id="top" className="roven-intel-hero">
      <motion.div className="intel-hero-copy" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5 }}>
        <div className="eyebrow"><i />Yield intelligence for Robinhood Chain</div>
        <h1>Find better yield.<br /><em>Keep full control.</em></h1>
        <p>Roven screens the monitored Morpho USDG set across APY, liquidity and observable market quality—then explains the tradeoff before you verify any destination.</p>
        <div className="hero-buttons">
          <button className="launch hero-launch" onClick={() => window.location.assign("/app")}>Explore opportunities <ArrowRight size={16} /></button>
          <button className="outline" onClick={() => document.querySelector("#how")?.scrollIntoView({ behavior: "smooth" })}>See how Roven works</button>
        </div>
        <div className="assurances">
          <span><ShieldCheck />No custody</span>
          <span><ShieldCheck />No token approvals</span>
          <span>{sourceStatus === "live" ? <ShieldCheck /> : <CircleAlert />}{sourceStatus === "live" ? "Live source data" : "Stale snapshot clearly marked"}</span>
        </div>
      </motion.div>

      <div className="intel-hero-visual" aria-label="Roven opportunity intelligence preview">
        <div className="ambient-orbit" />
        <motion.div className="source-card" animate={{ y: [0, -4, 0] }} transition={{ duration: 4.5, repeat: Infinity }}>
          <span><i />Live data</span><strong>Canonical USDG</strong><small>Robinhood Chain · 4663</small>
        </motion.div>
        <div className="intel-flow-line" />
        <motion.div className="roven-engine-card" animate={{ y: [0, 3, 0] }} transition={{ duration: 5.2, repeat: Infinity }}>
          <RovenMark size={42} /><div><span>Roven Intelligence</span><strong>Yield · Liquidity · Risk</strong><small>Read-only analysis</small></div>
        </motion.div>
        <div className="opportunity-fan">
          {markets.slice(0, 2).map((market, index) => <motion.div className={`mini-market-card m${index + 1}`} key={market.name} whileHover={{ y: -3 }}>
            <span className="morpho-symbol">M</span><div><strong>{market.name}</strong><small>{market.marketQualityLabel}</small></div><b>{market.netApy.toFixed(2)}%<small>Net APY</small></b>
          </motion.div>)}
        </div>
      </div>
    </section>

    <section id="how" className="landing-trust">
      <span>One calm decision surface</span>
      <h2>Roven shows what the headline APY leaves out.</h2>
      <div className="trust-grid">
        <article><Search size={19} /><span>01</span><h3>Discover</h3><p>Monitor screened canonical USDG opportunities from supported public sources.</p></article>
        <article><BarChart3 size={19} /><span>02</span><h3>Compare</h3><p>Normalize net APY, TVL, available liquidity and protocol listing status.</p></article>
        <article><Sparkles size={19} /><span>03</span><h3>Understand</h3><p>Ask Roven for a sourced comparison based on yield, liquidity, listing status and observable data.</p></article>
        <article><ExternalLink size={19} /><span>04</span><h3>Verify</h3><p>Continue directly to the protocol only after reviewing its source and risks.</p></article>
      </div>
    </section>

    <section id="markets" className="landing-markets">
      <div className="landing-section-head"><div><span>Qualified opportunity set</span><h2>Current USDG landscape</h2></div><button onClick={() => window.location.assign("/app")}>Open live explorer <ArrowRight size={14} /></button></div>
      <div className="landing-market-table">
        <div className="landing-market-head"><span>Opportunity</span><span>Net APY</span><span>TVL</span><span>Liquidity</span><span>Market Quality</span></div>
        {markets.map((market) => <div className="landing-market-row" key={market.name}>
          <div><span className="morpho-symbol">M</span><span><strong>{market.name}</strong><small>Morpho · USDG · {market.listed ? "Listed" : "Not listed"}</small></span></div>
          <strong>{market.netApy.toFixed(2)}%</strong><span>{compactMoney(market.tvlUsd)}</span><span>{compactMoney(market.liquidityUsd)}</span>
          <span className={market.marketQualityScore >= 85 ? "safer-score" : "moderate-score"}><Gauge size={12} />{market.marketQualityScore}/100</span>
        </div>)}
      </div>
      <small className="market-footnote">{sourceStatus === "live" ? "Live Morpho API snapshot." : "Stale fallback snapshot."} Rates are variable. Market Quality is not a security rating.</small>
    </section>

    <section id="method" className="landing-method">
      <div><span>Designed around restraint</span><h2>Useful intelligence without financial authority.</h2><p>Roven’s active product contains no deposit, withdrawal or routing flow. Wallet connection is optional and read-only.</p></div>
      <div className="method-checks">
        {["Canonical USDG only", "No transaction construction", "No token approvals", "Visible screening factors", "Direct Blockscout verification", "External protocol execution only"].map(item => <p key={item}><i><Check size={12} /></i>{item}</p>)}
      </div>
    </section>

    <footer id="about" className="roven-footer">
      <a className="wordmark" href="#top"><RovenMark size={31} /><strong>Roven<span>Finance</span></strong></a>
      <p>Yield intelligence for the Robinhood Chain economy.</p>
      <div><a href="/methodology">Methodology</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/security">Safety</a><a href="https://x.com/rovenfinance" target="_blank" rel="noreferrer">X</a><a href="/app">Open app</a></div>
    </footer>
  </main>;
}
