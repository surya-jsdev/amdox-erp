import { LucideIcon } from 'lucide-react';

export interface StatItem {
  title: string;
  amount: string;
  percentage: string;
  isPositive: boolean;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
}

export interface ChartDataPoint {
  date: string;
  inflow: number;
  outflow: number;
  net: number;
}

export interface Transaction {
  id: string;
  title: string;
  subtitle: string;
  ref: string;
  date: string;
  amount: string;
  isPositive: boolean;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountType: string;
  balance: string;
  logoColor: string;
}

export interface BudgetItem {
  title: string;
  percentage: number;
  color: string;
}

export interface FinanceModule {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
}

export interface AlertItemData {
  id: string;
  message: string;
  type: 'danger' | 'warning' | 'info' | 'success';
}