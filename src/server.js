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
app.use(express.static(path.join(__dirname, 'public')));

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

// TODO: Add endpoints for smart object insertion, shape drawing, and PSD export

app.listen(PORT, () => {
  console.log(`PSD Preview server running at http://localhost:${PORT}`);
});