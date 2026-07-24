"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  ChevronDown,
  CircleAlert,
  Copy,
  ExternalLink,
  Gauge,
  Home,
  Info,
  ListFilter,
  LogOut,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Wallet,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import WalletCoinbase from "@web3icons/react/icons/wallets/WalletCoinbase";
import WalletMetamask from "@web3icons/react/icons/wallets/WalletMetamask";
import WalletRabby from "@web3icons/react/icons/wallets/WalletRabby";
import WalletRainbow from "@web3icons/react/icons/wallets/WalletRainbow";
import WalletWalletConnect from "@web3icons/react/icons/wallets/WalletWalletConnect";
import { useEffect, useRef, useState } from "react";
import type { Address } from "viem";
import { FALLBACK_OPPORTUNITIES, FALLBACK_SNAPSHOT_AT, type OpportunityResponse, type YieldOpportunity } from "../lib/opportunities";
import { robinhoodMainnet } from "../lib/robinhood";
import { readUsdgBalance } from "../lib/wallet-data";

type EthereumProvider = {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  on?(event: string, listener: (...args: unknown[]) => void): void;
  removeListener?(event: string, listener: (...args: unknown[]) => void): void;
};

type WalletOption = {
  info: { uuid: string; name: string; rdns: string };
  provider: EthereumProvider;
};

type SupportedWalletId = "rabby" | "metamask" | "coinbase" | "rainbow" | "wallet-connect";

const walletCatalog = [
  {
    id: "rabby",
    name: "Rabby Wallet",
    description: "Transaction simulation and clear signing previews",
    installUrl: "https://rabby.io/",
    patterns: ["io.rabby", "rabby"],
    Icon: WalletRabby,
  },
  {
    id: "metamask",
    name: "MetaMask",
    description: "Connect with the MetaMask browser extension",
    installUrl: "https://metamask.io/download/",
    patterns: ["io.metamask", "metamask"],
    Icon: WalletMetamask,
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    description: "Connect with Coinbase Wallet on desktop",
    installUrl: "https://www.coinbase.com/wallet/downloads",
    patterns: ["com.coinbase.wallet", "org.toshi", "coinbase"],
    Icon: WalletCoinbase,
  },
  {
    id: "rainbow",
    name: "Rainbow Wallet",
    description: "Connect with the Rainbow browser extension",
    installUrl: "https://rainbow.me/download",
    patterns: ["me.rainbow", "rainbow"],
    Icon: WalletRainbow,
  },
  {
    id: "wallet-connect",
    name: "WalletConnect",
    description: "Mobile QR connection requires project setup",
    installUrl: "https://walletconnect.com/",
    patterns: ["walletconnect", "wallet connect"],
    Icon: WalletWalletConnect,
  },
] as const satisfies ReadonlyArray<{
  id: SupportedWalletId;
  name: string;
  description: string;
  installUrl: string;
  patterns: readonly string[];
  Icon: React.ComponentType<{ size?: number; variant?: "background" | "branded" | "mono" }>;
}>;

function discoveredWalletProvider(options: WalletOption[], id: SupportedWalletId) {
  const wallet = walletCatalog.find((item) => item.id === id);
  if (!wallet) return undefined;
  return options.find((option) => {
    const identity = `${option.info.rdns} ${option.info.name}`.toLowerCase();
    return wallet.patterns.some((pattern) => identity.includes(pattern));
  })?.provider;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

const navigation = [
  [Home, "Overview"],
  [Search, "Discover"],
  [BarChart3, "Compare"],
  [Wallet, "Portfolio"],
  [Activity, "Activity"],
  [ShieldCheck, "Safety"],
] as const;

type HistoryItem = { title: string; detail: string; time: string };

function Logo({ size = 34 }: { size?: number }) {
  return <span className="app-logo" style={{ width: size, height: size }}><Image src="/roven-mark-v2.png" width={size} height={size} alt="" priority unoptimized /></span>;
}

function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: value >= 1_000_000 ? "compact" : "standard",
    maximumFractionDigits: value >= 1_000_000 ? 1 : 0,
  }).format(value);
}

function snapshotTime(value: string) {
  return `${new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(value))} UTC`;
}

function localScreeningAnswer(question: string, opportunities: YieldOpportunity[]) {
  const text = question.toLowerCase();
  const byApy = [...opportunities].sort((a, b) => b.netApy - a.netApy);
  const byQuality = [...opportunities].sort((a, b) => b.marketQualityScore - a.marketQualityScore);
  const best = byApy[0];
  const strongestData = byQuality[0];
  if (!best || !strongestData) return "No screened USDG opportunity is available right now. Wait for the live source rather than relying on an unverified destination.";
  if (/safe|risk|güven|düşük/.test(text)) {
    return `${strongestData.name} has the strongest Market Quality score (${strongestData.marketQualityScore}/100) in the monitored set. This measures observable market data—not security. Its net APY is ${strongestData.netApy.toFixed(2)}%, TVL is ${money(strongestData.tvlUsd)}, and available liquidity is ${money(strongestData.liquidityUsd)}. Curator, oracle, collateral and smart-contract risks require separate review.`;
  }
  if (/high|best|apy|yüksek|getiri/.test(text)) {
    return `${best.name} currently shows the highest net APY in the monitored Morpho USDG set at ${best.netApy.toFixed(2)}%. Its Market Quality score is ${best.marketQualityScore}/100 and ${best.liquidityRatio.toFixed(1)}% of TVL is currently liquid. This is not an endorsement or security rating.`;
  }
  if (/liquid|withdraw|çek|likid/.test(text)) {
    return `${strongestData.name} reports ${money(strongestData.liquidityUsd)} of available liquidity, equal to ${strongestData.liquidityRatio.toFixed(1)}% of TVL. Withdrawals still depend on real-time vault and underlying market liquidity and are never guaranteed.`;
  }
  if (/1000|1,000|aylık|month/.test(text)) {
    const monthly = 1000 * (best.netApy / 100) / 12;
    return `At the current ${best.netApy.toFixed(2)}% net APY, 1,000 USDG would produce approximately ${monthly.toFixed(2)} USDG over one month if the rate stayed unchanged. APY is variable, so this is an illustration—not a forecast.`;
  }
  return `I found ${opportunities.length} screened Morpho Vault V2 opportunities for canonical USDG. ${strongestData.name} has the strongest observable market data, while ${best.name} has the highest current net APY. Tell me whether you want to compare yield, liquidity or listing status.`;
}

export default function RovenIntelligence() {
  const [active, setActive] = useState("Overview");
  const [address, setAddress] = useState("");
  const [chainId, setChainId] = useState<number | null>(null);
  const [walletError, setWalletError] = useState("");
  const [walletStatus, setWalletStatus] = useState("");
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState<string | null>(null);
  const [walletOptions, setWalletOptions] = useState<WalletOption[]>([]);
  const [walletChooserOpen, setWalletChooserOpen] = useState(false);
  const [activeProvider, setActiveProvider] = useState<EthereumProvider | null>(null);
  const [agentOpen, setAgentOpen] = useState(false);
  const [opportunityData, setOpportunityData] = useState<OpportunityResponse>({
    opportunities: FALLBACK_OPPORTUNITIES,
    fetchedAt: FALLBACK_SNAPSHOT_AT,
    snapshotAt: FALLBACK_SNAPSHOT_AT,
    sourceStatus: "stale",
    methodologyVersion: "2026-07-16.1",
    methodology: "Loading screened opportunity data.",
    dataScope: "Morpho Vault V2 · Robinhood Chain · canonical USDG",
    limitations: [],
  });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>(FALLBACK_OPPORTUNITIES.slice(0, 2).map((item) => item.id));
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const correctNetwork = chainId === robinhoodMainnet.chainId;
  const opportunities = opportunityData.opportunities;

  useEffect(() => {
    fetch("/api/opportunities")
      .then((response) => {
        if (!response.ok) throw new Error("Opportunity API unavailable");
        return response.json();
      })
      .then((data: OpportunityResponse) => {
        setOpportunityData(data);
        setSelected(data.opportunities.slice(0, 2).map((item) => item.id));
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const discovered = new Map<string, WalletOption>();
    const announce = (event: Event) => {
      const detail = (event as CustomEvent<WalletOption>).detail;
      if (!detail?.info?.uuid || !detail.provider) return;
      discovered.set(detail.info.uuid, detail);
      setWalletOptions([...discovered.values()]);
    };
    window.addEventListener("eip6963:announceProvider", announce);
    window.dispatchEvent(new Event("eip6963:requestProvider"));
    return () => window.removeEventListener("eip6963:announceProvider", announce);
  }, []);

  useEffect(() => {
    const provider = activeProvider ?? window.ethereum;
    if (!provider) return;
    provider.request({ method: "eth_chainId" })
      .then((network) => setChainId(Number.parseInt(network as string, 16)))
      .catch(() => undefined);
    if (window.localStorage.getItem("roven.wallet.disconnected") !== "1") {
      provider.request({ method: "eth_accounts" })
        .then((accounts) => setAddress(((accounts as string[]) ?? [])[0] ?? ""))
        .catch(() => undefined);
    }
    const accountsChanged = (...args: unknown[]) => {
      if (window.localStorage.getItem("roven.wallet.disconnected") === "1") return;
      setAddress(((args[0] as string[]) ?? [])[0] ?? "");
      setWalletBalance(null);
      setWalletMenuOpen(false);
    };
    const chainChanged = (...args: unknown[]) => {
      setChainId(Number.parseInt(args[0] as string, 16));
      setWalletBalance(null);
    };
    provider.on?.("accountsChanged", accountsChanged);
    provider.on?.("chainChanged", chainChanged);
    return () => {
      provider.removeListener?.("accountsChanged", accountsChanged);
      provider.removeListener?.("chainChanged", chainChanged);
    };
  }, [activeProvider]);

  useEffect(() => {
    if (!walletChooserOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setWalletChooserOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [walletChooserOpen]);

  useEffect(() => {
    const provider = activeProvider ?? window.ethereum;
    if (!address || !correctNetwork || !provider) return;
    readUsdgBalance(provider, address as Address)
      .then((balance) => setWalletBalance(balance.formatted))
      .catch(() => setWalletBalance(null));
  }, [address, correctNetwork, activeProvider]);

  async function connectWallet(providerOverride?: EthereumProvider) {
    setWalletError("");
    setWalletStatus("");
    const provider = providerOverride ?? activeProvider ?? window.ethereum;
    if (!provider) {
      setWalletError("No supported EVM wallet was detected. Install Rabby, MetaMask, Coinbase Wallet or Rainbow.");
      return;
    }
    try {
      window.localStorage.removeItem("roven.wallet.disconnected");
      const accounts = await provider.request({ method: "eth_requestAccounts" }) as string[];
      const network = await provider.request({ method: "eth_chainId" }) as string;
      setActiveProvider(provider);
      setAddress(accounts[0] ?? "");
      setChainId(Number.parseInt(network, 16));
      setWalletChooserOpen(false);
    } catch {
      setWalletError("Wallet connection was cancelled.");
    }
  }

  async function switchNetwork() {
    const provider = activeProvider ?? window.ethereum;
    if (!provider) return connectWallet(undefined);
    try {
      await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: robinhoodMainnet.chainIdHex }] });
    } catch (error) {
      const code = typeof error === "object" && error && "code" in error ? Number((error as { code: unknown }).code) : null;
      if (code !== 4902) {
        setWalletError("Network switch was cancelled or rejected by the wallet.");
        return;
      }
      try {
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: robinhoodMainnet.chainIdHex,
            chainName: robinhoodMainnet.chainName,
            nativeCurrency: robinhoodMainnet.nativeCurrency,
            rpcUrls: [...robinhoodMainnet.rpcUrls],
            blockExplorerUrls: [...robinhoodMainnet.blockExplorerUrls],
          }],
        });
      } catch {
        setWalletError("Robinhood Chain could not be added to this wallet.");
      }
    }
  }

  async function disconnectWallet() {
    try {
      await (activeProvider ?? window.ethereum)?.request({ method: "wallet_revokePermissions", params: [{ eth_accounts: {} }] });
    } catch {
      // Local disconnection still prevents silent reconnection in Roven.
    }
    window.localStorage.setItem("roven.wallet.disconnected", "1");
    setAddress("");
    setWalletBalance(null);
    setActiveProvider(null);
    setWalletMenuOpen(false);
    setWalletStatus("Wallet disconnected from Roven.");
  }

  function requestWalletConnection() {
    setWalletError("");
    setWalletChooserOpen(true);
  }

  function selectWallet(id: SupportedWalletId) {
    const exactProvider = discoveredWalletProvider(walletOptions, id);
    const fallbackProvider = walletOptions.length === 0 && (id === "rabby" || id === "metamask")
      ? window.ethereum
      : undefined;
    const provider = exactProvider ?? fallbackProvider;
    if (provider) {
      void connectWallet(provider);
      return;
    }
    const wallet = walletCatalog.find((item) => item.id === id);
    if (!wallet) return;
    if (id === "wallet-connect") {
      setWalletError("WalletConnect QR connection needs a Reown Project ID before it can be enabled safely.");
      setWalletChooserOpen(false);
      return;
    }
    window.open(wallet.installUrl, "_blank", "noopener,noreferrer");
    setWalletStatus(`${wallet.name} was not detected. Its official install page was opened.`);
    setWalletChooserOpen(false);
  }

  async function copyWalletAddress() {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setWalletStatus("Address copied.");
  }

  function record(title: string, detail: string) {
    setHistory((items) => [{ title, detail, time: "Just now" }, ...items].slice(0, 8));
  }

  function openOpportunity(opportunity: YieldOpportunity) {
    record("Opened on Morpho", `${opportunity.name} · ${shortAddress(opportunity.id)}`);
    window.open(opportunity.protocolUrl, "_blank", "noopener,noreferrer");
  }

  function verifyOpportunity(opportunity: YieldOpportunity) {
    record("Contract reviewed", `${opportunity.name} · ${shortAddress(opportunity.id)}`);
    window.open(opportunity.explorerUrl, "_blank", "noopener,noreferrer");
  }

  function toggleCompare(id: string) {
    setSelected((items) => {
      if (items.includes(id)) return items.filter((item) => item !== id);
      return [...items.slice(-1), id];
    });
  }

  let panel: React.ReactNode;
  if (active === "Discover") panel = <Discover opportunities={opportunities} loading={loading} selected={selected} onCompare={toggleCompare} onOpen={openOpportunity} onVerify={verifyOpportunity} />;
  else if (active === "Compare") panel = <Compare opportunities={opportunities.filter((item) => selected.includes(item.id))} onDiscover={() => setActive("Discover")} />;
  else if (active === "Portfolio") panel = <Portfolio address={address} balance={walletBalance} correctNetwork={correctNetwork} onConnect={requestWalletConnection} onSwitch={switchNetwork} />;
  else if (active === "Activity") panel = <ActivityPanel history={history} />;
  else if (active === "Safety") panel = <Safety />;
  else panel = <Overview opportunities={opportunities} loading={loading} data={opportunityData} onDiscover={() => setActive("Discover")} onAsk={() => setAgentOpen(true)} onOpen={openOpportunity} onVerify={verifyOpportunity} />;

  return (
    <main className="roven-app intelligence-app">
      <aside className="app-sidebar">
        <div>
          <Link className="app-brand" href="/"><Logo /><strong>Roven<span>Finance</span></strong></Link>
          <div className="app-nav">
            {navigation.map(([Icon, label]) => (
              <button key={label} className={active === label ? "active" : ""} onClick={() => setActive(label)}>
                <Icon size={16} /><span>{label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="app-side-bottom">
          <div className="noncustody-note"><ShieldCheck size={15} /><span><strong>Read-only by design</strong><small>Roven never requests token approval or custody.</small></span></div>
          <div className="network-card"><span><i className={correctNetwork ? "" : "warning"} />Robinhood Chain Mainnet</span><small>Canonical USDG monitoring</small></div>
        </div>
      </aside>

      <section className="app-main">
        <header className="app-topbar">
          <span className="live-source" role="status"><i className={opportunityData.sourceStatus} />{opportunityData.sourceStatus === "live" ? "Live market data" : "Stale snapshot"}<small>Snapshot {snapshotTime(opportunityData.snapshotAt)}</small></span>
          <div className="app-top-actions">
            <button className="agent-button" onClick={() => setAgentOpen(true)}><Sparkles size={14} />Ask Roven</button>
            {address ? (
              <div className="wallet-control">
                <button className="wallet-button connected" onClick={() => setWalletMenuOpen(!walletMenuOpen)}><span><i />{shortAddress(address)}</span><ChevronDown size={13} /></button>
                <AnimatePresence>
                  {walletMenuOpen && (
                    <motion.div className="wallet-menu" initial={{ opacity: 0, y: -5, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: .98 }}>
                      <div className="wallet-menu-head"><span><i />Read-only connection</span><strong>{shortAddress(address)}</strong><small>{correctNetwork ? "Robinhood Chain Mainnet" : `Unsupported network · ${chainId ?? "unknown"}`}</small></div>
                      <div className="wallet-balances single"><div><span>Wallet USDG</span><strong>{walletBalance ? Number(walletBalance).toLocaleString() : "—"}</strong></div></div>
                      {!correctNetwork && <button className="network-switch" onClick={switchNetwork}><RefreshCw size={13} />Switch to Robinhood Chain</button>}
                      <button onClick={copyWalletAddress}><Copy size={13} />Copy address</button>
                      <a href={`${robinhoodMainnet.blockExplorerUrls[0]}/address/${address}`} target="_blank" rel="noreferrer"><ExternalLink size={13} />View on explorer</a>
                      <button className="disconnect-button" onClick={disconnectWallet}><LogOut size={13} />Disconnect</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : <button className="wallet-button" onClick={requestWalletConnection}><Wallet size={14} />Connect wallet</button>}
          </div>
        </header>

        {walletError && <div className="wallet-error" role="alert"><CircleAlert size={14} />{walletError}<button aria-label="Dismiss wallet error" onClick={() => setWalletError("")}><X size={13} /></button></div>}
        {walletStatus && <div className="wallet-status" role="status"><Check size={13} />{walletStatus}<button aria-label="Dismiss wallet status" onClick={() => setWalletStatus("")}><X size={12} /></button></div>}
        <div className="app-content intel-content">{panel}</div>
      </section>

      <AnimatePresence>
        {agentOpen && <AskRoven opportunities={opportunities} onClose={() => setAgentOpen(false)} onRecord={record} />}
        {walletChooserOpen && <motion.div className="wallet-choice-backdrop" role="presentation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => event.target === event.currentTarget && setWalletChooserOpen(false)}>
          <motion.div role="dialog" aria-modal="true" aria-labelledby="wallet-choice-title" aria-describedby="wallet-choice-description" className="wallet-choice" initial={{ opacity: 0, y: 12, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: .98 }} transition={{ duration: .2, ease: "easeOut" }}>
            <header className="wallet-choice-head"><span><strong id="wallet-choice-title">Connect a wallet</strong><small id="wallet-choice-description">Choose an EVM wallet for Robinhood Chain.</small></span><button aria-label="Close wallet chooser" onClick={() => setWalletChooserOpen(false)}><X size={17} /></button></header>
            <section className="wallet-choice-group" aria-labelledby="recommended-wallets"><div className="wallet-group-label"><span id="recommended-wallets">Recommended</span></div>
              {walletCatalog.slice(0, 1).map(({ id, name, description, Icon }) => {
                const detected = Boolean(discoveredWalletProvider(walletOptions, id) ?? (walletOptions.length === 0 && typeof window !== "undefined" ? window.ethereum : undefined));
                return <button className="wallet-choice-row recommended" key={id} autoFocus onClick={() => selectWallet(id)}><span className="wallet-provider-icon"><Icon size={42} variant="background" /></span><span className="wallet-provider-copy"><span><strong>{name}</strong><b>Recommended</b></span><small className={detected ? "detected" : ""}>{detected && <i />}{detected ? "Detected · Ready to connect" : description}</small></span><ArrowRight size={15} /></button>;
              })}
            </section>
            <section className="wallet-choice-group other" aria-labelledby="other-wallets"><div className="wallet-group-label"><span id="other-wallets">Other wallets</span></div>
              {walletCatalog.slice(1).map(({ id, name, description, Icon }) => {
                const detected = Boolean(discoveredWalletProvider(walletOptions, id) ?? (id === "metamask" && walletOptions.length === 0 && typeof window !== "undefined" ? window.ethereum : undefined));
                return <button className={`wallet-choice-row${id === "wallet-connect" ? " setup-required" : ""}`} key={id} onClick={() => selectWallet(id)}><span className="wallet-provider-icon"><Icon size={42} variant="background" /></span><span className="wallet-provider-copy"><span><strong>{name}</strong>{id === "wallet-connect" && <b>Setup required</b>}</span><small className={detected ? "detected" : ""}>{detected && <i />}{detected ? "Detected · Ready to connect" : description}</small></span><ArrowRight size={15} /></button>;
              })}
            </section>
            <footer className="wallet-choice-footer"><ShieldCheck size={15} />Roven never requests access to your private keys.</footer>
          </motion.div>
        </motion.div>}
      </AnimatePresence>
    </main>
  );
}

function Title({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description: string; actions?: React.ReactNode }) {
  return <div className="app-page-title intel-title"><div><span>{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{actions && <div>{actions}</div>}</div>;
}

function Overview({ opportunities, loading, data, onDiscover, onAsk, onOpen, onVerify }: { opportunities: YieldOpportunity[]; loading: boolean; data: OpportunityResponse; onDiscover(): void; onAsk(): void; onOpen(item: YieldOpportunity): void; onVerify(item: YieldOpportunity): void }) {
  const strongestData = [...opportunities].sort((a, b) => b.marketQualityScore - a.marketQualityScore)[0];
  const highest = [...opportunities].sort((a, b) => b.netApy - a.netApy)[0];
  const liquidity = opportunities.reduce((sum, item) => sum + item.liquidityUsd, 0);
  return <>
    <Title eyebrow="Robinhood Chain yield intelligence" title="Know where your money could work." description="Roven screens the monitored Morpho USDG set, normalizes yield and explains observable tradeoffs. You independently verify every destination." actions={<><button className="soft-action" onClick={onAsk}><Sparkles size={13} />Ask Roven</button><button className="solid-action" onClick={onDiscover}>Explore opportunities <ArrowRight size={13} /></button></>} />
    <div className="read-only-banner"><ShieldCheck size={15} /><span><strong>No custody. No approvals. No hidden execution.</strong> Roven reads public data and sends you to Morpho for the matching vault — deposits stay on the protocol, never in Roven.</span></div>
    {data.sourceStatus === "stale" && <div className="stale-data-warning" role="alert"><CircleAlert size={15} /><span><strong>Live source unavailable.</strong> Values below come from the snapshot dated {snapshotTime(data.snapshotAt)}. Do not make a decision without refreshing and independently verifying the contracts.</span></div>}
    <div className="intel-kpis">
      <div><span>Screened opportunities</span><strong>{loading ? "—" : opportunities.length}</strong><small>{data.dataScope}</small></div>
      <div><span>Highest monitored net APY</span><strong>{highest ? `${highest.netApy.toFixed(2)}%` : "—"}</strong><small>Morpho instant net, variable</small></div>
      <div><span>Reported liquidity</span><strong>{money(liquidity)}</strong><small>Across the monitored set</small></div>
      <div><span>Strongest market data</span><strong>{strongestData ? `${strongestData.marketQualityScore}/100` : "—"}</strong><small>Not a security rating</small></div>
    </div>
    {strongestData && <div className="featured-opportunity">
      <div className="featured-copy"><span className="roven-pick"><Sparkles size={12} />Strongest observable data</span><h2>{strongestData.name}</h2><p>The strongest combination of listing status, scale, reported liquidity and APY sanity checks in the monitored set. This is not an endorsement.</p><div className="feature-tags"><span><ShieldCheck size={12} />{strongestData.marketQualityLabel}</span><span><Gauge size={12} />{strongestData.liquidityRatio.toFixed(1)}% liquid</span><span><RefreshCw size={12} />{data.sourceStatus === "live" ? "Live source" : "Stale snapshot"}</span></div><div className="featured-actions"><button className="solid-action" onClick={() => onOpen(strongestData)}>Open on Morpho <ExternalLink size={13} /></button><button className="soft-action" onClick={() => onVerify(strongestData)}>Verify contract <ExternalLink size={13} /></button></div></div>
      <div className="featured-metrics"><div><span>Net APY</span><strong>{strongestData.netApy.toFixed(2)}%</strong></div><div><span>Total deposits</span><strong>{money(strongestData.tvlUsd)}</strong></div><div><span>Reported liquidity</span><strong>{money(strongestData.liquidityUsd)}</strong></div><div><span>Market Quality</span><strong>{strongestData.marketQualityScore}<small>/100</small></strong></div></div>
    </div>}
    <div className="intel-method"><Info size={14} /><span>{data.methodology} Version {data.methodologyVersion}.</span><Link href="/methodology">Full methodology <ArrowRight size={11} /></Link></div>
  </>;
}

function Discover({ opportunities, loading, selected, onCompare, onOpen, onVerify }: { opportunities: YieldOpportunity[]; loading: boolean; selected: string[]; onCompare(id: string): void; onOpen(item: YieldOpportunity): void; onVerify(item: YieldOpportunity): void }) {
  return <>
    <Title eyebrow="Opportunity explorer" title="Compare yield without the noise." description="Every result is canonical USDG on Robinhood Chain and passes Roven’s transparent listing or TVL screen." actions={<button className="soft-action" aria-label="Current filter: USDG, all market quality levels"><ListFilter size={13} />USDG · All quality levels</button>} />
    <div className="opportunity-table">
      <div className="opportunity-head"><span>Opportunity</span><span>Net APY</span><span>TVL</span><span>Liquidity</span><span>Risk</span><span /></div>
      {loading ? <div className="opportunity-loading"><RefreshCw size={16} />Refreshing screened markets…</div> : opportunities.map((item) => (
        <div className="opportunity-row" key={item.id}>
          <div className="opportunity-name"><span className="morpho-symbol">M</span><span><strong>{item.name}</strong><small>{item.protocol} · {item.symbol}{item.listed && <b>Listed</b>}</small></span></div>
          <strong className="apy-cell">{item.netApy.toFixed(2)}%<small>Instant net</small></strong>
          <span>{money(item.tvlUsd)}</span>
          <span>{money(item.liquidityUsd)}<small>{item.liquidityRatio.toFixed(1)}% of TVL</small></span>
          <span className={`risk-pill ${item.marketQualityLabel.startsWith("Strong") ? "lower" : item.marketQualityLabel.startsWith("Standard") ? "moderate" : "elevated"}`}>{item.marketQualityLabel}<small>{item.marketQualityScore}/100 · not security</small></span>
          <div className="row-actions"><button aria-label={`${selected.includes(item.id) ? "Remove" : "Add"} ${item.name} ${selected.includes(item.id) ? "from" : "to"} comparison`} className={selected.includes(item.id) ? "selected" : ""} onClick={() => onCompare(item.id)}>{selected.includes(item.id) ? <Check size={12} /> : "Compare"}</button><button aria-label={`Open ${item.name} on Morpho`} onClick={() => onOpen(item)} title="Open on Morpho"><ExternalLink size={12} /></button><button aria-label={`Verify ${item.name} contract on Blockscout`} onClick={() => onVerify(item)} title="Verify on Blockscout"><ShieldCheck size={12} /></button></div>
        </div>
      ))}
    </div>
    <div className="discovery-disclosure"><CircleAlert size={14} /><p><strong>Screened does not mean verified, approved or safe.</strong><span>Rates are variable. Smart-contract, curator, adapter, underlying market, liquidity, oracle, governance and collateral risks remain outside the Market Quality score. “Open on Morpho” deep-links the exact vault address on Robinhood Chain.</span></p></div>
  </>;
}

function Compare({ opportunities, onDiscover }: { opportunities: YieldOpportunity[]; onDiscover(): void }) {
  if (opportunities.length < 2) return <div className="empty-state"><BarChart3 size={28} /><h2>Select two opportunities</h2><p>Choose two screened vaults in Discover to compare yield, reported liquidity and observable market data.</p><button className="solid-action" onClick={onDiscover}>Open Discover</button></div>;
  const [a, b] = opportunities;
  const rows = [
    ["Net APY", `${a.netApy.toFixed(2)}%`, `${b.netApy.toFixed(2)}%`],
    ["Net APY excl. rewards", `${a.baseApy.toFixed(2)}%`, `${b.baseApy.toFixed(2)}%`],
    ["Total deposits", money(a.tvlUsd), money(b.tvlUsd)],
    ["Available liquidity", money(a.liquidityUsd), money(b.liquidityUsd)],
    ["Liquidity / TVL", `${a.liquidityRatio.toFixed(1)}%`, `${b.liquidityRatio.toFixed(1)}%`],
    ["Market Quality", `${a.marketQualityScore}/100`, `${b.marketQualityScore}/100`],
    ["Morpho listing", a.listed ? "Listed" : "Not listed", b.listed ? "Listed" : "Not listed"],
  ];
  return <>
    <Title eyebrow="Side-by-side comparison" title="See the tradeoff, not just the rate." description="Roven keeps yield, scale, liquidity and listing status visible in one decision surface." />
    <div className="compare-grid"><div className="compare-labels"><span>Metric</span>{rows.map((row) => <p key={row[0]}>{row[0]}</p>)}</div>{[a,b].map((item, index) => <div className={`compare-card ${item.marketQualityScore === Math.max(a.marketQualityScore, b.marketQualityScore) ? "recommended" : ""}`} key={item.id}>{item.marketQualityScore === Math.max(a.marketQualityScore, b.marketQualityScore) && <span className="compare-recommendation"><Sparkles size={10} />Stronger data</span>}<div className="compare-name"><span className="morpho-symbol">M</span><div><strong>{item.name}</strong><small>{item.symbol}</small></div></div>{rows.map((row) => <p key={row[0]}>{row[index + 1]}</p>)}<div className="compare-links"><a href={item.protocolUrl} target="_blank" rel="noreferrer">Open on Morpho <ExternalLink size={12} /></a><a href={item.explorerUrl} target="_blank" rel="noreferrer">Verify contract <ExternalLink size={12} /></a></div></div>)}</div>
  </>;
}

function Portfolio({ address, balance, correctNetwork, onConnect, onSwitch }: { address: string; balance: string | null; correctNetwork: boolean; onConnect(): void; onSwitch(): void }) {
  return <>
    <Title eyebrow="Read-only portfolio" title="Your wallet, simply understood." description="Roven reads public balances without signatures, token approvals or transaction authority." />
    {!address ? <div className="portfolio-connect"><Wallet size={30} /><h2>Connect to view your wallet</h2><p>Connection is read-only. Roven cannot move assets or submit transactions.</p><button className="solid-action" onClick={onConnect}>Connect wallet</button></div> :
      !correctNetwork ? <div className="portfolio-connect"><CircleAlert size={30} /><h2>Switch to Robinhood Chain</h2><p>Your connected wallet is currently on another network.</p><button className="solid-action" onClick={onSwitch}>Switch network</button></div> :
      <div className="portfolio-summary"><div className="portfolio-wallet-card"><span>Canonical USDG balance</span><strong>{balance ? Number(balance).toLocaleString(undefined, { maximumFractionDigits: 2 }) : "—"} <small>USDG</small></strong><p>Wallet {shortAddress(address)}</p></div><div className="portfolio-explainer"><ShieldCheck size={22} /><h2>Read-only connection</h2><p>Roven queried the canonical USDG contract’s public `balanceOf` function. No signature, approval or transaction was requested.</p><a href={`${robinhoodMainnet.blockExplorerUrls[0]}/address/${address}`} target="_blank" rel="noreferrer">Verify on Blockscout <ExternalLink size={12} /></a></div></div>}
  </>;
}

function ActivityPanel({ history }: { history: HistoryItem[] }) {
  return <>
    <Title eyebrow="Your Roven activity" title="Research you can retrace." description="A local record of opportunities you reviewed and comparisons you requested. No financial transactions occur in Roven." />
    <div className="research-history">{history.length ? history.map((item, index) => <div key={`${item.title}-${index}`}><i><Search size={13} /></i><span><strong>{item.title}</strong><small>{item.detail}</small></span><time>{item.time}</time></div>) : <div className="history-empty"><Activity size={24} /><span><strong>No research activity yet</strong><small>Review an opportunity or ask Roven a question to begin.</small></span></div>}</div>
  </>;
}

function Safety() {
  return <>
    <Title eyebrow="Safety model" title="Information, never custody." description="The new Roven model removes smart-contract custody and automation risk from the application itself." />
    <div className="safety-grid">{[
      ["No approvals", "Roven never asks you to approve USDG or any other token."],
      ["No transaction execution", "The application contains no deposit, withdrawal or routing transaction flow."],
      ["Canonical assets", "Only the official Robinhood Chain USDG contract is included."],
      ["Transparent screening", "Small and negative-yield vaults are excluded; unlisted results are explicitly marked."],
      ["Visible methodology", "Market Quality shows the data source, snapshot time and observable factors used. It is not a security score."],
      ["Direct verification", "Every opportunity links to its Blockscout contract and underlying protocol."],
    ].map(([title, text]) => <div key={title}><i><Check size={13} /></i><h2>{title}</h2><p>{text}</p></div>)}</div>
    <div className="risk-warning"><CircleAlert size={19} /><div><strong>Discovery does not remove protocol risk.</strong><p>Opening an external protocol means interacting directly with its smart contracts and terms. Always verify the destination, review the transaction and use only funds you can afford to lose.</p></div></div>
  </>;
}

function AskRoven({ opportunities, onClose, onRecord }: { opportunities: YieldOpportunity[]; onClose(): void; onRecord(title: string, detail: string): void }) {
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<{ role: "user" | "roven"; text: string; sources?: { label: string; url: string }[] }[]>([
    { role: "roven", text: "I compare the monitored Morpho USDG set using net APY, TVL, reported liquidity, listing status and Market Quality. Market Quality is not a security rating. What would you like to compare?" },
  ]);
  useEffect(() => {
    inputRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function ask(question = input) {
    const clean = question.trim();
    if (!clean || pending) return;
    setMessages((items) => [...items, { role: "user", text: clean }]);
    setInput("");
    setPending(true);
    onRecord("Asked Roven", clean);
    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: clean }),
      });
      const payload = await response.json() as { answer?: string; error?: string; code?: string; sources?: { label: string; url: string }[] };
      const answer = response.ok && payload.answer
        ? payload.answer
        : `${localScreeningAnswer(clean, opportunities)}\n\nAI service is not available in this environment, so this response used the local screening rules.`;
      setMessages((items) => [...items, { role: "roven", text: answer, sources: response.ok ? payload.sources : undefined }]);
    } catch {
      setMessages((items) => [...items, { role: "roven", text: `${localScreeningAnswer(clean, opportunities)}\n\nAI service could not be reached, so this response used the local screening rules.` }]);
    } finally {
      setPending(false);
    }
  }
  return <motion.aside role="dialog" aria-modal="true" aria-label="Ask Roven yield research assistant" className="agent-drawer intelligence-agent" initial={{ x: 420 }} animate={{ x: 0 }} exit={{ x: 420 }}>
    <div className="agent-head"><div><Logo size={38} /><span><strong>Ask Roven</strong><small><i />Evidence-based yield research</small></span></div><button aria-label="Close Ask Roven" onClick={onClose}><X size={18} /></button></div>
    <div className="agent-scope"><ShieldCheck size={13} />Answers use the currently screened data set. Roven cannot execute transactions and Market Quality is not a security rating.</div>
    <div className="intel-agent-body" aria-live="polite">{messages.map((message, index) => <div className={message.role === "user" ? "intel-user" : "intel-roven"} key={index}>{message.role === "roven" && <Bot size={13} />}<div><p>{message.text}</p>{message.sources?.length ? <span className="agent-sources">{message.sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}>{source.label}<ExternalLink size={10} /></a>)}</span> : null}</div></div>)}{pending && <div className="intel-roven"><Bot size={13} /><div><p>Reviewing the current evidence…</p></div></div>}</div>
    <div className="agent-quick"><button onClick={() => ask("Which opportunity has the strongest observable market data?")}>Strongest data</button><button onClick={() => ask("What has the highest APY in the monitored set?")}>Highest APY</button><button onClick={() => ask("Estimate one month on 1,000 USDG")}>1,000 USDG example</button></div>
    <div className="agent-input"><input ref={inputRef} maxLength={500} aria-label="Question for Ask Roven" value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => event.key === "Enter" && ask()} placeholder="Ask about yield, liquidity or listing status…" /><button disabled={pending} aria-label="Send question" onClick={() => ask()}><Send size={15} /></button></div>
    <small className="agent-legal">Educational information only. Not financial advice or a guarantee of returns.</small>
  </motion.aside>;
}
