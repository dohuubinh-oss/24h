import asyncHandler from '../middleware/asyncHandler.js';
import Exam from '../models/Exam.js';
import ExamSubmission from '../models/ExamSubmission.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Submit answers for an exam
// @route   POST /api/v1/exams/:id/submit
// @access  Private
const submitExam = asyncHandler(async (req, res, next) => {
  const { id: examId } = req.params;
  const { answers } = req.body;
  const userId = req.user._id;

  const exam = await Exam.findById(examId).populate({
    path: 'questions',
    select: 'type correctOptionIndex point'
  });

  if (!exam) {
    return next(new ErrorResponse('Không tìm thấy bài thi.', 404));
  }

  const questions = exam.questions;
  let score = 0;
  let totalCorrect = 0;
  let hasEssayQuestions = false;

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    const userAnswer = answers[i];

    if (question.type === 'Trắc nghiệm') {
      if (userAnswer !== undefined && userAnswer === question.correctOptionIndex) {
        score += (question.point || 0);
        totalCorrect++;
      }
    } else if (question.type === 'Tự luận') {
      hasEssayQuestions = true;
    }
  }

  const gradingStatus = hasEssayQuestions ? 'pending_review' : 'auto_graded';

  const submission = await ExamSubmission.create({
    exam: examId,
    user: userId,
    answers,
    score,
    totalCorrect,
    totalQuestions: questions.length,
    gradingStatus,
    submittedAt: new Date(),
  });

  res.status(201).json({
    success: true,
    message: 'Nộp bài thành công!',
    data: {
      submissionId: submission._id,
      score,
      totalCorrect,
      totalQuestions: questions.length,
      gradingStatus,
    },
  });
});

// @desc    Get a single submission by its ID
// @route   GET /api/v1/submissions/:id
// @access  Private (Chủ sở hữu hoặc Admin)
const getSubmissionById = asyncHandler(async (req, res, next) => {
  // Logic kiểm tra quyền đã được chuyển sang middleware, 
  // controller giờ đây chỉ tập trung vào việc lấy và trả về dữ liệu.
  const submission = await ExamSubmission.findById(req.params.id)
    .populate({ path: 'user', select: 'name email' })
    .populate({
      path: 'exam',
      populate: { path: 'questions', model: 'Question' },
    });

  // Middleware đã xử lý việc submission không tồn tại, nhưng để an toàn, ta vẫn có thể kiểm tra lại
  if (!submission) {
    return next(new ErrorResponse(`Không tìm thấy bài làm với ID ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: submission,
  });
});

export { submitExam, getSubmissionById };
