#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const MockupGenerator = require('../src/generator');
const ImageValidator = require('../src/utils/imageValidator');

/**
 * Performance benchmark suite for the mockup generator
 */
class PerformanceBenchmark {
  constructor() {
    this.testDir = path.join(__dirname, 'test-images');
    this.outputDir = path.join(__dirname, 'test-output');
    this.results = [];
  }

  async setup() {
    console.log('🚀 Setting up performance benchmark...');
    
    // Create test directories
    await fs.mkdir(this.testDir, { recursive: true });
    await fs.mkdir(this.outputDir, { recursive: true });
    
    // Generate test images if they don't exist
    await this.generateTestImages();
  }

  async generateTestImages() {
    const sharp = require('sharp');
    const sizes = [
      { name: 'small', width: 200, height: 200 },
      { name: 'medium', width: 800, height: 600 },
      { name: 'large', width: 1920, height: 1080 },
      { name: 'xlarge', width: 4000, height: 3000 }
    ];

    for (const size of sizes) {
      for (let i = 1; i <= 5; i++) {
        const filename = `${size.name}_${i}.png`;
        const filepath = path.join(this.testDir, filename);
        
        try {
          await fs.access(filepath);
          console.log(`✓ Test image exists: ${filename}`);
        } catch {
          console.log(`📸 Generating test image: ${filename}`);
          await sharp({
            create: {
              width: size.width,
              height: size.height,
              channels: 3,
              background: { r: Math.floor(Math.random() * 255), g: Math.floor(Math.random() * 255), b: Math.floor(Math.random() * 255) }
            }
          }).png().toFile(filepath);
        }
      }
    }
  }

  async benchmarkImageValidation() {
    console.log('\n📊 Benchmarking Image Validation...');
    
    const validator = new ImageValidator();
    const files = await fs.readdir(this.testDir);
    const filePaths = files.map(file => path.join(this.testDir, file));
    
    // Sequential validation
    const sequentialStart = performance.now();
    for (const filePath of filePaths) {
      await validator.validateImage(filePath);
    }
    const sequentialTime = performance.now() - sequentialStart;
    
    // Clear cache for fair comparison
    validator.clearCache();
    
    // Batch validation
    const batchStart = performance.now();
    await validator.validateBatch(filePaths, 5);
    const batchTime = performance.now() - batchStart;
    
    const improvement = ((sequentialTime - batchTime) / sequentialTime * 100).toFixed(1);
    
    console.log(`Sequential validation: ${sequentialTime.toFixed(2)}ms`);
    console.log(`Batch validation: ${batchTime.toFixed(2)}ms`);
    console.log(`Improvement: ${improvement}% faster`);
    
    this.results.push({
      test: 'Image Validation',
      sequential: sequentialTime,
      optimized: batchTime,
      improvement: improvement
    });
  }

  async benchmarkMockupGeneration() {
    console.log('\n📊 Benchmarking Mockup Generation...');
    
    const templates = ['default', 'mobile', 'desktop'];
    const formats = ['png', 'jpg', 'webp'];
    
    for (const template of templates) {
      for (const format of formats) {
        console.log(`\n🔧 Testing ${template} template with ${format} format...`);
        
        // Test with different concurrency levels
        const concurrencyLevels = [1, 2, 4, 8];
        const templateResults = [];
        
        for (const concurrency of concurrencyLevels) {
          const outputSubDir = path.join(this.outputDir, `${template}_${format}_c${concurrency}`);
          await fs.mkdir(outputSubDir, { recursive: true });
          
          const generator = new MockupGenerator({
            inputDir: this.testDir,
            outputDir: outputSubDir,
            template: template,
            format: format,
            quality: 85,
            maxConcurrency: concurrency
          });
          
          const startTime = performance.now();
          const startMemory = process.memoryUsage();
          
          try {
            await generator.processAll();
            
            const endTime = performance.now();
            const endMemory = process.memoryUsage();
            const processingTime = endTime - startTime;
            const memoryDelta = endMemory.heapUsed - startMemory.heapUsed;
            
            templateResults.push({
              concurrency,
              time: processingTime,
              memory: memoryDelta
            });
            
            console.log(`  Concurrency ${concurrency}: ${processingTime.toFixed(2)}ms, Memory: ${(memoryDelta / 1024 / 1024).toFixed(2)}MB`);
            
            // Cleanup cache
            generator.clearCache();
            
          } catch (error) {
            console.error(`  Error with concurrency ${concurrency}:`, error.message);
          }
        }
        
        // Find optimal concurrency
        const fastest = templateResults.reduce((min, curr) => curr.time < min.time ? curr : min);
        const baseline = templateResults.find(r => r.concurrency === 1);
        const improvement = baseline ? ((baseline.time - fastest.time) / baseline.time * 100).toFixed(1) : 0;
        
        console.log(`  Optimal concurrency: ${fastest.concurrency} (${improvement}% improvement)`);
        
        this.results.push({
          test: `${template}-${format}`,
          baseline: baseline?.time || 0,
          optimized: fastest.time,
          optimalConcurrency: fastest.concurrency,
          improvement: improvement
        });
      }
    }
  }

  async benchmarkMemoryUsage() {
    console.log('\n📊 Benchmarking Memory Usage...');
    
    const generator = new MockupGenerator({
      inputDir: this.testDir,
      outputDir: this.outputDir,
      template: 'default',
      format: 'png',
      quality: 90,
      maxConcurrency: 4
    });
    
    const initialMemory = process.memoryUsage();
    console.log(`Initial memory: ${(initialMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`);
    
    await generator.processAll();
    
    const afterProcessing = process.memoryUsage();
    console.log(`After processing: ${(afterProcessing.heapUsed / 1024 / 1024).toFixed(2)}MB`);
    
    generator.clearCache();
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    const afterCleanup = process.memoryUsage();
    console.log(`After cleanup: ${(afterCleanup.heapUsed / 1024 / 1024).toFixed(2)}MB`);
    
    this.results.push({
      test: 'Memory Usage',
      initial: initialMemory.heapUsed,
      peak: afterProcessing.heapUsed,
      final: afterCleanup.heapUsed,
      efficiency: ((afterProcessing.heapUsed - afterCleanup.heapUsed) / afterProcessing.heapUsed * 100).toFixed(1)
    });
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up test files...');
    try {
      await fs.rmdir(this.outputDir, { recursive: true });
      // Keep test images for future runs
      console.log('✓ Cleanup completed');
    } catch (error) {
      console.log('⚠️ Cleanup warning:', error.message);
    }
  }

  generateReport() {
    console.log('\n📈 Performance Benchmark Report');
    console.log('================================');
    
    this.results.forEach(result => {
      console.log(`\n${result.test}:`);
      Object.entries(result).forEach(([key, value]) => {
        if (key !== 'test') {
          if (typeof value === 'number' && value > 1000) {
            console.log(`  ${key}: ${(value / 1000).toFixed(2)}s`);
          } else if (typeof value === 'number') {
            console.log(`  ${key}: ${value.toFixed(2)}ms`);
          } else {
            console.log(`  ${key}: ${value}`);
          }
        }
      });
    });
    
    // Save results to file
    const reportPath = path.join(__dirname, 'performance-report.json');
    fs.writeFile(reportPath, JSON.stringify(this.results, null, 2))
      .then(() => console.log(`\n📄 Detailed report saved to: ${reportPath}`))
      .catch(err => console.error('Failed to save report:', err.message));
  }

  async run() {
    try {
      await this.setup();
      await this.benchmarkImageValidation();
      await this.benchmarkMockupGeneration();
      await this.benchmarkMemoryUsage();
      this.generateReport();
      await this.cleanup();
      
      console.log('\n✅ Performance benchmark completed!');
    } catch (error) {
      console.error('❌ Benchmark failed:', error.message);
      process.exit(1);
    }
  }
}

// Run benchmark if called directly
if (require.main === module) {
  const benchmark = new PerformanceBenchmark();
  benchmark.run();
}

module.exports = PerformanceBenchmark;