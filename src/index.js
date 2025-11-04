/**
 * Smart Form Filler - Main Entry Point
 */

export { SmartFormFiller } from './form-filler.js';
export { FieldDetector } from './field-detector.js';
export { DataGenerator } from './data-generator.js';
export { VisionAnalyzer } from './vision-analyzer.js';

// Quick start function
export async function quickFill(url, options = {}) {
  const { SmartFormFiller } = await import('./form-filler.js');
  
  const filler = new SmartFormFiller({
    headless: false,
    ...options,
  });
  
  return await filler.automate(url, {
    analyze: true,
    submit: false,
    keepOpen: true,
    ...options,
  });
}
