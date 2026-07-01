import express from 'express';
import {
    getPurchaseOrders,
    getPurchaseOrder,
    createPurchaseOrder,
    updatePurchaseOrder,
    approvePurchaseOrder,
    deletePurchaseOrder,
} from '../controllers/purchaseOrderController.js';
import { authorizeRole } from '../middleware/authorizeRole.js';

const router = express.Router();

router.get('/', getPurchaseOrders);
router.get('/:id', getPurchaseOrder);
router.post('/', authorizeRole('Admin', 'HR'), createPurchaseOrder);
router.put('/:id', authorizeRole('Admin', 'HR'), updatePurchaseOrder);
router.put('/:id/approve', authorizeRole('Admin', 'HR'), approvePurchaseOrder);
router.delete('/:id', authorizeRole('Admin'), deletePurchaseOrder);

export default router;
