/**
 * Action Recorder CLI
 * Records user actions and generates automation scripts
 * Usage: node record-actions.js <url>
 */

import { chromium } from 'playwright';
import { ActionRecorder } from './src/action-recorder.js';
import * as readline from 'readline';

const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help') {
  console.log(`
🎬 Action Recorder - Record browser actions and generate automation scripts

Usage:
  node record-actions.js <url> [options]

Examples:
  # Record actions on a login page
  node record-actions.js https://example.com/login

  # Record with actual passwords (not hidden)
  node record-actions.js https://example.com/login --keep-passwords

  # Record and save as Playwright script
  node record-actions.js https://example.com/login --format playwright

  # Record and save as Smart Form Filler script
  node record-actions.js https://example.com/login --format smart-form-filler

Options:
  --format <type>       Output format: 'playwright' or 'smart-form-filler' (default: both)
  --output <file>       Output filename (default: auto-generated)
  --keep-passwords      Keep actual passwords instead of hiding them (use with caution!)
  --help                Show this help message

How it works:
  1. Browser opens to the specified URL
  2. Perform your actions (login, click buttons, fill forms, etc.)
  3. Press Ctrl+C in terminal when done
  4. Script is automatically generated!

What it captures:
  ✅ Button clicks (by text, name, ID, aria-label)
  ✅ Form inputs (by name, placeholder, ID)
  ✅ Form submissions
  ✅ Page navigation
  ✅ Multi-step workflows
  ❌ NO XPATH - only semantic selectors!
  `);
  process.exit(0);
}

const url = args[0];
const format = args.includes('--format') ? args[args.indexOf('--format') + 1] : 'both';
const outputFile = args.includes('--output') ? args[args.indexOf('--output') + 1] : null;
const keepPasswords = args.includes('--keep-passwords');

async function recordActions() {
  console.log('🎬 Action Recorder\n');
  console.log(`🌐 Target URL: ${url}\n`);

  const browser = await chromium.launch({
    headless: false,
    slowMo: 100,
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  const recorder = new ActionRecorder(page, { keepPasswords });

  try {
    // Navigate to URL
    console.log('🔄 Loading page...');
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    console.log('✅ Page loaded\n');

    // Start recording
    await recorder.startRecording();
    
    if (keepPasswords) {
      console.log('⚠️  Recording passwords in plain text (--keep-passwords enabled)\n');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎥 RECORDING IN PROGRESS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('👉 Perform your actions in the browser:');
    console.log('   - Fill in forms');
    console.log('   - Click buttons');
    console.log('   - Navigate through pages');
    console.log('   - Complete your workflow');
    console.log('');
    console.log('⏹️  Press Ctrl+C when done to stop recording and generate script');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Wait for user to press Ctrl+C
    await new Promise((resolve) => {
      process.on('SIGINT', async () => {
        try {
          console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('⏹️  RECORDING STOPPED');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
          
          // Check if page is still open
          if (!page.isClosed()) {
            // Stop recording
            await recorder.stopRecording();

            // Print summary
            recorder.printSummary();

            // Generate scripts
            console.log('📝 Generating automation scripts...\n');

            if (format === 'playwright' || format === 'both') {
              const playwrightFile = outputFile || 'generated-playwright-script.js';
              await recorder.saveScript(playwrightFile, 'playwright');
              console.log(`✅ Playwright script: ${playwrightFile}`);
            }

            if (format === 'smart-form-filler' || format === 'both') {
              const smartFile = outputFile ? outputFile.replace('.js', '-smart.js') : 'generated-smart-filler-script.js';
              await recorder.saveScript(smartFile, 'smart-form-filler');
              console.log(`✅ Smart Form Filler script: ${smartFile}`);
            }

            // Save raw actions
            await recorder.saveToFile('recorded-actions.json');
            console.log(`✅ Raw actions: recorded-actions.json`);

            console.log('\n🎉 Done! You can now run the generated scripts to automate your workflow.\n');
          } else {
            console.log('⚠️  Browser was closed. No actions to save.\n');
          }

          await browser.close().catch(() => {});
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during shutdown:', error.message);
          await browser.close().catch(() => {});
          process.exit(1);
        }
      });
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    await browser.close();
    process.exit(1);
  }
}

recordActions();
