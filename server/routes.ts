
import { Router } from "express";
import multer from "multer";
import path from "path";
import { analyzeFile } from "./ai";

const router = Router();
const upload = multer({
  storage: multer.diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  })
});

router.post('/api/chat/upload', upload.array('files'), async (req, res) => {
  try {
    if (!req.files || !Array.isArray(req.files)) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const files = req.files.map(file => ({
      name: file.originalname,
      type: path.extname(file.originalname).slice(1),
      url: `/uploads/${file.filename}`
    }));

    const analysis = await analyzeFile(files);

    res.json({
      files,
      analysis
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Error processing files' });
  }
});

export default router;
