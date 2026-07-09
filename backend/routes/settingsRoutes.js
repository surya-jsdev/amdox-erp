import express from 'express';
import {
    getUserSettings,
    updateUserSettings,
    changePassword,
    getSystemSettings,
    updateSystemSettings
} from '../controllers/settingsController.js';

const router = express.Router();

// User settings routes
router.get('/user/:userId', getUserSettings);
router.put('/user/:userId', updateUserSettings);
router.put('/user/:userId/password', changePassword);

// System settings routes
router.get('/system', getSystemSettings);
router.put('/system', updateSystemSettings);

export default router;
