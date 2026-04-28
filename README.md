# Playwright JS Demo with TestMu AI

> A demo project showcasing end-to-end browser automation using Playwright and JavaScript, runnable
> **locally**, on **LambdaTest Browser Cloud**, or at scale on **HyperExecute** — helping teams validate tests
> across environments with ease.

---

## Table of Contents

- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Option 1 — Run Locally](#option-1--run-locally)
- [Option 2 — Run on LambdaTest Browser Cloud](#option-2--run-on-lambdatest-browser-cloud)
- [Option 3 — Run on HyperExecute](#option-3--run-on-hyperexecute)
- [Comparison at a Glance](#comparison-at-a-glance)
- [Why HyperExecute is Superior](#why-hyperexecute-is-superior)

---

## Project Structure

```
playwright-js-testmu-demo/
├── tests/
│   ├── google.spec.js
│   ├── bing.spec.js
│   ├── duckduckgo.spec.js
│   └── github.spec.js
├── lambdatest_parallel.js      # LambdaTest Browser Cloud runner
├── playwright.config.js        # local Playwright config
├── hyperexecute_playwright.yaml
├── package.json
└── README.md
```

---

## Prerequisites

**Node.js 18+** and the following packages:

```bash
npm install
npx playwright install chromium
```

Set your LambdaTest credentials as environment variables (needed for Options 2 and 3):

```bash
export LT_USERNAME="your_lt_username"
export LT_ACCESS_KEY="your_lt_access_key"
```

---

## Option 1 — Run Locally

Run the full test suite directly on your machine using a local browser.

### How it works

`@playwright/test` reads `playwright.config.js`, discovers every `*.spec.js` file
under `tests/`, spins up a local Chromium process, runs the tests in parallel
across workers, and tears everything down when done.

### Example test

```js
// tests/google.spec.js
const { test, expect } = require('@playwright/test');

test('search LambdaTest on Google', async ({ page }) => {
  await page.goto('https://www.google.com');
  await page.fill('[name="q"]', 'LambdaTest');
  await page.press('[name="q"]', 'Enter');
  await page.waitForLoadState('networkidle');

  const title = await page.title();
  expect(title.toLowerCase()).toContain('lambdatest');
});
```

### `playwright.config.js`

```js
module.exports = {
  testDir: './tests',
  timeout: 60000,
  retries: 0,
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure',
  },
  workers: 4,   // run up to 4 tests in parallel locally
};
```

### Run commands

```bash
# Run all tests (headless, 4 workers as configured)
npx playwright test

# Watch the browser during the run
npx playwright test --headed

# Override worker count
npx playwright test --workers=2

# Run a single spec file
npx playwright test tests/google.spec.js

# Open the HTML report after a run
npx playwright show-report
```

### Pros
- **Zero setup cost** — no account or credentials required; works offline.
- **Instant feedback** — edit a test and re-run in seconds with no queue wait.

### Cons
- **Single machine bottleneck** — parallelism is capped by local CPU cores; a large suite still takes a long time.
- **Browser & OS coverage is limited** — you can only test what is installed on your machine (one OS, usually one browser).
- **Not reliable across the team** — environment differences between dev machines cause inconsistent results.

---

## Option 2 — Run on LambdaTest Browser Cloud

Run the same tests on real browsers hosted in LambdaTest's cloud infrastructure — no local browser installation needed beyond the Playwright client.

### How it works

`lambdatest_parallel.js` connects to LambdaTest's CDP endpoint over WebSocket.
The `LT:Options` capability block tells the cloud which OS and browser to
provision. All 4 tests run against all 3 browser/OS combinations simultaneously —
**12 parallel sessions** — and results appear in your LambdaTest dashboard.

### Capabilities configured

| Session | Browser | OS |
|---|---|---|
| Win10 Chrome — Google Search | Chrome latest | Windows 10 |
| Win10 Chrome — Bing Search | Chrome latest | Windows 10 |
| Win10 Chrome — DuckDuckGo Search | Chrome latest | Windows 10 |
| Win10 Chrome — GitHub Search | Chrome latest | Windows 10 |
| Mac Edge — Google Search | Edge latest | macOS Big Sur |
| Mac Edge — Bing Search | Edge latest | macOS Big Sur |
| Mac Edge — DuckDuckGo Search | Edge latest | macOS Big Sur |
| Mac Edge — GitHub Search | Edge latest | macOS Big Sur |
| Mac Chrome — Google Search | Chrome latest | macOS Big Sur |
| Mac Chrome — Bing Search | Chrome latest | macOS Big Sur |
| Mac Chrome — DuckDuckGo Search | Chrome latest | macOS Big Sur |
| Mac Chrome — GitHub Search | Chrome latest | macOS Big Sur |

### `lambdatest_parallel.js` (excerpt)

```js
const { chromium } = require('playwright');
const cp = require('child_process');
const playwrightClientVersion = cp.execSync('npx playwright --version')
  .toString().trim().split(' ')[1];

const capabilities = [
  {
    browserName: 'Chrome', browserVersion: 'latest',
    'LT:Options': {
      platform: 'Win10',
      build: 'Customer Demo - Parallel Execution',
      name: 'Win10 Chrome',
      user: process.env.LT_USERNAME,
      accessKey: process.env.LT_ACCESS_KEY,
      network: true, video: true, console: true, visual: true,
      playwrightClientVersion,
    },
  },
  // Mac Edge, Mac Chrome ...
];

// Each test × each browser/OS = its own cloud session
const runTest = async (testDef, capability) => {
  const browser = await chromium.connect({
    wsEndpoint: `wss://cdp.lambdatest.com/playwright?capabilities=${
      encodeURIComponent(JSON.stringify(capability))}`
  });
  const page = await browser.newPage();
  // ... run assertions, mark pass/fail via lambdatest_action
  await browser.close();
};

// 4 tests × 3 combos = 12 sessions, all in parallel
await Promise.all(jobs);
```

### Run command

```bash
node lambdatest_parallel.js
```

Session recordings, network logs, screenshots, and pass/fail status appear in
your [LambdaTest Automation Dashboard](https://automation.lambdatest.com).

### Pros
- **Real cross-browser & cross-OS coverage** — Chrome, Edge on Windows and macOS without owning those machines.
- **Session recordings & logs out of the box** — every session captures video, network HAR, and screenshots automatically.

### Cons
- **Requires internet & credentials** — cannot run offline; depends on account limits and network latency to the cloud.
- **Parallelism is self-managed** — you write and maintain the `Promise.all` orchestration; there is no built-in test distribution, retry logic, or unified failure reporting.

---

## Option 3 — Run on HyperExecute

Run the full suite on LambdaTest's **HyperExecute** grid — a purpose-built CI/CD
platform that automatically discovers, splits, and distributes your tests across
parallel cloud VMs, with smart retries, dependency caching, and a unified dashboard.

### How it works

HyperExecute reads `hyperexecute_playwright.yaml`, discovers all `*.js` files
under `tests/` dynamically, splits them across `concurrency` VMs, and streams
live results. No manual orchestration code needed — just point it at your tests.

### `hyperexecute_playwright.yaml`

```yaml
version: 0.1
runson: linux
autosplit: true      # HyperExecute auto-distributes tests across VMs
concurrency: 4       # up to 4 parallel VMs

globalTimeout: 90
testSuiteTimeout: 90

pre:
  - npm ci --cache ~/.npm --prefer-offline
  - npx playwright install --with-deps

cacheKey: npm-cache-{{ checksum "package-lock.json" }}
cacheDirectories:
  - ~/.npm
  - node_modules
  - ~/.cache/playwright

testDiscovery:
  type: raw
  mode: dynamic
  command: find ./tests -type f -name "*.js"

testRunnerCommand: npx playwright test $test --reporter=list

jobLabel: ["playwright", "javascript", "testmu", "autosplit"]
```

### Run command

```bash
hyperexecute --user $LT_USERNAME \
             --key  $LT_ACCESS_KEY \
             --config hyperexecute_playwright.yaml
```

Live results stream at [HyperExecute Dashboard](https://hyperexecute.lambdatest.com).

### Pros
- **Fastest total execution time** — tests are split and run in parallel across dedicated VMs automatically.
- **Zero infrastructure management** — HyperExecute handles VM provisioning, npm caching, and teardown.
- **Built-in CI/CD features** — smart retry, flaky test detection, per-scenario video and logs, unified report.

### Cons
- **Requires HyperExecute CLI and account** — one-time setup of the CLI binary and credentials.
- **Slight cold-start on first run** — first run per cache key installs dependencies; subsequent runs use cache.

---

## Comparison at a Glance

| | Local | Browser Cloud | HyperExecute |
|---|:---:|:---:|:---:|
| Cross-browser / OS coverage | ❌ | ✅ | ✅ |
| True parallel execution | Limited | Manual | ✅ Auto |
| Session video & logs | ❌ | ✅ | ✅ |
| CI/CD ready at scale | ❌ | Partial | ✅ |
| Smart retry & flaky detection | ❌ | ❌ | ✅ |
| Dependency caching | ❌ | ❌ | ✅ |
| Zero orchestration code needed | ❌ | ❌ | ✅ |
| **Best for** | Dev iteration | Cross-browser spot checks | Full suite in CI |

> **Recommendation:** start local for fast dev feedback → validate on Browser Cloud
> for cross-browser coverage → run the full suite on HyperExecute in CI for speed,
> reliability, and rich reporting.

---

## Why HyperExecute is Superior

### 1. Speed: Parallel Execution Without the Plumbing

With local execution, tests run sequentially or across however many CPU cores you have. With Browser Cloud, you write and maintain the parallelism yourself (`Promise.all`, managing sessions, handling failures). With HyperExecute, you declare `concurrency: 4` and the platform handles everything else.

```
Local (1 worker):       ████████████████████████  ~4 min
Browser Cloud (manual): ████████░░░░░░░░░░░░░░░░  ~1 min (you wrote it)
HyperExecute (auto):    ████░░░░░░░░░░░░░░░░░░░░  ~1 min (zero code)
```

As your suite grows from 4 tests to 400, HyperExecute scales linearly. Your local machine does not.

---

### 2. Smart Test Distribution with `autosplit`

HyperExecute's `autosplit` mode analyses historical test durations and distributes tests across VMs to minimise the total wall-clock time — not just split them round-robin.

```yaml
autosplit: true
concurrency: 4
```

- Slow tests get their own VM so they don't block fast ones.
- If a VM finishes early it picks up remaining tests automatically.
- No YAML matrix, no manual sharding config, no code changes needed.

---

### 3. Intelligent Caching

Every `npm ci` on a fresh VM normally takes 30–60 seconds. HyperExecute caches `node_modules` and the Playwright browser binaries keyed to your `package-lock.json` checksum. Subsequent runs skip the install entirely.

```yaml
cacheKey: npm-cache-{{ checksum "package-lock.json" }}
cacheDirectories:
  - ~/.npm
  - node_modules
  - ~/.cache/playwright
```

Browser Cloud and local runs repeat the full install on every clean environment.

---

### 4. Native Retry and Flaky Test Handling

Flaky tests are a fact of life in browser automation. HyperExecute detects and re-runs failing scenarios automatically without retrying the entire suite. You get a clear signal: did the test fail consistently, or was it a transient flake?

Browser Cloud gives you raw pass/fail with no retry logic. Local runs need `retries: N` in `playwright.config.js`, which retries on the same machine with the same environment that caused the failure in the first place.

---

### 5. Unified Observability

Every HyperExecute run produces a consolidated report with:

| Artifact | Local | Browser Cloud | HyperExecute |
|---|:---:|:---:|:---:|
| Per-test video recording | ❌ | ✅ | ✅ |
| Network HAR logs | ❌ | ✅ | ✅ |
| Console logs | ❌ | ✅ | ✅ |
| Visual screenshot diff | ❌ | ✅ | ✅ |
| Aggregated suite report | ✅ (HTML) | ❌ (per-session) | ✅ (unified) |
| Build-level trend history | ❌ | ❌ | ✅ |
| Flaky test flagging | ❌ | ❌ | ✅ |

---

### 6. CI/CD Integration in One Command

Plug HyperExecute into any CI system with a single command — no custom Docker images, no browser driver management, no Selenium Grid to maintain:

**GitHub Actions example:**

```yaml
# .github/workflows/playwright.yml
name: Playwright Tests

on: [push, pull_request]

jobs:
  hyperexecute:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Download HyperExecute CLI
        run: |
          curl -O https://downloads.lambdatest.com/hyperexecute/darwin/hyperexecute
          chmod +x hyperexecute

      - name: Run tests on HyperExecute
        env:
          LT_USERNAME: ${{ secrets.LT_USERNAME }}
          LT_ACCESS_KEY: ${{ secrets.LT_ACCESS_KEY }}
        run: |
          ./hyperexecute --user $LT_USERNAME \
                         --key  $LT_ACCESS_KEY \
                         --config hyperexecute_playwright.yaml
```

The equivalent Browser Cloud setup requires maintaining a custom orchestration script, managing session limits, and aggregating results manually.

---

### 7. Real-World Time Savings

Assume a suite of 40 Playwright tests averaging 30 seconds each:

| Approach | Wall-clock time | Engineering overhead |
|---|---|---|
| Local (4 workers) | ~5 min | Zero, but blocks your machine |
| Browser Cloud (manual parallel) | ~2 min | Write & maintain orchestration code |
| HyperExecute (concurrency: 10) | ~2 min | Zero — declare, run, done |
| HyperExecute (concurrency: 40) | ~30 sec | Same zero-code YAML change |

Scaling from 10 to 40 concurrency on HyperExecute is a one-line YAML change.
Scaling Browser Cloud requires rewriting your orchestration script.
Scaling local is not possible beyond your hardware.

---

## Resources

- [Playwright JavaScript Docs](https://playwright.dev/docs/intro)
- [TestMu Playwright Integration](https://www.lambdatest.com/support/docs/playwright-testing/)
- [HyperExecute Docs](https://www.lambdatest.com/support/docs/getting-started-with-hyperexecute/)
- [HyperExecute YAML Reference](https://www.lambdatest.com/support/docs/deep-dive-into-hyperexecute-yaml/)
