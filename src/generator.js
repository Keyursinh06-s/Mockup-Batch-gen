const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const ImageValidator = require('./utils/imageValidator');
const Logger = require('./utils/logger');

class MockupGenerator {
  constructor(options) {
    this.inputDir = options.inputDir;
    this.outputDir = options.outputDir;
    this.template = options.template;
    this.format = options.format;
    this.quality = options.quality;
    this.validator = new ImageValidator();
    this.processedCount = 0;
    this.errorCount = 0;
    this.logger = new Logger({ logLevel: 'info' });
    
    // Performance optimizations
    this.maxConcurrency = options.maxConcurrency || 4;
    this.templateCache = new Map();
    this.processedCache = new Map();
    
    this.templates = {
      default: { width: 1200, height: 800, padding: 50 },
      mobile: { width: 375, height: 812, padding: 20 },
      desktop: { width: 1920, height: 1080, padding: 100 },
      tablet: { width: 768, height: 1024, padding: 40 }
    };
  }

  async processAll() {
    const startTime = performance.now();
    const stats = { total: 0, processed: 0, errors: 0, processingTimes: [] };
    
    try {
      await this.logger.info('Starting batch processing', { template: this.template, format: this.format });
      await this.ensureOutputDir();
      const files = await this.getInputFiles();
      
      stats.total = files.length;
      await this.logger.info(`Found ${files.length} files to process`);
      
      // Process files in parallel batches for better performance
      const results = await this.processFilesInBatches(files, this.maxConcurrency);
      
      // Aggregate results
      results.forEach(result => {
        if (result.success) {
          stats.processed++;
          stats.processingTimes.push(result.duration);
        } else {
          stats.errors++;
        }
      });
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      stats.avgTime = stats.processingTimes.reduce((a, b) => a + b, 0) / stats.processingTimes.length || 0;
      
      await this.logger.logBatchStats(stats);
      await this.logger.info(`Total processing time: ${totalTime.toFixed(2)}ms`);
      
    } catch (error) {
      await this.logger.error('Batch processing failed', { error: error.message });
      throw new Error(`Processing failed: ${error.message}`);
    }
  }

  async processFilesInBatches(files, batchSize) {
    const results = [];
    
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      const batchPromises = batch.map(async (file, index) => {
        const fileStartTime = performance.now();
        
        try {
          await this.logger.debug(`Processing ${i + index + 1}/${files.length}: ${file}`);
          await this.processFile(file);
          
          const fileEndTime = performance.now();
          const duration = fileEndTime - fileStartTime;
          
          await this.logger.logPerformance(`Process file: ${file}`, duration);
          return { success: true, duration, file };
        } catch (error) {
          await this.logger.error(`Failed to process ${file}`, { error: error.message });
          return { success: false, error: error.message, file };
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }
    
    return results;
  }

  async getInputFiles() {
    try {
      const files = await fs.readdir(this.inputDir);
      const imageFiles = [];
      
      // Filter and validate files in parallel
      const validationPromises = files.map(async (file) => {
        const filePath = path.join(this.inputDir, file);
        const stats = await fs.stat(filePath);
        
        if (stats.isFile() && this.validator.isValidImageFormat(file)) {
          const validation = await this.validator.validateImage(filePath);
          if (validation.isValid) {
            return filePath;
          } else {
            await this.logger.warn(`Skipping invalid file: ${file}`, { errors: validation.errors });
            return null;
          }
        }
        return null;
      });
      
      const validatedFiles = await Promise.all(validationPromises);
      return validatedFiles.filter(file => file !== null);
      
    } catch (error) {
      throw new Error(`Failed to read input directory: ${error.message}`);
    }
  }

  async ensureOutputDir() {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
    } catch (error) {
      throw new Error(`Failed to create output directory: ${error.message}`);
    }
  }

  async processFile(inputPath) {
    const filename = path.basename(inputPath, path.extname(inputPath));
    const outputPath = path.join(this.outputDir, `${filename}_${this.template}.${this.format}`);
    
    // Check cache first
    const cacheKey = `${inputPath}_${this.template}_${this.format}_${this.quality}`;
    if (this.processedCache.has(cacheKey)) {
      await this.logger.debug(`Using cached result for ${filename}`);
      return;
    }
    
    const template = this.getTemplate(this.template);
    
    try {
      // Use Sharp's pipeline for memory efficiency
      const pipeline = sharp(inputPath)
        .resize(template.width - (template.padding * 2), template.height - (template.padding * 2), {
          fit: 'inside',
          withoutEnlargement: true
        })
        .extend({
          top: template.padding,
          bottom: template.padding,
          left: template.padding,
          right: template.padding,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        });
      
      // Configure output format with optimizations
      switch (this.format) {
        case 'webp':
          pipeline.webp({ quality: this.quality, effort: 6 });
          break;
        case 'jpg':
        case 'jpeg':
          pipeline.jpeg({ quality: this.quality, progressive: true, mozjpeg: true });
          break;
        case 'png':
          pipeline.png({ quality: this.quality, compressionLevel: 9, progressive: true });
          break;
      }
      
      await pipeline.toFile(outputPath);
      
      // Cache the result
      this.processedCache.set(cacheKey, true);
      
    } catch (error) {
      throw new Error(`Failed to process ${inputPath}: ${error.message}`);
    }
  }

  getTemplate(templateName) {
    // Use template cache for better performance
    if (this.templateCache.has(templateName)) {
      return this.templateCache.get(templateName);
    }
    
    const template = this.templates[templateName];
    if (!template) {
      throw new Error(`Template '${templateName}' not found`);
    }
    
    this.templateCache.set(templateName, template);
    return template;
  }

  // Cleanup method for memory management
  clearCache() {
    this.templateCache.clear();
    this.processedCache.clear();
  }
}

module.exports = MockupGenerator;