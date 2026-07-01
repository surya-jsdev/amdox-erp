import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
    HomeIcon,
    DollarSign,
    User,
    Building2,
    Folder,
    LucideTimer,
    Briefcase,
    BarChart3,
    Building2Icon,
    Brain,
    FileText,
    ShieldCheck,
    Settings,
    UserCog,
    LogOut,
    Warehouse,
    Menu,
    X,
    ChevronDown,
    ChevronRight,
} from "lucide-react";
import { LucideIcon } from "lucide-react";

interface ChildMenuItem {
    name: string;
    path: string;
    icon: LucideIcon;
}

interface MenuItem {
    name: string;
    path?: string;
    icon: LucideIcon;
    children?: ChildMenuItem[];
}

const baseMenuItems: MenuItem[] = [
    { name: 'Dashboard', path: '/Dashboard', icon: HomeIcon },
    { name: 'Finance Ledger', path: '/finance-ledger', icon: DollarSign },
    { name: 'HR & Payroll', path: '/hr-payroll', icon: User },
    {
        name: 'Supply Chain',
        icon: Building2Icon,
        children: [
            {
                name: 'Vendors',
                path: '/vendors',
                icon: Building2
            },
            {
                name: 'Purchase Orders',
                path: '/purchase-orders',
                icon: FileText
            },
            {
                name: 'Inventory',
                path: '/inventory',
                icon: Warehouse
            },
            {
                name: 'Forecasting',
                path: '/forecasting',
                icon: Brain
            }
        ]
    },
    { name: 'Projects', path: '/projects', icon: Briefcase },
    { name: 'Business Intelligence', path: '/reports', icon: BarChart3 },
    { name: 'AI Forecasting', path: '/tasks', icon: LucideTimer },
    { name: 'Reports', path: '/files', icon: Folder },
    { name: 'Support', path: '/support', icon: ShieldCheck },
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Logout', path: '/logout', icon: LogOut }
]

const adminMenuItem: MenuItem  = { name: 'Admin', path: '/admin/users', icon: UserCog }

function Aside() {
    const location = useLocation();

    const [userRole, setUserRole] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                setUserRole(parsed.role || "");
            } catch (err) {
                console.log(err);
            }
        }
    }, []);

    useEffect(() => {
        if (
            location.pathname.startsWith("/vendors") ||
            location.pathname.startsWith("/purchase-orders") ||
            location.pathname.startsWith("/inventory") ||
            location.pathname.startsWith("/forecasting")
        ) {
            setOpenDropdown("Supply Chain");
        }
    }, [location.pathname]);

    const toggleDropdown = (name: string) => {
        setOpenDropdown(openDropdown === name ? null : name);
    };

    const menuItems =
        userRole === "Admin"
            ? [adminMenuItem, ...baseMenuItems]
            : baseMenuItems;

    return (
        <>
            {/* Mobile Button */}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-4 left-4 z-50 rounded-lg bg-white p-2 shadow lg:hidden"
            >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                />
            )}

            <aside
                className={`fixed left-0 top-0 z-50 h-screen w-72 bg-blue-950 transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static`}
            >
                {/* Logo */}

                <div className="flex items-center justify-between p-5">
                    <h1 className="text-2xl font-bold text-white">
                        AmDOX <span className="text-blue-400">ERP</span>
                    </h1>

                    <button
                        className="lg:hidden text-white"
                        onClick={() => setIsOpen(false)}
                    >
                        <X />
                    </button>
                </div>

                {/* Menu */}

                <div className="space-y-2 px-3">
                    {menuItems.map((item) => {
                        const Icon = item.icon;

                        if (item.children) {
                            const activeParent = item.children.some((child) =>
                                location.pathname.startsWith(child.path)
                            );

                            return (
                                <div key={item.name}>
                                    <button
                                        onClick={() => toggleDropdown(item.name)}
                                        className={`flex w-full items-center justify-between rounded-lg p-3 transition
                    ${activeParent
                                                ? "bg-blue-600 text-white"
                                                : "text-white hover:bg-blue-700"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon size={20} />
                                            <span>{item.name}</span>
                                        </div>

                                        {openDropdown === item.name ? (
                                            <ChevronDown size={18} />
                                        ) : (
                                            <ChevronRight size={18} />
                                        )}
                                    </button>

                                    <div
                                        className={`overflow-hidden transition-all duration-300
                    ${openDropdown === item.name
                                                ? "max-h-96 mt-2"
                                                : "max-h-0"
                                            }`}
                                    >
                                        <div className="ml-8 space-y-1">
                                            {item.children.map((child: ChildMenuItem) => {
                                                const ChildIcon = child.icon;

                                                return (
                                                    <NavLink
                                                        key={child.name}
                                                        to={child.path}
                                                        onClick={() => setIsOpen(false)}
                                                        className={({ isActive }) =>
                                                            `flex items-center gap-3 rounded-lg p-2 text-sm transition
                              ${isActive
                                                                ? "bg-blue-500 text-white"
                                                                : "text-blue-100 hover:bg-blue-800"
                                                            }`
                                                        }
                                                    >
                                                        <ChildIcon size={18} />
                                                        {child.name}
                                                    </NavLink>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <NavLink
                                key={item.name}
                                to={item.path!}
                                onClick={() => setIsOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-lg p-3 transition
                  ${isActive
                                        ? "bg-blue-600 text-white"
                                        : "text-white hover:bg-blue-700"
                                    }`
                                }
                            >
                                <Icon size={20} />
                                {item.name}
                            </NavLink>
                        );
                    })}
                </div>
            </aside>
        </>
    );
}

export default Aside