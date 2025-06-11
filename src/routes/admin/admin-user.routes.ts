import { Router } from 'express';
import { AdminUserController } from '../../controllers/admin/admin-user.controller';
import { authenticate } from '../../middlewares/auth/auth.middleware';
import { requireRole } from '../../middlewares/auth/auth.middleware';
import { UserRole } from '../../constants/roles';

const router = Router();

// Middleware d'authentification et de vérification du rôle admin
router.use(authenticate, requireRole(UserRole.ADMIN));

/**
 * @swagger
 * components:
 *   schemas:
 *     AdminUserResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         user:
 *           $ref: '#/components/schemas/UserProfile'
 *     PaginatedUsersResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: object
 *           properties:
 *             users:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserProfile'
 *             pagination:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 */

/**
 * @swagger
 * /api/admin/users/{userId}:
 *   put:
 *     summary: Met à jour un utilisateur (Admin uniquement)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur à mettre à jour
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
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, admin, super_admin]
 *               phone:
 *                 type: string
 *               placeId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminUserResponse'
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès non autorisé
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.put('/users/:userId', AdminUserController.updateUser);

/**
 * @swagger
 * /api/admin/users/{userId}/suspend:
 *   post:
 *     summary: Suspend un utilisateur (Admin uniquement)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur à suspendre
 *     responses:
 *       200:
 *         description: Utilisateur suspendu avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminUserResponse'
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès non autorisé
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.post('/users/:userId/suspend', AdminUserController.suspendUser);

/**
 * @swagger
 * /api/admin/users/{userId}/unsuspend:
 *   post:
 *     summary: Réactive un utilisateur suspendu (Admin uniquement)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur à réactiver
 *     responses:
 *       200:
 *         description: Utilisateur réactivé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminUserResponse'
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès non autorisé
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.post('/users/:userId/unsuspend', AdminUserController.unsuspendUser);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Liste tous les utilisateurs (Admin uniquement)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de la page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre d'éléments par page
 *     responses:
 *       200:
 *         description: Liste des utilisateurs récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedUsersResponse'
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/users', AdminUserController.listUsers);

export default router;
