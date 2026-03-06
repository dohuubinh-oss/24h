import express from 'express';
import { getExams, getExamById } from '../controllers/examController.js';
import { submitExam } from '../controllers/submissionController.js'; // Import controller mới
import { protect } from '../middleware/auth.js';
import Exam from '../models/Exam.js';

const router = express.Router();

// Route để lấy tất cả bài thi và tạo bài thi mới
router.route('/')
  .get(protect, getExams)
  .post(protect, async (req, res) => {
    const { name, grade, examType, examCode, duration, difficulty, gradingScale, questions } = req.body;

    if (!name || !grade || !examType || !duration || !difficulty || !questions) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ các trường bắt buộc.' });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'Danh sách câu hỏi không hợp lệ.' });
    }

    try {
      const newExam = new Exam({
        name,
        grade,
        examType,
        examCode,
        duration,
        difficulty,
        gradingScale,
        questions,
        createdBy: req.user._id
      });

      const createdExam = await newExam.save();
      res.status(201).json({ success: true, data: createdExam });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Không thể tạo đề thi', error: error.message });
    }
  });

// Route để lấy một bài thi cụ thể theo ID
router.route('/:id').get(getExamById);

// --- ROUTE MỚI ĐỂ NỘP BÀI ---
// Áp dụng middleware `protect` để đảm bảo người dùng đã đăng nhập
router.route('/:id/submit').post(protect, submitExam);


export default router;
