import mongoose from 'mongoose';

const LedgerSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    category: {
        type: String,
        required: true,
        trim: true,
    },
    type: {
        type: String,
        enum: ['Debit', 'Credit'],
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    balance: {
        type: Number,
        required: true,
    },
}, {
    timestamps: true,
});

const Ledger = mongoose.model('Ledger', LedgerSchema);

export default Ledger;
