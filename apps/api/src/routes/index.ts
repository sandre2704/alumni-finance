import { Router } from 'express';
// import authRoutes from './auth.routes.js';
import categoriesRoutes from './categories.routes.js';
import transactionsRoutes from './transactions.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import reportsRoutes from './reports.routes.js';
import donationTargetsRoutes from './donation-targets.routes.js';
import usersRoutes from './users.routes.js';
import profileRoutes from './profile.routes.js';
import siteSettingsRoutes from './site-settings.routes.js';

import uploadRoutes from './upload.routes.js';

import { exportRouter } from './export.routes.js';
import feedbackRoutes from './feedbacks.routes.js';
import donationsRoutes from './donations.routes.js';

export const router: Router = Router();

// router.use('/auth', authRoutes);
router.use('/categories', categoriesRoutes);
router.use('/transactions', transactionsRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reports', reportsRoutes);
router.use('/donation-targets', donationTargetsRoutes);
router.use('/users', usersRoutes);
router.use('/upload', uploadRoutes);
router.use('/export', exportRouter);
router.use('/profile', profileRoutes);
router.use('/feedbacks', feedbackRoutes);
router.use('/site-settings', siteSettingsRoutes);
router.use('/donations', donationsRoutes);

