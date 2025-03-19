import express from 'express';
import { register, login, getProfile, updateProfile } from '../controllers/userController';
import { auth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { body } from 'express-validator';

const router = express.Router();

const registerValidation = [
  body('email').isEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  body('firstName').notEmpty().withMessage('Le prénom est requis'),
  body('lastName').notEmpty().withMessage('Le nom est requis'),
  validate
];

const loginValidation = [
  body('email').isEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Le mot de passe est requis'),
  validate
];

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);

export default router; 