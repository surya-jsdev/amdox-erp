import Ledger from '../models/Ledger.js';

export const getLedgerEntries = async (req, res) => {
    try {
        const entries = await Ledger.find().sort({ date: -1 }).limit(50);
        res.json(entries);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to load ledger entries' });
    }
};

export const createLedgerEntry = async (req, res) => {
    try {
        const { date, description, category, type, amount, balance } = req.body;
        const entry = await Ledger.create({ date, description, category, type, amount, balance });
        res.status(201).json(entry);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to create ledger entry' });
    }
};

export const updateLedgerEntry = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, description, category, type, amount, balance } = req.body;

        const updatedEntry = await Ledger.findByIdAndUpdate(
            id,
            { date, description, category, type, amount, balance },
            { new: true, runValidators: true }
        );

        if (!updatedEntry) {
            return res.status(404).json({ message: 'Ledger entry not found' });
        }

        res.json(updatedEntry);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to update ledger entry' });
    }
};

export const deleteLedgerEntry = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedEntry = await Ledger.findByIdAndDelete(id);

        if (!deletedEntry) {
            return res.status(404).json({ message: 'Ledger entry not found' });
        }

        res.json({ message: 'Ledger entry deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to delete ledger entry' });
    }
};

export const getDashboardLedgerSummary = async (req, res) => {
    try {
        const entries = await Ledger.find().sort({ date: -1 }).limit(30);
        const totalDebit = entries.filter((entry) => entry.type === 'Debit').reduce((sum, item) => sum + item.amount, 0);
        const totalCredit = entries.filter((entry) => entry.type === 'Credit').reduce((sum, item) => sum + item.amount, 0);
        res.json({ totalDebit, totalCredit, count: entries.length, recent: entries.slice(0, 5) });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to load ledger summary' });
    }
};
