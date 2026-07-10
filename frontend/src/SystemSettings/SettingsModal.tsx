import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

interface Settings {
  companyProfile: {
    companyName: string;
    supportEmail: string;
    phone: string;
    address: string;
    website: string;
    logoUrl: string;
  };
  localization: {
    language: string;
    dateFormat: string;
    timezone: string;
  };
  currency: {
    baseCurrency: string;
    decimalPlaces: number;
    multiCurrency: boolean;
  };
  documentNumbering: {
    invoicePrefix: string;
    poPrefix: string;
    soPrefix: string;
    customerPrefix: string;
  };
  security: {
    minPasswordLength: number;
    requireSpecialChars: boolean;
    sessionTimeout: string;
    enable2FA: boolean;
  };
  users: User[];
  workflow: {
    poApprovalLimit: number;
    autoApproveProjects: boolean;
    expenseApprovalLimit: number;
  };
  notifications: {
    emailAlerts: boolean;
    inAppAlerts: boolean;
    smsAlerts: boolean;
    monthlyDigest: boolean;
  };
}

interface SettingsModalProps {
  activeModal: string | null;
  onClose: () => void;
  tempSettings: Settings;
  setTempSettings: React.Dispatch<React.SetStateAction<Settings>>;
  onApply: () => void;
  addToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function SettingsModal({
  activeModal,
  onClose,
  tempSettings,
  setTempSettings,
  onApply,
  addToast,
}: SettingsModalProps) {

  // Local state for user management form
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('Employee');

  if (!activeModal) return null;

  const handleAddMockUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const newUser: User = {
      id: Date.now().toString(),
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      status: 'Active'
    };

    setTempSettings(prev => ({
      ...prev,
      users: [...prev.users, newUser]
    }));

    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('Employee');
    addToast(`User ${newUser.name} added.`, 'success');
  };

  const handleDeleteMockUser = (id: string) => {
    setTempSettings(prev => ({
      ...prev,
      users: prev.users.filter(u => u.id !== id)
    }));
    addToast('User removed.', 'info');
  };

  const getTitle = () => {
    switch (activeModal) {
      case 'companyProfile': return 'Company Profile Settings';
      case 'localization': return 'Localization Settings';
      case 'currency': return 'Currency Settings';
      case 'documentNumbering': return 'Document Numbering Prefixes';
      case 'security': return 'Security Policies';
      case 'users': return 'User Management';
      case 'workflow': return 'Workflow & Approvals';
      case 'notifications': return 'Notification Settings';
      default: return 'Settings';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />


      <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] z-10 border border-slate-100 animate-scale-up">

        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{getTitle()}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Configure options below then click Apply.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          {/* 1. Company Profile */}
          {activeModal === 'companyProfile' && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Company Name</label>
                <input
                  type="text"
                  value={tempSettings.companyProfile.companyName}
                  onChange={e => setTempSettings({
                    ...tempSettings,
                    companyProfile: { ...tempSettings.companyProfile, companyName: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Support Email</label>
                <input
                  type="email"
                  value={tempSettings.companyProfile.supportEmail}
                  onChange={e => setTempSettings({
                    ...tempSettings,
                    companyProfile: { ...tempSettings.companyProfile, supportEmail: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Contact Phone</label>
                <input
                  type="text"
                  value={tempSettings.companyProfile.phone}
                  onChange={e => setTempSettings({
                    ...tempSettings,
                    companyProfile: { ...tempSettings.companyProfile, phone: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Company Address</label>
                <textarea
                  rows={3}
                  value={tempSettings.companyProfile.address}
                  onChange={e => setTempSettings({
                    ...tempSettings,
                    companyProfile: { ...tempSettings.companyProfile, address: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm resize-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Website URL</label>
                <input
                  type="text"
                  value={tempSettings.companyProfile.website}
                  onChange={e => setTempSettings({
                    ...tempSettings,
                    companyProfile: { ...tempSettings.companyProfile, website: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm"
                />
              </div>
            </>
          )}

          {/* 2. Localization */}
          {activeModal === 'localization' && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">System Language</label>
                <select
                  value={tempSettings.localization.language}
                  onChange={e => setTempSettings({
                    ...tempSettings,
                    localization: { ...tempSettings.localization, language: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none bg-white text-sm"
                >
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                  <option>Japanese</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Date Format</label>
                <select
                  value={tempSettings.localization.dateFormat}
                  onChange={e => setTempSettings({
                    ...tempSettings,
                    localization: { ...tempSettings.localization, dateFormat: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none bg-white text-sm"
                >
                  <option>MM/DD/YYYY</option>
                  <option>DD/MM/YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Time Zone</label>
                <select
                  value={tempSettings.localization.timezone}
                  onChange={e => setTempSettings({
                    ...tempSettings,
                    localization: { ...tempSettings.localization, timezone: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none bg-white text-sm"
                >
                  <option>PST (Pacific Standard Time)</option>
                  <option>EST (Eastern Standard Time)</option>
                  <option>GMT (Greenwich Mean Time)</option>
                  <option>IST (Indian Standard Time)</option>
                  <option>UTC (Coordinated Universal Time)</option>
                </select>
              </div>
            </>
          )}

          {/* 3. Currency Settings */}
          {activeModal === 'currency' && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Base Currency</label>
                <select
                  value={tempSettings.currency.baseCurrency}
                  onChange={e => setTempSettings({
                    ...tempSettings,
                    currency: { ...tempSettings.currency, baseCurrency: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none bg-white text-sm"
                >
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                  <option>GBP (£)</option>
                  <option>INR (₹)</option>
                  <option>JPY (¥)</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Decimal Precision</label>
                <select
                  value={tempSettings.currency.decimalPlaces}
                  onChange={e => setTempSettings({
                    ...tempSettings,
                    currency: { ...tempSettings.currency, decimalPlaces: parseInt(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none bg-white text-sm"
                >
                  <option value="0">0 (e.g. $100)</option>
                  <option value="2">2 (e.g. $100.00)</option>
                  <option value="3">3 (e.g. $100.000)</option>
                </select>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/50 mt-2">
                <div>
                  <p className="text-xs font-semibold text-slate-800">Enable Multi-Currency</p>
                  <p className="text-[10px] text-slate-500">Allow transactions in foreign currencies</p>
                </div>
                <input
                  type="checkbox"
                  checked={tempSettings.currency.multiCurrency}
                  onChange={e => setTempSettings({
                    ...tempSettings,
                    currency: { ...tempSettings.currency, multiCurrency: e.target.checked }
                  })}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
              </div>
            </>
          )}

          {/* 4. Document Numbering */}
          {activeModal === 'documentNumbering' && (
            <>
              <p className="text-xs text-slate-500 leading-normal mb-3">Define the serialization prefixes for key system documents.</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Invoices Prefix</label>
                  <input
                    type="text"
                    value={tempSettings.documentNumbering.invoicePrefix}
                    onChange={e => setTempSettings({
                      ...tempSettings,
                      documentNumbering: { ...tempSettings.documentNumbering, invoicePrefix: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Purchase Orders Prefix</label>
                  <input
                    type="text"
                    value={tempSettings.documentNumbering.poPrefix}
                    onChange={e => setTempSettings({
                      ...tempSettings,
                      documentNumbering: { ...tempSettings.documentNumbering, poPrefix: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Sales Orders Prefix</label>
                  <input
                    type="text"
                    value={tempSettings.documentNumbering.soPrefix}
                    onChange={e => setTempSettings({
                      ...tempSettings,
                      documentNumbering: { ...tempSettings.documentNumbering, soPrefix: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Customers Prefix</label>
                  <input
                    type="text"
                    value={tempSettings.documentNumbering.customerPrefix}
                    onChange={e => setTempSettings({
                      ...tempSettings,
                      documentNumbering: { ...tempSettings.documentNumbering, customerPrefix: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm"
                  />
                </div>
              </div>
            </>
          )}

          {/* 5. Security Settings */}
          {activeModal === 'security' && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Minimum Password Length</label>
                <input
                  type="number"
                  min="6"
                  max="24"
                  value={tempSettings.security.minPasswordLength}
                  onChange={e => setTempSettings({
                    ...tempSettings,
                    security: { ...tempSettings.security, minPasswordLength: parseInt(e.target.value) || 8 }
                  })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Idle Session Timeout</label>
                <select
                  value={tempSettings.security.sessionTimeout}
                  onChange={e => setTempSettings({
                    ...tempSettings,
                    security: { ...tempSettings.security, sessionTimeout: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none bg-white text-sm"
                >
                  <option>15 mins</option>
                  <option>30 mins</option>
                  <option>1 hour</option>
                  <option>4 hours</option>
                </select>
              </div>

              <div className="space-y-3 mt-2">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/50">
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Enforce Numbers & Symbols</p>
                    <p className="text-[10px] text-slate-500">Require complexity rules for passwords</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={tempSettings.security.requireSpecialChars}
                    onChange={e => setTempSettings({
                      ...tempSettings,
                      security: { ...tempSettings.security, requireSpecialChars: e.target.checked }
                    })}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/50">
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Two-Factor Authentication (2FA)</p>
                    <p className="text-[10px] text-slate-500">Require 2FA codes for all admin operations</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={tempSettings.security.enable2FA}
                    onChange={e => setTempSettings({
                      ...tempSettings,
                      security: { ...tempSettings.security, enable2FA: e.target.checked }
                    })}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                  />
                </div>
              </div>
            </>
          )}

          {/* 6. User Management */}
          {activeModal === 'users' && (
            <div className="space-y-4">
              <div className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50 p-3">
                <p className="text-xs font-bold text-slate-700 mb-2">Add New Simulated User</p>
                <form onSubmit={handleAddMockUser} className="flex flex-col gap-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={newUserName}
                      onChange={e => setNewUserName(e.target.value)}
                      className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs outline-none bg-white focus:border-blue-500"
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={newUserEmail}
                      onChange={e => setNewUserEmail(e.target.value)}
                      className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs outline-none bg-white focus:border-blue-500"
                    />
                  </div>
                  <div className="flex gap-2 justify-between items-center">
                    <select
                      value={newUserRole}
                      onChange={e => setNewUserRole(e.target.value)}
                      className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs outline-none bg-white"
                    >
                      <option>Admin</option>
                      <option>Manager</option>
                      <option>Employee</option>
                    </select>
                    <button
                      type="submit"
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs transition"
                    >
                      <Plus size={12} />
                      <span>Add User</span>
                    </button>
                  </div>
                </form>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-600">Simulated Users List ({tempSettings.users.length})</p>
                <div className="divide-y divide-slate-100 max-h-52 overflow-y-auto border border-slate-100 rounded-xl">
                  {tempSettings.users.map(u => (
                    <div key={u.id} className="flex justify-between items-center p-2.5 hover:bg-slate-50 transition bg-white text-xs">
                      <div>
                        <p className="font-semibold text-slate-800">{u.name}</p>
                        <p className="text-slate-400">{u.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold">
                          {u.role}
                        </span>
                        <button
                          onClick={() => handleDeleteMockUser(u.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 7. Workflow Settings */}
          {activeModal === 'workflow' && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Purchase Order Auto-Approval Threshold ($)</label>
                <input
                  type="number"
                  value={tempSettings.workflow.poApprovalLimit}
                  onChange={e => setTempSettings({
                    ...tempSettings,
                    workflow: { ...tempSettings.workflow, poApprovalLimit: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm"
                />
                <span className="text-[10px] text-slate-400">POs exceeding this limit will flag for Admin approval.</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Expense Claim Auto-Approval Threshold ($)</label>
                <input
                  type="number"
                  value={tempSettings.workflow.expenseApprovalLimit}
                  onChange={e => setTempSettings({
                    ...tempSettings,
                    workflow: { ...tempSettings.workflow, expenseApprovalLimit: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/50 mt-2">
                <div>
                  <p className="text-xs font-semibold text-slate-800">Auto-Approve Project Creations</p>
                  <p className="text-[10px] text-slate-500">Allow team managers to initiate projects without Admin sign-off</p>
                </div>
                <input
                  type="checkbox"
                  checked={tempSettings.workflow.autoApproveProjects}
                  onChange={e => setTempSettings({
                    ...tempSettings,
                    workflow: { ...tempSettings.workflow, autoApproveProjects: e.target.checked }
                  })}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
              </div>
            </>
          )}

          {/* 8. Notifications */}
          {activeModal === 'notifications' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 mb-2">Enable or disable system notification delivery channels.</p>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/50">
                <div>
                  <p className="text-xs font-semibold text-slate-800">Email Notifications</p>
                  <p className="text-[10px] text-slate-500">Send transactional summaries and billing updates</p>
                </div>
                <input
                  type="checkbox"
                  checked={tempSettings.notifications.emailAlerts}
                  onChange={e => setTempSettings({
                    ...tempSettings,
                    notifications: { ...tempSettings.notifications, emailAlerts: e.target.checked }
                  })}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/50">
                <div>
                  <p className="text-xs font-semibold text-slate-800">In-App Alerts & Badges</p>
                  <p className="text-[10px] text-slate-500">Show notification dot and toast alerts in-browser</p>
                </div>
                <input
                  type="checkbox"
                  checked={tempSettings.notifications.inAppAlerts}
                  onChange={e => setTempSettings({
                    ...tempSettings,
                    notifications: { ...tempSettings.notifications, inAppAlerts: e.target.checked }
                  })}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/50">
                <div>
                  <p className="text-xs font-semibold text-slate-800">SMS Alerts</p>
                  <p className="text-[10px] text-slate-500">Deliver emergency security text updates to mobile</p>
                </div>
                <input
                  type="checkbox"
                  checked={tempSettings.notifications.smsAlerts}
                  onChange={e => setTempSettings({
                    ...tempSettings,
                    notifications: { ...tempSettings.notifications, smsAlerts: e.target.checked }
                  })}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/50">
                <div>
                  <p className="text-xs font-semibold text-slate-800">Monthly Analytical Digest</p>
                  <p className="text-[10px] text-slate-500">Send summary report of system operations every month</p>
                </div>
                <input
                  type="checkbox"
                  checked={tempSettings.notifications.monthlyDigest}
                  onChange={e => setTempSettings({
                    ...tempSettings,
                    notifications: { ...tempSettings.notifications, monthlyDigest: e.target.checked }
                  })}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-100 text-xs font-bold text-slate-700 transition"
          >
            Cancel
          </button>
          <button
            onClick={onApply}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            Apply Settings
          </button>
        </div>

      </div>
    </div>
  );
}
