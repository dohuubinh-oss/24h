import express from 'express';
import {
  addQuestionsFromJson,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
} from '../controllers/questionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Route for getting all questions
router.route('/').get(protect, getQuestions);

// Route for getting, updating, and deleting a single question by ID
router
  .route('/:id')
  .get(protect, getQuestionById)
  .put(protect, updateQuestion)
  .delete(protect, deleteQuestion);

// Route for adding multiple questions from a JSON array
router.route('/add-many').post(protect, addQuestionsFromJson);

export default router;
