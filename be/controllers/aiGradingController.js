import asyncHandler from '../middleware/asyncHandler.js';
import ExamSubmission from '../models/ExamSubmission.js';
import Exam from '../models/Exam.js';
import { gradeEssayByAI } from '../utils/gemini.js';

const gradeEssaysForSubmission = asyncHandler(async (req, res) => {
  const { id: submissionId } = req.params;

  const submission = await ExamSubmission.findById(submissionId);
  if (!submission) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy bài làm.' });
  }
  if (submission.gradingStatus !== 'pending_ai_grade') {
    return res.status(400).json({ success: false, message: `Bài làm không ở trạng thái chờ chấm AI. Trạng thái hiện tại: ${submission.gradingStatus}` });
  }

  const exam = await Exam.findById(submission.exam).populate('questions');
  if (!exam) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy đề thi gốc.' });
  }

  let totalAiScore = 0;
  const newGradingDetails = new Map();

  for (let i = 0; i < exam.questions.length; i++) {
    const question = exam.questions[i];
    const studentAnswer = submission.answers.get(String(i));

    if (question.type === 'Tự luận') {
      try {
        const result = await gradeEssayByAI({
          question: question.questionText,
          studentAnswer: studentAnswer || '',
          modelAnswer: question.solution,
          maxPoints: question.point || 0,
        });

        totalAiScore += result.score;
        newGradingDetails.set(String(i), {
          score: result.score,
          feedback: result.feedback,
        });

      } catch (error) {
        console.error(`Lỗi khi chấm câu hỏi ${i} cho bài làm ${submissionId}:`, error);
        submission.gradingStatus = 'grading_failed';
        await submission.save();
        return res.status(500).json({ success: false, message: `Lỗi khi tương tác với AI: ${error.message}` });
      }
    }
  }

  submission.aiGradedScore = totalAiScore;
  submission.gradingDetails = newGradingDetails;
  submission.gradingStatus = 'fully_graded';

  await submission.save();

  res.status(200).json({
    success: true,
    message: 'Chấm điểm tự luận bằng AI thành công!',
    data: {
      submissionId: submission._id,
      autoGradeScore: submission.autoGradeScore,
      aiGradedScore: submission.aiGradedScore,
      finalScore: submission.finalScore,
      gradingStatus: submission.gradingStatus,
      details: Object.fromEntries(newGradingDetails),
    },
  });
});

export { gradeEssaysForSubmission };
