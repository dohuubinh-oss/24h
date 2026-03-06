import express from 'express';
import { gradeEssaysForSubmission } from '../controllers/aiGradingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Route để kích hoạt việc chấm điểm tự luận bằng AI cho một bài làm cụ thể
// `protect` để đảm bảo chỉ người dùng đăng nhập mới có thể thực hiện
// (Trong tương lai có thể thêm middleware `admin` để chỉ admin mới được chấm)
router.route('/:id/grade-essays').post(protect, gradeEssaysForSubmission);

export default router;
