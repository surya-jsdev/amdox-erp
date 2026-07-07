import express from 'express';
import { getForecastData, retrainModel } from '../controllers/forecastController.js';

const router = express.Router();

router.get('/', getForecastData);
router.post('/retrain', retrainModel);

export default router;
