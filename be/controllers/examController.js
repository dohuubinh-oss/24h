import asyncHandler from '../middleware/asyncHandler.js';
import Exam from '../models/Exam.js';

// @desc    Fetch all exams
// @route   GET /api/v1/exams
// @access  Private/Admin
const getExams = asyncHandler(async (req, res) => {
  const exams = await Exam.find({})
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json(exams);
});

// @desc    Fetch a single exam by ID
// @route   GET /api/v1/exams/:id
// @access  Public
const getExamById = asyncHandler(async (req, res) => {
    // LOG MỚI: In ra ID nhận được để kiểm tra
    console.log(`[BACKEND LOG]: Nhận được yêu cầu cho bài thi với ID: '${req.params.id}'`);

    const exam = await Exam.findById(req.params.id).populate('questions');

    // THÊM LOG: Kiểm tra kết quả của populate
    console.log('[BACKEND LOG]: Dữ liệu bài thi sau khi populate:', JSON.stringify(exam, null, 2));

    if (exam) {
      // Nếu tìm thấy, log thêm để xác nhận
      console.log(`[BACKEND LOG]: Tìm thấy bài thi và trả về cho client.`);
      res.json({ success: true, data: exam });
    } else {
      // Nếu không tìm thấy, log và trả về lỗi 404
      console.log(`[BACKEND LOG]: Không tìm thấy bài thi. Trả về lỗi 404.`);
      res.status(404).json({ success: false, message: 'Không tìm thấy đề thi' });
    }
});

export { getExams, getExamById };
