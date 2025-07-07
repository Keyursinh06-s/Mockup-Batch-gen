const fs = require('fs').promises;
const path = require('path');

/**
 * Image validation utilities for the mockup generator
 */
class ImageValidator {
  constructor() {
    this.supportedFormats = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    this.maxFileSize = 50 * 1024 * 1024; // 50MB
    this.minDimensions = { width: 100, height: 100 };
  }

  /**
   * Validate if file is a supported image format
   */
  isValidImageFormat(filename) {
    const ext = path.extname(filename).toLowerCase();
    return this.supportedFormats.includes(ext);
  }

  /**
   * Check file size constraints
   */
  async validateFileSize(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return stats.size <= this.maxFileSize;
    } catch (error) {
      return false;
    }
  }

  /**
   * Validate image dimensions using sharp
   */
  async validateDimensions(filePath) {
    try {
      const sharp = require('sharp');
      const metadata = await sharp(filePath).metadata();
      
      return metadata.width >= this.minDimensions.width && 
             metadata.height >= this.minDimensions.height;
    } catch (error) {
      return false;
    }
  }

  /**
   * Comprehensive image validation
   */
  async validateImage(filePath) {
    const filename = path.basename(filePath);
    
    const validations = {
      format: this.isValidImageFormat(filename),
      fileSize: await this.validateFileSize(filePath),
      dimensions: await this.validateDimensions(filePath)
    };

    const isValid = Object.values(validations).every(v => v);
    
    return {
      isValid,
      validations,
      errors: this.getValidationErrors(validations)
    };
  }

  /**
   * Get human-readable validation errors
   */
  getValidationErrors(validations) {
    const errors = [];
    
    if (!validations.format) {
      errors.push(`Unsupported format. Supported: ${this.supportedFormats.join(', ')}`);
    }
    
    if (!validations.fileSize) {
      errors.push(`File too large. Maximum size: ${this.maxFileSize / (1024 * 1024)}MB`);
    }
    
    if (!validations.dimensions) {
      errors.push(`Image too small. Minimum: ${this.minDimensions.width}x${this.minDimensions.height}px`);
    }
    
    return errors;
  }
}

module.exports = ImageValidator;