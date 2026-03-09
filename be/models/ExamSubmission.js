import mongoose from 'mongoose';

const GradingDetailSchema = new mongoose.Schema({
  score: {
    type: Number,
    required: true,
  },
  feedback: {
    type: String,
    required: true,
  },
}, { _id: false });

const ExamSubmissionSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.ObjectId,
    ref: 'Exam',
    required: true,
    index: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  answers: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    required: true,
  },
  
  autoGradeScore: {
    type: Number,
    default: 0,
  },
  aiGradedScore: {
    type: Number,
    default: 0,
  },
  finalScore: {
    type: Number,
    default: 0,
  },

  gradingDetails: {
    type: Map,
    of: GradingDetailSchema,
  },

  gradingStatus: {
    type: String,
    enum: [
      'pending_auto_grade',
      'pending_ai_grade',
      'grading_failed',
      'pending_manual_review',
      'fully_graded'
    ],
    default: 'pending_auto_grade',
    required: true,
  },

  totalCorrect: {
    type: Number,
    default: 0,
  },
  totalQuestions: {
      type: Number,
      required: true,
  },
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
  timestamps: true,
});

ExamSubmissionSchema.pre('save', function(next) {
  if (this.isModified('submittedAt') && this.startedAt) {
    this.timeTaken = Math.round((this.submittedAt.getTime() - this.startedAt.getTime()) / 1000);
  }
  next();
});

ExamSubmissionSchema.pre('save', function(next) {
  if (this.isModified('autoGradeScore') || this.isModified('aiGradedScore')) {
    this.finalScore = (this.autoGradeScore || 0) + (this.aiGradedScore || 0);
  }
  next();
});

const ExamSubmission = mongoose.model('ExamSubmission', ExamSubmissionSchema);

export default ExamSubmission;
