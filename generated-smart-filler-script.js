/**
 * Generated Smart Form Filler Script
 * Created: 2025-11-05T15:02:31.328Z
 * Total Actions: 22
 */

import { SmartFormFiller } from './src/form-filler.js';
import { SmartNavigator } from './src/smart-navigator.js';

async function runWorkflow() {
  const filler = new SmartFormFiller({
    headless: false,
    screenshot: true,
  });

  try {
    // Navigate to starting page
    await filler.goto('https://ehbsec.hrsa.gov/EPSInternal/home');

    // Fill form with data
    await filler.fillForm({
      'eps_activityCode': 'h80',
    });

    // Submit form
    await filler.submit();

    // Auto-navigate through multi-step flow (login/agreement pages)
    const navigator = new SmartNavigator(filler.page);
    await navigator.autoNavigate();

    console.log('✅ Workflow complete!');
    await filler.page.waitForTimeout(5000);
    await filler.close();
  } catch (error) {
    console.error('❌ Error:', error);
    await filler.close();
  }
}

runWorkflow();
