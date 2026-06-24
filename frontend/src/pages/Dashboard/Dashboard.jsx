import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  HomeIcon, DollarSign, User, Building2Icon, Folder, LucideTimer, Package,
  Briefcase,
  BarChart3,
  Brain,
  FileText,
  ShieldCheck,
  Bell,
  Webhook,
  Settings,
  Building2,
  UserCog,
  LogOut, Boxes, Warehouse
} from 'lucide-react'


function Dashboard() {

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: HomeIcon
    },
    {
      name: 'Finance',
      path: '/finance',
      icon: DollarSign
    },
    {
      name: 'HR & Payroll',
      path: '/payroll',
      icon: User
    },
    {
      name: 'Inventory',
      path: '/inventory',
      icon: Folder
    },
    {
      name: 'Projects',
      path: '/projects',
      icon: Briefcase
    },
    {
      name: 'Business Intelligence',
      path: '/projects',
      icon: BarChart3
    },
    {
      name: 'AI Forecasting',
      path: '/attendance',
      icon: Brain
    },
    {
      name: 'Reports',
      path: '/attendance',
      icon: FileText
    }
  ];
  return (
    <section className="w-full min-h-screen">
      <aside className="w-64 min-h-screen bg-blue-950">

        <div className="p-4 ml-5">
          <h1 className="text-xl text-white font-bold">
            AmDOX <span className='text-blue-600'> ERP</span>
          </h1>
        </div>

        <div className="mt-5 px-3">

          {menuItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={index}
                to={item.path}
                className="flex items-center gap-4 p-3 rounded-lg text-white hover:bg-blue-500 transition"
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}

        </div>
      </aside>
    </section>
  );
}

export default Dashboard