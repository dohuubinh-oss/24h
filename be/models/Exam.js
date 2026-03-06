import mongoose from 'mongoose';
const { Schema } = mongoose;

const ExamSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Tên đề thi không được để trống'],
    trim: true
  },
  grade: {
    type: String,
    required: [true, 'Khối lớp không được để trống'],
    enum: ['Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9', 'Lớp 10', 'Lớp 11', 'Lớp 12']
  },
  examType: {
    type: String,
    required: [true, 'Loại đề thi không được để trống'],
    enum: [
      'Bài tập về nhà',
      'Kiểm tra 15 phút',
      'Kiểm tra 1 tiết',
      'Kiểm tra giữa kì 1',
      'Kiểm tra giữa kỳ 2',
      'Thi học kì 1',
      'Thi học kì 2',
      'Thi chuyển cấp'
    ]
  },
  examCode: {
    type: String,
    trim: true
  },
  duration: {
    type: Number,
    required: [true, 'Thời gian làm bài không được để trống'],
    min: [1, 'Thời gian làm bài phải lớn hơn 0']
  },
  difficulty: {
    type: String,
    required: [true, 'Độ khó của đề thi không được để trống'],
    enum: ['Nhận biết', 'Thông hiểu', 'Vận dụng', 'Vận dụng cao'],
    default: 'Thông hiểu'
  },
  questions: [{
    type: Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  }],
  numMultipleChoice: {
    type: Number,
    default: 0,
    min: 0
  },
  numEssay: {
    type: Number,
    default: 0,
    min: 0
  },
  gradingScale: {
    type: Number,
    default: 10,
    enum: [10, 100]
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Middleware to auto-calculate question counts before saving
ExamSchema.pre('save', async function(next) {
  if (this.isModified('questions')) {
    // We need to populate the questions to access their 'type'
    await this.populate('questions');
    
    let mcCount = 0;
    let essayCount = 0;
    
    this.questions.forEach(question => {
      if (question.type === 'Trắc nghiệm') {
        mcCount++;
      } else {
        // Assuming any other type is considered an essay question
        essayCount++;
      }
    });
    
    this.numMultipleChoice = mcCount;
    this.numEssay = essayCount;
    
    // Depopulate after counting to avoid saving populated fields
    this.depopulate('questions');
  }
  next();
});

const Exam = mongoose.model('Exam', ExamSchema);

export default Exam;
