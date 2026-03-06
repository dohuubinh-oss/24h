import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema(
  {
    grade: {
      type: String,
      required: [true, 'Vui lòng cung cấp khối lớp.'],
      enum: {
        values: [
          'Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9', 
          'Lớp 10', 'Lớp 11', 'Lớp 12'
        ],
        message: 'Khối lớp không hợp lệ. Vui lòng chọn một trong các giá trị đã cho.'
      },
      trim: true,
    },
    topic: {
      type: String,
      required: [true, 'Vui lòng cung cấp chủ đề.'],
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    difficulty: {
      type: String,
      required: [true, 'Vui lòng cung cấp mức độ khó.'],
      enum: ['Nhận biết', 'Thông hiểu', 'Vận dụng', 'Vận dụng cao'],
    },
    type: {
      type: String,
      required: [true, 'Vui lòng cung cấp loại câu hỏi.'],
      enum: ['Trắc nghiệm', 'Tự luận'],
    },
    content: {
      type: String,
      required: [true, 'Vui lòng cung cấp nội dung câu hỏi.'],
      trim: true,
    },
    options: [String], // Not required for 'Tự luận'
    // CHANGED: from correctOptionId (String) to correctOptionIndex (Number)
    correctOptionIndex: Number, // Not required for 'Tự luận'
    solution: {
      type: String,
      default: '',
      trim: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    point: {
      type: Number,
      required: [true, 'Vui lòng cung cấp điểm cho câu hỏi.'],
      min: [0, 'Điểm không được âm.'],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Middleware to apply conditional validation before saving
QuestionSchema.pre('save', function (next) {
  // For Multiple Choice questions
  if (this.type === 'Trắc nghiệm') {
    if (!this.options || this.options.length < 2) {
      return next(new Error('Câu hỏi trắc nghiệm phải có ít nhất 2 lựa chọn.'));
    }
    // VALIDATION CHANGED: Check if index is a valid number within the options array bounds
    if (this.correctOptionIndex == null || this.correctOptionIndex < 0 || this.correctOptionIndex >= this.options.length) {
      return next(new Error('Vui lòng cung cấp đáp án đúng hợp lệ cho câu hỏi trắc nghiệm.'));
    }
  }

  // For Essay questions, ensure MC fields are not present
  if (this.type === 'Tự luận') {
    this.options = undefined;
    // CHANGED: target correctOptionIndex instead of correctOptionId
    this.correctOptionIndex = undefined;
  }
  
  next();
});

export default mongoose.model('Question', QuestionSchema);
