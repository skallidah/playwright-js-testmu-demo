const { test, expect } = require('@playwright/test');

test('search LambdaTest on DuckDuckGo', async ({ page }) => {
  const start = Date.now();
  try {
    await page.goto('https://duckduckgo.com');
    await page.fill('[name="q"]', 'LambdaTest');
    await page.press('[name="q"]', 'Enter');
    await page.waitForLoadState('networkidle');

    const title = await page.title();
    console.log('DuckDuckGo Page title:', title);

    expect(title.toLowerCase()).toContain('lambdatest');
    console.log('DuckDuckGo Test Duration (ms):', Date.now() - start);

    // Mark test as passed in HyperExecute dashboard
    await page.evaluate(_ => {}, `lambdatest_action: ${JSON.stringify({
      action: 'setTestStatus',
      arguments: { status: 'passed', remark: 'Title contains LambdaTest' }
    })}`);

  } catch (e) {
    // Mark test as failed in HyperExecute dashboard
    await page.evaluate(_ => {}, `lambdatest_action: ${JSON.stringify({
      action: 'setTestStatus',
      arguments: { status: 'failed', remark: e.message }
    })}`);
    throw e; // rethrow so Playwright also registers the failure
  }
});
