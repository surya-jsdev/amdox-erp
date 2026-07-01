import express from 'express';
import {
    createVendor,
    deleteVendor,
    getVendors,
    updateVendor,
} from '../controllers/supplyController.js';
import { authorizeAdmin } from '../middleware/authorizeAdmin.js';

const router = express.Router();

router.get('/vendors', getVendors);
router.post('/vendors', authorizeAdmin, createVendor);
router.put('/vendors/:id', authorizeAdmin, updateVendor);
router.delete('/vendors/:id', authorizeAdmin, deleteVendor);

export default router;
