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
    LogOut, Boxes, Warehouse,
    ArrowBigRightIcon, Search
} from 'lucide-react'

const menuItems = [
    { name: 'Dashboard', path: '/', icon: HomeIcon },
    { name: 'Finace', path: '/sales', icon: DollarSign },
    { name: 'HR & Payroll', path: '/customers', icon: User },
    { name: 'Supply Chain', path: '/vendors', icon: Building2Icon },
    { name: 'Inventory', path: '/inventory', icon: Boxes },
    { name: 'Projects', path: '/projects', icon: Briefcase },
    { name: 'Business Intelligence', path: '/reports', icon: BarChart3 },
    { name: 'AI Forecasting', path: '/tasks', icon: LucideTimer },
    { name: 'Reports', path: '/files', icon: Folder },
    { name: 'Support', path: '/support', icon: ShieldCheck },
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Logout', path: '/logout', icon: LogOut }
]

function Aside() {

    return (
        <aside className="w-70 min-h-screen bg-blue-950 flex flex-col">

            <div className="p-4 ml-4">
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
    )
}

export default Aside