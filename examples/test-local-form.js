/**
 * Test Local Form Example
 * Test the tool with the included sample form
 */

import { SmartFormFiller } from '../src/form-filler.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testLocalForm() {
  const filler = new SmartFormFiller({
    headless: false,
    slowMo: 100,
    screenshot: true,
  });

  try {
    // Get absolute path to sample form
    const formPath = path.join(__dirname, '../test-forms/sample-form.html');
    const fileUrl = `file:///${formPath.replace(/\\/g, '/')}`;
    
    console.log('🌐 Opening local test form...');
    await filler.goto(fileUrl);
    
    // Analyze the form
    console.log('\n📊 Analyzing form structure...\n');
    const analysis = await filler.analyzeForm();
    console.log(`Total Fields: ${analysis.totalFields}`);
    console.log(`Required Fields: ${analysis.requiredFields}`);
    console.log(`Field Types:`, analysis.fieldTypes);
    
    // Fill the form
    console.log('\n📝 Filling form with smart data...\n');
    const result = await filler.fillForm({
      // You can override specific fields
      'email': 'test.automation@example.com',
      'company': 'Smart Form Filler Inc.',
    });
    
    console.log(`\n✅ Successfully filled ${result.filled}/${result.total} fields`);
    
    // Take a screenshot
    await filler.takeScreenshot('local-form-filled');
    
    // Submit the form
    console.log('\n🚀 Submitting form...');
    await filler.submit('button[type="submit"]');
    
    // Wait to see the success message
    await filler.page.waitForTimeout(3000);
    
    console.log('\n✅ Test completed successfully!');
    console.log('Check the screenshots/ folder for captured images.');
    
    // Keep browser open for inspection
    console.log('\nBrowser will close in 5 seconds...');
    await filler.page.waitForTimeout(5000);
    
    await filler.close();
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await filler.close();
  }
}

testLocalForm();
