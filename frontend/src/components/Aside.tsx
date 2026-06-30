import React, { Children, useEffect, useState } from 'react'
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
    ArrowBigRightIcon, Search,
    Menu,
    X
} from 'lucide-react'

const baseMenuItems = [
    { name: 'Dashboard', path: '/Dashboard', icon: HomeIcon },
    { name: 'Finance Ledger', path: '/finance-ledger', icon: DollarSign },
    { name: 'HR & Payroll', path: '/hr-payroll', icon: User },
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

const adminMenuItem = { name: 'Admin', path: '/admin/users', icon: UserCog }

function Aside() {
    const [userRole, setUserRole] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    // const [openDropdown, setOpenDropdown] = useState(null)

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                setUserRole(parsed?.role || '');
            } catch (error) {
                console.warn('Unable to parse user data', error);
            }
        }
    }, []);

    const menuItems = userRole === 'Admin' ? [adminMenuItem, ...baseMenuItems] : baseMenuItems;

    return (
        <>
            <button
                type="button"
                aria-label="Toggle menu"
                onClick={() => setIsOpen((prev) => !prev)}
                className="fixed left-4 top-4 z-50 rounded-full border border-slate-300 bg-white p-2 text-slate-700 shadow-lg lg:hidden"
            >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {isOpen && (
                <button
                    type="button"
                    aria-label="Close menu"
                    onClick={() => setIsOpen(false)}
                    className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
                />
            )}

            <aside className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-blue-950 p-4 transition-transform duration-300 lg:static lg:flex lg:w-72 lg:min-h-screen lg:flex-col lg:p-0 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="ml-2 flex items-center justify-between p-2 lg:ml-4 lg:p-4">
                    <h1 className="text-xl font-bold text-white">
                        AmDOX <span className='text-blue-500'> ERP</span>
                    </h1>
                    <button
                        type="button"
                        aria-label="Close menu"
                        onClick={() => setIsOpen(false)}
                        className="rounded-full p-2 text-white hover:bg-blue-800 lg:hidden"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="mt-3 grid gap-2 px-1 sm:grid-cols-2 lg:mt-5 lg:grid-cols-1 lg:px-3 lg:pb-3">
                    {menuItems.map((item, index) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={index}
                                to={item.path}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 rounded-lg p-3 text-white transition hover:bg-blue-500"
                            >
                                <Icon size={20} />
                                <span>{item.name}</span>
                            </NavLink>
                        );
                    })}
                </div>
            </aside>
        </>
    )
}

export default Aside