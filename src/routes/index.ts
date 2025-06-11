import { Router } from 'express';

import authRoutes from './auth/auth.routes';
import userRoutes from './user/user.routes';
import adminRoutes from './admin/admin-user.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);

export default router;
