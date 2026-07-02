import React, { useEffect, useState } from 'react';
import { AlertTriangle, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import Aside from '../../components/Aside.js';
import inventoryIllustration from '../../assets/Inventroy.png';

interface VendorOption {
    _id: string;
    name: string;
}

interface InventoryItem {
    _id: string;
    itemName: string;
    sku: string;
    category: string;
    quantity: number;
    reorderLevel: number;
    location: string;
    supplier?: {
        _id: string;
        name: string;
    } | null;
    status: 'In Stock' | 'Low Stock' | 'Out of Stock';
    description: string;
}

interface InventoryFormState {
    itemName: string;
    sku: string;
    category: string;
    quantity: string;
    reorderLevel: string;
    location: string;
    supplier: string;
    status: 'In Stock' | 'Low Stock' | 'Out of Stock';
    description: string;
}

const emptyForm: InventoryFormState = {
    itemName: '',
    sku: '',
    category: 'General',
    quantity: '0',
    reorderLevel: '0',
    location: '',
    supplier: '',
    status: 'In Stock',
    description: '',
};

function Inventory() {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [vendors, setVendors] = useState<VendorOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formState, setFormState] = useState<InventoryFormState>({ ...emptyForm });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'All' | 'In Stock' | 'Low Stock' | 'Out of Stock'>('All');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [isAuthorized, setIsAuthorized] = useState(false);

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

    const apiUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/$/, '') || '';
    const buildUrl = (path: string) => {
        if (import.meta.env.DEV) {
            return path;
        }
        return apiUrl ? `${apiUrl}${path}` : path;
    };

    const parseResponse = async (response: Response) => {
        const text = await response.text();
        const contentType = response.headers.get('content-type') || '';
        const isJson = contentType.includes('application/json');

        if (!response.ok) {
            if (contentType.includes('text/html')) {
                throw new Error('API returned HTML. Check backend URL and proxy configuration.');
            }
            const errorMessage = isJson ? JSON.parse(text)?.message || text : text;
            throw new Error(errorMessage || 'Server returned an error');
        }

        if (contentType.includes('text/html')) {
            throw new Error('API returned HTML instead of JSON. Verify the API endpoint.');
        }

        return text ? (isJson ? JSON.parse(text) : text) : null;
    };

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const response = await fetch(buildUrl('/api/inventory'), {
                headers: {
                    'x-user-role': getStoredUserRole(),
                },
            });
            const data = await parseResponse(response);
            setItems(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load inventory');
        } finally {
            setLoading(false);
        }
    };

    const fetchVendors = async () => {
        try {
            const response = await fetch(buildUrl('/api/supply/vendors'), {
                headers: {
                    'x-user-role': getStoredUserRole(),
                },
            });
            const data = await parseResponse(response);
            setVendors(Array.isArray(data) ? data : []);
        } catch (err) {
            console.warn('Unable to load supplier list', err);
        }
    };

    useEffect(() => {
        const storedRole = getStoredUserRole();
        const allowed = storedRole === 'Admin' || storedRole === 'Manager';
        setIsAuthorized(allowed);
        // Always fetch inventory for all users (view-only for others).
        fetchInventory();
        if (allowed) {
            fetchVendors();
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
        if (!isAuthorized) return;

        if (!formState.itemName.trim() || !formState.sku.trim()) {
            setMessage('Item name and SKU are required.');
            return;
        }

        const quantityValue = Number(formState.quantity);
        const reorderLevelValue = Number(formState.reorderLevel);

        if (Number.isNaN(quantityValue) || Number.isNaN(reorderLevelValue) || quantityValue < 0 || reorderLevelValue < 0) {
            setMessage('Quantity and reorder level must be non-negative numbers.');
            return;
        }

        const payload = {
            itemName: formState.itemName.trim(),
            sku: formState.sku.trim(),
            category: formState.category.trim() || 'General',
            quantity: quantityValue,
            reorderLevel: reorderLevelValue,
            location: formState.location.trim(),
            supplier: formState.supplier || null,
            status: formState.status,
            description: formState.description.trim(),
        };

        try {
            setSubmitting(true);
            const url = editingId ? buildUrl(`/api/inventory/${editingId}`) : buildUrl('/api/inventory');
            const response = await fetch(url, {
                method: editingId ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-role': getStoredUserRole(),
                },
                body: JSON.stringify(payload),
            });

            const data = await parseResponse(response);
            if (!response.ok) {
                throw new Error((data as any)?.message || 'Unable to save inventory item');
            }

            setMessage(editingId ? 'Inventory item updated successfully.' : 'Inventory item added successfully.');
            resetForm();
            await fetchInventory();
        } catch (err) {
            setMessage(err instanceof Error ? err.message : 'Unable to save inventory item');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (item: InventoryItem) => {
        setEditingId(item._id);
        setFormState({
            itemName: item.itemName,
            sku: item.sku,
            category: item.category,
            quantity: String(item.quantity),
            reorderLevel: String(item.reorderLevel),
            location: item.location,
            supplier: item.supplier?._id || '',
            status: item.status,
            description: item.description,
        });
        setMessage(null);
    };

    const handleDelete = async (id: string) => {
        if (!isAuthorized) return;
        if (!window.confirm('Delete this inventory item?')) return;

        try {
            const response = await fetch(buildUrl(`/api/inventory/${id}`), {
                method: 'DELETE',
                headers: {
                    'x-user-role': getStoredUserRole(),
                },
            });
            const data = await parseResponse(response);
            if (!response.ok) {
                throw new Error((data as any)?.message || 'Unable to delete inventory item');
            }
            setMessage('Inventory item deleted successfully.');
            await fetchInventory();
        } catch (err) {
            setMessage(err instanceof Error ? err.message : 'Unable to delete inventory item');
        }
    };

    const filteredItems = items.filter((item) => {
        const query = searchQuery.trim().toLowerCase();
        const matchesSearch =
            query === '' ||
            item.itemName.toLowerCase().includes(query) ||
            item.sku.toLowerCase().includes(query) ||
            item.category.toLowerCase().includes(query) ||
            item.location.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
            (item.supplier?.name.toLowerCase().includes(query) ?? false);

        const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
        const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;

        return matchesSearch && matchesStatus && matchesCategory;
    });

    const totalItems = items.length;
    const lowStockCount = items.filter((item) => item.quantity <= item.reorderLevel).length;
    const categories = Array.from(new Set(items.map((item) => item.category).filter(Boolean))).sort();

    // Non-authorized users get view-only access (no edit controls).

    return (
        <section className="min-h-screen w-full bg-slate-100 text-slate-900 lg:flex">
            <Aside />
            <main className="flex-1 p-3 pt-16 sm:p-6 lg:p-8 lg:pt-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                    <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 sm:text-sm">Supply Chain / Inventory</p>
                            <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">Inventory</h1>
                            <p className="mt-2 text-sm text-slate-600">Track stock levels, manage items, and keep your warehouse data in sync.</p>
                            <div className="mt-6 grid gap-3 sm:grid-cols-3">
                                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                                    <p className="text-sm font-medium text-slate-500">Total items</p>
                                    <p className="mt-3 text-3xl font-semibold text-slate-900">{totalItems}</p>
                                </div>
                                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                                    <p className="text-sm font-medium text-slate-500">Low stock</p>
                                    <p className="mt-3 text-3xl font-semibold text-rose-600">{lowStockCount}</p>
                                </div>
                                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                                    <p className="text-sm font-medium text-slate-500">In stock</p>
                                    <p className="mt-3 text-3xl font-semibold text-emerald-600">{items.filter((item) => item.status === 'In Stock').length}</p>
                                </div>
                            </div>
                        </div>
                        {/* <div className="hidden rounded-3xl border border-slate-200 bg-slate-50 p-6 xl:block">
              <img src={inventoryIllustration} alt="Inventory illustration" className="h-full w-full rounded-3xl object-contain" />
            </div> */}
                    </div>

                    <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-lg font-semibold text-slate-900">Inventory management</p>
                                    <p className="mt-1 text-sm text-slate-600">Add new stock items, define reorder levels and assign suppliers.</p>
                                </div>
                                {isAuthorized ? (
                                    <button type="button" onClick={resetForm} className="inline-flex items-center gap-2 rounded-2xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800">
                                        <Plus size={16} />
                                        {editingId ? 'New item' : 'Add item'}
                                    </button>
                                ) : (
                                    <div className="rounded-2xl bg-amber-50 px-4 py-2 text-sm text-amber-700">View-only access</div>
                                )}
                            </div>

                            {message && <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">{message}</div>}

                            {isAuthorized ? (
                                <form onSubmit={handleSubmit} className="grid gap-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <label className="space-y-2">
                                            <span className="text-sm font-medium text-slate-700">Item Name *</span>
                                            <input name="itemName" value={formState.itemName} onChange={handleChange} placeholder="Enter item name" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none" />
                                        </label>
                                        <label className="space-y-2">
                                            <span className="text-sm font-medium text-slate-700">SKU *</span>
                                            <input name="sku" value={formState.sku} onChange={handleChange} placeholder="Stock keeping unit" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none" />
                                        </label>
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <label className="space-y-2">
                                            <span className="text-sm font-medium text-slate-700">Category</span>
                                            <input name="category" value={formState.category} onChange={handleChange} placeholder="Furniture, Stationery, etc." className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none" />
                                        </label>
                                        <label className="space-y-2">
                                            <span className="text-sm font-medium text-slate-700">Location</span>
                                            <input name="location" value={formState.location} onChange={handleChange} placeholder="Warehouse / shelf" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none" />
                                        </label>
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-3">
                                        <label className="space-y-2">
                                            <span className="text-sm font-medium text-slate-700">Quantity *</span>
                                            <input type="number" name="quantity" value={formState.quantity} onChange={handleChange} min="0" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none" />
                                        </label>
                                        <label className="space-y-2">
                                            <span className="text-sm font-medium text-slate-700">Reorder Level *</span>
                                            <input type="number" name="reorderLevel" value={formState.reorderLevel} onChange={handleChange} min="0" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none" />
                                        </label>
                                        <label className="space-y-2">
                                            <span className="text-sm font-medium text-slate-700">Status</span>
                                            <select name="status" value={formState.status} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none">
                                                <option value="In Stock">In Stock</option>
                                                <option value="Low Stock">Low Stock</option>
                                                <option value="Out of Stock">Out of Stock</option>
                                            </select>
                                        </label>
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <label className="space-y-2">
                                            <span className="text-sm font-medium text-slate-700">Supplier</span>
                                            <select name="supplier" value={formState.supplier} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none">
                                                <option value="">No supplier</option>
                                                {vendors.map((vendor) => (
                                                    <option key={vendor._id} value={vendor._id}>{vendor.name}</option>
                                                ))}
                                            </select>
                                        </label>
                                        <label className="space-y-2">
                                            <span className="text-sm font-medium text-slate-700">Description</span>
                                            <textarea name="description" value={formState.description} onChange={handleChange} rows={3} placeholder="Optional item notes" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none" />
                                        </label>
                                    </div>
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <button type="submit" disabled={submitting || !isAuthorized} className="inline-flex items-center justify-center rounded-2xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">
                                            {submitting ? 'Saving...' : editingId ? 'Update item' : 'Save item'}
                                        </button>
                                        <button type="button" onClick={resetForm} className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">You have view-only access to inventory. Contact an administrator to make changes.</div>
                            )}
                        </div>
                        <div className="rounded-3xl border border-slate-200 bg-white p-6">
                            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex-1 relative">
                                    <span className="sr-only">Search inventory</span>
                                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search items, SKU, supplier" className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none focus:border-blue-500" />
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2 w-full sm:w-auto">
                                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none">
                                        <option value="All">All statuses</option>
                                        <option value="In Stock">In Stock</option>
                                        <option value="Low Stock">Low Stock</option>
                                        <option value="Out of Stock">Out of Stock</option>
                                    </select>
                                    <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none">
                                        <option value="All">All categories</option>
                                        {categories.map((category) => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {loading ? (
                                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-600">Loading inventory...</div>
                            ) : filteredItems.length === 0 ? (
                                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-600">No inventory items found. Adjust your filters or add a new item.</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                                        <thead className="bg-slate-50 text-slate-600">
                                            <tr>
                                                <th className="px-4 py-3 font-medium">Item</th>
                                                <th className="px-4 py-3 font-medium">SKU</th>
                                                <th className="px-4 py-3 font-medium">Qty</th>
                                                <th className="px-4 py-3 font-medium">Reorder</th>
                                                <th className="px-4 py-3 font-medium">Status</th>
                                                <th className="px-4 py-3 font-medium">Supplier</th>
                                                <th className="px-4 py-3 font-medium">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200">
                                            {filteredItems.map((item) => (
                                                <tr key={item._id} className="bg-white">
                                                    <td className="px-4 py-4 text-slate-900">
                                                        <div className="font-semibold">{item.itemName}</div>
                                                        <div className="text-xs text-slate-500">{item.category}</div>
                                                    </td>
                                                    <td className="px-4 py-4 text-slate-600">{item.sku}</td>
                                                    <td className="px-4 py-4 text-slate-900">{item.quantity}</td>
                                                    <td className="px-4 py-4 text-slate-900">{item.reorderLevel}</td>
                                                    <td className="px-4 py-4">
                                                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${item.status === 'In Stock' ? 'bg-emerald-100 text-emerald-700' : item.status === 'Low Stock' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 text-slate-600">{item.supplier?.name || '-'}</td>
                                                    <td className="px-4 py-4 text-slate-600">
                                                        {isAuthorized ? (
                                                            <div className="flex gap-2">
                                                                <button type="button" onClick={() => handleEdit(item)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100">
                                                                    <Pencil size={16} />
                                                                </button>
                                                                <button type="button" onClick={() => handleDelete(item._id)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-rose-200 bg-white text-rose-600 transition hover:bg-rose-50">
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm text-slate-400">View only</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main >
        </section >
    );
}

export default Inventory;
