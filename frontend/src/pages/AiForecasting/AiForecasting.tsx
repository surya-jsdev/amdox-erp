import React, { useEffect, useState } from 'react';
import {
    Calendar,
    FileDown,
    Brain,
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    Info,
    RefreshCw,
    ShoppingCart,
    ChevronDown,
    Sparkles,
    Search,
    Bell,
    Expand,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    PieChart as RechartsPieChart,
    Pie,
    Cell
} from 'recharts';
import Aside from '../../components/Aside.js';

interface ModelInfo {
    modelName: string;
    lastTrainedOn: string;
    nextTraining: string;
    dataPointsUsed: number;
    modelAccuracy: number;
    forecastDrivers: { name: string; percentage: number }[];
}

interface ForecastKPIs {
    totalForecastedDemand: number;
    forecastAccuracy: number;
    bestPerformingCategory: string;
    atRiskStockOutCount: number;
    overstockRiskCount: number;
}

interface ProductForecastItem {
    product: string;
    category: string;
    actualDemand30: number;
    forecastedDemand30: number;
    changePercentage: number;
    trend: number[];
}

interface AtRiskProductItem {
    product: string;
    category: string;
    riskType: 'Stock Out' | 'Overstock';
    daysToRisk: number;
    quantity: number;
    location: string;
}

interface FilterMetadata {
    categories: string[];
    products: string[];
    warehouses: string[];
}

const DRIVER_COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#94a3b8'];

export default function AiForecasting() {
    // Current user context
    const [userName, setUserName] = useState('Admin');
    const [userRole, setUserRole] = useState('Super Admin');

    // States for data loaded from API
    const [loading, setLoading] = useState(true);
    const [retraining, setRetraining] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // API States
    const [kpis, setKpis] = useState<ForecastKPIs | null>(null);
    const [chartData, setChartData] = useState<any[]>([]);
    const [aiInsights, setAiInsights] = useState<any[]>([]);
    const [topProducts, setTopProducts] = useState<ProductForecastItem[]>([]);
    const [atRiskProducts, setAtRiskProducts] = useState<AtRiskProductItem[]>([]);
    const [modelState, setModelState] = useState<ModelInfo | null>(null);
    const [filterOptions, setFilterOptions] = useState<FilterMetadata>({
        categories: ['All Categories'],
        products: ['All Products'],
        warehouses: ['All Warehouses']
    });

    // Filter values
    const [productCategory, setProductCategory] = useState('All Categories');
    const [product, setProduct] = useState('All Products');
    const [warehouse, setWarehouse] = useState('All Warehouses');
    const [timeHorizon, setTimeHorizon] = useState('30'); // '30', '60', '90'
    const [viewMode, setViewMode] = useState<'Daily' | 'Weekly'>('Daily');

    // Custom date filters (defaults to May 2024 to align with BI records)
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Alert toast state
    const [toast, setToast] = useState<{ text: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);

    // Profile menu toggle state
    const [showProfileMenu, setShowProfileMenu] = useState(false);

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

    // Load forecasting data
    const fetchForecastData = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                timeHorizon,
                productCategory,
                product,
                warehouse
            });

            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            let apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            // if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            //     apiUrl = 'http://localhost:5000';
            // }
            const response = await fetch(`${apiUrl}/api/forecast?${params.toString()}`);
            if (!response.ok) {
                throw new Error('Failed to load forecast data from server.');
            }
            const data = await response.json();

            setKpis(data.kpis);
            setChartData(data.chartData);
            setAiInsights(data.aiInsights);
            setTopProducts(data.topProductsForecast);
            setAtRiskProducts(data.atRiskProducts);
            setModelState(data.modelState);
            setFilterOptions(data.filterMetadata);
        } catch (err: any) {
            console.error('Error fetching forecasting data:', err);
            setError(err.message || 'Failed to fetch AI Forecasting dashboard data.');
        } finally {
            setLoading(false);
        }
    };

    // Trigger retraining
    const handleRetrain = async () => {
        setRetraining(true);
        showToast('Running AI Forecast training pipeline (Prophet + ML Ensemble)...', 'info');
        try {
            let apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                apiUrl = 'http://localhost:5000';
            }
            const response = await fetch(`${apiUrl}/api/forecast/retrain`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!response.ok) {
                throw new Error('Failed to retrain model on backend.');
            }
            const data = await response.json();
            setModelState(data.modelState);
            showToast('AI Model retrained successfully! Accuracy and forecasts updated.', 'success');
            // Refresh data
            fetchForecastData();
        } catch (err: any) {
            console.error('Error retraining model:', err);
            showToast(err.message || 'Model retraining failed.', 'error');
        } finally {
            setRetraining(false);
        }
    };

    useEffect(() => {
        fetchForecastData();
    }, [productCategory, product, warehouse, timeHorizon, startDate, endDate]);

    const showToast = (text: string, type: 'success' | 'info' | 'warning' | 'error') => {
        setToast({ text, type });
        setTimeout(() => setToast(null), 4000);
    };

    const formatIndianNumber = (num: number) => {
        if (!num) return '0';
        return new Intl.NumberFormat('en-IN').format(num);
    };

    const handleExportReport = () => {
        showToast('Exporting AI forecasting report (PDF)...', 'success');
        // Simple mock download
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ kpis, chartData, modelState }, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `AI_Forecast_Report_${timeHorizon}_Days.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    };

    // Process daily vs weekly view for chart
    const getProcessedChartData = () => {
        if (viewMode === 'Daily' || chartData.length === 0) return chartData;

        // Group by weeks
        const weeks: any[] = [];
        let currentWeek: any = null;
        let dayCount = 0;

        chartData.forEach((point, index) => {
            if (index % 7 === 0) {
                if (currentWeek) {
                    currentWeek.actual = currentWeek.actualCount ? Math.round(currentWeek.actual / currentWeek.actualCount) : null;
                    currentWeek.forecast = currentWeek.forecastCount ? Math.round(currentWeek.forecast / currentWeek.forecastCount) : null;
                    currentWeek.upperBound = currentWeek.upperCount ? Math.round(currentWeek.upperBound / currentWeek.upperCount) : null;
                    currentWeek.lowerBound = currentWeek.lowerCount ? Math.round(currentWeek.lowerBound / currentWeek.lowerCount) : null;
                    weeks.push(currentWeek);
                }
                const formattedDate = new Date(point.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
                currentWeek = {
                    date: `Wk starting ${formattedDate}`,
                    actual: point.actual || 0,
                    actualCount: point.actual !== null ? 1 : 0,
                    forecast: point.forecast || 0,
                    forecastCount: point.forecast !== null ? 1 : 0,
                    upperBound: point.upperBound || 0,
                    upperCount: point.upperBound !== null ? 1 : 0,
                    lowerBound: point.lowerBound || 0,
                    lowerCount: point.lowerBound !== null ? 1 : 0
                };
            } else {
                if (point.actual !== null) {
                    currentWeek.actual += point.actual;
                    currentWeek.actualCount++;
                }
                if (point.forecast !== null) {
                    currentWeek.forecast += point.forecast;
                    currentWeek.forecastCount++;
                }
                if (point.upperBound !== null) {
                    currentWeek.upperBound += point.upperBound;
                    currentWeek.upperCount++;
                }
                if (point.lowerBound !== null) {
                    currentWeek.lowerBound += point.lowerBound;
                    currentWeek.lowerCount++;
                }
            }
        });
        if (currentWeek) weeks.push(currentWeek);
        return weeks;
    };

    const processedData = getProcessedChartData();

    // Find divider index where forecast starts
    const forecastDividerIndex = chartData.findIndex(d => d.forecast !== null && d.actual === null);
    const forecastDividerDate = chartData[forecastDividerIndex]?.date;

    // SVG parameters for radial gauge
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const confidenceVal = kpis?.forecastAccuracy || 92;
    const strokeDashoffset = circumference - (confidenceVal / 100) * circumference;

    return (
        <section className="w-full min-h-screen flex flex-col bg-slate-50 text-slate-800 lg:flex-row antialiased">
            <Aside />

            {/* Custom Toast Alert */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl transition-all duration-300 transform translate-y-0
                    ${toast.type === 'success' ? 'bg-emerald-600 text-white' :
                        toast.type === 'info' ? 'bg-blue-600 text-white' :
                            toast.type === 'warning' ? 'bg-amber-500 text-white' : 'bg-rose-600 text-white'}`}
                >
                    {toast.type === 'success' && <CheckCircle2 size={18} />}
                    {toast.type === 'warning' && <AlertTriangle size={18} />}
                    {toast.type === 'info' && <Info size={18} />}
                    <span className="text-sm font-medium">{toast.text}</span>
                </div>
            )}

            <main className="flex-1 overflow-x-hidden">
                {/* Header Navbar */}
                <header className="bg-white border-b border-slate-100 px-6 py-4 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
                    <div className="flex items-center justify-between w-full md:w-auto">
                        <div className="flex items-center gap-3 pl-12 md:pl-0">
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">AI Demand Forecasting</h1>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5 hidden sm:block">Predict future demand and optimize inventory & supply chain</p>
                                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-0.5 block sm:hidden">Predict demand & optimize inventory</p>
                            </div>
                        </div>

                        {/* Notification / Profile Avatar for Mobile view */}
                        <div className="flex items-center gap-3 md:hidden">
                            <button className="relative p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition">
                                <Bell size={18} />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
                            </button>

                            <div className="relative">
                                <button
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                    className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow cursor-pointer"
                                >
                                    {userName.charAt(0)}
                                </button>

                                {showProfileMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-lg py-1 z-50">
                                        <div className="px-4 py-2 border-b border-slate-100">
                                            <p className="text-xs text-slate-400">Signed in as</p>
                                            <p className="text-sm font-semibold text-slate-800 truncate">{userName}</p>
                                        </div>
                                        <button
                                            onClick={() => { localStorage.clear(); window.location.href = '/Login'; }}
                                            className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-rose-50 font-medium transition"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full md:w-auto justify-end">
                        {/* Custom Date Range Picker Container */}
                        <div className="flex items-center justify-between gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl flex-1 sm:flex-initial">
                            <Calendar size={14} className="text-slate-400 flex-shrink-0" />
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-transparent border-none text-xs font-semibold text-slate-700 focus:outline-none w-28 cursor-pointer"
                                placeholder="Start Date"
                            />
                            <span className="text-slate-400 text-xs font-bold ">-</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-transparent border-none text-xs font-semibold text-slate-700 focus:outline-none w-28 cursor-pointer"
                                placeholder="End Date"
                            />
                            {(startDate || endDate) && (
                                <button
                                    onClick={() => { setStartDate(''); setEndDate(''); }}
                                    className="text-[10px] text-red-500 font-bold hover:underline ml-1"
                                >
                                    Clear
                                </button>
                            )}
                        </div>

                        {/* Top-Level Warehouse filter */}
                        <div className="relative flex-1 sm:flex-initial">
                            <select
                                value={warehouse}
                                onChange={(e) => setWarehouse(e.target.value)}
                                className="w-full appearance-none pr-8 pl-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition cursor-pointer"
                            >
                                {filterOptions.warehouses.map(w => (
                                    <option key={w} value={w}>{w}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2.5 top-3 text-slate-400 pointer-events-none" size={14} />
                        </div>

                        {/* Export Button */}
                        <button
                            onClick={handleExportReport}
                            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition duration-150 cursor-pointer w-full sm:w-auto"
                        >
                            <FileDown size={15} />
                            <span>Export Report</span>
                        </button>

                        {/* Notification / Profile Avatar for Desktop view */}
                        <div className="hidden md:flex items-center gap-3 border-l border-slate-200 pl-3">
                            <button className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition">
                                <Bell size={18} />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full"></span>
                            </button>

                            <div className="relative">
                                <button
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                    className="flex items-center gap-2 focus:outline-none cursor-pointer"
                                >
                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow">
                                        {userName.charAt(0)}
                                    </div>
                                    <div className="hidden lg:block text-left">
                                        <p className="text-xs font-bold text-slate-800 leading-tight">{userName}</p>
                                        <p className="text-[10px] text-slate-400 font-semibold uppercase">{userRole}</p>
                                    </div>
                                </button>

                                {showProfileMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-lg py-1 z-50">
                                        <div className="px-4 py-2 border-b border-slate-100">
                                            <p className="text-xs text-slate-400">Signed in as</p>
                                            <p className="text-sm font-semibold text-slate-800 truncate">{userName}</p>
                                        </div>
                                        <button
                                            onClick={() => { localStorage.clear(); window.location.href = '/Login'; }}
                                            className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-rose-50 font-medium transition"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Core Content */}
                <div className="p-6 space-y-6">

                    {/* KPI Cards Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                        {/* KPI 1 */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Forecasted Demand</span>
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                    <TrendingUp size={16} />
                                </div>
                            </div>
                            <div className="mt-3">
                                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                                    {loading ? '...' : formatIndianNumber(kpis?.totalForecastedDemand || 1245890)}
                                </h3>
                                <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1">
                                    <ArrowUpRight size={14} />
                                    <span>+18.6%</span>
                                    <span className="text-[10px] text-slate-400 font-normal ml-0.5">vs last 30 days</span>
                                </p>
                            </div>
                        </div>

                        {/* KPI 2 */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Forecast Accuracy</span>
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                    <Brain size={16} />
                                </div>
                            </div>
                            <div className="mt-3">
                                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                                    {loading ? '...' : `${kpis?.forecastAccuracy || 92.4}%`}
                                </h3>
                                <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1">
                                    <ArrowUpRight size={14} />
                                    <span>+5.3%</span>
                                    <span className="text-[10px] text-slate-400 font-normal ml-0.5">vs last 30 days</span>
                                </p>
                            </div>
                        </div>

                        {/* KPI 3 */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Best Performing Category</span>
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                                    <Sparkles size={16} />
                                </div>
                            </div>
                            <div className="mt-3">
                                <h3 className="text-lg sm:text-xl font-bold text-slate-900 truncate tracking-tight">
                                    {loading ? '...' : (kpis?.bestPerformingCategory || 'Electronics')}
                                </h3>
                                <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1">
                                    <ArrowUpRight size={14} />
                                    <span>+24.1%</span>
                                    <span className="text-[10px] text-slate-400 font-normal ml-0.5">predicted growth</span>
                                </p>
                            </div>
                        </div>

                        {/* KPI 4 */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">At Risk (Stock Out)</span>
                                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                                    <AlertTriangle size={16} />
                                </div>
                            </div>
                            <div className="mt-3">
                                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight text-amber-600">
                                    {loading ? '...' : (kpis?.atRiskStockOutCount || 23)}
                                </h3>
                                <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1">
                                    <ArrowDownRight size={14} className="rotate-180 text-rose-500" />
                                    <span className="text-rose-500">-8</span>
                                    <span className="text-[10px] text-slate-400 font-normal ml-0.5">vs last 30 days</span>
                                </p>
                            </div>
                        </div>

                        {/* KPI 5 */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Overstock Risk</span>
                                <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                                    <AlertTriangle size={16} />
                                </div>
                            </div>
                            <div className="mt-3">
                                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight text-rose-600">
                                    {loading ? '...' : (kpis?.overstockRiskCount || 15)}
                                </h3>
                                <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1">
                                    <ArrowDownRight size={14} className="text-emerald-600" />
                                    <span>-5</span>
                                    <span className="text-[10px] text-slate-400 font-normal ml-0.5">vs last 30 days</span>
                                </p>
                            </div>
                        </div>

                        {/* KPI 6 - Confidence Radial Gauge */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition">
                            <div className="flex-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-1">
                                    <Sparkles size={11} /> AI Confidence
                                </span>
                                <h4 className="text-sm font-extrabold text-slate-800 mt-2 tracking-tight">
                                    {loading ? '...' : confidenceVal >= 90 ? 'High Confidence' : 'Medium Confidence'}
                                </h4>
                                <p className="text-[10px] font-medium text-slate-400 mt-0.5">Ensemble output</p>
                            </div>
                            <div className="relative w-18 h-18 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="36"
                                        cy="36"
                                        r={radius}
                                        className="stroke-slate-100"
                                        strokeWidth="6"
                                        fill="transparent"
                                    />
                                    <circle
                                        cx="36"
                                        cy="36"
                                        r={radius}
                                        className="stroke-indigo-600 transition-all duration-500"
                                        strokeWidth="6"
                                        fill="transparent"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={loading ? circumference : strokeDashoffset}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <span className="absolute text-sm font-bold text-slate-800">
                                    {loading ? '...' : `${Math.round(confidenceVal)}%`}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Secondary Filters Bar */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-wrap gap-4 items-center">
                        <div className="flex flex-col flex-1 min-w-[150px]">
                            <label className="text-[10px] font-bold uppercase text-slate-400 mb-1">Product Category</label>
                            <div className="relative">
                                <select
                                    value={productCategory}
                                    onChange={(e) => {
                                        setProductCategory(e.target.value);
                                        setProduct('All Products'); // Reset product when category changes
                                    }}
                                    className="w-full appearance-none pr-8 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                                >
                                    {filterOptions.categories.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2.5 top-3 text-slate-400 pointer-events-none" size={14} />
                            </div>
                        </div>

                        <div className="flex flex-col flex-1 min-w-[150px]">
                            <label className="text-[10px] font-bold uppercase text-slate-400 mb-1">Product</label>
                            <div className="relative">
                                <select
                                    value={product}
                                    onChange={(e) => setProduct(e.target.value)}
                                    className="w-full appearance-none pr-8 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                                >
                                    {filterOptions.products.map(p => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2.5 top-3 text-slate-400 pointer-events-none" size={14} />
                            </div>
                        </div>

                        <div className="flex flex-col flex-1 min-w-[150px]">
                            <label className="text-[10px] font-bold uppercase text-slate-400 mb-1">Warehouse</label>
                            <div className="relative">
                                <select
                                    value={warehouse}
                                    onChange={(e) => setWarehouse(e.target.value)}
                                    className="w-full appearance-none pr-8 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                                >
                                    {filterOptions.warehouses.map(w => (
                                        <option key={w} value={w}>{w}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2.5 top-3 text-slate-400 pointer-events-none" size={14} />
                            </div>
                        </div>

                        <div className="flex flex-col flex-1 min-w-[150px]">
                            <label className="text-[10px] font-bold uppercase text-slate-400 mb-1">Time Horizon</label>
                            <div className="relative">
                                <select
                                    value={timeHorizon}
                                    onChange={(e) => setTimeHorizon(e.target.value)}
                                    className="w-full appearance-none pr-8 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                                >
                                    <option value="30">Next 30 Days</option>
                                    <option value="60">Next 60 Days</option>
                                    <option value="90">Next 90 Days</option>
                                </select>
                                <ChevronDown className="absolute right-2.5 top-3 text-slate-400 pointer-events-none" size={14} />
                            </div>
                        </div>
                    </div>

                    {/* Main Chart and Sidebar Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Demand Forecast vs Actual Chart */}
                        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between relative min-h-[450px]">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-base font-bold text-slate-900">Demand Forecast vs Actual</h3>
                                    <div className="relative group cursor-pointer">
                                        <Info size={14} className="text-slate-400" />
                                        <div className="absolute left-0 bottom-6 hidden group-hover:block bg-slate-900 text-white text-[10px] p-2 rounded shadow-lg w-48 z-10">
                                            Solid line shows historical sales demand. Dashed line indicates machine learning projection with uncertainty envelopes.
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {/* Toggle Daily/Weekly View */}
                                    <div className="flex bg-slate-100 rounded-xl p-0.5 border border-slate-200 text-xs font-bold">
                                        <button
                                            onClick={() => setViewMode('Daily')}
                                            className={`px-3 py-1 rounded-lg transition ${viewMode === 'Daily' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                                        >
                                            Daily View
                                        </button>
                                        <button
                                            onClick={() => setViewMode('Weekly')}
                                            className={`px-3 py-1 rounded-lg transition ${viewMode === 'Weekly' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                                        >
                                            Weekly View
                                        </button>
                                    </div>
                                    <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition">
                                        <Expand size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Chart rendering */}
                            <div className="flex-1 w-full min-h-[300px]">
                                {loading ? (
                                    <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                                        <div className="flex flex-col items-center gap-2">
                                            <RefreshCw className="animate-spin text-blue-600" size={32} />
                                            <span className="text-xs font-semibold text-slate-400">Calculating AI Forecast curves...</span>
                                        </div>
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart
                                            data={processedData}
                                            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                                        >
                                            <defs>
                                             
                                                <linearGradient id="uncertaintyEnvelope" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.12} />
                                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                            <XAxis
                                                dataKey="date"
                                                tickLine={false}
                                                axisLine={false}
                                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'medium' }}
                                            />
                                            <YAxis
                                                tickLine={false}
                                                axisLine={false}
                                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'medium' }}
                                                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}
                                            />
                                            <RechartsTooltip
                                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                                                labelStyle={{ fontWeight: 'bold', color: '#94a3b8', marginBottom: '4px' }}
                                                formatter={(value: any, name: any) => {
                                                    if (value === null) return ['-', name];
                                                    return [`${Math.round(value)} Units`, name];
                                                }}
                                            />
                                            {/* Uncertainty Envelope */}
                                            <Area
                                                type="monotone"
                                                dataKey="upperBound"
                                                stroke="transparent"
                                                fill="url(#uncertaintyEnvelope)"
                                                connectNulls
                                            />
                                            {/* Upper Bound Dotted */}
                                            <Line
                                                type="monotone"
                                                dataKey="upperBound"
                                                stroke="#818cf8"
                                                strokeWidth={1}
                                                strokeDasharray="3 3"
                                                dot={false}
                                                name="Upper Bound"
                                                connectNulls
                                            />
                                            {/* Lower Bound Dotted */}
                                            <Line
                                                type="monotone"
                                                dataKey="lowerBound"
                                                stroke="#818cf8"
                                                strokeWidth={1}
                                                strokeDasharray="3 3"
                                                dot={false}
                                                name="Lower Bound"
                                                connectNulls
                                            />
                                            {/* Actual Demand Line */}
                                            <Line
                                                type="monotone"
                                                dataKey="actual"
                                                stroke="#2563eb"
                                                strokeWidth={2.5}
                                                dot={{ r: 2, strokeWidth: 1 }}
                                                activeDot={{ r: 5 }}
                                                name="Actual Demand"
                                            />
                                            {/* Forecasted Demand Line */}
                                            <Line
                                                type="monotone"
                                                dataKey="forecast"
                                                stroke="#6366f1"
                                                strokeWidth={2.5}
                                                strokeDasharray="5 5"
                                                dot={{ r: 2, strokeWidth: 1 }}
                                                name="Forecasted Demand"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </div>

                            {/* Legends */}
                            <div className="flex flex-wrap items-center justify-center gap-6 mt-4 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-0.5 bg-blue-600"></div>
                                    <span>Actual Demand</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-0.5 bg-indigo-500 border-t border-dashed"></div>
                                    <span>Forecasted Demand</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-0.5 border-t border-dotted border-indigo-400"></div>
                                    <span>Confidence Interval (Upper/Lower Bound)</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar Section */}
                        <div className="space-y-6">

                            {/* AI Insights Card */}
                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                                        <Sparkles size={16} className="text-indigo-500" />
                                        <span>AI Insights</span>
                                    </h3>
                                    <button className="text-[11px] font-bold text-blue-600 hover:underline">Reset</button>
                                </div>

                                <div className="space-y-3">
                                    {loading ? (
                                        <div className="py-8 text-center text-xs text-slate-400">Generating insights...</div>
                                    ) : (
                                        aiInsights.map((insight, idx) => (
                                            <div
                                                key={idx}
                                                className={`flex items-start gap-3 p-3 rounded-xl border text-xs font-semibold
                                                ${insight.variant === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
                                                        insight.variant === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-800' :
                                                            insight.variant === 'info' ? 'bg-blue-50 border-blue-100 text-blue-800' :
                                                                'bg-indigo-50 border-indigo-100 text-indigo-800'}`}
                                            >
                                                <div className="mt-0.5 flex-shrink-0">
                                                    {insight.variant === 'success' && <CheckCircle2 size={15} className="text-emerald-600" />}
                                                    {insight.variant === 'warning' && <AlertTriangle size={15} className="text-amber-600" />}
                                                    {insight.variant === 'info' && <Info size={15} className="text-blue-600" />}
                                                    {insight.variant === 'primary' && <Brain size={15} className="text-indigo-600" />}
                                                </div>
                                                <p className="leading-relaxed">{insight.text}</p>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <button className="mt-4 w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition">
                                    View All Insights
                                </button>
                            </div>

                            {/* Top Forecast Drivers (Donut Chart) */}
                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                                <h3 className="text-base font-bold text-slate-900 mb-4">Top Forecast Drivers</h3>
                                <div className="flex items-center gap-4">
                                    <div className="w-28 h-28 flex-shrink-0">
                                        {loading ? (
                                            <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">Loading...</div>
                                        ) : (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RechartsPieChart>
                                                    <Pie
                                                        data={modelState?.forecastDrivers || []}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={28}
                                                        outerRadius={45}
                                                        paddingAngle={3}
                                                        dataKey="percentage"
                                                    >
                                                        {(modelState?.forecastDrivers || []).map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={DRIVER_COLORS[index % DRIVER_COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                </RechartsPieChart>
                                            </ResponsiveContainer>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-1.5">
                                        {(modelState?.forecastDrivers || []).map((driver, index) => (
                                            <div key={driver.name} className="flex items-center justify-between text-xs font-semibold text-slate-600">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: DRIVER_COLORS[index % DRIVER_COLORS.length] }}></span>
                                                    <span className="truncate max-w-[100px]">{driver.name}</span>
                                                </div>
                                                <span className="font-bold text-slate-800">{driver.percentage}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Model Information Card */}
                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                                <h3 className="text-base font-bold text-slate-900 mb-4">Model Information</h3>
                                <div className="space-y-3.5 text-xs font-semibold text-slate-500 border-b border-slate-100 pb-4">
                                    <div className="flex justify-between">
                                        <span>Model Used</span>
                                        <span className="text-slate-800 font-bold">{modelState?.modelName || 'Prophet + ML Ensemble'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Last Trained On</span>
                                        <span className="text-slate-800 font-bold">
                                            {modelState?.lastTrainedOn ? new Date(modelState.lastTrainedOn).toLocaleString('en-GB', {
                                                day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                            }) : '31 May 2024 02:30 AM'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Next Training</span>
                                        <span className="text-slate-800 font-bold">
                                            {modelState?.nextTraining ? new Date(modelState.nextTraining).toLocaleString('en-GB', {
                                                day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                            }) : '01 Jun 2024 02:30 AM'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Data Points Used</span>
                                        <span className="text-slate-800 font-bold">{formatIndianNumber(modelState?.dataPointsUsed || 24560)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Model Accuracy</span>
                                        <span className="text-slate-800 font-bold">{modelState?.modelAccuracy || 92.4}%</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleRetrain}
                                    disabled={retraining}
                                    className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs transition disabled:opacity-50 cursor-pointer"
                                >
                                    <RefreshCw className={`w-3.5 h-3.5 ${retraining ? 'animate-spin' : ''}`} />
                                    <span>{retraining ? 'Retraining...' : 'Retrain Model'}</span>
                                </button>
                            </div>

                        </div>
                    </div>

                    {/* Bottom Row Tables */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Top Products - Demand Forecast */}
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-base font-bold text-slate-900">Top Products - Demand Forecast</h3>
                                <button className="text-xs font-bold text-blue-600 hover:underline">View All Products &rarr;</button>
                            </div>

                            {/* Desktop Table View */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            <th className="py-2.5">Product</th>
                                            <th className="py-2.5">Category</th>
                                            <th className="py-2.5 text-right">Actual Demand (30 Days)</th>
                                            <th className="py-2.5 text-right">Forecasted (Next 30 Days)</th>
                                            <th className="py-2.5 text-right">Change (%)</th>
                                            <th className="py-2.5 text-center">Trend</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-700">
                                        {loading ? (
                                            <tr>
                                                <td colSpan={6} className="py-8 text-center text-slate-400">Loading products...</td>
                                            </tr>
                                        ) : (
                                            topProducts.map((p, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50/50 transition">
                                                    <td className="py-3 font-bold text-slate-900">{p.product}</td>
                                                    <td className="py-3 text-slate-500">{p.category}</td>
                                                    <td className="py-3 text-right">{formatIndianNumber(p.actualDemand30)}</td>
                                                    <td className="py-3 text-right text-indigo-600 font-bold">{formatIndianNumber(p.forecastedDemand30)}</td>
                                                    <td className={`py-3 text-right ${p.changePercentage >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                        {p.changePercentage >= 0 ? `+${p.changePercentage}%` : `${p.changePercentage}%`}
                                                    </td>
                                                    <td className="py-3 flex justify-center">
                                                        <div className="w-16 h-6">
                                                            <ResponsiveContainer width="100%" height="100%">
                                                                <LineChart data={p.trend.map((val, i) => ({ value: val }))}>
                                                                    <Line
                                                                        type="monotone"
                                                                        dataKey="value"
                                                                        stroke={p.changePercentage >= 0 ? '#10b981' : '#ef4444'}
                                                                        strokeWidth={1.5}
                                                                        dot={false}
                                                                    />
                                                                </LineChart>
                                                            </ResponsiveContainer>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card List View */}
                            <div className="block md:hidden space-y-3">
                                {loading ? (
                                    <div className="py-8 text-center text-xs text-slate-400">Loading products...</div>
                                ) : (
                                    topProducts.map((p, idx) => (
                                        <div key={idx} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col gap-3 shadow-sm hover:shadow transition">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-bold text-slate-900 text-sm">{p.product}</h4>
                                                    <p className="text-slate-400 text-[10px] font-semibold mt-0.5">{p.category}</p>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${p.changePercentage >= 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                                                    {p.changePercentage >= 0 ? `+${p.changePercentage}%` : `${p.changePercentage}%`}
                                                </span>
                                            </div>
                                            
                                            <div className="flex justify-between items-center text-xs font-bold text-slate-600 border-t border-slate-100 pt-2.5">
                                                <div>
                                                    <p className="text-slate-400 text-[9px] uppercase tracking-wider">Actual (30d)</p>
                                                    <p className="text-slate-800 font-extrabold mt-0.5">{formatIndianNumber(p.actualDemand30)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-400 text-[9px] uppercase tracking-wider">Forecast (30d)</p>
                                                    <p className="text-indigo-600 font-black mt-0.5">{formatIndianNumber(p.forecastedDemand30)}</p>
                                                </div>
                                                <div className="w-14 h-6">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <LineChart data={p.trend.map((val, i) => ({ value: val }))}>
                                                            <Line
                                                                type="monotone"
                                                                dataKey="value"
                                                                stroke={p.changePercentage >= 0 ? '#10b981' : '#ef4444'}
                                                                strokeWidth={1.5}
                                                                dot={false}
                                                            />
                                                        </LineChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* At Risk Products */}
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-base font-bold text-slate-900">At Risk Products</h3>
                                <button className="text-xs font-bold text-blue-600 hover:underline">View All At Risk &rarr;</button>
                            </div>

                            {/* Desktop Table View */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            <th className="py-2.5">Product</th>
                                            <th className="py-2.5">Risk Type</th>
                                            <th className="py-2.5 text-right">Days to Risk</th>
                                            <th className="py-2.5 text-right">Warehouse / Branch</th>
                                            <th className="py-2.5 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-700">
                                        {loading ? (
                                            <tr>
                                                <td colSpan={5} className="py-8 text-center text-slate-400">Loading risk assessments...</td>
                                            </tr>
                                        ) : (
                                            atRiskProducts.map((p, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50/50 transition">
                                                    <td className="py-3 font-bold text-slate-900">{p.product}</td>
                                                    <td className="py-3">
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide
                                                            ${p.riskType === 'Stock Out' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                                                            {p.riskType}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 text-right font-bold text-slate-950">{p.daysToRisk} Days</td>
                                                    <td className="py-3 text-right text-slate-500">{p.location}</td>
                                                    <td className="py-3 text-center">
                                                        <button
                                                            onClick={() => showToast(`Initiated purchase order process for ${p.product}`, 'success')}
                                                            className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition cursor-pointer"
                                                        >
                                                            <ShoppingCart size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card List View */}
                            <div className="block md:hidden space-y-3">
                                {loading ? (
                                    <div className="py-8 text-center text-xs text-slate-400">Loading risk assessments...</div>
                                ) : (
                                    atRiskProducts.map((p, idx) => (
                                        <div key={idx} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col gap-3 shadow-sm hover:shadow transition">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-bold text-slate-900 text-sm">{p.product}</h4>
                                                    <p className="text-slate-400 text-[10px] font-semibold mt-0.5">{p.location}</p>
                                                </div>
                                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border
                                                    ${p.riskType === 'Stock Out' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                                    {p.riskType}
                                                </span>
                                            </div>
                                            
                                            <div className="flex justify-between items-center border-t border-slate-100 pt-2.5">
                                                <div className="text-xs font-bold">
                                                    <span className="text-slate-400 text-[9px] uppercase tracking-wider block">Days to Risk</span>
                                                    <span className="text-slate-900 font-extrabold text-sm">{p.daysToRisk} Days</span>
                                                </div>
                                                
                                                <button
                                                    onClick={() => showToast(`Initiated purchase order process for ${p.product}`, 'success')}
                                                    className="flex items-center gap-1 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-bold transition cursor-pointer"
                                                >
                                                    <ShoppingCart size={12} />
                                                    <span>Reorder</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>

                </div>
            </main>
        </section>
    );
}