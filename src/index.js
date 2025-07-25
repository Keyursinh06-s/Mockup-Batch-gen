#!/usr/bin/env node

const { program } = require('commander');
const MockupGenerator = require('./generator');
const path = require('path');

program
  .version('1.0.0')
  .description('Mockup Batch Generator - Generate multiple mockups efficiently')
  .option('-i, --input <path>', 'Input directory containing designs')
  .option('-o, --output <path>', 'Output directory for generated mockups')
  .option('-t, --template <name>', 'Mockup template to use', 'default')
  .option('-f, --format <type>', 'Output format (png, jpg, webp)', 'png')
  .option('-q, --quality <number>', 'Output quality (1-100)', '90')
  .option('-c, --concurrency <number>', 'Maximum concurrent operations', '4')
  .option('--cache-size <number>', 'Cache size for validation results', '1000')
  .option('--verbose', 'Enable verbose logging')
  .parse();

const options = program.opts();

let generator = null;

async function main() {
  try {
    console.log('🚀 Starting Mockup Batch Generator...');
    
    if (!options.input) {
      console.error('❌ Input directory is required. Use -i flag.');
      process.exit(1);
    }

    // Validate input directory exists
    const fs = require('fs').promises;
    try {
      await fs.access(options.input);
    } catch (error) {
      console.error(`❌ Input directory does not exist: ${options.input}`);
      process.exit(1);
    }

    generator = new MockupGenerator({
      inputDir: options.input,
      outputDir: options.output || './output',
      template: options.template,
      format: options.format,
      quality: parseInt(options.quality),
      maxConcurrency: parseInt(options.concurrency),
      cacheSize: parseInt(options.cacheSize),
      verbose: options.verbose
    });

    // Setup graceful shutdown handlers
    setupGracefulShutdown();

    const startTime = performance.now();
    await generator.processAll();
    const endTime = performance.now();
    
    console.log('✅ Batch processing completed successfully!');
    console.log(`⏱️  Total time: ${((endTime - startTime) / 1000).toFixed(2)}s`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (options.verbose) {
      console.error('Stack trace:', error.stack);
    }
    
    await cleanup();
    process.exit(1);
  }
}

function setupGracefulShutdown() {
  const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
  
  signals.forEach(signal => {
    process.on(signal, async () => {
      console.log(`\n⚠️  Received ${signal}, shutting down gracefully...`);
      await cleanup();
      process.exit(0);
    });
  });

  process.on('uncaughtException', async (error) => {
    console.error('❌ Uncaught Exception:', error.message);
    if (options.verbose) {
      console.error('Stack trace:', error.stack);
    }
    await cleanup();
    process.exit(1);
  });

  process.on('unhandledRejection', async (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    await cleanup();
    process.exit(1);
  });
}

async function cleanup() {
  if (generator) {
    try {
      console.log('🧹 Cleaning up resources...');
      generator.clearCache();
      
      // Cleanup logger if it has a cleanup method
      if (generator.logger && typeof generator.logger.cleanup === 'function') {
        await generator.logger.cleanup();
      }
      
      console.log('✓ Cleanup completed');
    } catch (error) {
      console.error('⚠️ Cleanup warning:', error.message);
    }
  }
}

if (require.main === module) {
  main();
}

module.exports = { main, cleanup };