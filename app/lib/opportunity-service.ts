import {
  FALLBACK_OPPORTUNITIES,
  FALLBACK_SNAPSHOT_AT,
  morphoVaultUrl,
  type MarketQualityLabel,
  type OpportunityResponse,
  type YieldOpportunity,
} from "./opportunities";

const USDG = "0x5fc5360d0400a0fd4f2af552add042d716f1d168";
const MORPHO_API = "https://api.morpho.org/graphql";
const METHODOLOGY_VERSION = "2026-07-24.1";
let liveCache: { value: OpportunityResponse; expiresAt: number } | null = null;
const QUERY = `query {
  vaultV2s(first: 100, where: { chainId_in: [4663] }) {
    items {
      address name symbol listed netApy netApyExcludingRewards
      totalAssetsUsd liquidityUsd
      asset { address symbol decimals }
      chain { id network }
    }
  }
}`;

type MorphoVault = {
  address: string;
  name: string;
  symbol: string;
  listed: boolean;
  /** Morpho Instant Net APY (after fees, with rewards) — same field Morpho UI labels Net APY. */
  netApy: number | null;
  netApyExcludingRewards: number | null;
  totalAssetsUsd: number | null;
  liquidityUsd: number | null;
  asset: { address: string; symbol: string; decimals: number };
  chain: { id: number; network: string };
};

const limitations = [
  "Market Quality is a data-screening score, not a security rating or prediction of loss.",
  "The monitored set currently covers Morpho Vault V2 opportunities for canonical USDG only.",
  "Curator, adapter, underlying market, collateral, oracle, governance and smart-contract risks require separate review.",
];

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isMorphoVault(value: unknown): value is MorphoVault {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<MorphoVault>;
  return (
    typeof item.address === "string" &&
    /^0x[a-fA-F0-9]{40}$/.test(item.address) &&
    typeof item.name === "string" &&
    typeof item.symbol === "string" &&
    typeof item.listed === "boolean" &&
    (item.netApy === null || isFiniteNumber(item.netApy)) &&
    (item.netApyExcludingRewards === null || isFiniteNumber(item.netApyExcludingRewards)) &&
    (item.totalAssetsUsd === null || isFiniteNumber(item.totalAssetsUsd)) &&
    (item.liquidityUsd === null || isFiniteNumber(item.liquidityUsd)) &&
    Boolean(item.asset && typeof item.asset.address === "string" && typeof item.asset.symbol === "string") &&
    Boolean(item.chain && item.chain.id === 4663)
  );
}

function quality(vault: MorphoVault) {
  const tvl = Math.max(0, vault.totalAssetsUsd ?? 0);
  const liquidity = Math.max(0, vault.liquidityUsd ?? 0);
  const ratio = tvl > 0 ? liquidity / tvl : 0;
  const apy = (vault.netApy ?? 0) * 100;
  const reasons: string[] = [];
  let score = 10;

  if (vault.listed) {
    score += 30;
    reasons.push("Morpho listed");
  } else {
    reasons.push("Not Morpho listed");
  }
  if (tvl >= 50_000_000) {
    score += 25;
    reasons.push("TVL above $50M");
  } else if (tvl >= 10_000_000) {
    score += 20;
    reasons.push("TVL above $10M");
  }
  if (ratio >= .2) {
    score += 25;
    reasons.push("Liquidity above 20% of TVL");
  } else if (ratio >= .1) {
    score += 15;
    reasons.push("Liquidity above 10% of TVL");
  } else if (ratio >= .05) {
    score += 8;
    reasons.push("Liquidity above 5% of TVL");
  } else {
    reasons.push("Liquidity below 5% of TVL");
  }
  if (apy > 0 && apy < 15) {
    score += 10;
    reasons.push("Positive Morpho instant net APY");
  }

  const normalized = Math.min(score, 100);
  const label: MarketQualityLabel = normalized >= 85 ? "Strong data" : normalized >= 65 ? "Standard data" : "Limited data";
  return { score: normalized, label, reasons };
}

function transform(vault: MorphoVault): YieldOpportunity {
  const tvl = Math.max(0, vault.totalAssetsUsd ?? 0);
  const liquidity = Math.max(0, vault.liquidityUsd ?? 0);
  const marketQuality = quality(vault);
  return {
    id: vault.address,
    protocol: "Morpho",
    name: vault.name || vault.symbol || "Morpho USDG Vault",
    symbol: vault.symbol || "Vault",
    asset: "USDG",
    assetAddress: vault.asset.address,
    netApy: Math.max(0, (vault.netApy ?? 0) * 100),
    baseApy: Math.max(0, (vault.netApyExcludingRewards ?? 0) * 100),
    tvlUsd: tvl,
    liquidityUsd: liquidity,
    liquidityRatio: tvl > 0 ? (liquidity / tvl) * 100 : 0,
    marketQualityScore: marketQuality.score,
    marketQualityLabel: marketQuality.label,
    screeningReasons: marketQuality.reasons,
    listed: vault.listed,
    protocolUrl: morphoVaultUrl(vault.address),
    explorerUrl: `https://robinhoodchain.blockscout.com/address/${vault.address}`,
    source: "Morpho API",
  };
}

function staleResponse(): OpportunityResponse {
  return {
    opportunities: FALLBACK_OPPORTUNITIES,
    fetchedAt: new Date().toISOString(),
    snapshotAt: FALLBACK_SNAPSHOT_AT,
    sourceStatus: "stale",
    methodologyVersion: METHODOLOGY_VERSION,
    methodology: "Canonical USDG only. Morpho-listed vaults or TVL above $10M. Market Quality uses listing status, TVL, available liquidity and APY sanity checks.",
    dataScope: "Morpho Vault V2 · Robinhood Chain · canonical USDG",
    limitations,
  };
}

export async function getOpportunityResponse(): Promise<OpportunityResponse> {
  if (liveCache && liveCache.expiresAt > Date.now()) return liveCache.value;
  try {
    const response = await fetch(MORPHO_API, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ query: QUERY }),
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) throw new Error(`Morpho API ${response.status}`);
    const payload = await response.json() as {
      data?: { vaultV2s?: { items?: unknown[] } };
      errors?: unknown[];
    };
    if (payload.errors?.length) throw new Error("Morpho GraphQL error");
    const items = (payload.data?.vaultV2s?.items ?? []).filter(isMorphoVault);
    const opportunities = items
      .filter((item) =>
        item.asset.address.toLowerCase() === USDG &&
        (item.listed || (item.totalAssetsUsd ?? 0) >= 10_000_000) &&
        (item.netApy ?? 0) > 0
      )
      .map(transform)
      .sort((a, b) => b.marketQualityScore - a.marketQualityScore || b.netApy - a.netApy);
    if (!opportunities.length) throw new Error("No screened opportunities");
    const now = new Date().toISOString();
    const result: OpportunityResponse = {
      opportunities,
      fetchedAt: now,
      snapshotAt: now,
      sourceStatus: "live",
      methodologyVersion: METHODOLOGY_VERSION,
      methodology: "Canonical USDG only. Morpho-listed vaults or TVL above $10M. Market Quality uses listing status, TVL, available liquidity and APY sanity checks.",
      dataScope: "Morpho Vault V2 · Robinhood Chain · canonical USDG",
      limitations,
    };
    liveCache = { value: result, expiresAt: Date.now() + 60_000 };
    return result;
  } catch (error) {
    console.error("Roven market data refresh failed", error instanceof Error ? error.message : "Unknown error");
    return staleResponse();
  }
}
