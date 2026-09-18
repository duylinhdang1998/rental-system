#!/usr/bin/env node
// Read-only load smoke test against a running API (dev or staging). Never mutates data.
// Usage: node ops/load/smoke-load.mjs --base http://127.0.0.1:3000 --username staff \
//          --password 'StaffDemo!2026' --requests 300 --concurrency 20 --p95 500
// Run the API with raised RATE_LIMIT_* values for a load test; 429s are reported separately.
const DEFAULTS = { base: 'http://127.0.0.1:3000', concurrency: 20, p95: 500, requests: 300 };
const READ_ROUTES = [
  '/api/health',
  '/api/fleet/vehicles',
  '/api/contracts/board',
  '/api/finance/receivables',
];
const PERCENT = 100;

function parseArgs(argv) {
  const options = { ...DEFAULTS };
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index].replace(/^--/, '');
    options[key] = argv[index + 1];
  }
  return {
    ...options,
    concurrency: Number(options.concurrency),
    p95: Number(options.p95),
    requests: Number(options.requests),
  };
}

async function login(base, username, password) {
  const response = await fetch(`${base}/api/auth/login`, {
    body: JSON.stringify({ password, username }),
    headers: { 'content-type': 'application/json' },
    method: 'POST',
  });
  if (!response.ok) throw new Error(`login failed: ${response.status}`);
  return (
    response.headers
      .get('set-cookie')
      ?.split(',')
      .map((part) => part.split(';')[0])
      .join('; ') ?? ''
  );
}

function percentile(values, share) {
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.min(sorted.length - 1, Math.ceil((share / PERCENT) * sorted.length) - 1)] ?? 0;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const cookie = options.username
    ? await login(options.base, options.username, options.password)
    : '';
  const durations = [];
  const statuses = {};
  let next = 0;
  const startedAt = performance.now();
  const worker = async () => {
    while (next < options.requests) {
      const route = READ_ROUTES[next % READ_ROUTES.length];
      next += 1;
      const requestStart = performance.now();
      const response = await fetch(`${options.base}${route}`, {
        headers: cookie ? { cookie } : {},
      });
      durations.push(performance.now() - requestStart);
      statuses[response.status] = (statuses[response.status] ?? 0) + 1;
    }
  };
  await Promise.all(Array.from({ length: options.concurrency }, worker));
  const elapsedSeconds = (performance.now() - startedAt) / 1_000;
  const summary = {
    concurrency: options.concurrency,
    event: 'load.smoke',
    maxMs: Math.round(Math.max(...durations)),
    p50Ms: Math.round(percentile(durations, 50)),
    p95Ms: Math.round(percentile(durations, 95)),
    requests: durations.length,
    requestsPerSecond: Math.round(durations.length / elapsedSeconds),
    statuses,
  };
  const failed = Object.entries(statuses).some(([status]) => Number(status) >= 500);
  summary.ok = !failed && summary.p95Ms <= options.p95;
  process.stdout.write(`${JSON.stringify(summary)}\n`);
  process.exitCode = summary.ok ? 0 : 1;
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
