import React, { useEffect, useState } from 'react';
import Aside from '../../components/Aside.js';

interface PurchaseItem {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

interface VendorOption {
    _id: string;
    name: string;
}

interface PurchaseOrder {
    _id: string;
    poNumber: string;
    vendor: VendorOption;
    items: PurchaseItem[];
    totalAmount: number;
    status: 'Pending' | 'Approved' | 'Received' | 'Cancelled';
    expectedDeliveryDate: string;
    notes: string;
    createdAt: string;
}

const emptyItem: PurchaseItem = {
    description: '',
    quantity: 1,
    unitPrice: 0,
    total: 0,
};

function PurchaseOrderPage() {
    const [vendors, setVendors] = useState<VendorOption[]>([]);
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
    const [selectedVendor, setSelectedVendor] = useState('');
    const [items, setItems] = useState<PurchaseItem[]>([{ ...emptyItem }]);
    const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
    const [notes, setNotes] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    const apiUrl = import.meta.env.VITE_API_URL?.trim() || '';
    const buildUrl = (path: string) => (apiUrl ? `${apiUrl}${path}` : path);

    const storedUser = localStorage.getItem('user');
    const userRole = storedUser ? JSON.parse(storedUser).role : 'Employee';
    const userId = storedUser ? JSON.parse(storedUser).id : '';

    useEffect(() => {
        setIsAdmin(userRole === 'Admin');
        fetchVendors();
        fetchPurchaseOrders();
    }, []);

    const parseResponse = async (response: Response) => {
        const text = await response.text();
        const contentType = response.headers.get('content-type') || '';
        const isJson = contentType.includes('application/json');
        if (!response.ok) {
            const error = isJson && text ? JSON.parse(text) : { message: text };
            throw new Error(error.message || 'Server error');
        }
        return isJson && text ? JSON.parse(text) : null;
    };

    const fetchVendors = async () => {
        try {
            const response = await fetch(buildUrl('/api/supply/vendors'));
            const data = await parseResponse(response);
            setVendors(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchPurchaseOrders = async () => {
        try {
            const response = await fetch(buildUrl('/api/purchase-orders'));
            const data = await parseResponse(response);
            setPurchaseOrders(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        }
    };

    const updateItem = (index: number, field: keyof PurchaseItem, value: string | number) => {
        setItems((prev) => {
            const next = [...prev];
            const item = { ...next[index] };
            if (field === 'description') item.description = value as string;
            if (field === 'quantity') item.quantity = Number(value) || 0;
            if (field === 'unitPrice') item.unitPrice = Number(value) || 0;
            item.total = item.quantity * item.unitPrice;
            next[index] = item;
            return next;
        });
    };

    const addItem = () => setItems((prev) => [...prev, { ...emptyItem }]);
    const removeItem = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index));

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedVendor) {
            setMessage('Select a vendor before saving.');
            return;
        }
        const validItems = items.filter((item) => item.description.trim() && item.quantity > 0 && item.unitPrice >= 0);
        if (validItems.length === 0) {
            setMessage('Add at least one valid item to the PO.');
            return;
        }

        const payload = {
            vendor: selectedVendor,
            items: validItems,
            expectedDeliveryDate: expectedDeliveryDate || null,
            notes,
        };

        try {
            setSubmitting(true);
            const response = await fetch(buildUrl('/api/purchase-orders'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-role': userRole,
                    'x-user-id': userId,
                },
                body: JSON.stringify(payload),
            });
            const data = await parseResponse(response);
            setMessage(data?.message || 'Purchase order created');
            setSelectedVendor('');
            setItems([{ ...emptyItem }]);
            setExpectedDeliveryDate('');
            setNotes('');
            await fetchPurchaseOrders();
        } catch (err) {
            setMessage(err instanceof Error ? err.message : 'Failed to create PO');
        } finally {
            setSubmitting(false);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            const response = await fetch(buildUrl(`/api/purchase-orders/${id}/approve`), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-role': userRole,
                    'x-user-id': userId,
                },
                body: JSON.stringify({ comment: 'Approved through PO page' }),
            });
            const data = await parseResponse(response);
            setMessage(data?.message || 'Purchase order approved');
            await fetchPurchaseOrders();
        } catch (err) {
            setMessage(err instanceof Error ? err.message : 'Failed to approve PO');
        }
    };

    const filteredOrders = purchaseOrders.filter((order) => {
        const statusMatches = statusFilter === 'All' || order.status === statusFilter;
        const searchMatches = searchQuery.trim() === '' || order.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) || order.vendor.name.toLowerCase().includes(searchQuery.toLowerCase());
        return statusMatches && searchMatches;
    });

    const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

    return (
        <section className="min-h-screen w-full bg-slate-100 text-slate-900 lg:flex">
            <Aside />
            <main className="flex-1 p-3 pt-16 sm:p-6 lg:p-8 lg:pt-6">
                <div className="rounded-3xl border  border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                    <div className="mb-5 flex flex-col gap-3 sm:mb-6 md:flex-row md:items-start md:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 sm:text-sm">Supply Chain / Purchase Orders</p>
                            <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">Purchase Orders</h1>
                            <p className="mt-2 text-sm text-slate-600">Create, edit, and approve purchase orders with role-based access.</p>
                        </div>
                    </div>

                    <div className="mb-6 grid gap-4 md:grid-cols-4">
                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-sm font-medium text-slate-500">Total POs</p>
                            <p className="mt-3 text-3xl font-semibold text-slate-900">{purchaseOrders.length}</p>
                        </div>
                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-sm font-medium text-slate-500">Pending</p>
                            <p className="mt-3 text-3xl font-semibold text-orange-600">{purchaseOrders.filter((order) => order.status === 'Pending').length}</p>
                        </div>
                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-sm font-medium text-slate-500">Approved</p>
                            <p className="mt-3 text-3xl font-semibold text-emerald-600">{purchaseOrders.filter((order) => order.status === 'Approved').length}</p>
                        </div>
                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-sm font-medium text-slate-500">Received</p>
                            <p className="mt-3 text-3xl font-semibold text-sky-600">{purchaseOrders.filter((order) => order.status === 'Received').length}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="mb-8 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-6">
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">Vendor</label>
                                <select value={selectedVendor} onChange={(e) => setSelectedVendor(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none">
                                    <option value="">Select vendor</option>
                                    {vendors.map((vendor) => (
                                        <option key={vendor._id} value={vendor._id}>{vendor.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">Expected Delivery</label>
                                <input type="date" value={expectedDeliveryDate} onChange={(e) => setExpectedDeliveryDate(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none" />
                            </div>
                            <div className="xl:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-slate-700">Notes</label>
                                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"></textarea>
                            </div>
                        </div>

                        <div className="mt-6 space-y-4">
                            {items.map((item, index) => (
                                <div key={index} className="grid gap-4 sm:grid-cols-12 items-end rounded-3xl border border-slate-200 bg-white p-4">
                                    <div className="sm:col-span-5">
                                        <label className="block text-sm font-medium text-slate-700">Item Description</label>
                                        <input value={item.description} onChange={(e) => updateItem(index, 'description', e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" placeholder="Description" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700">Qty</label>
                                        <input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700">Unit Price</label>
                                        <input type="number" min="0" step="0.01" value={item.unitPrice} onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700">Total</label>
                                        <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-700">₹{item.total.toFixed(2)}</div>
                                    </div>
                                    <div className="sm:col-span-1 text-right">
                                        <button type="button" onClick={() => removeItem(index)} className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white hover:bg-rose-700">Remove</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <button type="button" onClick={addItem} className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100">Add Item</button>
                            <div className="text-right text-sm text-slate-700">Total: <span className="font-semibold">₹{totalAmount.toFixed(2)}</span></div>
                        </div>

                        {message && <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">{message}</div>}

                        <div className="mt-6 text-right">
                            <button type="submit" disabled={submitting} className="inline-flex items-center justify-center rounded-2xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">{submitting ? 'Saving...' : 'Create Purchase Order'}</button>
                        </div>
                    </form>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <input type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by PO number or vendor" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none sm:w-80" />
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none sm:w-56">
                            <option value="All">All statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Received">Received</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>

                    <div className="mt-6 overflow-x-auto rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                        <table className="min-w-full text-left text-sm text-slate-700">
                            <thead>
                                <tr className="border-b border-slate-200 text-slate-900">
                                    <th className="px-4 py-3">PO Number</th>
                                    <th className="px-4 py-3">Vendor</th>
                                    <th className="px-4 py-3">Total</th>
                                    <th className="px-4 py-3">Expected</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((order) => (
                                    <tr key={order._id} className="border-b border-slate-200 bg-white">
                                        <td className="px-4 py-3 font-medium text-slate-900">{order.poNumber}</td>
                                        <td className="px-4 py-3">{order.vendor.name}</td>
                                        <td className="px-4 py-3">₹{order.totalAmount.toFixed(2)}</td>
                                        <td className="px-4 py-3">{order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toLocaleDateString() : '-'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${order.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : order.status === 'Received' ? 'bg-sky-100 text-sky-700' : order.status === 'Cancelled' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>{order.status}</span>
                                        </td>
                                        <td className="px-4 py-3 space-x-2">
                                            {order.status === 'Pending' && (
                                                <button type="button" onClick={() => handleApprove(order._id)} className="rounded-2xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700">Approve</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </section>
    );
}

export default PurchaseOrderPage;
