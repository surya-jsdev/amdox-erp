import User from '../models/User.js';
import Ledger from '../models/Ledger.js';
import Payroll from '../models/Payroll.js';
import PurchaseOrder from '../models/PurchaseOrder.js';

export const getDashboardData = async (req, res) => {
    try {
        // Get total employees
        const totalEmployees = await User.countDocuments();

        // Calculate revenue and expenses from Ledger
        const ledgerData = await Ledger.find().sort({ date: -1 }).limit(100);

        // Separate credits (revenue) and debits (expenses)
        const totalRevenue = ledgerData
            .filter(entry => entry.type === 'Credit')
            .reduce((sum, entry) => sum + entry.amount, 0);

        const totalExpenses = ledgerData
            .filter(entry => entry.type === 'Debit')
            .reduce((sum, entry) => sum + entry.amount, 0);

        // Get pending purchase orders (invoices)
        const pendingInvoices = await PurchaseOrder.countDocuments({ status: { $in: ['Pending', 'Processing'] } });

        // Calculate percentage changes (mock data - can be enhanced)
        const revenueChange = totalRevenue > 0 ? '+12.5%' : '0%';
        const expenseChange = totalExpenses > 0 ? '-8.2%' : '0%';

        const summary = [
            {
                label: 'Total Revenue',
                value: `$${(totalRevenue / 1000).toFixed(0)}k`,
                change: revenueChange,
                type: 'revenue',
                color: 'bg-emerald-100 text-emerald-700',
            },
            {
                label: 'Total Expenses',
                value: `$${(totalExpenses / 1000).toFixed(0)}k`,
                change: expenseChange,
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
                value: pendingInvoices.toString(),
                change: '+12.0%',
                type: 'invoices',
                color: 'bg-amber-100 text-amber-700',
            },
        ];

        // Generate daily revenue series from ledger data
        const dailyData = {};
        ledgerData.forEach(entry => {
            const day = entry.date.getDate().toString().padStart(2, '0');
            if (!dailyData[day]) {
                dailyData[day] = { revenue: 0, expense: 0 };
            }
            if (entry.type === 'Credit') {
                dailyData[day].revenue += entry.amount;
            } else {
                dailyData[day].expense += entry.amount;
            }
        });

        const revenueSeries = Object.entries(dailyData)
            .map(([day, data]) => ({
                day,
                revenue: data.revenue,
                expense: data.expense,
            }))
            .sort((a, b) => parseInt(a.day) - parseInt(b.day))
            .slice(0, 7); // Last 7 days

        // Calculate expense categories from ledger
        const categoryExpenses = {};
        ledgerData
            .filter(entry => entry.type === 'Debit')
            .forEach(entry => {
                categoryExpenses[entry.category] = (categoryExpenses[entry.category] || 0) + entry.amount;
            });

        const totalCategoryExpense = Object.values(categoryExpenses).reduce((sum, val) => sum + val, 0);

        const expenseCategories = Object.entries(categoryExpenses)
            .map(([category, amount]) => ({
                category,
                percentage: totalCategoryExpense > 0 ? Math.round((amount / totalCategoryExpense) * 100) : 0,
                amount,
                color: getColorForCategory(category),
            }))
            .sort((a, b) => b.percentage - a.percentage);

        res.json({
            summary,
            revenueSeries: revenueSeries.length > 0 ? revenueSeries : getDefaultRevenueSeries(),
            expenseCategories: expenseCategories.length > 0 ? expenseCategories : getDefaultExpenseCategories(),
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ message: error.message || 'Failed to load dashboard data' });
    }
};

// Helper functions
const getColorForCategory = (category) => {
    const colors = {
        'Payroll': '#0ea5e9',
        'Operations': '#22c55e',
        'Marketing': '#c026d3',
        'Software': '#4338ca',
        'Revenue': '#10b981',
    };
    return colors[category] || '#71717a';
};

const getDefaultRevenueSeries = () => [
    { day: '01', revenue: 42000, expense: 26000 },
    { day: '05', revenue: 53000, expense: 32000 },
    { day: '10', revenue: 48000, expense: 29000 },
    { day: '15', revenue: 62000, expense: 35000 },
    { day: '20', revenue: 58000, expense: 31000 },
    { day: '25', revenue: 69000, expense: 38000 },
    { day: '30', revenue: 72000, expense: 41000 },
];

const getDefaultExpenseCategories = () => [
    { category: 'Payroll', percentage: 40, color: '#0ea5e9', amount: 0 },
    { category: 'Operations', percentage: 25, color: '#22c55e', amount: 0 },
    { category: 'Marketing', percentage: 15, color: '#c026d3', amount: 0 },
    { category: 'Software', percentage: 10, color: '#4338ca', amount: 0 },
    { category: 'Others', percentage: 10, color: '#71717a', amount: 0 },
];
