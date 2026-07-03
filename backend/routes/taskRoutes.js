import express from 'express';
import {
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    getTaskStats,
} from '../controllers/taskController.js';
import { authorizeRole } from '../middleware/authorizeRole.js';

const router = express.Router();

router.get('/stats', getTaskStats);
router.get('/', getTasks);
router.get('/:id', getTask);
router.post('/', authorizeRole('Admin', 'Manager', 'Employee'), createTask);
router.put('/:id', authorizeRole('Admin', 'Manager', 'Employee'), updateTask);
router.delete('/:id', authorizeRole('Admin', 'Manager'), deleteTask);

export default router;
