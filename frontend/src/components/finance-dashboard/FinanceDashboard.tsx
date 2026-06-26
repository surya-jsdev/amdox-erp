import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FileText } from 'lucide-react';
import { statCardsData, cashFlowData, transactionsData, bankAccountsData, budgetData, alertsData, financeModulesData } from './dummyData';

export  function FinanceDashboard() {
  return (
    <div className="w-full min-h-screen bg-gray-50/50 p-4 sm:p-6 flex flex-col gap-5 font-sans antialiased text-gray-600">
      
      {/* SECTION 1: TOP KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCardsData.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${card.iconBg} ${card.iconColor}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-400 truncate">{card.title}</p>
                  <h3 className="text-xl font-bold text-gray-900 mt-0.5 tracking-tight">{card.amount}</h3>
                  <p className={`text-[11px] font-semibold mt-1 ${card.isPositive ? 'text-green-600' : 'text-red-500'}`}>
                    {card.percentage}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DASHBOARD LAYOUT GRID MATRIX */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5 items-start">
        
        {/* Left + Mid Main Stack */}
        <div className="xl:col-span-3 flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* SECTION 2: CASH FLOW OVERVIEW */}
            <div className="md:col-span-2 bg-white p-5 rounded-xl border border-gray-100 shadow-sm h-full flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-gray-50">
                <h2 className="text-sm font-bold text-gray-800">Cash Flow Overview</h2>
                <select className="bg-gray-50 border border-gray-200 text-gray-600 text-xs rounded-lg p-1.5 outline-none font-medium">
                  <option>This Month</option>
                </select>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold mt-4 px-2">
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-1 rounded bg-emerald-500 inline-block"/> <span className="text-gray-500">Cash Inflow</span></div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-1 rounded bg-rose-400 inline-block"/> <span className="text-gray-500">Cash Outflow</span></div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-1 rounded bg-blue-500 inline-block"/> <span className="text-gray-500">Net Flow</span></div>
              </div>
              <div className="w-full flex-1 min-h-[260px] mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cashFlowData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="inflowG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                      <linearGradient id="outflowG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15}/><stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/></linearGradient>
                      <linearGradient id="netG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f9fafb" />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #f3f4f6', fontSize: 11 }} />
                    <Area type="monotone" dataKey="inflow" stroke="#10b981" strokeWidth={2} fill="url(#inflowG)" />
                    <Area type="monotone" dataKey="outflow" stroke="#f43f5e" strokeWidth={2} fill="url(#outflowG)" />
                    <Area type="monotone" dataKey="net" stroke="#3b82f6" strokeWidth={2} fill="url(#netG)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* SECTION 3: RECENT TRANSACTIONS */}
            <div className="md:col-span-1 bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col h-full">
              <div className="flex items-center justify-between pb-3 border-b border-gray-50">
                <h2 className="text-sm font-bold text-gray-800">Recent Transactions</h2>
                <button className="text-xs font-bold text-blue-600 hover:underline">View All</button>
              </div>
              <div className="mt-3 flex flex-col gap-2 flex-1 overflow-y-auto">
                {transactionsData.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50/80 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 bg-orange-50 text-orange-500 rounded-lg shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-gray-800 truncate">{tx.title}</h4>
                        <p className="text-[10px] text-gray-400 truncate mt-0.5">{tx.subtitle} • {tx.ref}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <span className={`text-xs font-bold ${tx.isPositive ? 'text-green-600' : 'text-red-500'}`}>
                        {tx.isPositive ? '+' : '-'} {tx.amount}
                      </span>
                      <p className="text-[9px] text-gray-400 mt-0.5">{tx.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
          
          {/* SECTION 6: FINANCE MODULES */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <h2 className="text-sm font-bold text-gray-800 pb-3 border-b border-gray-50">Finance Modules</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mt-4">
              {financeModulesData.map((mod) => {
                const Icon = mod.icon;
                return (
                  <div key={mod.id} className="p-3 border border-gray-100 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group flex items-center gap-3">
                    <div className={`p-2 rounded-lg shrink-0 ${mod.iconBg} ${mod.iconColor}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs font-bold text-gray-800 group-hover:text-blue-600 transition-colors truncate">{mod.title}</h3>
                      <p className="text-[10px] text-gray-400 truncate mt-0.5">{mod.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Rightmost Sidebar Stack */}
        <div className="xl:col-span-1 flex flex-col gap-5">
          
          {/* SECTION 4: BANK ACCOUNTS */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-gray-50">
              <h2 className="text-sm font-bold text-gray-800">Bank Accounts</h2>
              <button className="text-xs font-bold text-blue-600 hover:underline">View All</button>
            </div>
            <div className="mt-3 flex flex-col gap-3">
              {bankAccountsData.map((acc) => (
                <div key={acc.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 flex items-center justify-center font-black text-[10px] rounded-md ${acc.logoColor}`}>
                      {acc.bankName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-800">{acc.bankName} - {acc.accountNumber}</h4>
                      <p className="text-[10px] text-gray-400">{acc.accountType}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-gray-800">{acc.balance}</span>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 5: BUDGET VS ACTUAL */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-gray-50">
              <h2 className="text-sm font-bold text-gray-800">Budget vs Actual</h2>
              <select className="bg-gray-50 border border-gray-200 text-gray-600 text-[11px] rounded-lg p-1 outline-none font-medium">
                <option>This Month</option>
              </select>
            </div>
            <div className="mt-4 flex flex-col gap-3.5">
              {budgetData.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between text-[11px] font-medium mb-1">
                    <span className="text-gray-500">{item.title}</span>
                    <span className="text-gray-800 font-bold">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 7: ALERTS & REMINDERS */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between pb-3 border-b border-gray-50">
              <h2 className="text-sm font-bold text-gray-800">Alerts & Reminders</h2>
              <button className="text-xs font-bold text-blue-600 hover:underline">View All</button>
            </div>
            <div className="mt-3 flex flex-col gap-3 justify-between flex-1">
              {alertsData.map((alert) => {
                let dotColor = 'bg-blue-500';
                if (alert.type === 'danger') dotColor = 'bg-rose-500';
                if (alert.type === 'warning') dotColor = 'bg-amber-500';
                if (alert.type === 'success') dotColor = 'bg-purple-500';

                return (
                  <div key={alert.id} className="flex items-center gap-2.5">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
                    <span className="text-xs font-medium text-gray-600 line-clamp-1">{alert.message}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}