const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    console.log('Navigating to http://localhost:5174/admin ...');
    await page.goto('http://localhost:5174/admin', { waitUntil: 'networkidle2', timeout: 30000 });

    // Take screenshot of login modal
    const loginModalPath = path.resolve('C:/Users/Lenovo/.gemini/antigravity/brain/a65f0578-4a47-4a84-8743-3af3312bebbb/verified_admin_login_modal.png');
    await page.screenshot({ path: loginModalPath });
    console.log('Saved login modal screenshot:', loginModalPath);

    // Look for username input and password input
    const userInput = await page.$('input[placeholder="ayushprajapati9669@gmail.com"]');
    const passInput = await page.$('input[type="password"]');

    if (!passInput) {
      throw new Error('Password input not found on /admin page!');
    }

    console.log('Typing password "Ayush7162@" ...');
    await passInput.type('Ayush7162@');

    // Click submit button
    console.log('Clicking "Sign In to Admin CMS" button ...');
    const submitBtn = await page.$('button[type="submit"]');
    await submitBtn.click();

    // Wait for the admin interface to appear
    console.log('Waiting for admin dashboard to load ...');
    await page.waitForSelector('.admin-workspace, .admin-sidebar, .glass-card-admin, h1', { timeout: 15000 });

    // Wait 2 seconds for any GSAP animations to settle
    await new Promise(r => setTimeout(r, 2000));

    // Verify session
    const bodyText = await page.evaluate(() => document.body.innerText);
    const isAuthenticated = bodyText.includes('Admin Management Studio') ||
                            bodyText.includes('Deploy & Showcase') ||
                            bodyText.includes('Overview') ||
                            bodyText.includes('Sign Out') ||
                            bodyText.includes('Super Admin');

    console.log('Is authenticated in DOM:', isAuthenticated);

    const successScreenshot = path.resolve('C:/Users/Lenovo/.gemini/antigravity/brain/a65f0578-4a47-4a84-8743-3af3312bebbb/verified_admin_login_success.png');
    await page.screenshot({ path: successScreenshot });
    console.log('Saved success screenshot:', successScreenshot);

    if (isAuthenticated) {
      console.log('SUCCESS: Admin UI successfully logged in with password "Ayush7162@"!');
    } else {
      console.error('FAILED: Admin UI did not transition to authenticated state.');
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('Puppeteer test error:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();

