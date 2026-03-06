import asyncHandler from '../middleware/asyncHandler.js';
import ExamSubmission from '../models/ExamSubmission.js';
import Exam from '../models/Exam.js';
import { gradeEssayByAI } from '../utils/gemini.js';

// @desc    Grade all essay questions in a submission using AI
// @route   POST /api/v1/submissions/:id/grade-essays
// @access  Private (hoặc Admin)
const gradeEssaysForSubmission = asyncHandler(async (req, res) => {
  const { id: submissionId } = req.params;

  // 1. Lấy bài làm và đảm bảo nó cần được chấm
  const submission = await ExamSubmission.findById(submissionId);
  if (!submission) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy bài làm.' });
  }
  if (submission.gradingStatus !== 'pending_review') {
    return res.status(400).json({ success: false, message: `Bài làm này không ở trạng thái chờ chấm. Trạng thái hiện tại: ${submission.gradingStatus}` });
  }

  // 2. Lấy đề thi gốc để truy cập câu hỏi và đáp án mẫu
  const exam = await Exam.findById(submission.exam).populate('questions');
  if (!exam) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy đề thi gốc.' });
  }

  let totalEssayScore = 0;
  const gradingDetails = {}; // Lưu điểm và nhận xét chi tiết cho từng câu

  // 3. Lặp qua các câu hỏi để chấm điểm phần tự luận
  for (let i = 0; i < exam.questions.length; i++) {
    const question = exam.questions[i];
    const studentAnswer = submission.answers.get(String(i)); // Lấy câu trả lời của học sinh

    if (question.type === 'Tự luận') {
      // Gọi hàm chấm điểm bằng AI
      const result = await gradeEssayByAI({
        question: question.questionText, // Giả sử nội dung câu hỏi nằm trong questionText
        studentAnswer: studentAnswer || '',
        modelAnswer: question.solution, // Đáp án mẫu
        maxPoints: question.point || 0,
      });

      totalEssayScore += result.score;
      gradingDetails[i] = { 
        score: result.score, 
        feedback: result.feedback, 
        type: 'Tự luận' 
      };
    }
  }

  // 4. Cập nhật điểm số và trạng thái của bài làm
  // Cộng điểm AI chấm vào điểm trắc nghiệm đã có sẵn
  submission.score += totalEssayScore;
  submission.gradingStatus = 'fully_graded';
  
  // Thêm trường mới để lưu chi tiết quá trình chấm AI (tùy chọn)
  // Cần cập nhật model ExamSubmission để thêm trường `gradingDetails`
  // submission.gradingDetails = gradingDetails; 

  await submission.save();

  // 5. Trả về kết quả sau khi chấm xong
  res.status(200).json({
    success: true,
    message: 'Chấm điểm tự luận bằng AI thành công!',
    data: {
      submissionId: submission._id,
      newScore: submission.score,
      gradingStatus: submission.gradingStatus,
      details: gradingDetails,
    },
  });
});

export { gradeEssaysForSubmission };
