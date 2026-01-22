import { Router } from 'express';
// import authRoutes from './auth.routes';
import categoriesRoutes from './categories.routes';
import transactionsRoutes from './transactions.routes';
import dashboardRoutes from './dashboard.routes';
import reportsRoutes from './reports.routes';
import donationTargetsRoutes from './donation-targets.routes';
import usersRoutes from './users.routes';
import profileRoutes from './profile.routes';
import siteSettingsRoutes from './site-settings.routes';

import uploadRoutes from './upload.routes';

import { exportRouter } from './export.routes';
import feedbackRoutes from './feedbacks.routes';

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

