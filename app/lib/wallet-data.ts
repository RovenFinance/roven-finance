import { decodeFunctionResult, encodeFunctionData, formatUnits, getAddress, type Address } from "viem";

const USDG = getAddress("0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168");
const balanceAbi = [{
  type: "function",
  name: "balanceOf",
  stateMutability: "view",
  inputs: [{ name: "account", type: "address" }],
  outputs: [{ name: "balance", type: "uint256" }],
}] as const;

type Provider = {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
};

export async function readUsdgBalance(provider: Provider, account: Address) {
  const data = encodeFunctionData({ abi: balanceAbi, functionName: "balanceOf", args: [account] });
  const result = await provider.request({
    method: "eth_call",
    params: [{ to: USDG, data }, "latest"],
  }) as `0x${string}`;
  const balance = decodeFunctionResult({ abi: balanceAbi, functionName: "balanceOf", data: result });
  return { raw: balance, formatted: formatUnits(balance, 6) };
}

