/**
 * Regenerate scripts from recorded-actions.json
 */

import { ActionRecorder } from './src/action-recorder.js';
import fs from 'fs';

const actions = JSON.parse(fs.readFileSync('recorded-actions.json', 'utf8'));

const recorder = new ActionRecorder(null);
recorder.actions = actions;

console.log('📝 Regenerating scripts from recorded actions...\n');

await recorder.saveScript('generated-playwright-script.js', 'playwright');
console.log('✅ Playwright script: generated-playwright-script.js');

await recorder.saveScript('generated-smart-filler-script.js', 'smart-form-filler');
console.log('✅ Smart Form Filler script: generated-smart-filler-script.js');

console.log('\n🎉 Done! Scripts regenerated with latest logic.\n');
