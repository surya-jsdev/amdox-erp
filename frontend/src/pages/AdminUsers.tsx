import React, { useEffect, useState } from 'react';
import Aside from '../components/Aside.js';
import { apiUrl, fetchJson } from '../lib/api';

interface UserItem {
    _id: string;
    name: string;
    email: string;
    companyname?: string;
    role: string;
}

function AdminUsers() {
    const [users, setUsers] = useState<UserItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formState, setFormState] = useState({ name: '', email: '', companyname: '', role: 'Employee', password: '' });
    const [editingId, setEditingId] = useState<string | null>(null);

    const fetchUsers = async () => {
        try {
            const data = await fetchJson(apiUrl('/api/admin/users'));
            setUsers(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormState({ ...formState, [event.target.name]: event.target.value });
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const method = editingId ? 'PUT' : 'POST';
        const url = editingId ? apiUrl(`/api/admin/users/${editingId}`) : apiUrl('/api/admin/users');

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formState),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Unable to save user');

            setFormState({ name: '', email: '', companyname: '', role: 'Employee', password: '' });
            setEditingId(null);
            fetchUsers();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to save user');
        }
    };

    const handleEdit = (user: UserItem) => {
        setEditingId(user._id);
        setFormState({ name: user.name, email: user.email, companyname: user.companyname || '', role: user.role, password: '' });
    };

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(apiUrl(`/api/admin/users/${id}`), { method: 'DELETE' });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Unable to delete user');
            fetchUsers();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to delete user');
        }
    };

    return (
        <section className="flex min-h-screen w-full flex-col bg-slate-100 text-slate-900 lg:flex-row">
            <Aside />
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
                    <div className="rounded-3xl border  border-slate-200 bg-white p-4 shadow-sm sm:p-6 ">
                        <div className="mb-6">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 sm:text-sm">Admin users</p>
                            <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">Manage users</h1>
                        </div>
                        {loading ? (
                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">Loading users...</div>
                        ) : error ? (
                            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-800">{error}</div>
                        ) : (
                            <>
                                <div className="block md:hidden">
                                    <div className="space-y-3">
                                        {users.map((user) => (
                                            <div key={user._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="font-semibold text-slate-900">{user.name}</p>
                                                        <p className="mt-1 text-sm text-slate-600">{user.email}</p>
                                                    </div>
                                                    <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                                                        {user.role}
                                                    </span>
                                                </div>
                                                <p className="mt-2 text-sm text-slate-600">Company: {user.companyname || '-'}</p>
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    <button className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white" onClick={() => handleEdit(user)}>Edit</button>
                                                    <button className="rounded-lg bg-rose-600 px-3 py-2 text-sm text-white" onClick={() => handleDelete(user._id)}>Delete</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="hidden overflow-x-auto md:block">
                                    <table className="w-full min-w-[640px] text-sm">
                                        <thead className="bg-slate-100 text-slate-600">
                                            <tr>
                                                <th className="px-3 py-3 text-left font-medium sm:px-4">Name</th>
                                                <th className="px-3 py-3 text-left font-medium sm:px-4">Email</th>
                                                <th className="px-3 py-3 text-left font-medium sm:px-4">Company</th>
                                                <th className="px-3 py-3 text-left font-medium sm:px-4">Role</th>
                                                <th className="px-3 py-3 text-left font-medium sm:px-4">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((user) => (
                                                <tr key={user._id} className="border-b border-slate-200 bg-white">
                                                    <td className="px-3 py-3 text-slate-900 sm:px-4">{user.name}</td>
                                                    <td className="px-3 py-3 text-slate-600 sm:px-4">{user.email}</td>
                                                    <td className="px-3 py-3 text-slate-600 sm:px-4">{user.companyname || '-'}</td>
                                                    <td className="px-3 py-3 text-slate-900 sm:px-4">{user.role}</td>
                                                    <td className="px-3 py-3 sm:px-4">
                                                        <div className="flex flex-wrap gap-2">
                                                            <button className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white" onClick={() => handleEdit(user)}>Edit</button>
                                                            <button className="rounded-lg bg-rose-600 px-3 py-2 text-sm text-white" onClick={() => handleDelete(user._id)}>Delete</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>

                    <aside className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                        <div className="mb-6">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 sm:text-sm">User editor</p>
                            <h2 className="mt-2 text-lg font-semibold text-slate-900 sm:text-xl">Create or update user</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">Name</label>
                                <input name="name" value={formState.name} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" required />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                                <input name="email" type="email" value={formState.email} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" required />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">Company</label>
                                <input name="companyname" value={formState.companyname} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">Role</label>
                                <select name="role" value={formState.role} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none">
                                    <option value="Admin">Admin</option>
                                    <option value="Manager">Manager</option>
                                    <option value="Employee">Employee</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
                                <input name="password" type="password" value={formState.password} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
                            </div>
                            <button type="submit" className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white">
                                {editingId ? 'Update user' : 'Add user'}
                            </button>
                        </form>
                    </aside>
                </div>
            </main>
        </section>
    );
}

export default AdminUsers;
