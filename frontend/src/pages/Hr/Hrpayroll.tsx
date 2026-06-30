import React, { useEffect, useState } from 'react';
import Aside from '../../components/Aside.js';

interface Employee {
    _id: string;
    name: string;
    email: string;
    department: string;
    role: string;
    status: string;
    salary: number;
    joiningDate: string;
}

interface LeaveRequest {
    _id: string;
    employee: Employee;
    type: string;
    startDate: string;
    endDate: string;
    status: string;
    reason?: string;
}

interface PayrollRecord {
    _id: string;
    employee: Employee;
    month: string;
    year: number;
    grossSalary: number;
    deductions: number;
    netSalary: number;
}

const TAB_ITEMS = [
    { id: 'employees', label: 'Employee Onboarding' },
    { id: 'leave', label: 'Leave Management' },
    { id: 'payroll', label: 'Payroll' },
] as const;

function Hrpayroll() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
    const [selectedTab, setSelectedTab] = useState<(typeof TAB_ITEMS)[number]['id']>('employees');
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [employeeForm, setEmployeeForm] = useState({ name: '', email: '', department: '', joiningDate: '', role: 'Employee', salary: '', status: 'Onboarding' });
    const [leaveForm, setLeaveForm] = useState({ employee: '', type: 'Annual', startDate: '', endDate: '', reason: '', status: 'Pending' });
    const [payrollForm, setPayrollForm] = useState({ employee: '', month: '', year: '', grossSalary: '', deductions: '', pf: '', esi: '', professionalTax: '' });
    const [employeeEditingId, setEmployeeEditingId] = useState<string | null>(null);
    const [leaveEditingId, setLeaveEditingId] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);

    const getStoredUserRole = () => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) return 'Employee';
        try {
            const parsed = JSON.parse(storedUser);
            return parsed?.role || 'Employee';
        } catch {
            return 'Employee';
        }
    };

    useEffect(() => {
        setIsAdmin(getStoredUserRole() === 'Admin');
    }, []);

    const fetchHrData = async () => {
        try {
            setLoading(true);
            const [employeeRes, leaveRes, payrollRes] = await Promise.all([
                fetch('/api/hr/employees'),
                fetch('/api/hr/leaves'),
                fetch('/api/hr/payrolls'),
            ]);

            if (!employeeRes.ok) throw new Error('Unable to fetch employees');
            if (!leaveRes.ok) throw new Error('Unable to fetch leave requests');
            if (!payrollRes.ok) throw new Error('Unable to fetch payroll records');

            const [employeeData, leaveData, payrollData] = await Promise.all([
                employeeRes.json(),
                leaveRes.json(),
                payrollRes.json(),
            ]);

            setEmployees(employeeData);
            setLeaves(leaveData);
            setPayrolls(payrollData);
            setError('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load HR data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHrData();
        const intervalId = window.setInterval(fetchHrData, 20000);
        return () => window.clearInterval(intervalId);
    }, []);

    const resetNotifications = () => {
        setError('');
        setSuccess('');
    };

    const resetEmployeeForm = () => {
        setEmployeeEditingId(null);
        setEmployeeForm({ name: '', email: '', department: '', joiningDate: '', role: 'Employee', salary: '', status: 'Onboarding' });
    };

    const resetLeaveForm = () => {
        setLeaveEditingId(null);
        setLeaveForm({ employee: '', type: 'Annual', startDate: '', endDate: '', reason: '', status: 'Pending' });
    };

    const handleEmployeeEdit = (employee: Employee) => {
        resetNotifications();
        setEmployeeEditingId(employee._id);
        setSelectedTab('employees');
        setEmployeeForm({
            name: employee.name,
            email: employee.email,
            department: employee.department,
            joiningDate: employee.joiningDate.split('T')[0] || employee.joiningDate,
            role: employee.role,
            salary: String(employee.salary),
            status: employee.status,
        });
    };

    const handleLeaveEdit = (leave: LeaveRequest) => {
        resetNotifications();
        setLeaveEditingId(leave._id);
        setSelectedTab('leave');
        setLeaveForm({
            employee: leave.employee?._id || '',
            type: leave.type,
            startDate: leave.startDate.split('T')[0] || leave.startDate,
            endDate: leave.endDate.split('T')[0] || leave.endDate,
            reason: leave.reason || '',
            status: leave.status,
        });
    };
   
    const handleEmployeeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        resetNotifications();

        const method = employeeEditingId ? 'PUT' : 'POST';
        const url = employeeEditingId ? `${import.meta.env.VITE_API_URL}/api/hr/employees/${employeeEditingId}` : '/api/hr/employees';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'x-user-role': 'Admin' },
                body: JSON.stringify({ ...employeeForm, salary: Number(employeeForm.salary) }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Unable to save employee');

            if (employeeEditingId) {
                setEmployees((prev) => prev.map((item) => (item._id === employeeEditingId ? data.employee : item)));
                setSuccess('Employee updated successfully.');
            } else {
                setEmployees((prev) => [data.employee, ...prev]);
                setSuccess('Employee onboarded successfully.');
            }

            resetEmployeeForm();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save employee');
        }
    };

    const handleLeaveSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        resetNotifications();

        const method = leaveEditingId ? 'PUT' : 'POST';
        const url = leaveEditingId ? `/api/hr/leaves/${leaveEditingId}` : '/api/hr/leaves';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'x-user-role': 'Admin' },
                body: JSON.stringify({ ...leaveForm, status: isAdmin ? leaveForm.status : 'Pending' }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Unable to save leave request');

            if (leaveEditingId) {
                setLeaves((prev) => prev.map((item) => (item._id === leaveEditingId ? data.leave : item)));
                setSuccess('Leave request updated successfully.');
            } else {
                setLeaves((prev) => [data.leave, ...prev]);
                setSuccess('Leave request sent successfully.');
            }

            resetLeaveForm();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save leave request');
        }
    };

    const handleLeaveDelete = async (id: string) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this leave request?');
        if (!confirmDelete) return;

        try {
            resetNotifications();
            const response = await fetch(`/api/hr/leaves/${id}`, {
                method: 'DELETE',
                headers: { 'x-user-role': 'Admin' },
            });

            let data: any = {};
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            }

            if (!response.ok) throw new Error(data.message || 'Unable to delete leave request');

            setSuccess('Leave request deleted successfully.');
            setLeaves((prevLeaves) => prevLeaves.filter((leave) => leave._id !== id));
        } catch (err) {
            console.error('Error deleting leave:', err);
            setError(err instanceof Error ? err.message : 'Failed to delete leave request');
        }
    };

    const handlePayrollSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        resetNotifications();

        try {
            const response = await fetch('/api/hr/payrolls', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-user-role': 'Admin' },
                body: JSON.stringify({
                    employee: payrollForm.employee,
                    month: payrollForm.month,
                    year: Number(payrollForm.year),
                    grossSalary: Number(payrollForm.grossSalary),
                    deductions: Number(payrollForm.deductions),
                    pf: Number(payrollForm.pf),
                    esi: Number(payrollForm.esi),
                    professionalTax: Number(payrollForm.professionalTax),
                }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Unable to create payroll record');

            setPayrolls((prev) => [data.payroll, ...prev]);
            setPayrollForm({ employee: '', month: '', year: '', grossSalary: '', deductions: '', pf: '', esi: '', professionalTax: '' });
            setSuccess('Payroll record created successfully.');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save payroll');
        }
    };

    const renderTabButton = (id: typeof TAB_ITEMS[number]['id'], label: string) => {
        const active = selectedTab === id;
        return (
            <button
                key={id}
                type='button'
                onClick={() => setSelectedTab(id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${active ? 'bg-blue-800 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
                {label}
            </button>
        );
    };



    return (
        <section className='h-dvh max-w-full flex'>
            <Aside />
            <main className=' max-w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
                <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div>
                        <p className='text-xs uppercase tracking-[0.2em] text-slate-500'>HR & Payroll</p>
                        <h1 className='mt-2 text-3xl font-semibold text-slate-900'>{isAdmin ? 'Admin dashboard' : 'HR dashboard'}</h1>
                        <p className='mt-2 text-sm text-slate-500'>Manage onboarding, leave, payroll and statutory compliance from one place.</p>
                    </div>
                    <div className='flex flex-wrap gap-2 items-center'>
                        {TAB_ITEMS.map((tab) => renderTabButton(tab.id, tab.label))}
                        <button
                            type='button'
                            onClick={fetchHrData}
                            className='rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100'
                        >
                            Refresh data
                        </button>
                        {loading && <span className='text-sm text-slate-500'>Refreshing...</span>}
                    </div>
                </div>

                {(error || success) && (
                    <div className='mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                        {error && <div className='w-full rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700'>{error}</div>}
                        {success && <div className='w-full rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700'>{success}</div>}
                    </div>
                )}

                {!isAdmin && (
                    <div className='mb-6 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700'>
                        You have read-only access to HR and payroll data. Admins can make updates from the HR dashboard.
                    </div>
                )}

                {selectedTab === 'employees' && (
                    <div className={`grid gap-6 ${isAdmin ? 'xl:grid-cols-[1fr_1.2fr]' : 'grid-cols-1'}`}>
                        {isAdmin && (
                            <section className='rounded-3xl border border-slate-200 bg-slate-50 p-6'>
                                <h2 className='mb-4 text-xl font-semibold text-slate-900'>New employee onboarding</h2>
                                <form className='space-y-4' onSubmit={handleEmployeeSubmit}>
                                    <div className='grid gap-4 md:grid-cols-2'>
                                        <div>
                                            <label className='mb-2 block text-sm font-medium text-slate-700'>Name</label>
                                            <input
                                                name='name'
                                                value={employeeForm.name}
                                                onChange={(e) => setEmployeeForm({ ...employeeForm, [e.target.name]: e.target.value })}
                                                className='w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none'
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className='mb-2 block text-sm font-medium text-slate-700'>Email</label>
                                            <input
                                                name='email'
                                                type='email'
                                                value={employeeForm.email}
                                                onChange={(e) => setEmployeeForm({ ...employeeForm, [e.target.name]: e.target.value })}
                                                className='w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none'
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className='grid gap-4 md:grid-cols-2'>
                                        <div>
                                            <label className='mb-2 block text-sm font-medium text-slate-700'>Department</label>
                                            <input
                                                name='department'
                                                value={employeeForm.department}
                                                onChange={(e) => setEmployeeForm({ ...employeeForm, [e.target.name]: e.target.value })}
                                                className='w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none'
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className='mb-2 block text-sm font-medium text-slate-700'>Joining date</label>
                                            <input
                                                name='joiningDate'
                                                type='date'
                                                value={employeeForm.joiningDate}
                                                onChange={(e) => setEmployeeForm({ ...employeeForm, [e.target.name]: e.target.value })}
                                                className='w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none'
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className='grid gap-4 md:grid-cols-3'>
                                        <div>
                                            <label className='mb-2 block text-sm font-medium text-slate-700'>Role</label>
                                            <select
                                                name='role'
                                                value={employeeForm.role}
                                                onChange={(e) => setEmployeeForm({ ...employeeForm, [e.target.name]: e.target.value })}
                                                className='w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none'
                                            >
                                                <option value='Admin'>Admin</option>
                                                <option value='Manager'>Manager</option>
                                                <option value='Employee'>Employee</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className='mb-2 block text-sm font-medium text-slate-700'>Status</label>
                                            <select
                                                name='status'
                                                value={employeeForm.status}
                                                onChange={(e) => setEmployeeForm({ ...employeeForm, [e.target.name]: e.target.value })}
                                                className='w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none'
                                            >
                                                <option value='Onboarding'>Onboarding</option>
                                                <option value='Active'>Active</option>
                                                <option value='Inactive'>Inactive</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className='mb-2 block text-sm font-medium text-slate-700'>Salary</label>
                                            <input
                                                name='salary'
                                                type='number'
                                                value={employeeForm.salary}
                                                onChange={(e) => setEmployeeForm({ ...employeeForm, [e.target.name]: e.target.value })}
                                                className='w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none'
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className='flex flex-col gap-3 sm:flex-row'>
                                        <button type='submit' className='w-full rounded-3xl bg-blue-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-900'>
                                            {employeeEditingId ? 'Update employee' : 'Add employee'}
                                        </button>
                                        {employeeEditingId && (
                                            <button type='button' onClick={resetEmployeeForm} className='w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100'>
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </section>
                        )}
                        <section className='rounded-3xl border border-slate-200 bg-white p-6'>
                            <div className='mb-4 flex items-center justify-between gap-3'>
                                <h2 className='text-xl font-semibold text-slate-900'>Employee list</h2>
                                <span className='rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700'>{employees.length} records</span>
                            </div>
                            <div className='space-y-4'>
                                {employees.length === 0 ? (
                                    <p className='text-sm text-slate-600'>No employees available yet.</p>
                                ) : (
                                    employees.map((employee) => (
                                        <div key={employee._id} className='rounded-3xl border border-slate-200 p-4'>
                                            <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                                                <div>
                                                    <p className='text-lg font-semibold text-slate-900'>{employee.name}</p>
                                                    <p className='text-sm text-slate-500'>{employee.email}</p>
                                                </div>
                                                <div className='flex flex-wrap items-center gap-2'>
                                                    <span className='rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700'>{employee.role}</span>
                                                    <span className='rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700'>{employee.status}</span>
                                                </div>
                                            </div>
                                            <div className='mt-4 grid gap-3 sm:grid-cols-3 text-sm text-slate-600'>
                                                <span>Department: {employee.department}</span>
                                                <span>Salary: ₹{employee.salary}</span>
                                                <span>Joined: {new Date(employee.joiningDate).toLocaleDateString()}</span>
                                            </div>
                                            {isAdmin && (
                                                <div className='mt-4 flex flex-wrap gap-2'>
                                                    <button
                                                        type='button'
                                                        onClick={() => handleEmployeeEdit(employee)}
                                                        className='rounded-3xl border border-blue-600 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100'
                                                    >
                                                        Edit
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </div>
                )}

{/* Leave Tab */}
                {selectedTab === 'leave' && (
                    <div className='grid gap-6 xl:grid-cols-[1fr_1.2fr]'>
                        <section className='rounded-3xl border border-slate-200 bg-slate-50 p-6'>
                            <h2 className='mb-4 text-xl font-semibold text-slate-900'>Leave request</h2>
                            <form className='space-y-4' onSubmit={handleLeaveSubmit}>
                                <div>
                                    <label className='mb-2 block text-sm font-medium text-slate-700'>Employee</label>
                                    <select
                                        name='employee'
                                        value={leaveForm.employee}
                                        onChange={(e) => setLeaveForm({ ...leaveForm, [e.target.name]: e.target.value })}
                                        className='w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none'
                                        required
                                    >
                                        <option value=''>Choose employee</option>
                                        {employees.map((employee) => (
                                            <option key={employee._id} value={employee._id}>{employee.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className='grid gap-4 sm:grid-cols-2'>
                                    <div>
                                        <label className='mb-2 block text-sm font-medium text-slate-700'>Leave type</label>
                                        <select
                                            name='type'
                                            value={leaveForm.type}
                                            onChange={(e) => setLeaveForm({ ...leaveForm, [e.target.name]: e.target.value })}
                                            className='w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none'
                                        >
                                            <option value='Annual'>Annual</option>
                                            <option value='Sick'>Sick</option>
                                            <option value='Casual'>Casual</option>
                                        </select>
                                    </div>
                                    {isAdmin ? (
                                        <div>
                                            <label className='mb-2 block text-sm font-medium text-slate-700'>Status</label>
                                            <select
                                                name='status'
                                                value={leaveForm.status}
                                                onChange={(e) => setLeaveForm({ ...leaveForm, [e.target.name]: e.target.value })}
                                                className='w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none'
                                            >
                                                <option value='Pending'>Pending</option>
                                                <option value='Approved'>Approved</option>
                                                <option value='Rejected'>Rejected</option>
                                            </select>
                                        </div>
                                    ) : (
                                        <div>
                                            <label className='mb-2 block text-sm font-medium text-slate-700'>Status</label>
                                            <div className='rounded-3xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-600'>
                                                Pending
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className='grid gap-4 sm:grid-cols-2'>
                                    <div>
                                        <label className='mb-2 block text-sm font-medium text-slate-700'>Start date</label>
                                        <input
                                            name='startDate'
                                            type='date'
                                            value={leaveForm.startDate}
                                            onChange={(e) => setLeaveForm({ ...leaveForm, [e.target.name]: e.target.value })}
                                            className='w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none'
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className='mb-2 block text-sm font-medium text-slate-700'>End date</label>
                                        <input
                                            name='endDate'
                                            type='date'
                                            value={leaveForm.endDate}
                                            onChange={(e) => setLeaveForm({ ...leaveForm, [e.target.name]: e.target.value })}
                                            className='w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none'
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className='mb-2 block text-sm font-medium text-slate-700'>Reason</label>
                                    <textarea
                                        name='reason'
                                        value={leaveForm.reason}
                                        onChange={(e) => setLeaveForm({ ...leaveForm, [e.target.name]: e.target.value })}
                                        className='w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none'
                                        rows={4}
                                    />
                                </div>
                                <button type='submit' className='w-full rounded-3xl bg-blue-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-900'>
                                    Submit leave request
                                </button>
                            </form>
                        </section>
                        <section className='rounded-3xl border border-slate-200 bg-white p-6'>
                            <div className='mb-4 flex items-center justify-between gap-3'>
                                <h2 className='text-xl font-semibold text-slate-900'>Leave requests</h2>
                                <span className='rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700'>{leaves.length} requests</span>
                            </div>
                            <div className='space-y-4'>
                                {leaves.length === 0 ? (
                                    <p className='text-sm text-slate-600'>No leave requests submitted yet.</p>
                                ) : (
                                    leaves.map((leave) => (
                                        <div key={leave._id} className='rounded-3xl border border-slate-200 p-4 shadow-sm'>
                                            <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                                                <div>
                                                    <p className='font-semibold text-slate-900'>{leave.employee?.name || 'Unknown'}</p>
                                                    <p className='text-sm text-slate-500'>{leave.type} leave</p>
                                                </div>
                                                <span className='rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700'>{leave.status}</span>
                                            </div>
                                            <div className='mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2'>
                                                <span>{new Date(leave.startDate).toLocaleDateString()} → {new Date(leave.endDate).toLocaleDateString()}</span>
                                                <span>{leave.reason || 'No reason provided'}</span>
                                            </div>
                                            {isAdmin && (
                                                <div className='mt-4 flex flex-wrap gap-2'>
                                                    <button
                                                        type='button'
                                                        onClick={() => handleLeaveEdit(leave)}
                                                        className='rounded-3xl border border-blue-600 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100'
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type='button'
                                                        onClick={() => handleLeaveDelete(leave._id)}
                                                        className='rounded-3xl border border-rose-600 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100'
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </div>
                )}

                {selectedTab === 'payroll' && (
                    <div className='grid gap-6 xl:grid-cols-[1fr_1.2fr]'>
                        <section className='rounded-3xl border border-slate-200 bg-slate-50 p-6'>
                            <h2 className='mb-4 text-xl font-semibold text-slate-900'>Payroll calculator</h2>
                            <form className='space-y-4' onSubmit={handlePayrollSubmit}>
                                <div>
                                    <label className='mb-2 block text-sm font-medium text-slate-700'>Employee</label>
                                    <select
                                        name='employee'
                                        value={payrollForm.employee}
                                        onChange={(e) => setPayrollForm({ ...payrollForm, [e.target.name]: e.target.value })}
                                        className='w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none'
                                        required
                                    >
                                        <option value=''>Select employee</option>
                                        {employees.map((employee) => (
                                            <option key={employee._id} value={employee._id}>{employee.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className='grid gap-4 sm:grid-cols-3'>
                                    <div>
                                        <label className='mb-2 block text-sm font-medium text-slate-700'>Month</label>
                                        <input
                                            name='month'
                                            value={payrollForm.month}
                                            onChange={(e) => setPayrollForm({ ...payrollForm, [e.target.name]: e.target.value })}
                                            className='w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none'
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className='mb-2 block text-sm font-medium text-slate-700'>Year</label>
                                        <input
                                            name='year'
                                            type='number'
                                            value={payrollForm.year}
                                            onChange={(e) => setPayrollForm({ ...payrollForm, [e.target.name]: e.target.value })}
                                            className='w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none'
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className='mb-2 block text-sm font-medium text-slate-700'>Gross salary</label>
                                        <input
                                            name='grossSalary'
                                            type='number'
                                            value={payrollForm.grossSalary}
                                            onChange={(e) => setPayrollForm({ ...payrollForm, [e.target.name]: e.target.value })}
                                            className='w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none'
                                            required
                                        />
                                    </div>
                                </div>
                                <div className='grid gap-4 sm:grid-cols-3'>
                                    <div>
                                        <label className='mb-2 block text-sm font-medium text-slate-700'>Deductions</label>
                                        <input
                                            name='deductions'
                                            type='number'
                                            value={payrollForm.deductions}
                                            onChange={(e) => setPayrollForm({ ...payrollForm, [e.target.name]: e.target.value })}
                                            className='w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none'
                                        />
                                    </div>
                                    <div>
                                        <label className='mb-2 block text-sm font-medium text-slate-700'>PF</label>
                                        <input
                                            name='pf'
                                            type='number'
                                            value={payrollForm.pf}
                                            onChange={(e) => setPayrollForm({ ...payrollForm, [e.target.name]: e.target.value })}
                                            className='w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none'
                                        />
                                    </div>
                                    <div>
                                        <label className='mb-2 block text-sm font-medium text-slate-700'>ESI</label>
                                        <input
                                            name='esi'
                                            type='number'
                                            value={payrollForm.esi}
                                            onChange={(e) => setPayrollForm({ ...payrollForm, [e.target.name]: e.target.value })}
                                            className='w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none'
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className='mb-2 block text-sm font-medium text-slate-700'>Professional tax</label>
                                    <input
                                        name='professionalTax'
                                        type='number'
                                        value={payrollForm.professionalTax}
                                        onChange={(e) => setPayrollForm({ ...payrollForm, [e.target.name]: e.target.value })}
                                        className='w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none'
                                    />
                                </div>
                                <button type='submit' className='w-full rounded-3xl bg-blue-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-900'>
                                    Create payroll
                                </button>
                            </form>
                        </section>
                        <section className='rounded-3xl border border-slate-200 bg-white p-6'>
                            <div className='mb-4 flex items-center justify-between gap-3'>
                                <h2 className='text-xl font-semibold text-slate-900'>Payroll records</h2>
                                <span className='rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700'>{payrolls.length} records</span>
                            </div>
                            <div className='space-y-4'>
                                {payrolls.length === 0 ? (
                                    <p className='text-sm text-slate-600'>No payroll records found.</p>
                                ) : (
                                    payrolls.map((payroll) => (
                                        <div key={payroll._id} className='rounded-3xl border border-slate-200 p-4 shadow-sm'>
                                            <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                                                <div>
                                                    <p className='font-semibold text-slate-900'>{payroll.employee?.name || 'Unknown'}</p>
                                                    <p className='text-sm text-slate-500'>{payroll.month} {payroll.year}</p>
                                                </div>
                                                <span className='rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700'>Net ₹{payroll.netSalary}</span>
                                            </div>
                                            <div className='mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2'>
                                                <span>Gross: ₹{payroll.grossSalary}</span>
                                                <span>Deductions: ₹{payroll.deductions}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </div>
                )}
            </main>
        </section>
    );
}

export default Hrpayroll;
