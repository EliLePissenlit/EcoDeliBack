import { Router } from 'express';
import { UserController } from '../../controllers/user/user.controller';
import { authenticate } from '../../middlewares/auth/auth.middleware';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     UserProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         email:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         role:
 *           type: string
 *           enum: [user, admin, super_admin]
 *         isEmailVerified:
 *           type: boolean
 *         phone:
 *           type: string
 *         placeId:
 *           type: string
 *           description: Google Maps Place ID de l'utilisateur
 *         isSuspended:
 *           type: boolean
 */

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Récupère le profil de l'utilisateur connecté
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil utilisateur récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur
 */
router.get('/me', authenticate, UserController.me);

/**
 * @swagger
 * /api/users/me:
 *   put:
 *     summary: Met à jour le profil de l'utilisateur connecté
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               placeId:
 *                 type: string
 *                 description: Google Maps Place ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Profil utilisateur mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur
 */
router.put('/me', authenticate, UserController.updateProfile);

export default router;
