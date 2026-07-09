import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Globe, 
  DollarSign, 
  Hash, 
  Shield, 
  Users, 
  GitBranch, 
  Bell, 
  Search, 
  Save, 
  RotateCcw, 
  Info, 
  ArrowRight, 
  X, 
  CheckCircle
} from 'lucide-react';
import Aside from '../components/Aside.js';
import SettingsModal from './SettingsModal.js';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

const defaultSettings = {
  companyProfile: {
    companyName: 'AmDOX Corporation',
    supportEmail: 'support@amdox.com',
    phone: '+1 (555) 019-2834',
    address: '100 Pine Street, San Francisco, CA 94111',
    website: 'https://amdox.com',
    logoUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  },
  localization: {
    language: 'English',
    dateFormat: 'MM/DD/YYYY',
    timezone: 'PST',
  },
  currency: {
    baseCurrency: 'USD',
    decimalPlaces: 2,
    multiCurrency: true,
  },
  documentNumbering: {
    invoicePrefix: 'INV-',
    poPrefix: 'PO-',
    soPrefix: 'SO-',
    customerPrefix: 'CUST-',
  },
  security: {
    minPasswordLength: 8,
    requireSpecialChars: true,
    sessionTimeout: '30 mins',
    enable2FA: false,
  },
  users: [
    { id: '1', name: 'Admin User', email: 'admin@amdox.com', role: 'Admin', status: 'Active' },
    { id: '2', name: 'John Doe', email: 'john@amdox.com', role: 'Manager', status: 'Active' },
    { id: '3', name: 'Jane Smith', email: 'jane@amdox.com', role: 'Employee', status: 'Active' },
  ],
  workflow: {
    poApprovalLimit: 5000,
    autoApproveProjects: false,
    expenseApprovalLimit: 1000,
  },
  notifications: {
    emailAlerts: true,
    inAppAlerts: true,
    smsAlerts: false,
    monthlyDigest: true,
  }
};

function SystemSettings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [tempSettings, setTempSettings] = useState(defaultSettings);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [userName, setUserName] = useState('Admin User');
  const [userRole, setUserRole] = useState('Administrator');
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);

  const isUserAdmin = userRole === 'Administrator' || userRole === 'Admin';

  // Load settings on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed?.name) setUserName(parsed.name);
        if (parsed?.role) setUserRole(parsed.role === 'Admin' ? 'Administrator' : parsed.role);
      } catch (err) {
        console.warn('Could not parse user info', err);
      }
    }

    const storedSettings = localStorage.getItem('systemSettings');
    if (storedSettings) {
      try {
        const parsedSettings = JSON.parse(storedSettings);
 
        const sanitized = {
          ...defaultSettings,
          ...parsedSettings,
          companyProfile: { ...defaultSettings.companyProfile, ...(parsedSettings.companyProfile || {}) },
          localization: { ...defaultSettings.localization, ...(parsedSettings.localization || {}) },
          currency: { ...defaultSettings.currency, ...(parsedSettings.currency || {}) },
          documentNumbering: { ...defaultSettings.documentNumbering, ...(parsedSettings.documentNumbering || {}) },
          security: { ...defaultSettings.security, ...(parsedSettings.security || {}) },
          users: parsedSettings.users || defaultSettings.users,
          workflow: { ...defaultSettings.workflow, ...(parsedSettings.workflow || {}) },
          notifications: { ...defaultSettings.notifications, ...(parsedSettings.notifications || {}) },
        };
        setSettings(sanitized);
        setTempSettings(sanitized);
      } catch (err) {
        console.warn('Could not parse stored settings, using default', err);
      }
    }
  }, []);

  const addToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const handleSaveChanges = () => {
    localStorage.setItem('systemSettings', JSON.stringify(settings));
    addToast('All system settings saved successfully!', 'success');
  };

  const handleResetToDefault = () => {
    if (window.confirm('Are you sure you want to reset all settings to system defaults? This will overwrite your current configurations.')) {
      setSettings(defaultSettings);
      setTempSettings(defaultSettings);
      localStorage.setItem('systemSettings', JSON.stringify(defaultSettings));
      addToast('System settings reset to default.', 'info');
    }
  };

  const handleOpenModal = (modalKey: string) => {
    setTempSettings(JSON.parse(JSON.stringify(settings))); // Deep copy
    setActiveModal(modalKey);
  };

  const handleApplyModalChanges = () => {
    setSettings(JSON.parse(JSON.stringify(tempSettings)));
    setActiveModal(null);
    addToast('Configuration applied temporarily. Click "Save Changes" to persist.', 'info');
  };

  // Filter verification function for search
  const matchesSearch = (title: string, desc: string) => {
    const q = searchQuery.toLowerCase();
    return title.toLowerCase().includes(q) || desc.toLowerCase().includes(q);
  };

  // Main UI Grid configs
  const sections = [
    {
      title: 'General Settings',
      cards: [
        {
          id: 'companyProfile',
          title: 'Company Profile',
          desc: 'Manage company information, address, contact details and logo.',
          icon: Building2,
          colorClass: 'bg-blue-50 text-blue-600',
        },
        {
          id: 'localization',
          title: 'Localization',
          desc: 'Configure language, date format, time zone and regional settings.',
          icon: Globe,
          colorClass: 'bg-emerald-50 text-emerald-600',
        },
        {
          id: 'currency',
          title: 'Currency Settings',
          desc: 'Manage default currency, exchange rates and currency options.',
          icon: DollarSign,
          colorClass: 'bg-purple-50 text-purple-600',
        },
        {
          id: 'documentNumbering',
          title: 'Document Numbering',
          desc: 'Define document numbering format and sequences.',
          icon: Hash,
          colorClass: 'bg-amber-50 text-amber-600',
        }
      ]
    },
    {
      title: 'System Configuration',
      cards: [
        {
          id: 'security',
          title: 'Security Settings',
          desc: 'Configure password policy, session timeout and security options.',
          icon: Shield,
          colorClass: 'bg-blue-50 text-blue-600',
        },
        ...(isUserAdmin ? [{
          id: 'users',
          title: 'User Management',
          desc: 'Manage users, roles, departments and access control.',
          icon: Users,
          colorClass: 'bg-emerald-50 text-emerald-600',
        }] : []),
        {
          id: 'workflow',
          title: 'Workflow Settings',
          desc: 'Configure approval workflows and business process rules.',
          icon: GitBranch,
          colorClass: 'bg-purple-50 text-purple-600',
        },
        {
          id: 'notifications',
          title: 'Notifications',
          desc: 'Manage email templates, notifications and alert preferences.',
          icon: Bell,
          colorClass: 'bg-amber-50 text-amber-600',
        }
      ]
    }
  ];

  return (
    <section className="w-full min-h-screen flex flex-col bg-slate-50 text-slate-900 lg:flex-row">
      <Aside />

      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 lg:px-8 z-30">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search settings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-4 pr-10 rounded-full border border-slate-200 bg-slate-50 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
              />
              <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                3
              </span>
            </button>

            {/* Profile Avatar */}
            <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
              <div className="w-9 h-9 rounded-full bg-violet-700 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                AD
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-slate-800 leading-tight">{userName}</p>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider whitespace-nowrap">{userRole}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Settings Body */}
        <div className="flex-1 p-6 sm:p-8 flex flex-col gap-8 max-w-350 mx-auto w-full">
          
          {/* Header Title block */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Settings</h1>
              <p className="mt-1.5 text-sm text-slate-500">Manage and configure system-wide settings for your ERP.</p>
            </div>
            
            <button 
              onClick={handleSaveChanges}
              className="flex items-center justify-center gap-2 h-11 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-sm transition hover:shadow-md active:scale-95"
            >
              <Save size={16} />
              <span>Save Changes</span>
            </button>
          </div>

          {/* Settings Sections Grid */}
          <div className="flex flex-col gap-8">
            {sections.map(section => {
              // Filter cards if search query is active
              const filteredCards = section.cards.filter(card => 
                matchesSearch(card.title, card.desc)
              );

              if (filteredCards.length === 0) return null;

              return (
                <div key={section.title} className="flex flex-col gap-4">
                  <h2 className="text-lg font-semibold text-slate-800 tracking-tight">{section.title}</h2>
                  
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {filteredCards.map(card => {
                      const CardIcon = card.icon;
                      return (
                        <div 
                          key={card.id} 
                          onClick={() => handleOpenModal(card.id)}
                          className="group relative cursor-pointer bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition duration-200 flex flex-col justify-between"
                        >
                          <div>
                            <div className={`h-11 w-11 rounded-2xl flex items-center justify-center ${card.colorClass} font-semibold transition group-hover:scale-105`}>
                              <CardIcon size={20} />
                            </div>
                            <h3 className="mt-4 text-base font-semibold text-slate-900 group-hover:text-blue-600 transition">
                              {card.title}
                            </h3>
                            <p className="mt-2 text-xs leading-relaxed text-slate-500">
                              {card.desc}
                            </p>
                          </div>
                          <div className="mt-5 flex justify-end">
                            <span className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition duration-150">
                              <ArrowRight size={16} />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Fallback when search has no matches */}
            {sections.every(section => 
              section.cards.filter(c => matchesSearch(c.title, c.desc)).length === 0
            ) && (
              <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                <p className="text-slate-500 font-medium">No configuration cards found matching "{searchQuery}"</p>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="mt-3 text-sm text-blue-600 font-semibold hover:underline"
                >
                  Clear search query
                </button>
              </div>
            )}
          </div>

          {/* Footer Warning & Reset Alert */}
          <div className="mt-4 bg-blue-50 border border-blue-100 rounded-2xl p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shadow-sm">
            <div className="flex gap-3 items-start sm:items-center">
              <Info className="text-blue-600 shrink-0 mt-0.5 sm:mt-0" size={20} />
              <div>
                <p className="text-sm font-semibold text-blue-950">Changes made in system settings will affect all users and operations.</p>
                <p className="text-xs text-blue-800/90 mt-0.5">Please review all settings carefully before saving changes.</p>
              </div>
            </div>
            
            <button
              onClick={handleResetToDefault}
              className="flex items-center justify-center gap-2 h-10 px-4 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-semibold text-xs transition whitespace-nowrap shadow-sm"
            >
              <RotateCcw size={14} />
              <span>Reset to Default</span>
            </button>
          </div>

        </div>

        {/* Global Toast Stack */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50 pointer-events-none">
          {toasts.map(toast => (
            <div 
              key={toast.id}
              className={`p-4 rounded-xl shadow-lg border text-sm font-medium flex items-center gap-3 animate-slide-in pointer-events-auto bg-white max-w-sm ${
                toast.type === 'success' ? 'border-emerald-100 text-emerald-800' :
                toast.type === 'error' ? 'border-rose-100 text-rose-800' :
                'border-sky-100 text-sky-800'
              }`}
            >
              {toast.type === 'success' && <CheckCircle className="text-emerald-500 shrink-0" size={18} />}
              {toast.type === 'error' && <X className="text-rose-500 shrink-0" size={18} />}
              {toast.type === 'info' && <Info className="text-sky-500 shrink-0" size={18} />}
              <span>{toast.message}</span>
            </div>
          ))}
        </div>

        {/* Abstracted Modal Subcomponent */}
        <SettingsModal 
          activeModal={activeModal}
          onClose={() => setActiveModal(null)}
          tempSettings={tempSettings}
          setTempSettings={setTempSettings}
          onApply={handleApplyModalChanges}
          addToast={addToast}
        />

      </main>
    </section>
  );
}

export default SystemSettings;
