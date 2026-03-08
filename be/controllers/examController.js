import asyncHandler from '../middleware/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js'; // Import ErrorResponse
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
const getExamById = asyncHandler(async (req, res, next) => { // Thêm next vào đây
    // LOG MỚI: In ra ID nhận được để kiểm tra
    console.log(`[BACKEND LOG]: Nhận được yêu cầu cho bài thi với ID: '${req.params.id}'`);

    const exam = await Exam.findById(req.params.id).populate('questions');

    // THÊM LOG: Kiểm tra kết quả của populate
    console.log('[BACKEND LOG]: Dữ liệu bài thi sau khi populate:', JSON.stringify(exam, null, 2));

    if (!exam) {
      // Nếu không tìm thấy, sử dụng ErrorResponse để chuyển lỗi cho errorHandler
      console.log(`[BACKEND LOG]: Không tìm thấy bài thi. Chuyển lỗi cho middleware.`);
      return next(new ErrorResponse('Không tìm thấy đề thi', 404));
    }

    // Nếu tìm thấy, log thêm để xác nhận và trả về dữ liệu
    console.log(`[BACKEND LOG]: Tìm thấy bài thi và trả về cho client.`);
    res.status(200).json({ success: true, data: exam });
});

export { getExams, getExamById };
