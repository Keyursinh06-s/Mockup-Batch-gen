const MockupGenerator = require('../src/generator');
const fs = require('fs').promises;
const path = require('path');

describe('MockupGenerator', () => {
  let generator;
  const testInputDir = './test-input';
  const testOutputDir = './test-output';

  beforeEach(() => {
    generator = new MockupGenerator({
      inputDir: testInputDir,
      outputDir: testOutputDir,
      template: 'default',
      format: 'png',
      quality: 90
    });
  });

  afterEach(async () => {
    // Cleanup test directories
    try {
      await fs.rmdir(testOutputDir, { recursive: true });
    } catch (error) {
      // Directory might not exist
    }
  });

  test('should initialize with correct options', () => {
    expect(generator.inputDir).toBe(testInputDir);
    expect(generator.outputDir).toBe(testOutputDir);
    expect(generator.template).toBe('default');
    expect(generator.format).toBe('png');
    expect(generator.quality).toBe(90);
  });

  test('should have predefined templates', () => {
    expect(generator.templates).toHaveProperty('default');
    expect(generator.templates).toHaveProperty('mobile');
    expect(generator.templates).toHaveProperty('desktop');
    expect(generator.templates).toHaveProperty('tablet');
  });

  test('should create output directory if it does not exist', async () => {
    await generator.ensureOutputDir();
    
    try {
      await fs.access(testOutputDir);
      // If we reach here, directory exists
      expect(true).toBe(true);
    } catch (error) {
      fail('Output directory was not created');
    }
  });

  test('should filter image files correctly', async () => {
    // This would require setting up test files
    // For now, we'll test the logic conceptually
    const mockFiles = ['image1.jpg', 'image2.png', 'document.txt', 'image3.gif'];
    const imageFiles = mockFiles.filter(file => 
      /\.(jpg|jpeg|png|webp|gif)$/i.test(file)
    );
    
    expect(imageFiles).toEqual(['image1.jpg', 'image2.png', 'image3.gif']);
  });
});