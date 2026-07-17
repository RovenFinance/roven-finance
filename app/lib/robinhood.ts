export const robinhoodMainnet = {
  chainId: 4663,
  chainIdHex: "0x1237",
  chainName: "Robinhood Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: [process.env.NEXT_PUBLIC_ROBINHOOD_RPC_URL ?? "https://rpc.mainnet.chain.robinhood.com"],
  blockExplorerUrls: ["https://robinhoodchain.blockscout.com"],
} as const;
