import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

async function worker() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${Math.random()}`);
  const { default: builtWorker } = await import(workerUrl.href);
  return builtWorker;
}

const env = { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } };
const ctx = { waitUntil() {}, passThroughOnException() {} };

async function html(path) {
  const builtWorker = await worker();
  const response = await builtWorker.fetch(new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }), env, ctx);
  assert.equal(response.status, 200);
  return { response, body: await response.text() };
}

test("renders the read-only Roven intelligence landing", async () => {
  const { response, body } = await html("/");
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  assert.match(body, /<title>Roven Finance/);
  assert.match(body, /Find better yield/);
  assert.match(body, /Keep full control/);
  assert.match(body, /No custody/);
  assert.match(body, /No token approvals/);
  assert.match(body, /Market Quality/);
  assert.doesNotMatch(body, /Personal Vault|Your deposit|automatically allocates|Safety score/i);
});

test("serves the Roven mark directly without an image-optimizer dependency", async () => {
  const { body } = await html("/");
  const logo = await stat(new URL("../public/roven-mark-v2.png", import.meta.url));
  assert.ok(logo.size > 10_000);
  assert.match(body, /src="\/roven-mark-v2\.png"/);
  assert.doesNotMatch(body, /_vinext\/image\?url=%2Froven-mark-v2/);
});

test("active source contains no financial transaction construction", async () => {
  const [app, walletData, robinhood, ask] = await Promise.all([
    readFile(new URL("../app/app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/lib/wallet-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/lib/robinhood.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/ask/route.ts", import.meta.url), "utf8"),
  ]);
  assert.match(app, /Ask Roven/);
  assert.match(app, /WalletRabby/);
  assert.match(app, /WalletMetamask/);
  assert.match(app, /WalletCoinbase/);
  assert.match(app, /WalletRainbow/);
  assert.match(app, /WalletWalletConnect/);
  assert.match(app, /Roven never requests access to your private keys/);
  assert.match(app, /wallet_revokePermissions/);
  assert.match(app, /Verify contract/);
  assert.match(walletData, /eth_call/);
  assert.match(robinhood, /4663/);
  assert.match(ask, /OPENAI_API_KEY/);
  assert.match(ask, /gpt-5\.6-luna/);
  assert.match(ask, /Market Quality is a data-screening score/);
  assert.doesNotMatch(`${app}\n${walletData}\n${robinhood}`, /eth_sendTransaction|writeContract|sendDeposit|sendWithdraw|createVault|ROVEN_MAINNET_READY/);
  assert.doesNotMatch(`${app}\n${walletData}\n${robinhood}`, /ArrowLend|testnet/i);
  assert.doesNotMatch(app, /info\.name\.slice\(0, 1\)/);
});

test("opportunity API returns explicit scope, timestamp and limitations", async () => {
  const builtWorker = await worker();
  const response = await builtWorker.fetch(new Request("http://localhost/api/opportunities"), env, ctx);
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.ok(Array.isArray(payload.opportunities));
  assert.ok(payload.opportunities.length >= 1);
  assert.ok(payload.opportunities.every((item) => item.asset === "USDG"));
  assert.ok(payload.opportunities.every((item) => Number.isFinite(item.marketQualityScore)));
  assert.match(payload.dataScope, /Morpho Vault V2/);
  assert.match(payload.snapshotAt, /^\d{4}-\d{2}-\d{2}T/);
  assert.ok(Array.isArray(payload.limitations) && payload.limitations.length >= 3);
  assert.doesNotMatch(JSON.stringify(payload), /riskScore|safety score/i);
});

test("Ask Roven fails closed when the server key is not configured", async () => {
  const builtWorker = await worker();
  const response = await builtWorker.fetch(new Request("http://localhost/api/ask", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ question: "What has the highest APY?" }),
  }), env, ctx);
  assert.equal(response.status, 503);
  const payload = await response.json();
  assert.equal(payload.code, "AI_NOT_CONFIGURED");
});

test("health endpoint reports degraded until deployment secrets are present", async () => {
  const builtWorker = await worker();
  const response = await builtWorker.fetch(new Request("http://localhost/api/health"), env, ctx);
  assert.equal(response.status, 503);
  const payload = await response.json();
  assert.equal(payload.status, "degraded");
  assert.equal(payload.checks.askRoven, "not_configured");
});

test("ships app, methodology, privacy, terms and safety routes", async () => {
  for (const [path, pattern] of [
    ["/app", /Robinhood Chain yield intelligence/],
    ["/methodology", /What Roven measures/],
    ["/privacy", /minimal data footprint/],
    ["/terms", /Research software/],
    ["/security", /Information, never custody/],
  ]) {
    const { body } = await html(path);
    assert.match(body, pattern);
  }
});

test("adds baseline production security headers", async () => {
  const { response } = await html("/");
  assert.match(response.headers.get("content-security-policy") ?? "", /frame-ancestors 'none'/);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-frame-options"), "DENY");
  assert.equal(response.headers.get("referrer-policy"), "strict-origin-when-cross-origin");
  assert.match(response.headers.get("permissions-policy") ?? "", /camera=\(\)/);
});
