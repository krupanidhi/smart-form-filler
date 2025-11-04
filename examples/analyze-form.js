/**
 * Form Analysis Example
 * Analyze form structure before filling
 */

import { SmartFormFiller } from '../src/form-filler.js';

async function analyzeFormStructure() {
  const filler = new SmartFormFiller({
    headless: false,
  });

  try {
    await filler.goto('https://example.com/complex-form');
    
    // Analyze form structure
    const analysis = await filler.analyzeForm();
    
    console.log('\n📊 Form Analysis Results:\n');
    console.log(`Total Fields: ${analysis.totalFields}`);
    console.log(`Required Fields: ${analysis.requiredFields}`);
    console.log(`Optional Fields: ${analysis.optionalFields}`);
    console.log('\nField Types:');
    console.log(analysis.fieldTypes);
    console.log('\nDetailed Fields:');
    console.log(JSON.stringify(analysis.fields, null, 2));
    
    // Now fill based on analysis
    await filler.fillForm();
    
    await filler.close();
    
  } catch (error) {
    console.error('Error:', error);
    await filler.close();
  }
}

analyzeFormStructure();
