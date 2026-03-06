import mongoose from 'mongoose';

const ExamSubmissionSchema = new mongoose.Schema({
  // ... (các trường cũ giữ nguyên)
  exam: {
    type: mongoose.Schema.ObjectId,
    ref: 'Exam',
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  answers: {
    type: Map,
    of: mongoose.Schema.Types.Mixed, // Lưu cả index (số) cho trắc nghiệm và text (chuỗi) cho tự luận
    required: true,
  },
  score: {
    type: Number,
    required: true,
    default: 0,
  },
  totalCorrect: {
    type: Number,
    required: true,
    default: 0,
  },
  totalQuestions: {
      type: Number,
      required: true,
  },

  // --- TRƯỜNG MỚI ĐỂ THEO DÕI TRẠNG THÁI CHẤM BÀI ---
  gradingStatus: {
    type: String,
    enum: ['auto_graded', 'pending_review', 'fully_graded'],
    default: 'auto_graded', // Mặc định là đã chấm tự động
  },
  // --- CÁC TRƯỜNG KHÁC ---
  startedAt: {
    type: Date,
    default: Date.now,
  },
  submittedAt: {
    type: Date,
  },
  timeTaken: {
    type: Number,
  }
}, {
  timestamps: true, // Tự động thêm createdAt và updatedAt
});

// Middleware để tính thời gian làm bài trước khi lưu
ExamSubmissionSchema.pre('save', function(next) {
  if (this.isModified('submittedAt') && this.startedAt) {
    this.timeTaken = Math.round((this.submittedAt.getTime() - this.startedAt.getTime()) / 1000);
  }
  next();
});

const ExamSubmission = mongoose.model('ExamSubmission', ExamSubmissionSchema);

export default ExamSubmission;
