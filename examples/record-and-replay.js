/**
 * Example: Record and Replay Actions
 * Shows how to use the Action Recorder programmatically
 */

import { chromium } from 'playwright';
import { ActionRecorder } from '../src/action-recorder.js';

async function recordAndReplay() {
  console.log('🎬 Record and Replay Example\n');

  // ============================================
  // PHASE 1: RECORD
  // ============================================
  console.log('📍 PHASE 1: Recording actions...\n');

  const browser1 = await chromium.launch({ headless: false });
  const page1 = await browser1.newPage();
  const recorder = new ActionRecorder(page1);

  // Navigate and start recording
  await page1.goto('https://example.com');
  await recorder.startRecording();

  console.log('✅ Recording started!');
  console.log('👉 Interact with the page for 30 seconds...\n');

  // Record for 30 seconds
  await page1.waitForTimeout(30000);

  // Stop recording
  await recorder.stopRecording();
  recorder.printSummary();

  // Generate and save script
  await recorder.saveScript('recorded-workflow.js', 'playwright');
  await recorder.saveToFile('recorded-actions.json');

  await browser1.close();

  console.log('\n✅ Recording complete!\n');

  // ============================================
  // PHASE 2: REPLAY
  // ============================================
  console.log('📍 PHASE 2: Replaying actions...\n');

  const browser2 = await chromium.launch({ headless: false });
  const page2 = await browser2.newPage();

  // Get recorded actions
  const actions = recorder.getActions();

  // Replay each action
  for (const action of actions) {
    try {
      if (action.type === 'navigation') {
        console.log(`🧭 Navigate to: ${action.to}`);
        await page2.goto(action.to);
      } else if (action.type === 'input') {
        console.log(`⌨️  Fill ${action.selector.selector} = ${action.value}`);
        await page2.fill(action.selector.selector, action.value);
      } else if (action.type === 'click') {
        console.log(`🖱️  Click ${action.selector.selector}`);
        await page2.click(action.selector.selector);
        await page2.waitForTimeout(1000);
      } else if (action.type === 'submit') {
        console.log(`📤 Submit form`);
        await page2.click('button[type="submit"]');
        await page2.waitForLoadState('networkidle');
      }
    } catch (error) {
      console.error(`⚠️  Failed to replay action: ${error.message}`);
    }
  }

  console.log('\n✅ Replay complete!\n');

  await page2.waitForTimeout(5000);
  await browser2.close();
}

recordAndReplay();
