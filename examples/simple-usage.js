/**
 * Simple Usage Example
 * Basic form filling without XPath
 */

import { SmartFormFiller } from '../src/form-filler.js';

async function fillContactForm() {
  // Configuration
  const KEEP_BROWSER_OPEN = false; // ← Change this to true to keep browser open
  
  // Create filler instance
  const filler = new SmartFormFiller({
    headless: false,  // Show browser
    screenshot: true, // Save screenshots
  });

  try {
    // Navigate to your form
    await filler.goto('https://example.com/contact-form');
    
    // Automatically detect and fill all fields
    const result = await filler.fillForm();
    
    console.log(`Filled ${result.filled} out of ${result.total} fields`);
    
    // Optionally submit
    // await filler.submit();
    
    // Control browser closing
    if (KEEP_BROWSER_OPEN) {
      console.log('Browser will stay open. Press Ctrl+C to close.');
      await filler.page.waitForTimeout(60000); // Wait 60 seconds
    }
    
    // Close browser
    await filler.close();
    
  } catch (error) {
    console.error('Error:', error);
    await filler.close();
  }
}

fillContactForm();
