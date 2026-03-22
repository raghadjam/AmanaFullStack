import { Router } from 'express';
import multer from 'multer';
import extractPDF from '../utils/extractPDF';
import extractDOCX from '../utils/extractDOCX';

const router = Router();
const upload = multer({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
});

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (req.file) {
      const mime = req.file.mimetype;

      if (mime === 'application/pdf') {
        const text = await extractPDF(req.file.buffer);
        return res.json({ text });
      }

      if (
        mime ===
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        mime === 'application/msword'
      ) {
        const text = await extractDOCX(req.file.buffer);
        return res.json({ text });
      }

      // Fallback for plain text or unknown formats
      return res.json({ text: req.file.buffer.toString('utf8') });
    }

    return res.status(400).json({ error: 'No file uploaded' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to extract text' });
  }
});

export default router;
