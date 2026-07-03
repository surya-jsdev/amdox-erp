import express from 'express';
import {
    getIssues,
    getIssue,
    createIssue,
    updateIssue,
    deleteIssue,
    getIssueStats,
} from '../controllers/issueController.js';
import { authorizeRole } from '../middleware/authorizeRole.js';

const router = express.Router();

router.get('/stats', getIssueStats);
router.get('/', getIssues);
router.get('/:id', getIssue);
router.post('/', authorizeRole('Admin', 'Manager', 'Employee'), createIssue);
router.put('/:id', authorizeRole('Admin', 'Manager', 'Employee'), updateIssue);
router.delete('/:id', authorizeRole('Admin', 'Manager'), deleteIssue);

export default router;
