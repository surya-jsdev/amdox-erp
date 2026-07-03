import express from 'express';
import {
    getProjectOverview,
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    getClients,
    createClient,
    getProjectManagers,
} from '../controllers/projectController.js';
import { authorizeRole } from '../middleware/authorizeRole.js';

const router = express.Router();

router.get('/overview', getProjectOverview);
router.get('/clients', getClients);
router.post('/clients', authorizeRole('Admin', 'Manager'), createClient);
router.get('/managers', getProjectManagers);
router.get('/', getProjects);
router.get('/:id', getProject);
router.post('/', authorizeRole('Admin', 'Manager'), createProject);
router.put('/:id', authorizeRole('Admin', 'Manager'), updateProject);
router.delete('/:id', authorizeRole('Admin'), deleteProject);

export default router;
