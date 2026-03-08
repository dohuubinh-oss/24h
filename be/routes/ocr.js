import express from 'express';
import {
  createFolderByDate,
  upload,
  recognizeHandwriting
} from '../controllers/ocrController.js';

const router = express.Router();

// Định nghĩa route POST cho việc nhận dạng chữ viết
// POST /api/v1/ocr/recognize
router.post(
    '/recognize',
    createFolderByDate, 
    upload.single('handwrittenImage'), 
    recognizeHandwriting
);

export default router;
