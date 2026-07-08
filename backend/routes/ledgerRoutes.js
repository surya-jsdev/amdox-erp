import express from 'express';
import { getLedgerEntries, createLedgerEntry, updateLedgerEntry, deleteLedgerEntry, getDashboardLedgerSummary } from '../controllers/ledgerController.js';


const router = express.Router();

const authorizeAdmin = (req, res, next) => {
    const role = req.get('x-user-role');
    if (role === 'Admin') {
        return next();
    }
    return res.status(403).json({ message: 'Admin access required' });
};

router.get('/', authorizeAdmin, getLedgerEntries);
// router.get('/', getLedgerEntries);
router.post('/', authorizeAdmin, createLedgerEntry);
router.put('/:id', authorizeAdmin, updateLedgerEntry);
router.delete('/:id', authorizeAdmin, deleteLedgerEntry);
router.get('/summary', getDashboardLedgerSummary);

export default router;
