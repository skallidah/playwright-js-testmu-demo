const { test, expect } = require('@playwright/test');

test('search LambdaTest on Bing', async ({ page }) => {
  const start = Date.now();

  try {
    // ✅ Direct search URL (avoids flaky homepage)
    await page.goto('https://www.bing.com/search?q=LambdaTest', {
      waitUntil: 'domcontentloaded'
    });

    // Wait for page load
    await page.waitForSelector('body', { timeout: 15000 });
    await page.waitForTimeout(3000);

    const content = await page.content();

    console.log("Bing search page loaded");

    expect(content.toLowerCase()).toContain('lambdatest');

    // ✅ Report pass
    try {
      await page.evaluate(_ => {}, `lambdatest_action: ${JSON.stringify({
        action: 'setTestStatus',
        arguments: { status: 'passed', remark: 'Bing search content contains LambdaTest' }
      })}`);
    } catch {}

    console.log('Bing Duration:', Date.now() - start);

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
