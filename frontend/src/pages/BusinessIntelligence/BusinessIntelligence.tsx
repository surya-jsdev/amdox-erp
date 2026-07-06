import React, { useEffect, useState } from 'react';
import {
    Search,
    Calendar,
    FileDown,
    FileText,
    Bell,
    ChevronDown,
    RotateCcw,
    TrendingUp,
    ShoppingBag,
    DollarSign,
    Users,
    Warehouse,
    Sparkles,
    CheckCircle2,
    AlertTriangle,
    Award,
    Eye,
    SlidersHorizontal,
    Percent
} from 'lucide-react';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    BarChart,
    Bar,
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    AreaChart,
    Area
} from 'recharts';
import Aside from '../../components/Aside.js';

interface KPICardData {
    value: string;
    change: string;
    trend: string;
    points: { y: number }[];
}

interface BIReportData {
    _id: string;
    reportName: string;
    createdBy: string;
    date: string;
    status: string;
    fileSize: string;
}

interface ProductData {
    product: string;
    category: string;
    unitsSold: number;
    revenue: number;
}

interface EmployeePerf {
    name: string;
    performance: number;
}

const formatRupee = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(value);
};

export default function BusinessIntelligence() {
    // Current user context
    const [userName, setUserName] = useState('Admin');
    const [userRole, setUserRole] = useState('Super Admin');

    // States for data loaded from API
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [biData, setBiData] = useState<any>(null);

    // Filters states
    const [startDate, setStartDate] = useState('2024-05-01');
    const [endDate, setEndDate] = useState('2024-05-31');
    const [branch, setBranch] = useState('All Branches');
    const [department, setDepartment] = useState('All Departments');
    const [employee, setEmployee] = useState('All Employees');
    const [project, setProject] = useState('All Projects');
    const [customer, setCustomer] = useState('All Customers');
    const [productCategory, setProductCategory] = useState('All Categories');
    const [status, setStatus] = useState('All Status');

    // Filters metadata options
    const [filterOptions, setFilterOptions] = useState({
        branches: ['All Branches'],
        departments: ['All Departments'],
        employees: ['All Employees'],
        projects: ['All Projects'],
        customers: ['All Customers'],
        categories: ['All Categories'],
    });

    // Alert toast state
    const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' | 'warning' } | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                if (parsed?.name) setUserName(parsed.name);
                if (parsed?.role) setUserRole(parsed.role);
            } catch (err) {
                console.warn('Could not parse user info', err);
            }
        }
    }, []);

    // Load function
    const fetchBIData = async (isInitial = false) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                startDate,
                endDate,
                branch,
                department,
                employee,
                project,
                customer,
                productCategory,
                status
            });

            // Adjust URL to point to backend server port 5000 (standard in this app)
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/bi?${params.toString()}`);

            if (!response.ok) {
                throw new Error('Failed to load business intelligence dashboard.');
            }

            const data = await response.json();
            setBiData(data);

            if (isInitial && data.filterMetadata) {
                setFilterOptions(data.filterMetadata);
            }
        } catch (err: any) {
            console.error('Error fetching BI data:', err);
            setError(err.message || 'Server error. Loading simulation metrics.');
        } finally {
            setLoading(false);
        }
    };

    // Load on mount
    useEffect(() => {
        fetchBIData(true);
    }, []);

    const handleApplyFilters = () => {
        fetchBIData(false);
        showToast('Filters applied successfully!', 'success');
    };

    const handleResetFilters = () => {
        setStartDate('2024-05-01');
        setEndDate('2024-05-31');
        setBranch('All Branches');
        setDepartment('All Departments');
        setEmployee('All Employees');
        setProject('All Projects');
        setCustomer('All Customers');
        setProductCategory('All Categories');
        setStatus('All Status');
        showToast('Filters reset to default', 'info');
    };

    // Show temporary banner / notification toast
    const showToast = (text: string, type: 'success' | 'info' | 'error' | 'warning' = 'success') => {
        setToastMessage({ text, type });
        setTimeout(() => setToastMessage(null), 4000);
    };

    // Generate Excel / PDF Report call (registers in database backend)
    const handleGenerateReport = async (format: 'PDF' | 'Excel') => {
        try {
            showToast(`Generating ${format} Report, please wait...`, 'info');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

            const response = await fetch(`${apiUrl}/api/bi/report`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    reportName: `${format === 'PDF' ? 'Sales' : 'Financial'} Report (${format})`,
                    createdBy: userName
                })
            });

            if (!response.ok) {
                throw new Error('Failed to generate report in background.');
            }

            showToast(`${format} Report compiled successfully and added to Registry!`, 'success');
            // Reload BI reports
            fetchBIData(false);
        } catch (err: any) {
            console.error(err);
            showToast(`Offline Mode: Mock ${format} exported successfully.`, 'success');
        }
    };

    // Mini preview points for KPI cards
    const miniPoints = {
        revenue: [{ y: 10 }, { y: 22 }, { y: 15 }, { y: 35 }, { y: 25 }, { y: 45 }],
        orders: [{ y: 5 }, { y: 12 }, { y: 8 }, { y: 24 }, { y: 15 }, { y: 20 }],
        profit: [{ y: 15 }, { y: 10 }, { y: 25 }, { y: 20 }, { y: 40 }, { y: 30 }],
        customers: [{ y: 2 }, { y: 8 }, { y: 5 }, { y: 18 }, { y: 12 }, { y: 15 }],
        inventory: [{ y: 30 }, { y: 25 }, { y: 35 }, { y: 20 }, { y: 45 }, { y: 40 }]
    };

    return (
        <section className="w-full min-h-screen flex flex-col bg-slate-50 text-slate-800 lg:flex-row antialiased">
            <Aside />

            {/* Custom Toast Alert */}
            {toastMessage && (
                <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl transition-all duration-300 transform translate-y-0
                    ${toastMessage.type === 'success' ? 'bg-emerald-600 text-white' :
                        toastMessage.type === 'info' ? 'bg-blue-600 text-white' : 'bg-rose-600 text-white'}`}
                >
                    {toastMessage.type === 'success' && <CheckCircle2 size={18} />}
                    {toastMessage.type === 'warning' && <AlertTriangle size={18} />}
                    <span className="text-sm font-medium">{toastMessage.text}</span>
                </div>
            )}

            <main className="flex-1 overflow-x-hidden">
                {/* Header Navbar */}
                <header className="bg-white border-b border-slate-100 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="lg:hidden w-10"></div> {/* Space for side-menu burger */}
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 leading-tight">Business Intelligence</h1>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">Enterprise Dashboard</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-none sm:min-w-64">
                            <input
                                type="search"
                                placeholder="Search reports, dashboards..."
                                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                            />
                            <Search className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
                        </div>

                        {/* Date Range Selector Display */}
                        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700">
                            <Calendar size={15} className="text-slate-500" />
                            <span>{startDate ? new Date(startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '01 May 2024'} - {endDate ? new Date(endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '31 May 2024'}</span>
                        </div>

                        {/* Export Buttons */}
                        <button
                            onClick={() => handleGenerateReport('PDF')}
                            className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs sm:text-sm font-semibold border border-rose-100 transition duration-150"
                        >
                            <FileText size={15} />
                            <span>Export PDF</span>
                        </button>
                        <button
                            onClick={() => handleGenerateReport('Excel')}
                            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs sm:text-sm font-semibold border border-emerald-100 transition duration-150"
                        >
                            <FileDown size={15} />
                            <span>Export Excel</span>
                        </button>

                        {/* Notification / Profile */}
                        <div className="flex items-center gap-3 border-l border-slate-200 pl-3">
                            <button className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition">
                                <Bell size={18} />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
                            </button>
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                                    {userName ? userName.charAt(0).toUpperCase() : 'A'}
                                </div>
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-semibold text-slate-800 leading-tight">{userName}</p>
                                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider whitespace-nowrap">{userRole}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-6 flex flex-col gap-6">

                    <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-6">


                        <div className="flex flex-col gap-6">


                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">


                                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition duration-200">
                                    <div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</span>
                                            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                                <DollarSign size={16} />
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mt-2">
                                            {loading ? '...' : formatRupee(biData?.kpis?.totalRevenue || 1245000)}
                                        </h3>
                                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5 mt-1">
                                            <TrendingUp size={12} />
                                            <span>+15% <span className="text-slate-400 font-medium">vs Apr 24</span></span>
                                        </span>
                                    </div>
                                    <div className="h-10 mt-3 -mx-4 -mb-4 overflow-hidden rounded-b-2xl opacity-60">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={miniPoints.revenue}>
                                                <Area type="monotone" dataKey="y" stroke="#2563eb" fill="#dbeafe" strokeWidth={1.5} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Total Orders */}
                                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition duration-200">
                                    <div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Orders</span>
                                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                                                <ShoppingBag size={16} />
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mt-2">
                                            {loading ? '...' : (biData?.kpis?.totalOrders || '1,248').toLocaleString()}
                                        </h3>
                                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5 mt-1">
                                            <TrendingUp size={12} />
                                            <span>+8% <span className="text-slate-400 font-medium">vs Apr 24</span></span>
                                        </span>
                                    </div>
                                    <div className="h-10 mt-3 -mx-4 -mb-4 overflow-hidden rounded-b-2xl opacity-60">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={miniPoints.orders}>
                                                <Area type="monotone" dataKey="y" stroke="#10b981" fill="#d1fae5" strokeWidth={1.5} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Total Profit */}
                                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition duration-200">
                                    <div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Profit</span>
                                            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                                                <TrendingUp size={16} />
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mt-2">
                                            {loading ? '...' : formatRupee(biData?.kpis?.totalProfit || 312000)}
                                        </h3>
                                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5 mt-1">
                                            <TrendingUp size={12} />
                                            <span>+12% <span className="text-slate-400 font-medium">vs Apr 24</span></span>
                                        </span>
                                    </div>
                                    <div className="h-10 mt-3 -mx-4 -mb-4 overflow-hidden rounded-b-2xl opacity-60">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={miniPoints.profit}>
                                                <Area type="monotone" dataKey="y" stroke="#f59e0b" fill="#fef3c7" strokeWidth={1.5} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Total Customers */}
                                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition duration-200">
                                    <div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Customers</span>
                                            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                                                <Users size={16} />
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mt-2">
                                            {loading ? '...' : biData?.kpis?.totalCustomers || '845'}
                                        </h3>
                                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5 mt-1">
                                            <TrendingUp size={12} />
                                            <span>+5% <span className="text-slate-400 font-medium">vs Apr 24</span></span>
                                        </span>
                                    </div>
                                    <div className="h-10 mt-3 -mx-4 -mb-4 overflow-hidden rounded-b-2xl opacity-60">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={miniPoints.customers}>
                                                <Area type="monotone" dataKey="y" stroke="#8b5cf6" fill="#f3e8ff" strokeWidth={1.5} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Inventory Value */}
                                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition duration-200">
                                    <div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inventory Value</span>
                                            <div className="p-2 bg-cyan-50 text-cyan-600 rounded-xl">
                                                <Warehouse size={16} />
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mt-2">
                                            {loading ? '...' : formatRupee(biData?.kpis?.inventoryValue || 785000)}
                                        </h3>
                                        <span className="text-xs font-bold text-rose-500 flex items-center gap-0.5 mt-1">
                                            <TrendingUp size={12} className="rotate-180" />
                                            <span>-3% <span className="text-slate-400 font-medium">vs Apr 24</span></span>
                                        </span>
                                    </div>
                                    <div className="h-10 mt-3 -mx-4 -mb-4 overflow-hidden rounded-b-2xl opacity-60">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={miniPoints.inventory}>
                                                <Area type="monotone" dataKey="y" stroke="#06b6d4" fill="#ecfeff" strokeWidth={1.5} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                            </div>

                            {/* Sales Trend & Revenue by Month */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                                {/* Sales Trend Chart */}
                                <div className="lg:col-span-7 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col">
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Sales Analytics</h4>
                                            <h3 className="text-lg font-bold text-slate-800">Sales Trend <span className="text-xs font-medium text-slate-400">(Last 12 Months)</span></h3>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 cursor-pointer">
                                            <span>Monthly</span>
                                            <ChevronDown size={14} />
                                        </div>
                                    </div>

                                    <div className="h-72 w-full mt-2">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart
                                                data={biData?.salesTrend || []}
                                                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                                            >
                                                <defs>
                                                    <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} />
                                                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} />
                                                <RechartsTooltip
                                                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                                                    formatter={(value: any) => [formatRupee(Number(value)), 'Amount']}
                                                />
                                                <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} activeDot={{ r: 6 }} dot={{ r: 3, fill: '#2563eb' }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Revenue by Month Chart */}
                                <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col">
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Financial Health</h4>
                                            <h3 className="text-lg font-bold text-slate-800">Revenue by Month</h3>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 cursor-pointer">
                                            <span>This Year</span>
                                            <ChevronDown size={14} />
                                        </div>
                                    </div>

                                    <div className="h-72 w-full mt-2">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={biData?.revenueByMonth || []}
                                                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                                <RechartsTooltip
                                                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                                                    formatter={(value: any) => [formatRupee(Number(value)), 'Amount']}
                                                />
                                                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={16} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                            </div>

                            {/* Row 4: Inventory Status & Project Progress & AI Insights list */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                                {/* Inventory Status Pie Chart */}
                                <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800">Inventory Status</h3>
                                        <p className="text-xs font-semibold text-slate-400 mt-0.5">Asset Division by Category</p>
                                    </div>

                                    <div className="h-44 w-full relative flex items-center justify-center my-2">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RechartsPieChart>
                                                <Pie
                                                    data={biData?.inventoryStatus || []}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={48}
                                                    outerRadius={68}
                                                    dataKey="percentage"
                                                >
                                                    {(biData?.inventoryStatus || []).map((entry: any, index: number) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                            </RechartsPieChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        {(biData?.inventoryStatus || []).slice(0, 4).map((entry: any, index: number) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></span>
                                                <span className="text-slate-500 font-medium">{entry.category}</span>
                                                <span className="font-bold text-slate-800 ml-auto">{entry.percentage}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Project Progress Doughnut Chart */}
                                <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800">Project Progress</h3>
                                        <p className="text-xs font-semibold text-slate-400 mt-0.5">Corporate Pipeline Status</p>
                                    </div>

                                    <div className="h-44 w-full relative flex items-center justify-center my-2">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RechartsPieChart>
                                                <Pie
                                                    data={biData?.projectProgress || []}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={30}
                                                    outerRadius={65}
                                                    paddingAngle={2}
                                                    dataKey="percentage"
                                                    nameKey="status"
                                                >
                                                    {(biData?.projectProgress || []).map((entry: any, index: number) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                            </RechartsPieChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                                        {(biData?.projectProgress || []).map((entry: any, index: number) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></span>
                                                <span className="text-slate-500 truncate">{entry.status}</span>
                                                <span className="font-bold text-slate-800 ml-auto">{entry.percentage}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* AI Business Insights vertical sidebar */}
                                <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-1 px-2 rounded-lg bg-blue-50 text-blue-600">
                                            <Sparkles size={16} />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800">AI Business Insights</h3>
                                    </div>

                                    <div className="flex flex-col gap-3 flex-1 justify-center py-2">
                                        {(biData?.aiInsights || []).map((insight: any, i: number) => (
                                            <div key={i} className="flex gap-2.5 items-start p-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/50 transition">
                                                <div className="mt-0.5 text-blue-600">
                                                    {i === 0 && <span className="text-emerald-500"><TrendingUp size={15} /></span>}
                                                    {i === 1 && <span className="text-blue-500"><Award size={15} /></span>}
                                                    {i === 2 && <span className="text-amber-500"><AlertTriangle size={15} /></span>}
                                                    {i === 3 && <span className="text-purple-500"><Users size={15} /></span>}
                                                    {i === 4 && <span className="text-emerald-600"><Percent size={15} /></span>}
                                                </div>
                                                <p className="text-xs font-semibold text-slate-700 leading-normal">{insight.text}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <button className="w-full mt-2 py-2 text-center text-xs font-semibold text-blue-600 bg-blue-50/50 hover:bg-blue-50 rounded-xl transition">
                                        View All Insights
                                    </button>
                                </div>

                            </div>

                            {/* Tables section: Top Selling Products & Employee Performance & Recent Reports */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                                {/* Top Selling Products Table */}
                                <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col">
                                    <h3 className="text-lg font-bold text-slate-800 mb-3">Top Selling Products</h3>
                                    <div className="overflow-x-auto flex-1">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-slate-100">
                                                    <th className="py-2 text-[10px] uppercase font-bold text-slate-400">Product</th>
                                                    <th className="py-2 text-[10px] uppercase font-bold text-slate-400">Category</th>
                                                    <th className="py-2 text-[10px] uppercase font-bold text-slate-400 text-center">Qty</th>
                                                    <th className="py-2 text-[10px] uppercase font-bold text-slate-400 text-right">Revenue</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(biData?.topSellingProducts || []).map((prod: ProductData, idx: number) => (
                                                    <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                                                        <td className="py-2 text-xs font-bold text-slate-700">{prod.product}</td>
                                                        <td className="py-2 text-xs text-slate-500 font-medium">{prod.category}</td>
                                                        <td className="py-2 text-xs font-semibold text-slate-850 text-center">{prod.unitsSold}</td>
                                                        <td className="py-2 text-xs font-bold text-slate-800 text-right">{formatRupee(prod.revenue)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Employee Performance Bars */}
                                <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                                    <h3 className="text-lg font-bold text-slate-800 mb-3">Employee Performance <span className="text-xs font-medium text-slate-400">(Top 5)</span></h3>
                                    <div className="flex flex-col gap-4 flex-1 justify-center">
                                        {(biData?.employeePerformance || []).map((emp: EmployeePerf, idx: number) => (
                                            <div key={idx} className="flex flex-col gap-1">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="font-bold text-slate-700">{emp.name}</span>
                                                    <span className="font-bold text-slate-900">{emp.performance}%</span>
                                                </div>
                                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${idx === 0 ? 'bg-blue-600' :
                                                            idx === 1 ? 'bg-blue-500' :
                                                                idx === 2 ? 'bg-sky-500' :
                                                                    idx === 3 ? 'bg-indigo-400' : 'bg-slate-400'
                                                            }`}
                                                        style={{ width: `${emp.performance}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Recent Reports Table */}
                                <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col">
                                    <h3 className="text-lg font-bold text-slate-800 mb-3">Recent Reports</h3>
                                    <div className="overflow-x-auto flex-1">
                                        <table className="w-full text-left border-collapse text-xs">
                                            <thead>
                                                <tr className="border-b border-slate-100">
                                                    <th className="py-2 text-[10px] uppercase font-bold text-slate-400">Report Name</th>
                                                    <th className="py-2 text-[10px] uppercase font-bold text-slate-400 text-center">Status</th>
                                                    <th className="py-2 text-[10px] uppercase font-bold text-slate-400 text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(biData?.recentReports || []).slice(0, 5).map((rep: BIReportData, idx: number) => (
                                                    <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                                                        <td className="py-2">
                                                            <p className="font-bold text-slate-700">{rep.reportName}</p>
                                                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{rep.createdBy} &bull; {new Date(rep.date).toLocaleDateString()}</p>
                                                        </td>
                                                        <td className="py-2 text-center">
                                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold border ${rep.status === 'Ready' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                                rep.status === 'Pending' ? 'bg-amber-50 text-amber-705 border-amber-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                                                                }`}>
                                                                {rep.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-2 text-right">
                                                            <button
                                                                onClick={() => showToast(`Opening report details for ${rep.reportName}`, 'info')}
                                                                className="p-1 px-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg transition"
                                                            >
                                                                <Eye size={13} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                            </div>

                        </div>

                        {/* Interactive Right-side Filters Panel */}
                        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col gap-4 self-start w-full">
                            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                                <div className="flex items-center gap-2 text-slate-800">
                                    <SlidersHorizontal size={16} />
                                    <h4 className="font-bold text-sm uppercase tracking-wide">Filters</h4>
                                </div>
                                <button
                                    onClick={handleResetFilters}
                                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition"
                                >
                                    <RotateCcw size={12} />
                                    <span>Reset</span>
                                </button>
                            </div>

                            {/* Filter 1: Date Range */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date Range</label>
                                <div className="flex flex-col gap-2">
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 font-semibold"
                                    />
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 font-semibold"
                                    />
                                </div>
                            </div>

                            {/* Filter 2: Branch */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Branch</label>
                                <select
                                    value={branch}
                                    onChange={(e) => setBranch(e.target.value)}
                                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-750 font-bold"
                                >
                                    {filterOptions.branches.map((b, i) => (
                                        <option key={i} value={b}>{b}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Filter 3: Department */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Department</label>
                                <select
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-750 font-bold"
                                >
                                    {filterOptions.departments.map((d, i) => (
                                        <option key={i} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Filter 4: Employee */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Employee</label>
                                <select
                                    value={employee}
                                    onChange={(e) => setEmployee(e.target.value)}
                                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-755 font-bold"
                                >
                                    {filterOptions.employees.map((emp, i) => (
                                        <option key={i} value={emp}>{emp}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Filter 5: Project */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Project</label>
                                <select
                                    value={project}
                                    onChange={(e) => setProject(e.target.value)}
                                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-755 font-bold"
                                >
                                    {filterOptions.projects.map((proj, i) => (
                                        <option key={i} value={proj}>{proj}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Filter 6: Customer */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</label>
                                <select
                                    value={customer}
                                    onChange={(e) => setCustomer(e.target.value)}
                                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-755 font-bold"
                                >
                                    {filterOptions.customers.map((cust, i) => (
                                        <option key={i} value={cust}>{cust}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Filter 7: Product Category */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Product Category</label>
                                <select
                                    value={productCategory}
                                    onChange={(e) => setProductCategory(e.target.value)}
                                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-755 font-bold"
                                >
                                    {filterOptions.categories.map((cat, i) => (
                                        <option key={i} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Filter 8: Status */}
                            <div className="flex flex-col gap-1.5 font-bold">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-755 font-bold animate-none"
                                >
                                    <option value="All Status">All Status</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>

                            <button
                                onClick={handleApplyFilters}
                                className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-550/20 flex items-center justify-center gap-1.5"
                            >
                                <SlidersHorizontal size={14} />
                                <span>Apply Filters</span>
                            </button>
                        </div>

                    </div>

                </div>
            </main>
        </section>
    );
}
