/**
 * Custom Data Example
 * Fill form with specific test data
 */

import { SmartFormFiller } from '../src/form-filler.js';

async function fillWithCustomData() {
  const filler = new SmartFormFiller({
    headless: false,
    customData: {
      // Map field names/IDs to custom values
      'email': 'testuser@example.com',
      'firstName': 'Jane',
      'lastName': 'Smith',
      'company': 'Acme Corp',
      'phone': '+1-555-0123',
    },
  });

  try {
    await filler.goto('https://example.com/signup');
    
    // Fill with custom data
    await filler.fillForm();
    
    // Take screenshot
    await filler.takeScreenshot('custom-data-filled');
    
    await filler.close();
    
  } catch (error) {
    console.error('Error:', error);
    await filler.close();
  }
}

fillWithCustomData();
