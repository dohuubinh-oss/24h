import mongoose from 'mongoose';
const Schema = mongoose.Schema;

// Schema cho một bài tập mẫu (sample exercise)
const SampleExerciseSchema = new Schema({
    question: {
        type: String,
        required: [true, 'Đề bài là bắt buộc.']
    },
    modelAnswer: {
        type: String,
        required: [true, 'Lời giải mẫu là bắt buộc.']
    }
});

// Schema chính cho Bài giảng (Lesson)
const LessonSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Tiêu đề bài giảng là bắt buộc.'],
        trim: true
    },
    subject: {
        type: String,
        required: [true, 'Môn học là bắt buộc.'],
        trim: true
    },
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
    chapter: {
        type: String,
        required: [true, 'Chương mục là bắt buộc.'],
        trim: true
    },
    authorId: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Giả định bạn có một model 'User'
        required: true
    },
    theory: {
        content: {
            type: String,
            required: [true, 'Nội dung lý thuyết là bắt buộc.']
        }
    },
    sampleExercises: [SampleExerciseSchema]
}, {
    // Tự động thêm dấu thời gian createdAt và updatedAt
    timestamps: true
});

export default mongoose.model('Lesson', LessonSchema);