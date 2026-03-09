import express from 'express';
import {
    gradeEssaysForSubmission
} from '../controllers/aiGradingController.js';
import {
    getSubmissionById,
} from '../controllers/submissionController.js';
import {
    protect,
    authorize,
    checkSubmissionOwnership
} from '../middleware/auth.js';

const router = express.Router();

// Middleware `protect` được áp dụng cho tất cả các route bên dưới 
// vì mọi hành động liên quan đến submission đều yêu cầu người dùng phải đăng nhập.
router.use(protect);

// Route để lấy chi tiết một bài nộp theo ID.
// GET /api/v1/submissions/:id
// Chuỗi middleware được thực thi tuần tự:
// 1. `protect`: Xác thực người dùng.
// 2. `checkSubmissionOwnership`: Kiểm tra xem người dùng có phải là chủ bài nộp hoặc admin không.
// 3. `getSubmissionById`: Nếu vượt qua 2 bước trên, hàm controller sẽ được thực thi.
router.route('/:id').get(checkSubmissionOwnership, getSubmissionById);

// Route để kích hoạt việc chấm điểm tự luận bằng AI cho một bài làm cụ thể.
// POST /api/v1/submissions/:id/grade-essays
// Yêu cầu người dùng phải đăng nhập (`protect`) và có vai trò là 'admin' (`authorize('admin')`).
router.route('/:id/grade-essays').post(authorize('admin'), gradeEssaysForSubmission);

export default router;
