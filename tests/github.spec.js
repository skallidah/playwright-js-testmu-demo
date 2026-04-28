const { test, expect } = require('@playwright/test');

test('search LambdaTest on GitHub', async ({ page }) => {
  const start = Date.now();

  try {
    // ✅ Directly open search results page (most reliable)
    await page.goto('https://github.com/search?q=LambdaTest', {
      waitUntil: 'domcontentloaded'
    });

    // Wait for page to load
    await page.waitForSelector('body', { timeout: 15000 });
    await page.waitForTimeout(3000);

    const content = await page.content();

    console.log("GitHub search page loaded");

    expect(content.toLowerCase()).toContain('lambdatest');

    // ✅ Report pass
    try {
      await page.evaluate(_ => {}, `lambdatest_action: ${JSON.stringify({
        action: 'setTestStatus',
        arguments: { status: 'passed', remark: 'GitHub search content contains LambdaTest' }
      })}`);
    } catch {}

    console.log('GitHub Duration:', Date.now() - start);

  } catch (e) {
    try {
      await page.evaluate(_ => {}, `lambdatest_action: ${JSON.stringify({
        action: 'setTestStatus',
        arguments: { status: 'failed', remark: e.message }
      })}`);
    } catch {}

    throw e;
  }

}, { timeout: 120000 });
