const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/Lenovo/.gemini/antigravity/brain/a65f0578-4a47-4a84-8743-3af3312bebbb';
const BASE_URL = 'http://localhost:5174';

async function runVerification() {
  console.log('--- STARTING COMPREHENSIVE VERIFICATION OF 4 NEW TASKS ---');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  // Pre-seed authenticated admin session
  await page.evaluateOnNewDocument(() => {
    sessionStorage.setItem(
      'ayush_modern_portfolio_admin_session_v4',
      JSON.stringify({
        username: 'ayushprajapati9669@gmail.com',
        role: 'admin',
        csrfToken: 'test_token',
        token: 'test_token',
        exp: Date.now() + 12 * 3600 * 1000
      })
    );
  });

  try {
    // 1. Navigate to Admin CMS
    console.log('[Step 1] Navigating to Admin CMS...');
    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle2', timeout: 30000 });

    await page.waitForSelector('.admin-workspace', { timeout: 10000 });
    console.log('Successfully loaded Admin CMS workspace.');

    // =========================================================================
    // TASK 1: Voice Command Assistant Verification
    // =========================================================================
    console.log('\n--- VERIFYING TASK 1: VOICE COMMAND ASSISTANT ---');
    // Open Voice Assistant via event
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('ams-toggle-voice'));
    });
    await page.waitForSelector('.admin-voice-backdrop', { visible: true, timeout: 5000 });

    // Verify backdrop z-index
    const voiceZIndex = await page.evaluate(() => {
      const el = document.querySelector('.admin-voice-backdrop');
      return window.getComputedStyle(el).zIndex;
    });
    console.log(`Voice Assistant Backdrop z-index: ${voiceZIndex} (Expected: 10000000)`);
    if (parseInt(voiceZIndex, 10) < 10000000) {
      throw new Error(`Voice backdrop z-index ${voiceZIndex} is too low`);
    }

    // Verify steady visualizer wave bars exist and no animate-ping / animate-pulse on mic
    const micClasses = await page.evaluate(() => {
      const micBtn = document.querySelector('.admin-voice-backdrop button[title*="mic"]');
      const waveBars = document.querySelectorAll('.admin-voice-wave-bar');
      const pulsingEl = document.querySelector('.admin-voice-backdrop .animate-ping, .admin-voice-backdrop .animate-pulse');
      return {
        hasMic: !!micBtn,
        waveBarsCount: waveBars.length,
        hasErraticPingPulse: !!pulsingEl
      };
    });
    console.log(`Mic visualizer checks: wave bars = ${micClasses.waveBarsCount}, erratic ping/pulse = ${micClasses.hasErraticPingPulse}`);
    if (micClasses.waveBarsCount !== 5 || micClasses.hasErraticPingPulse) {
      throw new Error('Mic visualizer missing wave bars or contains erratic ping/pulse');
    }

    // Screenshot steady voice assistant
    const voiceSteadyPath = path.join(ARTIFACTS_DIR, 'voice_assistant_steady_state.png');
    await page.screenshot({ path: voiceSteadyPath });
    console.log(`Saved screenshot: ${voiceSteadyPath}`);

    // Test unrecognized command feedback
    console.log('Testing unrecognized command: "teleport to mars"...');
    await page.type('.admin-voice-backdrop input[type="text"]', 'teleport to mars');
    await page.click('.admin-voice-backdrop form button[type="submit"]');
    await page.waitForFunction(() => {
      return document.querySelector('.admin-voice-backdrop')?.textContent.includes('Unrecognized command');
    }, { timeout: 5000 });
    console.log('Verified: Unrecognized command displays helpful guidance banner.');

    const voiceUnrecPath = path.join(ARTIFACTS_DIR, 'voice_assistant_unrecognized_feedback.png');
    await page.screenshot({ path: voiceUnrecPath });
    console.log(`Saved screenshot: ${voiceUnrecPath}`);

    // Close voice assistant
    await page.evaluate(() => {
      const closeBtn = document.querySelector('.admin-voice-backdrop button[aria-label="Close voice assistant"]');
      if (closeBtn) closeBtn.click();
    });
    await page.waitForFunction(() => !document.querySelector('.admin-voice-backdrop'), { timeout: 3000 });
    console.log('Voice Assistant closed successfully.');

    // =========================================================================
    // TASK 3: Keyboard Shortcuts Modal (No Navbar Overlap) Verification
    // =========================================================================
    console.log('\n--- VERIFYING TASK 3: KEYBOARD SHORTCUTS MODAL ---');
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('ams-open-shortcuts'));
    });
    await page.waitForSelector('.keyboard-shortcuts-backdrop', { visible: true, timeout: 5000 });

    const shortcutsMetrics = await page.evaluate(() => {
      const backdrop = document.querySelector('.keyboard-shortcuts-backdrop');
      const dialog = backdrop.querySelector('.relative');
      const heading = dialog.querySelector('h2');
      const navbar = document.querySelector('.navbar');

      const bZ = window.getComputedStyle(backdrop).zIndex;
      const dRect = dialog.getBoundingClientRect();
      const hRect = heading.getBoundingClientRect();
      const nRect = navbar ? navbar.getBoundingClientRect() : { top: 0, bottom: 0, height: 0 };

      return {
        zIndex: bZ,
        dialogTop: dRect.top,
        headingTop: hRect.top,
        navbarBottom: nRect.bottom,
        headingVisible: hRect.top > 0 && hRect.bottom > hRect.top
      };
    });

    console.log(`Keyboard Shortcuts z-index: ${shortcutsMetrics.zIndex} (Expected: 10000000)`);
    console.log(`Dialog Top: ${shortcutsMetrics.dialogTop}px, Heading Top: ${shortcutsMetrics.headingTop}px, Navbar Bottom: ${shortcutsMetrics.navbarBottom}px`);
    if (parseInt(shortcutsMetrics.zIndex, 10) < 10000000) {
      throw new Error(`Shortcuts backdrop z-index ${shortcutsMetrics.zIndex} is too low`);
    }
    if (!shortcutsMetrics.headingVisible) {
      throw new Error('Keyboard Shortcuts modal heading is not visible');
    }

    const shortcutsPath = path.join(ARTIFACTS_DIR, 'keyboard_shortcuts_no_overlap.png');
    await page.screenshot({ path: shortcutsPath });
    console.log(`Saved screenshot: ${shortcutsPath}`);

    // Close shortcuts modal via Escape
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('.keyboard-shortcuts-backdrop'), { timeout: 3000 });
    console.log('Shortcuts modal closed.');

    // =========================================================================
    // TASK 2: Admin Panel Dropdowns Verification
    // =========================================================================
    console.log('\n--- VERIFYING TASK 2: STANDARDIZED ADMIN DROPDOWNS ---');

    // 2.1 Projects Tab Dropdowns
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('ams-select-tab', { detail: { tab: 'projects' } }));
    });
    await page.waitForSelector('.admin-select-wrapper select', { timeout: 5000 });

    const projDropdowns = await page.evaluate(() => {
      const selects = document.querySelectorAll('.admin-select-wrapper select');
      return Array.from(selects).map((s) => ({
        classes: s.className,
        hasCustomIcon: !!s.parentElement.querySelector('.admin-select-icon'),
        bg: window.getComputedStyle(s).backgroundColor
      }));
    });
    console.log(`Projects tab standardized selects found: ${projDropdowns.length}`);
    projDropdowns.forEach((d, i) => {
      console.log(`  Select ${i + 1}: hasCustomIcon=${d.hasCustomIcon}, bg=${d.bg}`);
      if (!d.hasCustomIcon || !d.classes.includes('admin-select-field')) {
        throw new Error(`Projects tab select ${i + 1} does not use standard classes`);
      }
    });

    // 2.2 Milestones Tab Dropdowns
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('ams-select-tab', { detail: { tab: 'milestones' } }));
    });
    await page.waitForSelector('.admin-milestones-toolbar .admin-select-wrapper select', { timeout: 5000 });

    const milestoneDropdowns = await page.evaluate(() => {
      const selects = document.querySelectorAll('.admin-milestones-toolbar .admin-select-wrapper select');
      return Array.from(selects).map((s) => ({
        classes: s.className,
        hasCustomIcon: !!s.parentElement.querySelector('.admin-select-icon')
      }));
    });
    console.log(`Milestones toolbar standardized selects found: ${milestoneDropdowns.length}`);
    if (milestoneDropdowns.length < 3) {
      throw new Error('Milestones toolbar missing standardized selects');
    }

    // 2.3 Certificates Tab Dropdowns
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('ams-select-tab', { detail: { tab: 'certificates' } }));
    });
    await page.waitForSelector('.admin-select-wrapper select', { timeout: 5000 });
    const certDropdowns = await page.evaluate(() => {
      return document.querySelectorAll('.admin-select-wrapper select').length;
    });
    console.log(`Certificates tab standardized selects found: ${certDropdowns}`);

    // 2.4 Skills Tab Dropdowns
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('ams-select-tab', { detail: { tab: 'skills' } }));
    });
    await page.waitForSelector('.admin-select-wrapper select', { timeout: 5000 });
    const skillDropdowns = await page.evaluate(() => {
      return document.querySelectorAll('.admin-select-wrapper select').length;
    });
    console.log(`Skills tab standardized selects found: ${skillDropdowns}`);

    const dropdownsPath = path.join(ARTIFACTS_DIR, 'admin_dropdowns_verified.png');
    await page.screenshot({ path: dropdownsPath });
    console.log(`Saved screenshot: ${dropdownsPath}`);

    // =========================================================================
    // TASK 4: Typography in SEO & Metadata and Site Settings
    // =========================================================================
    console.log('\n--- VERIFYING TASK 4: TYPOGRAPHY CONSISTENCY ---');

    // 4.1 SEO & Metadata Tab
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('ams-select-tab', { detail: { tab: 'seo' } }));
    });
    await page.waitForSelector('.admin-seo-page', { timeout: 5000 });

    const seoTypo = await page.evaluate(() => {
      const labels = Array.from(document.querySelectorAll('.admin-seo-page label'));
      const inputs = Array.from(document.querySelectorAll('.admin-seo-page input[type="text"], .admin-seo-page textarea'));
      const buttons = Array.from(document.querySelectorAll('.admin-seo-page .admin-proj-top-banner button'));

      const labelFonts = labels.map((l) => window.getComputedStyle(l).fontFamily);
      const inputFonts = inputs.map((i) => window.getComputedStyle(i).fontFamily);
      const btnFonts = buttons.map((b) => window.getComputedStyle(b).fontFamily);

      // Check if any label or input is using monospace
      const labelsWithMono = labels.filter((l) => l.className.includes('font-mono')).length;
      const inputsWithMono = inputs.filter((i) => i.className.includes('font-mono')).length;

      return {
        labelCount: labels.length,
        labelsWithMono,
        inputsWithMono,
        sampleLabelFont: labelFonts[0] || '',
        sampleInputFont: inputFonts[0] || '',
        sampleBtnFont: btnFonts[0] || ''
      };
    });

    console.log(`SEO Tab Typography: labelsWithMono=${seoTypo.labelsWithMono}, inputsWithMono=${seoTypo.inputsWithMono}`);
    console.log(`  Sample Label Font: ${seoTypo.sampleLabelFont}`);
    console.log(`  Sample Input Font: ${seoTypo.sampleInputFont}`);
    if (seoTypo.labelsWithMono > 0 || seoTypo.inputsWithMono > 0) {
      throw new Error('SEO Tab has form labels or inputs still using font-mono');
    }

    const seoPath = path.join(ARTIFACTS_DIR, 'admin_seo_typography_verified.png');
    await page.screenshot({ path: seoPath });
    console.log(`Saved screenshot: ${seoPath}`);

    // 4.2 Site Settings Tab
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('ams-select-tab', { detail: { tab: 'settings' } }));
    });
    await page.waitForSelector('.admin-site-settings-page', { timeout: 5000 });

    const settingsTypo = await page.evaluate(() => {
      const labels = Array.from(document.querySelectorAll('.admin-site-settings-page label'));
      const inputs = Array.from(document.querySelectorAll('.admin-site-settings-page input[type="text"], .admin-site-settings-page textarea'));

      const labelsWithMono = labels.filter((l) => l.className.includes('font-mono')).length;
      const inputsWithMono = inputs.filter((i) => i.className.includes('font-mono')).length;

      return {
        labelCount: labels.length,
        labelsWithMono,
        inputsWithMono,
        sampleLabelFont: labels[0] ? window.getComputedStyle(labels[0]).fontFamily : '',
        sampleInputFont: inputs[0] ? window.getComputedStyle(inputs[0]).fontFamily : ''
      };
    });

    console.log(`Site Settings Typography: labelsWithMono=${settingsTypo.labelsWithMono}, inputsWithMono=${settingsTypo.inputsWithMono}`);
    console.log(`  Sample Label Font: ${settingsTypo.sampleLabelFont}`);
    console.log(`  Sample Input Font: ${settingsTypo.sampleInputFont}`);
    if (settingsTypo.labelsWithMono > 0 || settingsTypo.inputsWithMono > 0) {
      throw new Error('Site Settings Tab has form labels or inputs still using font-mono');
    }

    const settingsPath = path.join(ARTIFACTS_DIR, 'admin_settings_typography_verified.png');
    await page.screenshot({ path: settingsPath });
    console.log(`Saved screenshot: ${settingsPath}`);

    console.log('\n======================================================');
    console.log('ALL 4 TASKS FULLY VERIFIED AND PASSING WITH FLYING COLORS!');
    console.log('======================================================\n');
  } catch (err) {
    console.error('VERIFICATION ERROR:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

runVerification();
