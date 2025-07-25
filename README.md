# Mockup Batch Generator

A powerful tool for generating multiple mockups in batch processing mode.

## Features

- Batch processing of multiple designs
- Customizable mockup templates
- High-resolution output
- Multiple format support
- Parallel processing for faster batch jobs (configurable concurrency)
- Experimental PSD file support (preview, smart object editing coming soon)

## Installation

```bash
git clone https://github.com/Keyursinh06-s/Mockup-Batch-gen.git
cd Mockup-Batch-gen
npm install
```

## Usage

```bash
npm start -- -c 8 # Process 8 files in parallel
npm start -- --psd-preview # Enable PSD preview mode (experimental)
```

## PSD Web Preview & Smart Object Editing (Experimental)

You can start a web server to upload, preview, and edit PSD files (add smart objects/shapes) for mockup generation.

### Start the server

```bash
npm run psd-server
```

The server will be available at http://localhost:3000

### Features
- Upload and preview PSD files in the browser
- Add shapes or smart objects to PSD layers (UI in progress)
- Download or use the edited PSD for batch mockup generation

This feature is experimental and under active development.

## Contributing

Pull requests are welcome. For major changes, please open an issue first.

## License

MIT