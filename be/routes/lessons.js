import express from 'express';
const router = express.Router();

// Import controller functions
import {
    createLesson,
    getAllLessons,
    getLessonById,
    updateLesson,
    deleteLesson
} from '../controllers/lessonController.js';

// Định nghĩa các routes

// Route cho lấy tất cả bài giảng và tạo bài giảng mới
router.route('/')
    .get(getAllLessons)
    .post(createLesson);

// Route cho lấy, cập nhật, và xóa một bài giảng cụ thể bằng ID
router.route('/:id')
    .get(getLessonById)
    .put(updateLesson)
    .delete(deleteLesson);

export default router;