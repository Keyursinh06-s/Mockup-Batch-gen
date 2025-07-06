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
  .parse();

const options = program.opts();

async function main() {
  try {
    console.log('🚀 Starting Mockup Batch Generator...');
    
    if (!options.input) {
      console.error('❌ Input directory is required. Use -i flag.');
      process.exit(1);
    }

    const generator = new MockupGenerator({
      inputDir: options.input,
      outputDir: options.output || './output',
      template: options.template,
      format: options.format,
      quality: parseInt(options.quality)
    });

    await generator.processAll();
    console.log('✅ Batch processing completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };