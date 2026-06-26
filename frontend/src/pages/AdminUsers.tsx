import React, { useEffect, useState } from 'react';
import Aside from '../components/Aside.js';

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
            const response = await fetch('/api/admin/users');
            if (!response.ok) throw new Error('Unable to fetch users');
            const data = await response.json();
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
        const url = editingId ? `/api/admin/users/${editingId}` : '/api/admin/users';

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
            const response = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Unable to delete user');
            fetchUsers();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to delete user');
        }
    };

    return (
        <section className="w-full min-h-screen flex bg-slate-100 text-slate-900">
            <Aside />
            <main className="flex-1 p-6 lg:p-8">
                <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-6">
                            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Admin users</p>
                            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Manage users</h1>
                        </div>
                        {loading ? (
                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">Loading users...</div>
                        ) : error ? (
                            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-800">{error}</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-175 text-sm">
                                    <thead className="bg-slate-100 text-slate-600">
                                        <tr>
                                            <th className="px-4 py-4 text-left font-medium">Name</th>
                                            <th className="px-4 py-4 text-left font-medium">Email</th>
                                            <th className="px-4 py-4 text-left font-medium">Company</th>
                                            <th className="px-4 py-4 text-left font-medium">Role</th>
                                            <th className="px-4 py-4 text-left font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user) => (
                                            <tr key={user._id} className="border-b border-slate-200 bg-white">
                                                <td className="px-4 py-4 text-slate-900">{user.name}</td>
                                                <td className="px-4 py-4 text-slate-600">{user.email}</td>
                                                <td className="px-4 py-4 text-slate-600">{user.companyname || '-'}</td>
                                                <td className="px-4 py-4 text-slate-900">{user.role}</td>
                                                <td className="px-4 py-4">
                                                    <button className="mr-2 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white" onClick={() => handleEdit(user)}>Edit</button>
                                                    <button className="rounded-lg bg-rose-600 px-3 py-2 text-sm text-white" onClick={() => handleDelete(user._id)}>Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-6">
                            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">User editor</p>
                            <h2 className="mt-2 text-xl font-semibold text-slate-900">Create or update user</h2>
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
