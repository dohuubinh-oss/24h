import fs from 'fs/promises';
import path from 'path';
import multer from 'multer';
import { getTextFromImage } from '../utils/gemini.js';

// ------------------ MIDDLEWARE XỬ LÝ UPLOAD ------------------

// Hàm tạo thư mục theo ngày tháng YYYY/MM/DD để lưu file
// Tôi thêm lại hàm này và export nó
export const createFolderByDate = (req, res, next) => {
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  
  // Đường dẫn đầy đủ tính từ thư mục gốc của project
  const dirPath = path.join('public', 'uploads', year, month, day);
  req.uploadDir = dirPath; // Lưu đường dẫn để multer sử dụng

  // Tạo thư mục nếu nó chưa tồn tại
  fs.mkdir(dirPath, { recursive: true })
    .then(() => next())
    .catch(err => next(err));
};

// Cấu hình lưu trữ cho multer (diskStorage) để lưu file vào server
// Tôi cũng thêm lại cấu hình này và export middleware 'upload'
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, req.uploadDir); // Sử dụng đường dẫn đã tạo từ middleware createFolderByDate
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// Middleware multer để xử lý upload, được export để route sử dụng
export const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Giới hạn file 10MB
    fileFilter: function (req, file, cb) {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Chỉ chấp nhận file hình ảnh!'), false);
        }
        cb(null, true);
    }
});

// ------------------ CONTROLLER CHÍNH ------------------

// Controller chính để nhận dạng chữ viết. 
// Tôi đã đổi tên nó lại thành `recognizeHandwriting` để khớp với file route của bạn.
export const recognizeHandwriting = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Không có tệp nào được tải lên.' });
  }

  try {
    const filePath = req.file.path;
    const mimeType = req.file.mimetype;

    const imageBuffer = await fs.readFile(filePath);
    const ocrText = await getTextFromImage(imageBuffer, mimeType);

    // Chuyển đổi đường dẫn file hệ thống thành đường dẫn web có thể truy cập
    // Ví dụ: 'public/uploads/2024/05/21/file.png' -> '/uploads/2024/05/21/file.png'
    const webPath = '/' + path.relative('public', filePath).replace(/\\/g, '/');

    res.status(200).json({
      message: 'Nhận dạng thành công',
      text: ocrText,
      imageUrl: webPath,
    });

  } catch (error) {
    console.error('Lỗi trong quá trình nhận dạng chữ viết:', error);
    if (error.message.includes('Google')) {
        return res.status(502).json({ message: 'Lỗi từ dịch vụ nhận dạng của Google.' });
    }
    res.status(500).json({ message: 'Lỗi server khi xử lý ảnh.' });
  }
};
