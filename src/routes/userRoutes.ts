import { Router } from 'express';
import { auth, adminAuth } from '../middleware/auth';
import { UserService } from '../services/userService';
import { AsyncRequestHandler, AuthRequest } from '../types';

const router = Router();

// Inscription
router.post('/register', (async (req, res) => {
  const result = await UserService.register(req.body);
  res.status(result.success ? 201 : 400).json(result);
}) as AsyncRequestHandler);

// Connexion
router.post('/login', (async (req, res) => {
  const { email, password } = req.body;
  const result = await UserService.login(email, password);
  res.status(result.success ? 200 : 401).json(result);
}) as AsyncRequestHandler);

// Profil utilisateur
router.get('/me', auth, (async (req: AuthRequest, res) => {
  const result = await UserService.getProfile(req.user!.id);
  res.status(result.success ? 200 : 404).json(result);
}) as AsyncRequestHandler);

// Mise à jour du profil
router.put('/me', auth, (async (req: AuthRequest, res) => {
  const result = await UserService.updateProfile(req.user!.id, req.body);
  res.status(result.success ? 200 : 400).json(result);
}) as AsyncRequestHandler);

// Suppression du compte
router.delete('/me', auth, (async (req: AuthRequest, res) => {
  const result = await UserService.deleteAccount(req.user!.id);
  res.status(result.success ? 200 : 500).json(result);
}) as AsyncRequestHandler);

// Routes administrateur
router.get('/', adminAuth, (async (_, res) => {
  const result = await UserService.getAllUsers();
  res.status(result.success ? 200 : 500).json(result);
}) as AsyncRequestHandler);

router.get('/:id', adminAuth, (async (req, res) => {
  const result = await UserService.getProfile(parseInt(req.params.id));
  res.status(result.success ? 200 : 404).json(result);
}) as AsyncRequestHandler);

router.put('/:id/role', adminAuth, (async (req, res) => {
  const result = await UserService.updateUserRole(parseInt(req.params.id), req.body.role);
  res.status(result.success ? 200 : 400).json(result);
}) as AsyncRequestHandler);

router.put('/:id/admin', adminAuth, (async (req, res) => {
  const result = await UserService.updateAdminStatus(parseInt(req.params.id), req.body.is_admin);
  res.status(result.success ? 200 : 400).json(result);
}) as AsyncRequestHandler);

router.delete('/:id', adminAuth, (async (req, res) => {
  const result = await UserService.deleteUser(parseInt(req.params.id));
  res.status(result.success ? 200 : 500).json(result);
}) as AsyncRequestHandler);

export default router;
