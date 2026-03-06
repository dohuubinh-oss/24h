import Question from '../models/Question.js';
import asyncHandler from '../middleware/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import APIFeatures from '../utils/apiFeatures.js';

/**
 * @desc    Add multiple questions from a JSON array
 * @route   POST /api/v1/questions/add-many
 * @access  Private
 */
export const addQuestionsFromJson = asyncHandler(async (req, res, next) => {
  const questionsData = req.body;

  if (!Array.isArray(questionsData) || questionsData.length === 0) {
    return next(new ErrorResponse('Request body must be a non-empty array of questions', 400));
  }

  try {
    // CORRECT: Use Question.create() to ensure 'save' middleware is triggered for each document.
    // This guarantees that all validation and data processing logic in the model is executed.
    const createdQuestions = await Question.create(questionsData);

    res.status(201).json({
      success: true,
      count: createdQuestions.length,
      message: `${createdQuestions.length} câu hỏi đã được thêm thành công.`,
      data: createdQuestions,
    });
  } catch (error) {
    // Errors from the 'save' middleware (e.g., validation errors) will now be caught correctly.
    return next(new ErrorResponse(error.message, 400));
  }
});

/**
 * @desc    Get all questions with filtering, sorting, pagination
 * @route   GET /api/v1/questions
 * @access  Private 
 */
export const getQuestions = asyncHandler(async (req, res, next) => {
  const features = new APIFeatures(Question.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const questions = await features.query;

  const totalQuery = new APIFeatures(Question.find(), req.query).filter().query.getFilter();
  const totalQuestions = await Question.countDocuments(totalQuery);

  res.status(200).json({
    success: true,
    total: totalQuestions, 
    count: questions.length,
    data: questions,
  });
});


/**
 * @desc    Get single question
 * @route   GET /api/v1/questions/:id
 * @access  Private
 */
export const getQuestionById = asyncHandler(async (req, res, next) => {
  const question = await Question.findById(req.params.id);

  if (!question) {
    return next(
      new ErrorResponse(`Question not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: question,
  });
});

/**
 * @desc    Update question
 * @route   PUT /api/v1/questions/:id
 * @access  Private
 */
export const updateQuestion = asyncHandler(async (req, res, next) => {
  const question = await Question.findById(req.params.id);

  if (!question) {
    return next(
      new ErrorResponse(`Question not found with id of ${req.params.id}`, 404)
    );
  }

  // CORRECT: Manually update fields and then call .save() to trigger middleware.
  // This is the robust way to ensure validation runs on updates.
  Object.assign(question, req.body);

  const updatedQuestion = await question.save();

  res.status(200).json({
    success: true,
    data: updatedQuestion,
  });
});


/**
 * @desc    Delete question
 * @route   DELETE /api/v1/questions/:id
 * @access  Private
 */
export const deleteQuestion = asyncHandler(async (req, res, next) => {
  const question = await Question.findById(req.params.id);

   if (!question) {
    return next(
      new ErrorResponse(`Question not found with id of ${req.params.id}`, 404)
    );
  }

  await question.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
    message: "Question deleted successfully"
  });
});
