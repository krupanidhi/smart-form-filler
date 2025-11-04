/**
 * Smart Form Filler
 * Main orchestrator for intelligent form filling
 */

import { chromium } from 'playwright';
import { FieldDetector } from './field-detector.js';
import { DataGenerator } from './data-generator.js';

export class SmartFormFiller {
  constructor(options = {}) {
    this.options = {
      headless: options.headless ?? false,
      slowMo: options.slowMo ?? 100,
      screenshot: options.screenshot ?? true,
      locale: options.locale || 'en',
      customData: options.customData || {},
      ...options,
    };
    
    this.detector = new FieldDetector();
    this.generator = new DataGenerator({
      locale: this.options.locale,
      customData: this.options.customData,
    });
    
    this.browser = null;
    this.page = null;
  }

  /**
   * Initialize browser
   */
  async init() {
    this.browser = await chromium.launch({
      headless: this.options.headless,
      slowMo: this.options.slowMo,
    });
    
    this.page = await this.browser.newPage();
    return this;
  }

  /**
   * Navigate to URL
   */
  async goto(url) {
    if (!this.page) await this.init();
    await this.page.goto(url, { waitUntil: 'networkidle' });
    return this;
  }

  /**
   * Detect all form fields on current page
   */
  async detectFields() {
    if (!this.page) {
      throw new Error('Browser not initialized. Call init() or goto() first.');
    }
    
    console.log('🔍 Detecting form fields...');
    const fields = await this.detector.detectFields(this.page);
    console.log(`✅ Found ${fields.length} fields`);
    
    return fields;
  }

  /**
   * Fill a single field
   */
  async fillField(field, value) {
    try {
      const selector = this.getSmartSelector(field);
      
      // Handle different field types
      if (field.tagName === 'select') {
        await this.fillSelect(selector, field);
      } else if (field.type === 'checkbox') {
        await this.fillCheckbox(selector, value);
      } else if (field.type === 'radio') {
        await this.fillRadio(selector);
      } else if (field.type === 'file') {
        console.log(`⏭️  Skipping file input: ${field.name || field.id}`);
      } else {
        await this.fillTextInput(selector, value, field);
      }
      
      return true;
    } catch (error) {
      console.warn(`⚠️  Failed to fill field ${field.name || field.id}:`, error.message);
      return false;
    }
  }

  /**
   * Fill text input
   */
  async fillTextInput(selector, value, field) {
    const element = await this.page.locator(selector).first();
    
    // Clear existing value
    await element.clear();
    
    // Type with human-like delay
    await element.type(value, { delay: 50 });
    
    console.log(`✏️  Filled ${field.label || field.name || field.id}: ${value}`);
  }

  /**
   * Fill select dropdown
   */
  async fillSelect(selector, field) {
    const element = await this.page.locator(selector).first();
    
    // Get available options
    const options = await element.locator('option').allTextContents();
    
    if (options.length > 1) {
      // Skip first option (usually placeholder) and select random
      const randomIndex = Math.floor(Math.random() * (options.length - 1)) + 1;
      await element.selectOption({ index: randomIndex });
      console.log(`📋 Selected option ${randomIndex} in ${field.label || field.name || field.id}`);
    }
  }

  /**
   * Fill checkbox
   */
  async fillCheckbox(selector, value) {
    const element = await this.page.locator(selector).first();
    
    if (value) {
      await element.check();
    } else {
      await element.uncheck();
    }
  }

  /**
   * Fill radio button
   */
  async fillRadio(selector) {
    const element = await this.page.locator(selector).first();
    await element.check();
  }

  /**
   * Get smart selector for a field
   */
  getSmartSelector(field) {
    // Try multiple selector strategies
    const strategies = [];
    
    // 1. Placeholder (most reliable for Salesforce)
    if (field.placeholder) {
      strategies.push(`[placeholder="${field.placeholder}"]`);
    }
    
    // 2. ARIA label
    if (field.ariaLabel) {
      strategies.push(`[aria-label="${field.ariaLabel}"]`);
    }
    
    // 3. Name attribute
    if (field.name) {
      strategies.push(`[name="${field.name}"]`);
    }
    
    // 4. ID selector (only if it doesn't have special characters that break CSS)
    if (field.id && !/[:\[\](){}]/.test(field.id)) {
      strategies.push(`#${field.id}`);
    } else if (field.id) {
      // Use attribute selector for IDs with special characters
      strategies.push(`[id="${field.id}"]`);
    }
    
    // 5. Type + Placeholder combination
    if (field.type && field.placeholder) {
      strategies.push(`input[type="${field.type}"][placeholder="${field.placeholder}"]`);
    }
    
    // 6. Label text (Playwright's text selector)
    if (field.label) {
      strategies.push(`text="${field.label}" >> .. >> ${field.tagName}`);
    }
    
    // Return first strategy (most reliable)
    return strategies[0] || field.tagName;
  }

  /**
   * Fill entire form automatically
   */
  async fillForm(customData = {}) {
    // Update custom data if provided
    if (Object.keys(customData).length > 0) {
      this.generator.setCustomData(customData);
    }
    
    // Detect fields
    const fields = await this.detectFields();
    
    if (fields.length === 0) {
      console.log('❌ No form fields detected');
      return { success: false, filled: 0, total: 0 };
    }
    
    console.log('\n📝 Starting form fill...\n');
    
    let filled = 0;
    
    // Fill each field
    for (const field of fields) {
      if (field.disabled || field.readonly) {
        console.log(`⏭️  Skipping disabled/readonly field: ${field.name || field.id}`);
        continue;
      }
      
      const value = this.generator.generateData(field);
      const success = await this.fillField(field, value);
      
      if (success) filled++;
      
      // Small delay between fields
      await this.page.waitForTimeout(100);
    }
    
    console.log(`\n✅ Filled ${filled}/${fields.length} fields`);
    
    // Take screenshot if enabled
    if (this.options.screenshot) {
      await this.takeScreenshot('filled-form');
    }
    
    return {
      success: true,
      filled,
      total: fields.length,
      fields,
    };
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(name = 'screenshot') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const path = `screenshots/${name}-${timestamp}.png`;
    
    await this.page.screenshot({ path, fullPage: true });
    console.log(`📸 Screenshot saved: ${path}`);
    
    return path;
  }

  /**
   * Get form analysis
   */
  async analyzeForm() {
    const fields = await this.detectFields();
    
    const analysis = {
      totalFields: fields.length,
      fieldTypes: {},
      requiredFields: 0,
      optionalFields: 0,
      fields: fields.map(f => ({
        name: f.name || f.id,
        type: f.detectedType || f.type,
        label: f.label,
        required: f.required,
        confidence: f.confidence,
      })),
    };
    
    fields.forEach(field => {
      const type = field.detectedType || field.type || 'unknown';
      analysis.fieldTypes[type] = (analysis.fieldTypes[type] || 0) + 1;
      
      if (field.required) {
        analysis.requiredFields++;
      } else {
        analysis.optionalFields++;
      }
    });
    
    return analysis;
  }

  /**
   * Submit form
   */
  async submit(selector = null) {
    console.log('\n🚀 Submitting form...');
    
    // If custom selector provided, use it
    if (selector) {
      try {
        await this.page.click(selector);
        await this.page.waitForTimeout(1000);
        console.log('✅ Form submitted');
        return true;
      } catch (error) {
        console.warn('⚠️  Could not submit with custom selector:', error.message);
      }
    }
    
    // Try multiple strategies to find submit button
    const strategies = [
      // Strategy 1: Standard submit buttons
      'button[type="submit"]',
      'input[type="submit"]',
      
      // Strategy 2: Common button text (case-insensitive)
      'button:has-text("Submit")',
      'button:has-text("submit")',
      'button:has-text("Login")',
      'button:has-text("login")',
      'button:has-text("Sign In")',
      'button:has-text("Sign in")',
      'button:has-text("Log In")',
      'button:has-text("Log in")',
      'button:has-text("Continue")',
      'button:has-text("Next")',
      'button:has-text("Send")',
      
      // Strategy 3: Input buttons with value
      'input[value="Submit"]',
      'input[value="Login"]',
      'input[value="Sign In"]',
      'input[value="Log In"]',
      
      // Strategy 4: Common IDs
      '#submit',
      '#login',
      '#signin',
      '#btn-submit',
      '#btn-login',
      
      // Strategy 5: Common classes
      '.submit-button',
      '.login-button',
      '.btn-submit',
      '.btn-login',
      
      // Strategy 6: Any button in a form
      'form button',
      'form input[type="button"]',
    ];
    
    for (const strategy of strategies) {
      try {
        const element = await this.page.locator(strategy).first();
        const isVisible = await element.isVisible({ timeout: 1000 }).catch(() => false);
        
        if (isVisible) {
          console.log(`🎯 Found submit button using: ${strategy}`);
          await element.click();
          await this.page.waitForTimeout(1000);
          console.log('✅ Form submitted');
          return true;
        }
      } catch (error) {
        // Try next strategy
        continue;
      }
    }
    
    console.warn('⚠️  Could not find submit button');
    console.log('💡 Tip: Specify custom selector with --submit-selector or submitSelector option');
    return false;
  }

  /**
   * Close browser
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log('👋 Browser closed');
    }
  }

  /**
   * Run complete automation flow
   */
  async automate(url, options = {}) {
    try {
      // Navigate to page
      await this.goto(url);
      
      // Optional: wait for specific element
      if (options.waitFor) {
        await this.page.waitForSelector(options.waitFor);
      }
      
      // Analyze form
      if (options.analyze) {
        const analysis = await this.analyzeForm();
        console.log('\n📊 Form Analysis:', JSON.stringify(analysis, null, 2));
      }
      
      // Fill form
      const result = await this.fillForm(options.customData);
      
      // Submit if requested
      if (options.submit) {
        await this.submit(options.submitSelector);
      }
      
      // Keep browser open if requested
      if (!options.keepOpen) {
        await this.close();
      }
      
      return result;
    } catch (error) {
      console.error('❌ Automation failed:', error);
      await this.close();
      throw error;
    }
  }
}
