export type MarketQualityLabel = "Strong data" | "Standard data" | "Limited data";

export type YieldOpportunity = {
  id: string;
  protocol: "Morpho";
  name: string;
  symbol: string;
  asset: "USDG";
  assetAddress: string;
  netApy: number;
  baseApy: number;
  tvlUsd: number;
  liquidityUsd: number;
  liquidityRatio: number;
  marketQualityScore: number;
  marketQualityLabel: MarketQualityLabel;
  screeningReasons: string[];
  listed: boolean;
  /** Deep link into Morpho app for this vault on Robinhood Chain. */
  protocolUrl: string;
  /** Blockscout contract page for independent verification. */
  explorerUrl: string;
  source: "Morpho API";
};

/** Canonical Morpho Vault V2 page for Robinhood Chain (chainId 4663). */
export function morphoVaultUrl(address: string): string {
  // Morpho app uses chainIdentifier "robinhood-chain" (not "robinhood").
  return `https://app.morpho.org/robinhood-chain/vault/${address}`;
}

export type OpportunityResponse = {
  opportunities: YieldOpportunity[];
  fetchedAt: string;
  snapshotAt: string;
  sourceStatus: "live" | "stale";
  methodologyVersion: string;
  methodology: string;
  dataScope: string;
  limitations: string[];
};

export const FALLBACK_SNAPSHOT_AT = "2026-07-16T13:09:07.331Z";

export const FALLBACK_OPPORTUNITIES: YieldOpportunity[] = [
  {
    id: "0xBeEff033F34C046626B8D0A041844C5d1A5409dd",
    protocol: "Morpho",
    name: "Steakhouse USDG",
    symbol: "steakUSDG",
    asset: "USDG",
    assetAddress: "0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168",
    netApy: 2.92,
    baseApy: 2.92,
    tvlUsd: 96_639_661,
    liquidityUsd: 19_875_860,
    liquidityRatio: 20.57,
    marketQualityScore: 100,
    marketQualityLabel: "Strong data",
    screeningReasons: ["Morpho listed", "TVL above $50M", "Liquidity above 20% of TVL", "Positive 6h average net APY"],
    listed: true,
    protocolUrl: morphoVaultUrl("0xBeEff033F34C046626B8D0A041844C5d1A5409dd"),
    explorerUrl: "https://robinhoodchain.blockscout.com/address/0xBeEff033F34C046626B8D0A041844C5d1A5409dd",
    source: "Morpho API",
  },
  {
    id: "0xbEeFF0fb1Dc19344A87b8479dAb60A2e16160737",
    protocol: "Morpho",
    name: "Ethena x Steakhouse USDG",
    symbol: "ethenaUSDG",
    asset: "USDG",
    assetAddress: "0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168",
    netApy: 3.18,
    baseApy: 3.18,
    tvlUsd: 50_100_511,
    liquidityUsd: 9_867_919,
    liquidityRatio: 19.7,
    marketQualityScore: 70,
    marketQualityLabel: "Standard data",
    screeningReasons: ["Not Morpho listed", "TVL above $50M", "Liquidity above 10% of TVL", "Positive 6h average net APY"],
    listed: false,
    protocolUrl: morphoVaultUrl("0xbEeFF0fb1Dc19344A87b8479dAb60A2e16160737"),
    explorerUrl: "https://robinhoodchain.blockscout.com/address/0xbEeFF0fb1Dc19344A87b8479dAb60A2e16160737",
    source: "Morpho API",
  },
];
