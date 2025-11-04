#!/usr/bin/env node
/**
 * Login with Agreement Handler
 * Automatically handles login + agree/disagree pages
 * 
 * Usage:
 *   node login-with-agreement.js <url> --username <user> --password <pass> [--agree|--disagree]
 */

import { SmartFormFiller } from './src/form-filler.js';

const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help')) {
  console.log(`
🔐 Login with Agreement Handler

Usage:
  node login-with-agreement.js <url> --username <user> --password <pass> [options]

Examples:
  # Login and click Agree
  node login-with-agreement.js https://example.com/login --username myuser --password mypass --agree

  # Login and click Disagree
  node login-with-agreement.js https://example.com/login --username myuser --password mypass --disagree

  # Login only (no agreement handling)
  node login-with-agreement.js https://example.com/login --username myuser --password mypass

Options:
  --username <user>     Username or email
  --password <pass>     Password
  --agree              Click "Agree" button after login
  --disagree           Click "Disagree" button after login
  --keep-open          Keep browser open after completion
  --headless           Run in headless mode

Salesforce Example:
  node login-with-agreement.js https://hrsa-dcpaas--dcpuat.sandbox.my.site.com/pars/s/login/ --username YOUR_USER --password YOUR_PASS --agree --keep-open
  `);
  process.exit(0);
}

const url = args[0];
const username = args[args.indexOf('--username') + 1] || '';
const password = args[args.indexOf('--password') + 1] || '';
const shouldAgree = args.includes('--agree');
const shouldDisagree = args.includes('--disagree');
const keepOpen = args.includes('--keep-open');
const headless = args.includes('--headless');

async function loginWithAgreement() {
  console.log('🔐 Login with Agreement Handler\n');
  console.log(`URL: ${url}`);
  console.log(`Username: ${username ? '***' : 'Not provided'}`);
  console.log(`Password: ${password ? '***' : 'Not provided'}`);
  console.log(`Agreement: ${shouldAgree ? 'Agree' : shouldDisagree ? 'Disagree' : 'None'}\n`);

  if (!username || !password) {
    console.error('❌ Error: Username and password are required');
    console.log('Use: node login-with-agreement.js <url> --username <user> --password <pass>');
    process.exit(1);
  }

  const filler = new SmartFormFiller({
    headless,
    slowMo: 300,
    screenshot: true,
  });

  try {
    // Step 1: Load page
    console.log('📍 Loading page...');
    await filler.goto(url);
    await filler.page.waitForLoadState('networkidle', { timeout: 30000 });
    await filler.page.waitForTimeout(3000);
    console.log('✅ Page loaded\n');
    
    // Step 2: Fill login form
    console.log('📍 Filling login form...');
    
    // Try multiple username field selectors
    const usernameSelectors = [
      '[placeholder="Username"]',
      '[placeholder="Email"]',
      '[placeholder*="username" i]',
      '[placeholder*="email" i]',
      '#username',
      '#email',
      '#UserName',
      'input[type="text"]',
      'input[type="email"]',
    ];
    
    let usernameFilled = false;
    for (const selector of usernameSelectors) {
      try {
        const element = await filler.page.locator(selector).first();
        if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
          await element.fill(username);
          console.log(`✅ Username filled using: ${selector}`);
          usernameFilled = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!usernameFilled) {
      throw new Error('Could not find username field');
    }
    
    // Try multiple password field selectors
    const passwordSelectors = [
      '[placeholder="Password"]',
      '[placeholder*="password" i]',
      '#password',
      '#Password',
      'input[type="password"]',
    ];
    
    let passwordFilled = false;
    for (const selector of passwordSelectors) {
      try {
        const element = await filler.page.locator(selector).first();
        if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
          await element.fill(password);
          console.log(`✅ Password filled using: ${selector}`);
          passwordFilled = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!passwordFilled) {
      throw new Error('Could not find password field');
    }
    
    await filler.takeScreenshot('credentials-filled');
    console.log('');
    
    // Step 3: Submit login
    console.log('📍 Submitting login...');
    const submitted = await filler.submit();
    
    if (!submitted) {
      throw new Error('Could not find login button');
    }
    
    console.log('⏳ Waiting for page to load...');
    await filler.page.waitForTimeout(5000);
    await filler.page.waitForLoadState('networkidle', { timeout: 30000 });
    console.log('✅ Login submitted\n');
    
    await filler.takeScreenshot('after-login');
    
    // Step 4: Handle agreement page
    if (shouldAgree || shouldDisagree) {
      console.log('📍 Checking for agreement page...');
      
      const buttonText = shouldAgree ? 'Agree' : 'Disagree';
      const buttonExists = await filler.page
        .locator(`button:has-text("${buttonText}")`)
        .isVisible({ timeout: 5000 })
        .catch(() => false);
      
      if (buttonExists) {
        console.log(`✅ Found "${buttonText}" button`);
        await filler.takeScreenshot('agreement-page');
        
        await filler.page.click(`button:has-text("${buttonText}")`);
        console.log(`✅ Clicked "${buttonText}"\n`);
        
        await filler.page.waitForTimeout(3000);
        await filler.page.waitForLoadState('networkidle', { timeout: 30000 });
        
        await filler.takeScreenshot('after-agreement');
      } else {
        console.log(`ℹ️  "${buttonText}" button not found\n`);
      }
    }
    
    // Final
    console.log('✅ Login flow completed!');
    console.log(`Current URL: ${filler.page.url()}\n`);
    
    await filler.takeScreenshot('final');
    
    if (keepOpen) {
      console.log('⏸️  Browser will stay open. Press Ctrl+C to close.\n');
      await new Promise(() => {});
    } else {
      console.log('⏸️  Browser will close in 10 seconds...\n');
      await filler.page.waitForTimeout(10000);
      await filler.close();
    }
    
    console.log('✅ Done!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await filler.takeScreenshot('error');
    
    if (keepOpen) {
      console.log('\n🐛 Browser will stay open for debugging. Press Ctrl+C to close.');
      await new Promise(() => {});
    } else {
      await filler.page.waitForTimeout(30000);
      await filler.close();
    }
  }
}

loginWithAgreement();
