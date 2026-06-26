import { 
  DollarSign, CreditCard, TrendingUp, Wallet, ArrowUpRight, ArrowDownLeft,
  FileText, Landmark, ClipboardList, Briefcase, Percent, BarChart3
} from 'lucide-react';
import { StatItem, ChartDataPoint, Transaction, BankAccount, BudgetItem, FinanceModule, AlertItemData } from './types';

export const statCardsData: StatItem[] = [
  { title: "Total Revenue", amount: "₹1,25,80,000", percentage: "▲ 12.5% vs last month", isPositive: true, icon: TrendingUp, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
  { title: "Total Expense", amount: "₹68,40,000", percentage: "▲ 8.3% vs last month", isPositive: true, icon: CreditCard, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
  { title: "Net Profit", amount: "₹57,40,000", percentage: "▲ 18.7% vs last month", isPositive: true, icon: DollarSign, iconBg: "bg-purple-50", iconColor: "text-purple-600" },
  { title: "Cash & Bank Balance", amount: "₹42,35,000", percentage: "▼ 5.2% vs last month", isPositive: false, icon: Wallet, iconBg: "bg-amber-50", iconColor: "text-amber-600" },
  { title: "Outstanding Receivable", amount: "₹31,20,000", percentage: "▼ 3.7% vs last month", isPositive: false, icon: ArrowUpRight, iconBg: "bg-teal-50", iconColor: "text-teal-600" },
  { title: "Outstanding Payable", amount: "₹19,80,000", percentage: "▼ 2.1% vs last month", isPositive: false, icon: ArrowDownLeft, iconBg: "bg-rose-50", iconColor: "text-rose-600" }
];

export const cashFlowData: ChartDataPoint[] = [
  { date: '01 May', inflow: 40000, outflow: 25000, net: 15000 },
  { date: '06 May', inflow: 38000, outflow: 28000, net: 10000 },
  { date: '11 May', inflow: 50000, outflow: 32000, net: 18000 },
  { date: '16 May', inflow: 45000, outflow: 30000, net: 15000 },
  { date: '21 May', inflow: 62000, outflow: 42000, net: 20000 },
  { date: '26 May', inflow: 58000, outflow: 38000, net: 20000 },
  { date: '31 May', inflow: 78000, outflow: 52000, net: 26000 },
];

export const transactionsData: Transaction[] = [
  { id: '1', title: 'Payment to Vendor', subtitle: 'ABC Supplies', ref: 'INV-2024-1052', date: '21 May 2024', amount: '₹45,000', isPositive: false },
  { id: '2', title: 'Receipt from Customer', subtitle: 'Tech Solutions', ref: 'INV-2024-2048', date: '21 May 2024', amount: '₹85,000', isPositive: true },
  { id: '3', title: 'Journal Entry', subtitle: 'Office Rent', ref: 'JE-2024-0548', date: '20 May 2024', amount: '₹25,000', isPositive: false },
  { id: '4', title: 'Employee Expense', subtitle: 'Travel', ref: 'EXP-2024-0156', date: '20 May 2024', amount: '₹8,500', isPositive: false },
  { id: '5', title: 'Receipt from Customer', subtitle: 'Digital Ltd.', ref: 'INV-2024-2047', date: '19 May 2024', amount: '₹65,000', isPositive: true },
];

export const bankAccountsData: BankAccount[] = [
  { id: '1', bankName: 'HDFC Bank', accountNumber: '1234', accountType: 'Savings Account', balance: '₹18,75,000', logoColor: 'bg-blue-900 text-white' },
  { id: '2', bankName: 'ICICI Bank', accountNumber: '5678', accountType: 'Current Account', balance: '₹12,40,000', logoColor: 'bg-orange-600 text-white' },
  { id: '3', bankName: 'Axis Bank', accountNumber: '9012', accountType: 'Current Account', balance: '₹11,20,000', logoColor: 'bg-purple-800 text-white' },
];

export const budgetData: BudgetItem[] = [
  { title: 'Total Revenue', percentage: 75, color: 'bg-teal-500' },
  { title: 'Total Expense', percentage: 60, color: 'bg-blue-500' },
  { title: 'Total Budget', percentage: 80, color: 'bg-indigo-600' },
];

export const financeModulesData: FinanceModule[] = [
  { id: '1', title: 'General Ledger', description: 'Manage GL accounts', icon: FileText, iconColor: 'text-blue-600', iconBg: 'bg-blue-50' },
  { id: '2', title: 'Accounts Payable', description: 'Manage vendor payables', icon: ArrowDownLeft, iconColor: 'text-orange-600', iconBg: 'bg-orange-50' },
  { id: '3', title: 'Accounts Receivable', description: 'Manage customer receivables', icon: ArrowUpRight, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50' },
  { id: '4', title: 'Cash & Bank', description: 'Manage cash & bank', icon: Landmark, iconColor: 'text-cyan-600', iconBg: 'bg-cyan-50' },
  { id: '5', title: 'Budget Management', description: 'Plan and track budgets', icon: ClipboardList, iconColor: 'text-purple-600', iconBg: 'bg-purple-50' },
  { id: '6', title: 'Expense Management', description: 'Manage expenses', icon: CreditCard, iconColor: 'text-amber-600', iconBg: 'bg-amber-50' },
  { id: '7', title: 'Asset Management', description: 'Manage fixed assets', icon: Briefcase, iconColor: 'text-blue-700', iconBg: 'bg-blue-50' },
  { id: '8', title: 'Tax Management', description: 'Manage taxes & compliance', icon: Percent, iconColor: 'text-rose-600', iconBg: 'bg-rose-50' },
  { id: '9', title: 'Financial Reports', description: 'View financial reports', icon: FileText, iconColor: 'text-green-600', iconBg: 'bg-green-50' },
  { id: '10', title: 'Financial Analytics', description: 'Analytics & KPIs', icon: BarChart3, iconColor: 'text-violet-600', iconBg: 'bg-violet-50' },
];

export const alertsData: AlertItemData[] = [
  { id: '1', message: '5 Vendor Invoices pending payment', type: 'danger' },
  { id: '2', message: '3 Overdue Customer Invoices', type: 'warning' },
  { id: '3', message: 'Bank Reconciliation pending for 2 accounts', type: 'info' },
  { id: '4', message: 'TDS payment due on 07 Jun 2024', type: 'success' },
];