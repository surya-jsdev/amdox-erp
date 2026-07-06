import express from 'express';
import { getBIData, createBIReport } from '../controllers/biController.js';

const router = express.Router();

router.get('/', getBIData);
router.post('/report', createBIReport);

export default router;
