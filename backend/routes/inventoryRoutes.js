import express from 'express';
import { createInventoryItem, deleteInventoryItem, getInventoryItem, getInventoryItems, updateInventoryItem } from '../controllers/inventoryController.js';
import { authorizeRole } from '../middleware/authorizeRole.js';

const router = express.Router();

// Allow read-only access to inventory for all users; protect write operations.
const requireInventoryAccess = authorizeRole('Admin', 'Manager');

router.get('/', getInventoryItems);
router.get('/:id', getInventoryItem);
router.post('/', requireInventoryAccess, createInventoryItem);
router.put('/:id', requireInventoryAccess, updateInventoryItem);
router.delete('/:id', requireInventoryAccess, deleteInventoryItem);

export default router;