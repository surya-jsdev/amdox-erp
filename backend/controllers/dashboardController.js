import User from '../models/User.js';

export const getDashboardData = async (req, res) => {
    try {
        const totalEmployees = await User.countDocuments();

        const summary = [
            {
                label: 'Total Revenue',
                value: '$2,45,000',
                change: '+12.5%',
                type: 'revenue',
                color: 'bg-emerald-100 text-emerald-700',
            },
            {
                label: 'Total Expenses',
                value: '$1,28,000',
                change: '-8.2%',
                type: 'expenses',
                color: 'bg-rose-100 text-rose-700',
            },
            {
                label: 'Total Employees',
                value: totalEmployees.toString(),
                change: '+5.4%',
                type: 'employees',
                color: 'bg-sky-100 text-sky-700',
            },
            {
                label: 'Pending Invoices',
                value: '28',
                change: '+12.0%',
                type: 'invoices',
                color: 'bg-amber-100 text-amber-700',
            },
        ];

        const revenueSeries = [
            { day: '01', revenue: 42000, expense: 26000 },
            { day: '05', revenue: 53000, expense: 32000 },
            { day: '10', revenue: 48000, expense: 29000 },
            { day: '15', revenue: 62000, expense: 35000 },
            { day: '20', revenue: 58000, expense: 31000 },
            { day: '25', revenue: 69000, expense: 38000 },
            { day: '30', revenue: 72000, expense: 41000 },
        ];

        const expenseCategories = [
            { category: 'Payroll', percentage: 40, color: '#0ea5e9' },
            { category: 'Operations', percentage: 25, color: '#22c55e' },
            { category: 'Marketing', percentage: 15, color: '#c026d3' },
            { category: 'Software', percentage: 10, color: '#4338ca' },
            { category: 'Others', percentage: 10, color: '#71717a' },
        ];

        res.json({ summary, revenueSeries, expenseCategories });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to load dashboard data' });
    }
};
