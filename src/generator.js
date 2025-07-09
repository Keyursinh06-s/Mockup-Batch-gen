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
      
      console.log(`📁 Found ${files.length} files to process`);
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`🔄 Processing ${i + 1}/${files.length}: ${file}`);
        await this.processFile(file);
      }
      
    } catch (error) {
      throw new Error(`Processing failed: ${error.message}`);
    }
  }

  async ensureOutputDir() {
    try {
      await fs.access(this.outputDir);
    } catch {
      await fs.mkdir(this.outputDir, { recursive: true });
    }
  }

  async getInputFiles() {
    const files = await fs.readdir(this.inputDir);
    return files.filter(file => 
      /\.(jpg|jpeg|png|webp|gif)$/i.test(file)
    );
  }

  async processFile(filename) {
    const inputPath = path.join(this.inputDir, filename);
    const outputPath = path.join(
      this.outputDir, 
      `mockup_${path.parse(filename).name}.${this.format}`
    );

    const template = this.templates[this.template] || this.templates.default;
    
    await sharp(inputPath)
      .resize(
        template.width - (template.padding * 2),
        template.height - (template.padding * 2),
        { fit: 'inside', withoutEnlargement: true }
      )
      .extend({
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