# Mockup Batch Generator - CLI Usage Guide

## Overview

The Mockup Batch Generator is a powerful command-line tool for processing multiple images and generating professional mockups in batch mode. It supports various templates, output formats, and quality settings.

## Installation

```bash
npm install -g mockup-batch-gen
# or
npm install mockup-batch-gen
```

## Basic Usage

```bash
mockup-batch-gen -i <input-directory> -o <output-directory>
```

## Command Line Options

### Required Options

- `-i, --input <path>` - Input directory containing images to process
- `-o, --output <path>` - Output directory for generated mockups

### Optional Options

- `-t, --template <name>` - Mockup template to use (default: "default")
- `-f, --format <type>` - Output format: png, jpg, webp (default: "png")
- `-q, --quality <number>` - Output quality 1-100 (default: "90")
- `-h, --help` - Display help information
- `-V, --version` - Display version number

## Available Templates

### Default Template
- **Size**: 1200x800px
- **Padding**: 50px
- **Use case**: General purpose mockups

```bash
mockup-batch-gen -i ./designs -o ./output -t default
```

### Mobile Template
- **Size**: 375x812px
- **Padding**: 20px
- **Use case**: Mobile app screenshots

```bash
mockup-batch-gen -i ./mobile-screens -o ./mobile-mockups -t mobile
```

### Desktop Template
- **Size**: 1920x1080px
- **Padding**: 100px
- **Use case**: Desktop application screenshots

```bash
mockup-batch-gen -i ./desktop-screens -o ./desktop-mockups -t desktop
```

### Tablet Template
- **Size**: 768x1024px
- **Padding**: 40px
- **Use case**: Tablet interface mockups

```bash
mockup-batch-gen -i ./tablet-designs -o ./tablet-mockups -t tablet
```

### Social Post Template
- **Size**: 1080x1080px
- **Padding**: 60px
- **Use case**: Square social media posts

```bash
mockup-batch-gen -i ./social-content -o ./social-mockups -t social-post
```

### Banner Template
- **Size**: 1200x400px
- **Padding**: 30px
- **Use case**: Wide banner designs

```bash
mockup-batch-gen -i ./banners -o ./banner-mockups -t banner
```

### Business Card Template
- **Size**: 350x200px
- **Padding**: 15px
- **Use case**: Business card designs

```bash
mockup-batch-gen -i ./cards -o ./card-mockups -t business-card
```

## Output Formats

### PNG (Recommended)
- **Quality**: Lossless compression
- **Transparency**: Supported
- **File size**: Larger
- **Use case**: High-quality mockups, logos with transparency

```bash
mockup-batch-gen -i ./input -o ./output -f png -q 90
```

### JPEG
- **Quality**: Lossy compression
- **Transparency**: Not supported
- **File size**: Smaller
- **Use case**: Photographs, web display

```bash
mockup-batch-gen -i ./input -o ./output -f jpg -q 85
```

### WebP
- **Quality**: Efficient compression
- **Transparency**: Supported
- **File size**: Smallest
- **Use case**: Modern web applications

```bash
mockup-batch-gen -i ./input -o ./output -f webp -q 80
```

## Examples

### Basic Batch Processing
```bash
# Process all images in 'designs' folder with default settings
mockup-batch-gen -i ./designs -o ./mockups
```

### Mobile App Screenshots
```bash
# Create mobile mockups with high quality PNG output
mockup-batch-gen -i ./app-screens -o ./mobile-mockups -t mobile -f png -q 95
```

### Web Optimized Mockups
```bash
# Generate WebP mockups for web use
mockup-batch-gen -i ./web-designs -o ./web-mockups -t desktop -f webp -q 80
```

### Social Media Content
```bash
# Create square mockups for social media
mockup-batch-gen -i ./social-designs -o ./social-mockups -t social-post -f jpg -q 85
```

## Supported Input Formats

- **JPEG** (.jpg, .jpeg)
- **PNG** (.png)
- **WebP** (.webp)
- **GIF** (.gif)

## File Naming Convention

Output files are automatically named with the pattern:
```
mockup_[original-filename].[output-format]
```

Example:
- Input: `design.png`
- Output: `mockup_design.png`

## Error Handling

The tool includes comprehensive error handling for:

- **Invalid input directory**: Checks if the input directory exists and is readable
- **Unsupported file formats**: Skips non-image files with warnings
- **File size limits**: Validates file sizes (max 50MB)
- **Image dimensions**: Ensures minimum dimensions (100x100px)
- **Output directory**: Creates output directory if it doesn't exist

## Logging

The tool provides detailed logging information:

- **Info level**: General processing information
- **Debug level**: Detailed processing steps
- **Error level**: Error messages and stack traces
- **Performance**: Processing time for each file and batch statistics

## Performance Tips

1. **Use appropriate quality settings**:
   - PNG: 90-95 for high quality
   - JPEG: 80-90 for good balance
   - WebP: 75-85 for optimal compression

2. **Choose the right template**:
   - Use mobile template for app screenshots
   - Use desktop template for web applications
   - Use social-post template for social media

3. **Batch processing**:
   - Process similar images together
   - Use consistent input formats
   - Ensure adequate disk space

## Troubleshooting

### Common Issues

**"Input directory not found"**
- Verify the input path exists
- Check file permissions
- Use absolute paths if relative paths fail

**"No valid image files found"**
- Ensure input directory contains supported image formats
- Check file extensions are correct
- Verify files are not corrupted

**"Output directory creation failed"**
- Check write permissions for output location
- Ensure adequate disk space
- Verify parent directories exist

**"Processing failed for file"**
- Check if input file is corrupted
- Verify file meets minimum dimension requirements
- Ensure file size is under 50MB limit

### Getting Help

For additional help and support:

1. Run `mockup-batch-gen --help` for quick reference
2. Check the GitHub repository for issues and documentation
3. Review log files for detailed error information

## Advanced Configuration

For advanced users, you can modify the `config/templates.json` file to:

- Add custom templates
- Modify existing template dimensions
- Adjust quality settings per format
- Configure validation rules

Example custom template:
```json
{
  "custom-template": {
    "width": 1440,
    "height": 900,
    "padding": 75,
    "background": "#f8f9fa",
    "description": "Custom widescreen template"
  }
}
```