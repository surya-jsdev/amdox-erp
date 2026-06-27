import express from 'express';
import {
    createEmployee,
    getEmployees,
    updateEmployee,
    deleteEmployee,
    createLeave,
    getLeaves,
    updateLeave,
    deleteLeave,
    createPayroll,
    getPayrolls,
    calculatePayroll,
} from '../controllers/hrController.js';
import { authorizeAdmin } from '../middleware/authorizeAdmin.js';

const router = express.Router();

router.get('/employees', getEmployees);
router.post('/employees', authorizeAdmin, createEmployee);
router.put('/employees/:id', authorizeAdmin, updateEmployee);
router.delete('/employees/:id', authorizeAdmin, deleteEmployee);

router.get('/leaves', getLeaves);
router.post('/leaves', authorizeAdmin, createLeave);
router.put('/leaves/:id', authorizeAdmin, updateLeave);
router.delete('/leaves/:id', authorizeAdmin, deleteLeave);

router.get('/payrolls', getPayrolls);
router.post('/payrolls', authorizeAdmin, createPayroll);
router.get('/payrolls/calculate/:employeeId/:month/:year', authorizeAdmin, calculatePayroll);

export default router;
