import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import ledgerRoutes from './routes/ledgerRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import hrRoutes from './routes/hrRoutes.js';
import supplyRoutes from './routes/supplyRoutes.js';
import purchaseOrderRoutes from './routes/purchaseOrderRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import issueRoutes from './routes/issueRoutes.js';
import biRoutes from './routes/biRoutes.js';
import { seedBIData } from './controllers/biController.js';
import Ledger from './models/Ledger.js';
import Client from './models/Client.js';
import Project from './models/Project.js';
import Task from './models/Task.js';
import Issue from './models/Issue.js';
import User from './models/User.js';

dotenv.config();

const app = express();

app.use(express.json());

app.use(cors());


app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ledger', ledgerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/supply', supplyRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/bi', biRoutes);

app.get('/', (req, res) => {
    res.send('server Running Successfully')
})

const seedProjects = async () => {
    const projectCount = await Project.countDocuments();
    if (projectCount > 0) return;

    let clients = await Client.find();
    if (clients.length === 0) {
        clients = await Client.create([
            { name: 'TechNova Solutions', company: 'TechNova Solutions', email: 'contact@technova.com', phone: '+91 98765 43210' },
            { name: 'Global Retail Corp', company: 'Global Retail Corp', email: 'info@globalretail.com', phone: '+91 91234 56789' },
            { name: 'HealthFirst India', company: 'HealthFirst India', email: 'support@healthfirst.in', phone: '+91 99887 76655' },
        ]);
    }

    const managers = await User.find({ role: { $in: ['Admin', 'Manager'] } }).limit(3);
    if (managers.length === 0) return;

    const now = new Date();
    const addDays = (days) => {
        const d = new Date(now);
        d.setDate(d.getDate() + days);
        return d;
    };

    const seededProjects = await Project.create([
        {
            name: 'ERP Implementation',
            code: 'PRJ-0001',
            client: clients[0]._id,
            manager: managers[0]._id,
            startDate: addDays(-30),
            endDate: addDays(60),
            budget: 1250000,
            status: 'In Progress',
            progressPercentage: 45,
            description: 'Full ERP rollout for TechNova',
        },
        {
            name: 'Warehouse Automation',
            code: 'PRJ-0002',
            client: clients[1]._id,
            manager: managers[Math.min(1, managers.length - 1)]._id,
            startDate: addDays(-15),
            endDate: addDays(45),
            budget: 850000,
            status: 'In Progress',
            progressPercentage: 30,
            description: 'Automated inventory tracking system',
        },
        {
            name: 'HR Portal Upgrade',
            code: 'PRJ-0003',
            client: clients[2]._id,
            manager: managers[0]._id,
            startDate: addDays(-90),
            endDate: addDays(-10),
            budget: 420000,
            status: 'Completed',
            progressPercentage: 100,
            description: 'Modernized HR self-service portal',
        },
        {
            name: 'Mobile App Development',
            code: 'PRJ-0004',
            client: clients[0]._id,
            manager: managers[Math.min(1, managers.length - 1)]._id,
            startDate: addDays(10),
            endDate: addDays(120),
            budget: 980000,
            status: 'Not Started',
            progressPercentage: 0,
            description: 'Customer-facing mobile application',
        },
    ]);

    await Task.create([
        { project: seededProjects[0]._id, title: 'Requirements gathering', status: 'Done', priority: 'High', assignedTo: managers[0]._id, dueDate: addDays(-20) },
        { project: seededProjects[0]._id, title: 'Database schema design', status: 'Done', priority: 'High', assignedTo: managers[0]._id, dueDate: addDays(-10) },
        { project: seededProjects[0]._id, title: 'Module development', status: 'In Progress', priority: 'Critical', assignedTo: managers[Math.min(1, managers.length - 1)]._id, dueDate: addDays(30) },
        { project: seededProjects[0]._id, title: 'UAT testing', status: 'To Do', priority: 'Medium', dueDate: addDays(50) },
        { project: seededProjects[1]._id, title: 'Hardware procurement', status: 'In Progress', priority: 'High', assignedTo: managers[0]._id, dueDate: addDays(15) },
        { project: seededProjects[1]._id, title: 'Sensor integration', status: 'To Do', priority: 'Medium', dueDate: addDays(35) },
    ]);

    await Issue.create([
        { project: seededProjects[0]._id, title: 'Login timeout on mobile', priority: 'High', status: 'Open', assignedTo: managers[Math.min(1, managers.length - 1)]._id },
        { project: seededProjects[0]._id, title: 'Report export fails for large datasets', priority: 'Critical', status: 'In Progress', assignedTo: managers[0]._id },
        { project: seededProjects[1]._id, title: 'Barcode scanner compatibility', priority: 'Medium', status: 'Open' },
        { project: seededProjects[2]._id, title: 'Leave balance miscalculation', priority: 'Low', status: 'Resolved', assignedTo: managers[0]._id },
    ]);

    console.log('Sample projects seeded');
};

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
    await connectDB();
    await seedLedger();
    await seedProjects();
    await seedBIData();
    app.listen(PORT, () => {
        console.log(`Server Running on Port ${PORT}`);
    });
};

startServer();