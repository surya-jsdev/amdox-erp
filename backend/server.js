import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import ledgerRoutes from './routes/ledgerRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import Ledger from './models/Ledger.js';

dotenv.config();

const app = express();
const allowedOrigins = [
    'https://amdox-erp-tau.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
];

app.use(express.json());

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }

        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-role']
}));


app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ledger', ledgerRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
    res.send('server Running Successfully')
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

const seedLedger = async () => {
    const count = await Ledger.countDocuments();
    if (count > 0) return;

    const sampleEntries = [
        { date: new Date('2026-06-01'), description: 'Office supplies purchase', category: 'Operations', type: 'Debit', amount: 7800, balance: 19200 },
        { date: new Date('2026-06-03'), description: 'Sales revenue received', category: 'Revenue', type: 'Credit', amount: 24000, balance: 43200 },
        { date: new Date('2026-06-07'), description: 'Payroll payout', category: 'Payroll', type: 'Debit', amount: 15800, balance: 27400 },
        { date: new Date('2026-06-10'), description: 'Consulting income', category: 'Revenue', type: 'Credit', amount: 9600, balance: 37000 },
        { date: new Date('2026-06-13'), description: 'Software subscription', category: 'Software', type: 'Debit', amount: 3200, balance: 33800 },
    ];

    await Ledger.create(sampleEntries);
    console.log('Sample ledger entries seeded');
};

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    const dbReady = await connectDB();

    if (dbReady) {
        await seedLedger();
    } else {
        console.warn('Database not available. API routes will return errors until the connection is restored.');
    }

    app.listen(PORT, () => {
        console.log(`Server Running on Port ${PORT}`);
    });
};

startServer();