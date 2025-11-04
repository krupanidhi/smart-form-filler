/**
 * Smart Data Generator
 * Generates realistic test data based on field type
 */

import { faker } from '@faker-js/faker';

export class DataGenerator {
  constructor(options = {}) {
    this.locale = options.locale || 'en';
    this.customData = options.customData || {};
    
    // Note: Faker.js v8+ uses localized imports instead of setting locale
    // The default 'en' locale is already loaded
  }

  /**
   * Generate appropriate data for a field
   * @param {Object} field - Field metadata
   * @returns {string} Generated data
   */
  generateData(field) {
    // Use custom data if provided
    const customValue = this.getCustomData(field);
    if (customValue !== null) return customValue;

    // Generate based on detected type
    const type = field.detectedType || field.type || 'text';
    
    try {
      switch (type) {
        case 'email':
          return faker.internet.email();
        
        case 'password':
          return this.generatePassword(field);
        
        case 'phone':
        case 'tel':
          return faker.phone.number();
        
        case 'firstName':
          return faker.person.firstName();
        
        case 'lastName':
          return faker.person.lastName();
        
        case 'name':
          return faker.person.fullName();
        
        case 'username':
          return faker.internet.userName();
        
        case 'address':
          return faker.location.streetAddress();
        
        case 'city':
          return faker.location.city();
        
        case 'state':
          return faker.location.state();
        
        case 'zip':
        case 'postal':
          return faker.location.zipCode();
        
        case 'country':
          return faker.location.country();
        
        case 'company':
          return faker.company.name();
        
        case 'website':
        case 'url':
          return faker.internet.url();
        
        case 'date':
          return this.generateDate(field);
        
        case 'age':
          return faker.number.int({ min: 18, max: 80 }).toString();
        
        case 'gender':
          return faker.person.sex();
        
        case 'message':
        case 'textarea':
          return faker.lorem.paragraph();
        
        case 'subject':
          return faker.lorem.sentence();
        
        case 'card':
          return faker.finance.creditCardNumber();
        
        case 'cvv':
          return faker.finance.creditCardCVV();
        
        case 'number':
          return this.generateNumber(field);
        
        case 'checkbox':
          return Math.random() > 0.5;
        
        case 'radio':
          return true; // Will select first option
        
        case 'select':
          return null; // Will be handled separately
        
        case 'color':
          return faker.internet.color();
        
        case 'time':
          return '10:30';
        
        case 'month':
          return '2024-01';
        
        case 'week':
          return '2024-W01';
        
        case 'range':
          return '50';
        
        default:
          return this.generateGenericText(field);
      }
    } catch (error) {
      console.warn(`Error generating data for field ${field.name}:`, error);
      return this.generateGenericText(field);
    }
  }

  /**
   * Generate password based on field requirements
   */
  generatePassword(field) {
    const length = field.maxLength || 12;
    const hasPattern = field.pattern;
    
    if (hasPattern) {
      // Try to match pattern requirements
      return 'Test@1234'; // Common pattern-compliant password
    }
    
    return faker.internet.password({ length, memorable: false, pattern: /[A-Za-z0-9!@#$%]/ });
  }

  /**
   * Generate date based on field requirements
   */
  generateDate(field) {
    const inputType = field.type;
    
    if (inputType === 'date') {
      return faker.date.past({ years: 1 }).toISOString().split('T')[0];
    }
    
    if (inputType === 'datetime-local') {
      return faker.date.recent().toISOString().slice(0, 16);
    }
    
    // Text field expecting date
    return faker.date.past({ years: 1 }).toLocaleDateString();
  }

  /**
   * Generate number based on field requirements
   */
  generateNumber(field) {
    const min = parseInt(field.min) || 0;
    const max = parseInt(field.max) || 100;
    
    return faker.number.int({ min, max }).toString();
  }

  /**
   * Generate generic text based on field characteristics
   */
  generateGenericText(field) {
    const maxLength = field.maxLength;
    
    if (maxLength && maxLength < 20) {
      return faker.lorem.word();
    }
    
    if (maxLength && maxLength < 50) {
      return faker.lorem.words(3);
    }
    
    if (field.tagName === 'textarea') {
      return faker.lorem.paragraph();
    }
    
    return faker.lorem.words(2);
  }

  /**
   * Get custom data for a field
   */
  getCustomData(field) {
    const keys = [field.id, field.name, field.label].filter(Boolean);
    
    for (const key of keys) {
      if (this.customData[key] !== undefined) {
        return this.customData[key];
      }
    }
    
    return null;
  }

  /**
   * Generate data set for all fields
   */
  generateDataSet(fields) {
    const data = {};
    
    fields.forEach(field => {
      const key = field.name || field.id || `field_${field.index}`;
      data[key] = this.generateData(field);
    });
    
    return data;
  }

  /**
   * Set custom data for specific fields
   */
  setCustomData(customData) {
    this.customData = { ...this.customData, ...customData };
  }
}
