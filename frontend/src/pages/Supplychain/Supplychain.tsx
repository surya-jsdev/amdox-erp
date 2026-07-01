import React, { useEffect, useState } from 'react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import Aside from '../../components/Aside.js';

interface VendorItem {
    _id: string;
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: string;
    gstNumber: string;
    status: 'Active' | 'Inactive';
}

interface VendorFormState {
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: string;
    gstNumber: string;
    status: 'Active' | 'Inactive';
}

const emptyForm: VendorFormState = {
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    gstNumber: '',
    status: 'Active',
};

function Supplychain() {
    const [vendors, setVendors] = useState<VendorItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formState, setFormState] = useState<VendorFormState>(emptyForm);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
    const [isAdmin, setIsAdmin] = useState(false);

    const getStoredUserRole = () => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) return 'Employee';

        try {
            const parsed = JSON.parse(storedUser);
            return parsed?.role || 'Employee';
        } catch (err) {
            console.warn('Unable to parse user data', err);
            return 'Employee';
        }
    };

    const appApiUrl = import.meta.env.VITE_API_URL?.trim() || '';
    const buildUrl = (path: string) => {
        if (!appApiUrl) return path;
        const prefix = appApiUrl.endsWith('/') ? appApiUrl.slice(0, -1) : appApiUrl;
        return `${prefix}${path}`;
    };

    const parseResponse = async (response: Response) => {
        const text = await response.text();
        const contentType = response.headers.get('content-type') || '';
        const isJson = contentType.includes('application/json');

        if (!response.ok) {
            const errorMessage = isJson ? JSON.parse(text)?.message || text : text;
            throw new Error(errorMessage || 'Server returned an error');
        }

        if (!text) return null;
        return isJson ? JSON.parse(text) : text;
    };

    const fetchVendors = async () => {
        try {
            setLoading(true);
            const response = await fetch(buildUrl('/api/supply/vendors'));
            const data = await parseResponse(response);
            setVendors(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load vendors');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const storedRole = getStoredUserRole();
        setIsAdmin(storedRole === 'Admin');
        fetchVendors();
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
        if (!isAdmin) return;

        if (!formState.name.trim() || !formState.contactPerson.trim() || !formState.email.trim() || !formState.phone.trim()) {
            setMessage('Vendor name, contact person, email and phone are required.');
            return;
        }

        const payload = {
            ...formState,
            name: formState.name.trim(),
            contactPerson: formState.contactPerson.trim(),
            email: formState.email.trim(),
            phone: formState.phone.trim(),
            address: formState.address.trim(),
            gstNumber: formState.gstNumber.trim(),
        };

        try {
            setSubmitting(true);
            const method = editingId ? 'PUT' : 'POST';
            const url = editingId
                ? buildUrl(`/api/supply/vendors/${editingId}`)
                : buildUrl('/api/supply/vendors');

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-role': getStoredUserRole(),
                },
                body: JSON.stringify(payload),
            });

            const data = await parseResponse(response);
            if (!response.ok) {
                throw new Error((data as any)?.message || 'Unable to save vendor');
            }

            setMessage(editingId ? 'Vendor updated successfully.' : 'Vendor added successfully.');
            resetForm();
            await fetchVendors();
        } catch (err) {
            setMessage(err instanceof Error ? err.message : 'Unable to save vendor');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (vendor: VendorItem) => {
        setEditingId(vendor._id);
        setFormState({
            name: vendor.name,
            contactPerson: vendor.contactPerson,
            email: vendor.email,
            phone: vendor.phone,
            address: vendor.address,
            gstNumber: vendor.gstNumber,
            status: vendor.status,
        });
        setMessage(null);
    };

    const handleDelete = async (id: string) => {
        if (!isAdmin) return;
        if (!window.confirm('Delete this vendor?')) return;

        try {
            const response = await fetch(buildUrl(`/api/supply/vendors/${id}`), {
                method: 'DELETE',
                headers: {
                    'x-user-role': getStoredUserRole(),
                },
            });
            const data = await parseResponse(response);
            if (!response.ok) {
                throw new Error((data as any)?.message || 'Unable to delete vendor');
            }
            setMessage('Vendor deleted successfully.');
            await fetchVendors();
        } catch (err) {
            setMessage(err instanceof Error ? err.message : 'Unable to delete vendor');
        }
    };

    const filteredVendors = vendors.filter((vendor) => {
        const searchText = searchQuery.trim().toLowerCase();
        const matchesSearch =
            vendor.name.toLowerCase().includes(searchText) ||
            vendor.contactPerson.toLowerCase().includes(searchText) ||
            vendor.email.toLowerCase().includes(searchText) ||
            vendor.phone.toLowerCase().includes(searchText) ||
            vendor.gstNumber.toLowerCase().includes(searchText);

        const matchesStatus = statusFilter === 'All' || vendor.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalVendors = vendors.length;
    const activeVendors = vendors.filter((vendor) => vendor.status === 'Active').length;
    const inactiveVendors = vendors.filter((vendor) => vendor.status === 'Inactive').length;

    return (
        <section className="min-h-screen w-full bg-slate-100 text-slate-900 lg:flex">
            <Aside />
            <main className="flex-1 p-3 pt-16 sm:p-6 lg:p-8 lg:pt-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                    <div className="mb-5 flex flex-col gap-3 sm:mb-6 md:flex-row md:items-start md:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 sm:text-sm">Supply Chain / Vendors</p>
                            <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">Vendors</h1>
                            <p className="mt-2 text-sm text-slate-600">Manage and maintain your vendor information in one place.</p>
                        </div>
                        <button
                            type="button"
                            onClick={resetForm}
                            className="inline-flex items-center gap-2 rounded-2xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
                        >
                            <Plus size={16} />
                            {editingId ? 'New vendor' : 'Add vendor'}
                        </button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-sm font-medium text-slate-500">Total Vendors</p>
                            <p className="mt-3 text-3xl font-semibold text-slate-900">{totalVendors}</p>
                            <p className="mt-2 text-sm text-slate-500">Active vendors in system</p>
                        </div>
                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-sm font-medium text-slate-500">Active Vendors</p>
                            <p className="mt-3 text-3xl font-semibold text-emerald-600">{activeVendors}</p>
                            <p className="mt-2 text-sm text-slate-500">{totalVendors ? `${Math.round((activeVendors / totalVendors) * 100)}% of total` : '0% of total'}</p>
                        </div>
                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-sm font-medium text-slate-500">Inactive Vendors</p>
                            <p className="mt-3 text-3xl font-semibold text-rose-600">{inactiveVendors}</p>
                            <p className="mt-2 text-sm text-slate-500">{totalVendors ? `${Math.round((inactiveVendors / totalVendors) * 100)}% of total` : '0% of total'}</p>
                        </div>
                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-sm font-medium text-slate-500">Purchase Orders</p>
                            <p className="mt-3 text-3xl font-semibold text-slate-900">0</p>
                            <p className="mt-2 text-sm text-slate-500">Available after PO module is added</p>
                        </div>
                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-sm font-medium text-slate-500">Total Spend</p>
                            <p className="mt-3 text-3xl font-semibold text-slate-900">₹0</p>
                            <p className="mt-2 text-sm text-slate-500">Placeholder until spend tracking is available</p>
                        </div>
                    </div>

                    {isAdmin && (
                        <form onSubmit={handleSubmit} className="my-6 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-6">
                            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-2 text-slate-700">
                                    <Plus size={18} />
                                    <span className="text-sm font-semibold sm:text-base">{editingId ? 'Edit vendor' : 'Add vendor'}</span>
                                </div>
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                    <button type="button" onClick={resetForm} className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
                                        Reset
                                    </button>
                                    <button type="submit" disabled={submitting} className="rounded-2xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">
                                        {submitting ? 'Saving...' : editingId ? 'Update vendor' : 'Save vendor'}
                                    </button>
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">Vendor Name *</label>
                                    <input type="text" name="name" value={formState.name} onChange={handleChange} placeholder="Enter vendor name" className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none sm:px-4 sm:py-3" />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">Contact Person *</label>
                                    <input type="text" name="contactPerson" value={formState.contactPerson} onChange={handleChange} placeholder="Enter contact person" className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none sm:px-4 sm:py-3" />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">Email *</label>
                                    <input type="email" name="email" value={formState.email} onChange={handleChange} placeholder="Enter email address" className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none sm:px-4 sm:py-3" />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">Phone *</label>
                                    <input type="tel" name="phone" value={formState.phone} onChange={handleChange} placeholder="Enter phone number" className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none sm:px-4 sm:py-3" />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">Address</label>
                                    <input type="text" name="address" value={formState.address} onChange={handleChange} placeholder="Enter address" className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none sm:px-4 sm:py-3" />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">GST Number</label>
                                    <input type="text" name="gstNumber" value={formState.gstNumber} onChange={handleChange} placeholder="Enter GST number" className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none sm:px-4 sm:py-3" />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
                                    <select name="status" value={formState.status} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none sm:px-4 sm:py-3">
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            {message && <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">{message}</div>}
                        </form>
                    )}

                    {!isAdmin && (
                        <div className="my-6 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                            Only admins can add, edit, or delete vendors. You can still search and view the vendor list.
                        </div>
                    )}

                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative w-full sm:w-72">
                            <Search size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search vendors..."
                                className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none sm:px-4 sm:py-3"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as 'All' | 'Active' | 'Inactive')}
                                className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none"
                            >
                                <option value="All">All statuses</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                            <button type="button" onClick={fetchVendors} className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
                                Refresh
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600 sm:p-8">Loading vendors...</div>
                    ) : error ? (
                        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-800 sm:p-8">{error}</div>
                    ) : (
                        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-slate-50 p-3 shadow-sm sm:p-4">
                            {filteredVendors.length === 0 ? (
                                <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
                                    No vendors found. Try adjusting your search or filter.
                                </div>
                            ) : (
                                <table className="w-full min-w-225 border-separate border-spacing-y-3 text-left text-sm">
                                    <thead>
                                        <tr className="bg-slate-100 text-slate-600">
                                            <th className="px-4 py-4 font-medium">id</th>
                                            <th className="px-4 py-4 font-medium">Vendor Name</th>
                                            <th className="px-4 py-4 font-medium">Contact Person</th>
                                            <th className="px-4 py-4 font-medium">Email</th>
                                            <th className="px-4 py-4 font-medium">Phone</th>
                                            <th className="px-4 py-4 font-medium">GST Number</th>
                                            <th className="px-4 py-4 font-medium">Status</th>
                                            {isAdmin && <th className="px-4 py-4 font-medium">Action</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredVendors.map((vendor, index) => (
                                            <tr key={vendor._id} className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                                                <td className="whitespace-nowrap px-4 py-4 text-slate-600">{index + 1}</td>
                                                <td className="px-4 py-4 text-slate-900">{vendor.name}</td>
                                                <td className="px-4 py-4 text-slate-600">{vendor.contactPerson}</td>
                                                <td className="px-4 py-4 text-slate-600">{vendor.email}</td>
                                                <td className="px-4 py-4 text-slate-600">{vendor.phone}</td>
                                                <td className="px-4 py-4 text-slate-600">{vendor.gstNumber || '-'}</td>
                                                <td className={`px-4 py-4 font-semibold ${vendor.status === 'Active' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    {vendor.status}
                                                </td>
                                                {isAdmin && (
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <button type="button" onClick={() => handleEdit(vendor)} className="rounded-full border border-slate-300 p-2 text-slate-700 hover:bg-slate-100">
                                                                <Pencil size={16} />
                                                            </button>
                                                            <button type="button" onClick={() => handleDelete(vendor._id)} className="rounded-full border border-rose-200 p-2 text-rose-600 hover:bg-rose-50">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </section>
    );
}

export default Supplychain;
