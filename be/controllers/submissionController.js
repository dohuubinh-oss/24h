import asyncHandler from '../middleware/asyncHandler.js';
import Exam from '../models/Exam.js';
import ExamSubmission from '../models/ExamSubmission.js';

// @desc    Submit answers for an exam
// @route   POST /api/v1/exams/:id/submit
// @access  Private
const submitExam = asyncHandler(async (req, res) => {
  const { id: examId } = req.params;
  const { answers } = req.body;
  const userId = req.user._id;

  const exam = await Exam.findById(examId).populate({
    path: 'questions',
    select: 'type correctOptionIndex point'
  });

  if (!exam) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy bài thi.' });
  }

  const questions = exam.questions;
  let score = 0;
  let totalCorrect = 0;
  let hasEssayQuestions = false; // Biến để kiểm tra có câu tự luận hay không

  // 1. Chấm điểm tự động và kiểm tra loại câu hỏi
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
      // Với câu tự luận, chúng ta chỉ cần lưu câu trả lời.
      // Việc chấm điểm sẽ được thực hiện sau (bởi AI hoặc giáo viên).
    }
  }

  // 2. Xác định trạng thái chấm bài
  const gradingStatus = hasEssayQuestions ? 'pending_review' : 'auto_graded';

  // 3. Tạo và lưu lại kết quả nộp bài
  const submission = await ExamSubmission.create({
    exam: examId,
    user: userId,
    answers, // Lưu tất cả câu trả lời (cả trắc nghiệm và tự luận)
    score, // Điểm số hiện tại chỉ từ các câu trắc nghiệm
    totalCorrect, // Số câu đúng hiện tại chỉ từ các câu trắc nghiệm
    totalQuestions: questions.length,
    gradingStatus, // Lưu trạng thái chấm bài
    submittedAt: new Date(),
  });

  // 4. Trả kết quả về cho người dùng
  res.status(201).json({
    success: true,
    message: 'Nộp bài thành công!',
    data: {
      submissionId: submission._id,
      score, // Trả về điểm số đã chấm tự động
      totalCorrect,
      totalQuestions: questions.length,
      gradingStatus, // Cho frontend biết trạng thái
    },
  });
});

export { submitExam };
