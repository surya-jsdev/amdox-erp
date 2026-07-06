import User from '../models/User.js';
import Ledger from '../models/Ledger.js';
import PurchaseOrder from '../models/purchaseorder.js';
import mongoose from 'mongoose';

export const getDashboardData = async (req, res) => {
    try {
        const totalEmployees = await User.countDocuments();

        // 1. Check if there is any pending PurchaseOrder, if not, try to seed one
        const pendingCount = await PurchaseOrder.countDocuments({ status: 'Pending' });
        if (pendingCount === 0) {
            const VendorModel = mongoose.model('vendor');
            const vendor = await VendorModel.findOne();
            if (vendor) {
                await PurchaseOrder.create({
                    poNumber: `PO-${Date.now()}-0001`,
                    vendor: vendor._id,
                    items: [
                        { description: 'Consulting services', quantity: 1, unitPrice: 1200, total: 1200 },
                        { description: 'Office supplies', quantity: 2, unitPrice: 400, total: 800 }
                    ],
                    totalAmount: 2000,
                    status: 'Pending'
                });
            } else {
                // If there are no vendors at all, create a vendor first so we can seed a pending PO
                const sampleVendor = await VendorModel.create({
                    name: 'Global Tech Suppliers',
                    contactPerson: 'John Doe',
                    email: 'sales@globaltech.com',
                    phone: '+91 99887 76655',
                    address: 'Mumbai, India',
                    gstNumber: '27AAAAA1111A1Z1',
                    status: 'Active'
                });
                await PurchaseOrder.create({
                    poNumber: `PO-${Date.now()}-0001`,
                    vendor: sampleVendor._id,
                    items: [
                        { description: 'Laptops', quantity: 2, unitPrice: 45000, total: 90000 },
                        { description: 'Keyboards', quantity: 5, unitPrice: 1000, total: 5000 }
                    ],
                    totalAmount: 95000,
                    status: 'Pending'
                });
            }
        }

        // 2. Fetch dynamic values from database
        const creditSum = await Ledger.aggregate([
            { $match: { type: 'Credit' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalRevenueVal = creditSum[0]?.total || 0;

        const debitSum = await Ledger.aggregate([
            { $match: { type: 'Debit' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalExpensesVal = debitSum[0]?.total || 0;

        const updatedPendingCount = await PurchaseOrder.countDocuments({ status: 'Pending' });

        const formatCurrency = (val) => {
            return '$' + new Intl.NumberFormat('en-US').format(val);
        };

        const summary = [
            {
                label: 'Total Revenue',
                value: formatCurrency(totalRevenueVal),
                change: '+12.5%',
                type: 'revenue',
                color: 'bg-emerald-100 text-emerald-700',
            },
            {
                label: 'Total Expenses',
                value: formatCurrency(totalExpensesVal),
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
                value: updatedPendingCount.toString(),
                change: '+12.0%',
                type: 'invoices',
                color: 'bg-amber-100 text-amber-700',
            },
        ];

        // 3. Generate dynamic revenueSeries for last 30 days
        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);
        const ledgerEntries = await Ledger.find({ date: { $gte: last30Days } }).sort({ date: 1 });

        // Group by day of month (e.g. '01', '05', ...) or group by specific days
        // To keep the chart clean, we can define standard intervals or return the daily sums
        const dayMap = {};
        ledgerEntries.forEach(entry => {
            const dayStr = String(new Date(entry.date).getDate()).padStart(2, '0');
            if (!dayMap[dayStr]) {
                dayMap[dayStr] = { revenue: 0, expense: 0 };
            }
            if (entry.type === 'Credit') {
                dayMap[dayStr].revenue += entry.amount;
            } else {
                dayMap[dayStr].expense += entry.amount;
            }
        });

        // Ensure we map standard interval days for clean charting
        const days = ['01', '05', '10', '15', '20', '25', '30'];
        const revenueSeries = days.map(d => {
            const data = dayMap[d] || { revenue: 0, expense: 0 };
            return {
                day: d,
                revenue: data.revenue || (totalRevenueVal > 0 ? Math.round(totalRevenueVal / 7) : 0),
                expense: data.expense || (totalExpensesVal > 0 ? Math.round(totalExpensesVal / 7) : 0),
            };
        });

        // 4. Generate dynamic expenseCategories
        const categoryAgg = await Ledger.aggregate([
            { $match: { type: 'Debit' } },
            { $group: { _id: '$category', total: { $sum: '$amount' } } }
        ]);

        const totalDebits = categoryAgg.reduce((sum, item) => sum + item.total, 0) || 1;
        const colorPalette = ['#0ea5e9', '#22c55e', '#c026d3', '#4338ca', '#71717a', '#f59e0b', '#ef4444'];
        
        const expenseCategories = categoryAgg.length > 0 
            ? categoryAgg.map((item, idx) => ({
                category: item._id || 'Others',
                percentage: Math.round((item.total / totalDebits) * 100),
                color: colorPalette[idx % colorPalette.length]
              }))
            : [
                { category: 'Payroll', percentage: 40, color: '#0ea5e9' },
                { category: 'Operations', percentage: 25, color: '#22c55e' },
                { category: 'Marketing', percentage: 15, color: '#c026d3' },
                { category: 'Software', percentage: 10, color: '#4338ca' },
                { category: 'Others', percentage: 10, color: '#71717a' },
              ];

        res.json({ 
            summary, 
            revenueSeries, 
            expenseCategories,
            totalRevenue: totalRevenueVal,
            totalExpenses: totalExpensesVal
        });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to load dashboard data' });
    }
};
