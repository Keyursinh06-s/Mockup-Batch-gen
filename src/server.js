const express = require('express');
const cors = require('cors');
const multer = require('multer');
const PSD = require('psd');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });
const PORT = 3000;

app.use(cors());
app.use(express.json());
const webBuildPath = path.join(__dirname, 'web', 'build');
if (fs.existsSync(webBuildPath)) {
  app.use(express.static(webBuildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(webBuildPath, 'index.html'));
  });
}

// Upload PSD and return basic info
app.post('/api/upload', upload.single('psd'), async (req, res) => {
  try {
    const psdPath = req.file.path;
    const psd = await PSD.open(psdPath);
    psd.parse();
    const tree = psd.tree().export();
    res.json({
      success: true,
      tree,
      filename: req.file.originalname,
      tempPath: psdPath
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Render a flattened PNG preview of the PSD
app.get('/api/preview/:tempPath', async (req, res) => {
  try {
    const tempPath = path.join('uploads', path.basename(req.params.tempPath));
    if (!fs.existsSync(tempPath)) return res.status(404).send('PSD not found');
    const psd = await PSD.open(tempPath);
    psd.parse();
    const img = psd.image;
    if (!img) return res.status(400).send('No image in PSD');
    const pngBuffer = await img.toPng();
    res.set('Content-Type', 'image/png');
    res.send(pngBuffer);
  } catch (err) {
    res.status(500).send('Error rendering preview: ' + err.message);
  }
});

// TODO: Add endpoints for smart object insertion, shape drawing, and PSD export

app.listen(PORT, () => {
  console.log(`PSD Preview server running at http://localhost:${PORT}`);
});