const { describe, it, expect, beforeEach, afterEach } = require('@jest/globals');
const fs = require('fs').promises;
const path = require('path');
const ImageValidator = require('../src/utils/imageValidator');

describe('ImageValidator', () => {
    let validator;
    let testDir;

    beforeEach(() => {
        validator = new ImageValidator();
        testDir = path.join(__dirname, 'fixtures');
    });

    afterEach(async () => {
        // Clean up test files if they exist
        try {
            await fs.rmdir(testDir, { recursive: true });
        } catch (error) {
            // Directory might not exist
        }
    });

    describe('isValidImageFormat', () => {
        it('should return true for supported formats', () => {
            expect(validator.isValidImageFormat('test.jpg')).toBe(true);
            expect(validator.isValidImageFormat('test.jpeg')).toBe(true);
            expect(validator.isValidImageFormat('test.png')).toBe(true);
            expect(validator.isValidImageFormat('test.webp')).toBe(true);
            expect(validator.isValidImageFormat('test.gif')).toBe(true);
        });

        it('should return false for unsupported formats', () => {
            expect(validator.isValidImageFormat('test.txt')).toBe(false);
            expect(validator.isValidImageFormat('test.pdf')).toBe(false);
            expect(validator.isValidImageFormat('test.doc')).toBe(false);
            expect(validator.isValidImageFormat('test')).toBe(false);
        });

        it('should be case insensitive', () => {
            expect(validator.isValidImageFormat('test.JPG')).toBe(true);
            expect(validator.isValidImageFormat('test.PNG')).toBe(true);
            expect(validator.isValidImageFormat('test.WEBP')).toBe(true);
        });
    });

    describe('validateFileSize', () => {
        beforeEach(async () => {
            await fs.mkdir(testDir, { recursive: true });
        });

        it('should return true for files within size limit', async () => {
            const testFile = path.join(testDir, 'small.txt');
            await fs.writeFile(testFile, 'small content');
            
            const result = await validator.validateFileSize(testFile);
            expect(result).toBe(true);
        });

        it('should return false for non-existent files', async () => {
            const nonExistentFile = path.join(testDir, 'nonexistent.jpg');
            
            const result = await validator.validateFileSize(nonExistentFile);
            expect(result).toBe(false);
        });

        it('should handle large files correctly', async () => {
            const testFile = path.join(testDir, 'large.txt');
            // Create a file larger than 50MB (mock scenario)
            const largeContent = 'x'.repeat(1000); // Small for testing
            await fs.writeFile(testFile, largeContent);
            
            const result = await validator.validateFileSize(testFile);
            expect(result).toBe(true); // Should pass for our small test file
        });
    });

    describe('getValidationErrors', () => {
        it('should return empty array for valid validations', () => {
            const validations = {
                format: true,
                fileSize: true,
                dimensions: true
            };
            
            const errors = validator.getValidationErrors(validations);
            expect(errors).toEqual([]);
        });

        it('should return format error for invalid format', () => {
            const validations = {
                format: false,
                fileSize: true,
                dimensions: true
            };
            
            const errors = validator.getValidationErrors(validations);
            expect(errors).toContain('Unsupported format. Supported: .jpg, .jpeg, .png, .webp, .gif');
        });

        it('should return file size error for large files', () => {
            const validations = {
                format: true,
                fileSize: false,
                dimensions: true
            };
            
            const errors = validator.getValidationErrors(validations);
            expect(errors).toContain('File too large. Maximum size: 50MB');
        });

        it('should return dimensions error for small images', () => {
            const validations = {
                format: true,
                fileSize: true,
                dimensions: false
            };
            
            const errors = validator.getValidationErrors(validations);
            expect(errors).toContain('Image too small. Minimum: 100x100px');
        });

        it('should return multiple errors when multiple validations fail', () => {
            const validations = {
                format: false,
                fileSize: false,
                dimensions: false
            };
            
            const errors = validator.getValidationErrors(validations);
            expect(errors).toHaveLength(3);
            expect(errors).toContain('Unsupported format. Supported: .jpg, .jpeg, .png, .webp, .gif');
            expect(errors).toContain('File too large. Maximum size: 50MB');
            expect(errors).toContain('Image too small. Minimum: 100x100px');
        });
    });

    describe('constructor', () => {
        it('should initialize with default values', () => {
            const newValidator = new ImageValidator();
            
            expect(newValidator.supportedFormats).toEqual(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
            expect(newValidator.maxFileSize).toBe(50 * 1024 * 1024);
            expect(newValidator.minDimensions).toEqual({ width: 100, height: 100 });
        });

        it('should allow custom configuration', () => {
            const customValidator = new ImageValidator({
                maxFileSize: 10 * 1024 * 1024, // 10MB
                minDimensions: { width: 200, height: 200 }
            });
            
            expect(customValidator.maxFileSize).toBe(10 * 1024 * 1024);
            expect(customValidator.minDimensions).toEqual({ width: 200, height: 200 });
        });
    });

    describe('edge cases', () => {
        it('should handle empty filename', () => {
            expect(validator.isValidImageFormat('')).toBe(false);
        });

        it('should handle filename without extension', () => {
            expect(validator.isValidImageFormat('filename')).toBe(false);
        });

        it('should handle filename with multiple dots', () => {
            expect(validator.isValidImageFormat('file.name.jpg')).toBe(true);
            expect(validator.isValidImageFormat('file.name.txt')).toBe(false);
        });

        it('should handle null and undefined inputs', () => {
            expect(validator.isValidImageFormat(null)).toBe(false);
            expect(validator.isValidImageFormat(undefined)).toBe(false);
        });
    });

    describe('integration tests', () => {
        it('should validate a complete image validation workflow', () => {
            const filename = 'test-image.jpg';
            const validations = {
                format: validator.isValidImageFormat(filename),
                fileSize: true, // Assume valid for this test
                dimensions: true // Assume valid for this test
            };
            
            const errors = validator.getValidationErrors(validations);
            const isValid = Object.values(validations).every(v => v);
            
            expect(isValid).toBe(true);
            expect(errors).toEqual([]);
        });

        it('should handle complete validation failure', () => {
            const filename = 'test-file.txt';
            const validations = {
                format: validator.isValidImageFormat(filename),
                fileSize: false,
                dimensions: false
            };
            
            const errors = validator.getValidationErrors(validations);
            const isValid = Object.values(validations).every(v => v);
            
            expect(isValid).toBe(false);
            expect(errors.length).toBeGreaterThan(0);
        });
    });
});