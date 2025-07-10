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
    this.templates = {
      default: { width: 1200, height: 800, padding: 50 },
      mobile: { width: 375, height: 812, padding: 20 },
      desktop: { width: 1920, height: 1080, padding: 100 },
      tablet: { width: 768, height: 1024, padding: 40 }
    };
      const files = await this.getInputFiles();
      
  async processAll() {
    const startTime = performance.now();
    const stats = { total: 0, processed: 0, errors: 0, processingTimes: [] };
    
    try {
      await this.logger.info('Starting batch processing', { template: this.template, format: this.format });
      await this.ensureOutputDir();
      const files = await this.getInputFiles();
      
      stats.total = files.length;
      await this.logger.info(`Found ${files.length} files to process`);
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileStartTime = performance.now();
        
        try {
          await this.logger.debug(`Processing ${i + 1}/${files.length}: ${file}`);
          await this.processFile(file);
          
          const fileEndTime = performance.now();
          const processingTime = fileEndTime - fileStartTime;
          stats.processingTimes.push(processingTime);
          stats.processed++;
          
          await this.logger.logPerformance(`Process file: ${file}`, processingTime);
        } catch (error) {
          stats.errors++;
          await this.logger.error(`Failed to process ${file}`, { error: error.message });
        }
      }
      
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
        top: template.padding,
        bottom: template.padding,
        left: template.padding,
        right: template.padding,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .toFormat(this.format, { quality: this.quality })
      .toFile(outputPath);
  }
}

module.exports = MockupGenerator;