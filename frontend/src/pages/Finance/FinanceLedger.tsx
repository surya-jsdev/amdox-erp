import React, { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import Aside from '../../components/Aside.js';


interface LedgerEntry {
    _id: string;
    date: string;
    description: string;
    category: string;
    type: 'Debit' | 'Credit';
    amount: number;
    balance: number;
}

interface LedgerFormState {
    date: string;
    description: string;
    category: string;
    type: 'Debit' | 'Credit';
    amount: string;
    balance: string;
}

const emptyForm: LedgerFormState = {
    date: '',
    description: '',
    category: '',
    type: 'Debit',
    amount: '',
    balance: ''
};
// Finance Ledger
function FinanceLedger() {
    const [entries, setEntries] = useState<LedgerEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formState, setFormState] = useState<LedgerFormState>(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const getStoredUserRole = () => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            return 'Employee';
        }

        try {
            const parsed = JSON.parse(storedUser);
            return parsed?.role || 'Employee';
        } catch (error) {
            console.warn('Unable to parse user data', error);
            return 'Employee';
        }
    };

    const fetchLedger = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ledger`);
            if (!response.ok) {
                throw new Error('Unable to fetch ledger entries');
            }
            const data = await response.json();
            setEntries(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load ledger entries');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                setIsAdmin(parsed?.role === 'Admin');
            } catch (error) {
                console.warn('Unable to parse user data', error);
            }
        }

        fetchLedger();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setMessage(null);
    };

    const resetForm = () => {
        setFormState({ ...emptyForm });
        setEditingId(null);
        setMessage(null);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!isAdmin) {
            return;
        }

        const payload = {
            date: formState.date,
            description: formState.description.trim(),
            category: formState.category.trim(),
            type: formState.type,
            amount: Number(formState.amount),
            balance: Number(formState.balance)
        };

        if (!payload.description || !payload.category || !payload.date || Number.isNaN(payload.amount) || Number.isNaN(payload.balance)) {
            setMessage('Please fill in all fields with valid numbers.');
            return;
        }

        try {
            setSubmitting(true);
            const method = editingId ? 'PUT' : 'POST';
            const url = editingId ? `/api/ledger/${editingId}` : '/api/ledger';
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-role': getStoredUserRole()
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Unable to save ledger entry');
            }

            setMessage(editingId ? 'Ledger entry updated successfully.' : 'Ledger entry created successfully.');
            resetForm();
            await fetchLedger();
        } catch (err) {
            setMessage(err instanceof Error ? err.message : 'Unable to save ledger entry');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (entry: LedgerEntry) => {
        setEditingId(entry._id);
        setFormState({
            date: entry.date ? entry.date.split('T')[0] : '',
            description: entry.description,
            category: entry.category,
            type: entry.type,
            amount: String(entry.amount),
            balance: String(entry.balance)
        });
        setMessage(null);
    };

    const handleDelete = async (id: string) => {
        if (!isAdmin) {
            return;
        }

        if (!window.confirm('Delete this ledger entry?')) {
            return;
        }

        try {
            const response = await fetch(`/api/ledger/${id}`, {
                method: 'DELETE',
                headers: {
                    'x-user-role': getStoredUserRole()
                }
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Unable to delete ledger entry');
            }
            setMessage('Ledger entry deleted successfully.');
            await fetchLedger();
        } catch (err) {
            setMessage(err instanceof Error ? err.message : 'Unable to delete ledger entry');
        }
    };

    return (
        <section className="min-h-screen w-full bg-slate-100 text-slate-900 lg:flex">
            <Aside />
            <main className="flex-1 p-3 pt-16 sm:p-6 lg:p-8 lg:pt-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                    <div className="mb-5 flex flex-col gap-3 sm:mb-6 md:flex-row md:items-start md:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 sm:text-sm">Finance Ledger</p>
                            <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">Ledger entries</h1>
                            <p className="mt-2 text-sm text-slate-600">View all finance transactions with debit, credit, and balance details.</p>
                        </div>
                    </div>

                    {isAdmin && (
                        <form onSubmit={handleSubmit} className="mb-5 rounded-3xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
                            <div className="mb-3 flex items-center gap-2 text-slate-700">
                                <Plus size={18} />
                                <span className="text-sm font-semibold sm:text-base">{editingId ? 'Update ledger entry' : 'Create new ledger entry'}</span>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">Date</label>
                                    <input type="date" name="date" value={formState.date} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none sm:px-4 sm:py-3" required />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
                                    <input type="text" name="description" value={formState.description} onChange={handleChange} placeholder="Payment received" className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none sm:px-4 sm:py-3" required />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">Category</label>
                                    <input type="text" name="category" value={formState.category} onChange={handleChange} placeholder="Sales" className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none sm:px-4 sm:py-3" required />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">Type</label>
                                    <select name="type" value={formState.type} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none sm:px-4 sm:py-3">
                                        <option value="Debit">Debit</option>
                                        <option value="Credit">Credit</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">Amount</label>
                                    <input type="number" name="amount" value={formState.amount} onChange={handleChange} placeholder="1200" className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none sm:px-4 sm:py-3" required />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">Balance</label>
                                    <input type="number" name="balance" value={formState.balance} onChange={handleChange} placeholder="5000" className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none sm:px-4 sm:py-3" required />
                                </div>
                            </div>
                            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                                <button type="submit" disabled={submitting} className="w-full rounded-2xl bg-blue-700 px-4 py-2.5 font-medium text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
                                    {submitting ? 'Saving...' : editingId ? 'Update entry' : 'Create entry'}
                                </button>
                                <button type="button" onClick={resetForm} className="w-full rounded-2xl border border-slate-300 px-4 py-2.5 font-medium text-slate-700 transition hover:bg-slate-100 sm:w-auto">
                                    Cancel
                                </button>
                            </div>
                            {message && <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">{message}</div>}
                        </form>
                    )}

                    {!isAdmin && (
                        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                            Only admins can Access ledger entries.
                        </div>
                    )}

                    {loading ? (
                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600 sm:p-8">Loading ledger entries...</div>
                    ) : error ? (
                        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-800 sm:p-8">{error}</div>
                    ) : (
                        <>
                            <div className="space-y-3 lg:hidden">
                                {entries.map((entry) => (
                                    <div key={entry._id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">{entry.description}</p>
                                                <p className="mt-1 text-xs text-slate-500">{new Date(entry.date).toLocaleDateString()} • {entry.category}</p>
                                            </div>
                                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${entry.type === 'Debit' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                {entry.type}
                                            </span>
                                        </div>

                                        <div className="mt-3 flex items-center justify-between text-sm">
                                            <span className="text-slate-600">Amount</span>
                                            <span className="font-semibold text-slate-900">₹{entry.amount.toLocaleString()}</span>
                                        </div>
                                        <div className="mt-2 flex items-center justify-between text-sm">
                                            <span className="text-slate-600">Balance</span>
                                            <span className="font-semibold text-slate-900">₹{entry.balance.toLocaleString()}</span>
                                        </div>

                                        {isAdmin && (
                                            <div className="mt-3 flex gap-2">
                                                <button type="button" onClick={() => handleEdit(entry)} className="flex-1 rounded-full border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                                                    Edit
                                                </button>
                                                <button type="button" onClick={() => handleDelete(entry._id)} className="flex-1 rounded-full border border-rose-200 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50">
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="hidden overflow-x-auto lg:block">
                                <table className="w-full min-w-180 border-separate border-spacing-y-3 text-left text-sm">
                                    <thead>
                                        <tr className="bg-slate-100 text-slate-600">
                                            <th className="px-4 py-4 font-medium">Date</th>
                                            <th className="px-4 py-4 font-medium">Description</th>
                                            <th className="px-4 py-4 font-medium">Category</th>
                                            <th className="px-4 py-4 font-medium">Type</th>
                                            <th className="px-4 py-4 font-medium">Amount</th>
                                            <th className="px-4 py-4 font-medium">Balance</th>
                                            {isAdmin && <th className="px-4 py-4 font-medium">Actions</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {entries.map((entry) => (
                                            <tr key={entry._id} className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                                                <td className="whitespace-nowrap px-4 py-4 text-slate-600">{new Date(entry.date).toLocaleDateString()}</td>
                                                <td className="px-4 py-4 text-slate-900">{entry.description}</td>
                                                <td className="px-4 py-4 text-slate-600">{entry.category}</td>
                                                <td className={`px-4 py-4 font-semibold ${entry.type === 'Debit' ? 'text-rose-600' : 'text-emerald-600'}`}>{entry.type}</td>
                                                <td className="px-4 py-4 text-slate-900">₹{entry.amount.toLocaleString()}</td>
                                                <td className="px-4 py-4 text-slate-900">₹{entry.balance.toLocaleString()}</td>
                                                {isAdmin && (
                                                    <td className="px-4 py-4">
                                                        <div className="flex gap-2">
                                                            <button type="button" onClick={() => handleEdit(entry)} className="rounded-full border border-slate-300 p-2 text-slate-700 hover:bg-slate-100">
                                                                <Pencil size={16} />
                                                            </button>
                                                            <button type="button" onClick={() => handleDelete(entry._id)} className="rounded-full border border-rose-200 p-2 text-rose-600 hover:bg-rose-50">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </section>
    );
}

export default FinanceLedger;
