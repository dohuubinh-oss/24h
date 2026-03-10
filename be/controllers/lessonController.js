import asyncHandler from '../middleware/asyncHandler.js';
import Lesson from '../models/Lesson.js';

// @desc    Tạo một bài giảng mới
// @route   POST /api/v1/lessons
// @access  Private (Cần xác thực, ví dụ: giáo viên)
export const createLesson = asyncHandler(async (req, res, next) => {
    // Note: This route should be protected to get req.user
    // if (req.user) {
    //     req.body.authorId = req.user.id;
    // }
    const lesson = await Lesson.create(req.body);
    res.status(201).json({ success: true, data: lesson });
});

// @desc    Lấy tất cả bài giảng
// @route   GET /api/v1/lessons
// @access  Public
export const getAllLessons = asyncHandler(async (req, res, next) => {
    const lessons = await Lesson.find();
    res.status(200).json({ success: true, count: lessons.length, data: lessons });
});

// @desc    Lấy một bài giảng bằng ID
// @route   GET /api/v1/lessons/:id
// @access  Public
export const getLessonById = asyncHandler(async (req, res, next) => {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy bài giảng' });
    }

    res.status(200).json({ success: true, data: lesson });
});

// @desc    Cập nhật bài giảng
// @route   PUT /api/v1/lessons/:id
// @access  Private
export const updateLesson = asyncHandler(async (req, res, next) => {
    let lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy bài giảng' });
    }

    // Note: Add authorization logic here. e.g.:
    // if (lesson.authorId.toString() !== req.user.id) {
    //     return res.status(401).json({ success: false, message: 'Không có quyền cập nhật bài giảng này' });
    // }

    lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({ success: true, data: lesson });
});

// @desc    Xóa bài giảng
// @route   DELETE /api/v1/lessons/:id
// @access  Private
export const deleteLesson = asyncHandler(async (req, res, next) => {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy bài giảng' });
    }

    // Note: Add authorization logic here.
    // if (lesson.authorId.toString() !== req.user.id) {
    //     return res.status(401).json({ success: false, message: 'Không có quyền xóa bài giảng này' });
    // }

    await lesson.deleteOne();

    res.status(200).json({ success: true, data: {} });
});
