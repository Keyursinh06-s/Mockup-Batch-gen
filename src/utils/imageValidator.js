const fs = require('fs').promises;
const path = require('path');

/**
 * Optimized image validation utilities for the mockup generator
 */
class ImageValidator {
  constructor(options = {}) {
    this.supportedFormats = options.supportedFormats || ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    this.maxFileSize = options.maxFileSize || 50 * 1024 * 1024; // 50MB
    this.minDimensions = options.minDimensions || { width: 100, height: 100 };
    
    // Performance optimizations
    this.validationCache = new Map();
    this.cacheMaxSize = options.cacheMaxSize || 1000;
    this.sharpInstance = null; // Lazy load Sharp
  }

  /**
   * Lazy load Sharp to reduce initial bundle size
   */
  getSharp() {
    if (!this.sharpInstance) {
      this.sharpInstance = require('sharp');
    }
    return this.sharpInstance;
  }

  /**
   * Validate if file is a supported image format
   */
  isValidImageFormat(filename) {
    if (!filename || typeof filename !== 'string') return false;
    
    const ext = path.extname(filename).toLowerCase();
    return this.supportedFormats.includes(ext);
  }

  /**
   * Check file size constraints with caching
   */
  async validateFileSize(filePath) {
    const cacheKey = `size_${filePath}`;
    
    if (this.validationCache.has(cacheKey)) {
      return this.validationCache.get(cacheKey);
    }
    
    try {
      const stats = await fs.stat(filePath);
      const isValid = stats.size <= this.maxFileSize;
      
      this.setCacheValue(cacheKey, isValid);
      return isValid;
    } catch (error) {
      this.setCacheValue(cacheKey, false);
      return false;
    }
  }

  /**
   * Validate image dimensions using sharp with caching
   */
  async validateDimensions(filePath) {
    const cacheKey = `dims_${filePath}`;
    
    if (this.validationCache.has(cacheKey)) {
      return this.validationCache.get(cacheKey);
    }
    
    try {
      const sharp = this.getSharp();
      const metadata = await sharp(filePath).metadata();
      
      const isValid = metadata.width >= this.minDimensions.width && 
                     metadata.height >= this.minDimensions.height;
      
      this.setCacheValue(cacheKey, isValid);
      return isValid;
    } catch (error) {
      this.setCacheValue(cacheKey, false);
      return false;
    }
  }

  /**
   * Comprehensive image validation with parallel checks
   */
  async validateImage(filePath) {
    const filename = path.basename(filePath);
    const cacheKey = `full_${filePath}`;
    
    // Check full validation cache first
    if (this.validationCache.has(cacheKey)) {
      return this.validationCache.get(cacheKey);
    }
    
    // Run validations in parallel for better performance
    const [formatValid, fileSizeValid, dimensionsValid] = await Promise.all([
      Promise.resolve(this.isValidImageFormat(filename)),
      this.validateFileSize(filePath),
      this.validateDimensions(filePath)
    ]);
    
    const validations = {
      format: formatValid,
      fileSize: fileSizeValid,
      dimensions: dimensionsValid
    };

    const isValid = Object.values(validations).every(v => v);
    
    const result = {
      isValid,
      validations,
      errors: this.getValidationErrors(validations)
    };
    
    this.setCacheValue(cacheKey, result);
    return result;
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
      errors.push(`File too large. Maximum size: ${Math.round(this.maxFileSize / (1024 * 1024))}MB`);
    }
    
    if (!validations.dimensions) {
      errors.push(`Image too small. Minimum: ${this.minDimensions.width}x${this.minDimensions.height}px`);
    }
    
    return errors;
  }

  /**
   * Batch validate multiple files with concurrency control
   */
  async validateBatch(filePaths, concurrency = 5) {
    const results = [];
    
    for (let i = 0; i < filePaths.length; i += concurrency) {
      const batch = filePaths.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        batch.map(filePath => this.validateImage(filePath))
      );
      results.push(...batchResults);
    }
    
    return results;
  }

  /**
   * Cache management with LRU-like behavior
   */
  setCacheValue(key, value) {
    // Simple cache size management
    if (this.validationCache.size >= this.cacheMaxSize) {
      // Remove oldest entries (first 10% of cache)
      const keysToDelete = Array.from(this.validationCache.keys()).slice(0, Math.floor(this.cacheMaxSize * 0.1));
      keysToDelete.forEach(k => this.validationCache.delete(k));
    }
    
    this.validationCache.set(key, value);
  }

  /**
   * Clear validation cache
   */
  clearCache() {
    this.validationCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.validationCache.size,
      maxSize: this.cacheMaxSize,
      hitRate: this.cacheHits / (this.cacheHits + this.cacheMisses) || 0
    };
  }
}

module.exports = ImageValidator;