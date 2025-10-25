import express from 'express';
import { chatAI, getPersonalizedSuggestions } from '../controllers/aiController.js';
import isAuth from '../middlewares/isAuth.js'; // ✅ Fixed: default import + correct filename

const router = express.Router();

// AI Chat endpoint
router.post('/chat', isAuth, chatAI); // ✅ Changed from isAuthenticated to isAuth

// Get personalized suggestions
router.get('/suggestions', isAuth, getPersonalizedSuggestions); // ✅ Changed from isAuthenticated to isAuth

export default router;
