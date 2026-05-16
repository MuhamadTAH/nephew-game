const { chromium } = require('playwright');

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`CONSOLE ERROR: ${msg.text()}`);
    }
  });
  page.on('pageerror', err => {
    errors.push(`PAGE ERROR: ${err.message}`);
  });
  page.on('requestfailed', req => {
    errors.push(`FAILED REQUEST: ${req.url()} - ${req.failure()?.errorText}`);
  });

  console.log('Opening http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });

  console.log('Page loaded. Waiting for page to settle...');
  await page.waitForTimeout(2000);

  console.log('Looking for "New Player" button...');
  const registerBtn = page.locator('#register-btn');
  const btnCount = await registerBtn.count();
  console.log(`Found ${btnCount} register button(s)`);

  if (btnCount === 0) {
    errors.push('REGISTER BUTTON NOT FOUND');
  } else {
    console.log('Clicking "New Player"...');
    await registerBtn.click();
    await page.waitForTimeout(3000);

    const url = page.url();
    console.log(`URL after click: ${url}`);

    const content = await page.content();
    const hasDashboard = content.includes('dashboard-section') && content.includes('hidden');
    console.log(`Dashboard visible: ${hasDashboard}`);
  }

  await browser.close();

  console.log('\n=== RESULTS ===');
  if (errors.length === 0) {
    console.log('✅ NO ERRORS FOUND');
  } else {
    console.log('❌ ERRORS FOUND:');
    errors.forEach(e => console.log('  - ' + e));
  }

  return errors.length === 0;
}

test().then(success => {
  process.exit(success ? 0 : 1);
}).catch(e => {
  console.error('Test failed:', e.message);
  process.exit(1);
});