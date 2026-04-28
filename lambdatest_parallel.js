const { chromium } = require('playwright');
const cp = require('child_process');
const playwrightClientVersion = cp.execSync('npx playwright --version').toString().trim().split(' ')[1];

const BUILD_NAME = 'Customer Demo - Parallel Execution';

const tests = [
  {
    name: 'Google Search',
    run: async (page) => {
      await page.goto('https://www.google.com');
      await page.fill('[name="q"]', 'LambdaTest');
      await page.press('[name="q"]', 'Enter');
      await page.waitForLoadState('networkidle');
      const title = await page.title();
      console.log(`    Google title: ${title}`);
      if (!title.toLowerCase().includes('lambdatest')) {
        throw new Error(`Title validation failed: "${title}"`);
      }
    }
  },
  {
    name: 'Bing Search',
    run: async (page) => {
      await page.goto('https://www.bing.com/search?q=LambdaTest', { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('body', { timeout: 15000 });
      await page.waitForTimeout(3000);
      const content = await page.content();
      if (!content.toLowerCase().includes('lambdatest')) {
        throw new Error('Page content does not contain LambdaTest');
      }
    }
  },
  {
    name: 'DuckDuckGo Search',
    run: async (page) => {
      await page.goto('https://duckduckgo.com');
      await page.fill('[name="q"]', 'LambdaTest');
      await page.press('[name="q"]', 'Enter');
      await page.waitForLoadState('networkidle');
      const title = await page.title();
      console.log(`    DuckDuckGo title: ${title}`);
      if (!title.toLowerCase().includes('lambdatest')) {
        throw new Error(`Title validation failed: "${title}"`);
      }
    }
  },
  {
    name: 'GitHub Search',
    run: async (page) => {
      await page.goto('https://github.com/search?q=LambdaTest', { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('body', { timeout: 15000 });
      await page.waitForTimeout(3000);
      const content = await page.content();
      if (!content.toLowerCase().includes('lambdatest')) {
        throw new Error('Page content does not contain LambdaTest');
      }
    }
  }
];

const capabilities = [
  {
    browserName: 'Chrome',
    browserVersion: 'latest',
    'LT:Options': {
      platform: 'Win10',
      build: BUILD_NAME,
      name: 'Win10 Chrome',
      user: process.env.LT_USERNAME,
      accessKey: process.env.LT_ACCESS_KEY,
      network: true,
      video: true,
      console: true,
      visual: true,
      terminal: true,
      playwrightClientVersion
    }
  },
  {
    browserName: 'MicrosoftEdge',
    browserVersion: 'latest',
    'LT:Options': {
      platform: 'MacOS Big Sur',
      build: BUILD_NAME,
      name: 'Mac Edge',
      user: process.env.LT_USERNAME,
      accessKey: process.env.LT_ACCESS_KEY,
      network: true,
      video: true,
      console: true,
      visual: true,
      terminal: true,
      playwrightClientVersion
    }
  },
  {
    browserName: 'Chrome',
    browserVersion: 'latest',
    'LT:Options': {
      platform: 'MacOS Big Sur',
      build: BUILD_NAME,
      name: 'Mac Chrome',
      user: process.env.LT_USERNAME,
      accessKey: process.env.LT_ACCESS_KEY,
      network: true,
      video: true,
      console: true,
      visual: true,
      terminal: true,
      playwrightClientVersion
    }
  }
];

const runTest = async (testDef, capability) => {
  const label = `[${capability['LT:Options'].name}] ${testDef.name}`;
  console.log(`🚀 Starting: ${label}`);

  let browser;
  let page;

  try {
    browser = await chromium.connect({
      wsEndpoint: `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(JSON.stringify(capability))}`
    });
    page = await browser.newPage();

    await testDef.run(page);

    await page.evaluate(_ => {}, `lambdatest_action: ${JSON.stringify({
      action: 'setTestStatus',
      arguments: { status: 'passed', remark: `${testDef.name} passed` }
    })}`);

    console.log(`✅ Passed: ${label}`);

  } catch (error) {
    console.error(`❌ Failed: ${label} — ${error.message}`);

    if (page) {
      try {
        await page.evaluate(_ => {}, `lambdatest_action: ${JSON.stringify({
          action: 'setTestStatus',
          arguments: { status: 'failed', remark: error.message }
        })}`);
      } catch (_) {}
    }

  } finally {
    if (page) await page.close();
    if (browser) await browser.close();
    console.log(`🏁 Done: ${label}`);
  }
};

(async () => {
  console.log('🚀 Starting parallel tests on LambdaTest Cloud...\n');

  const jobs = [];
  for (const capability of capabilities) {
    for (const testDef of tests) {
      const cap = {
        ...capability,
        'LT:Options': {
          ...capability['LT:Options'],
          name: `${capability['LT:Options'].name} - ${testDef.name}`
        }
      };
      jobs.push(runTest(testDef, cap));
    }
  }

  await Promise.all(jobs);

  console.log('\n🎉 All tests finished!');
})();
