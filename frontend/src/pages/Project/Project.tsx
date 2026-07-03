import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Aside from '../../components/Aside.js';
import {
    Search,
    Plus,
    Pencil,
    Trash2,
    LayoutDashboard,
    FolderKanban,
    ListTodo,
    AlertCircle,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

type TabId = 'overview' | 'projects' | 'tasks' | 'issues';

interface ClientOption {
    _id: string;
    name: string;
    company?: string;
}

interface ManagerOption {
    _id: string;
    name: string;
    email?: string;
    role?: string;
}

interface ProjectItem {
    _id: string;
    name: string;
    code: string;
    client: ClientOption;
    manager: ManagerOption;
    startDate: string;
    endDate: string;
    budget: number;
    status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled';
    progressPercentage: number;
    description?: string;
}

interface TaskItem {
    _id: string;
    project: { _id: string; name: string; code: string };
    title: string;
    description: string;
    status: 'To Do' | 'In Progress' | 'Done' | 'Blocked';
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    assignedTo?: ManagerOption;
    dueDate?: string;
}

interface IssueItem {
    _id: string;
    project: { _id: string; name: string; code: string };
    title: string;
    description: string;
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
    assignedTo?: ManagerOption;
    reportedBy?: ManagerOption;
}

interface OverviewData {
    summary: {
        total: number;
        active: number;
        completed: number;
        onHold: number;
        totalBudget: number;
    };
    statusDistribution: { status: string; count: number }[];
    dueSoon: { _id: string; name: string; code: string; endDate: string; daysLeft: number }[];
    topManagers: { _id: string; name: string; count: number }[];
}

const PIE_COLORS = ['#94a3b8', '#22c55e', '#3b82f6', '#f97316', '#ef4444'];

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const formatDate = (dateStr: string) =>
    dateStr ? new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

const statusBadge = (status: string) => {
    const map: Record<string, string> = {
        'Not Started': 'bg-slate-100 text-slate-700',
        'In Progress': 'bg-emerald-100 text-emerald-700',
        Completed: 'bg-sky-100 text-sky-700',
        'On Hold': 'bg-amber-100 text-amber-700',
        Cancelled: 'bg-rose-100 text-rose-700',
        'To Do': 'bg-slate-100 text-slate-700',
        Done: 'bg-emerald-100 text-emerald-700',
        Blocked: 'bg-rose-100 text-rose-700',
        Open: 'bg-amber-100 text-amber-700',
        Resolved: 'bg-sky-100 text-sky-700',
        Closed: 'bg-slate-100 text-slate-700',
    };
    return map[status] || 'bg-slate-100 text-slate-700';
};

const priorityBadge = (priority: string) => {
    const map: Record<string, string> = {
        Low: 'bg-slate-100 text-slate-600',
        Medium: 'bg-sky-100 text-sky-700',
        High: 'bg-amber-100 text-amber-700',
        Critical: 'bg-rose-100 text-rose-700',
    };
    return map[priority] || 'bg-slate-100 text-slate-600';
};

const emptyProjectForm = {
    name: '',
    client: '',
    manager: '',
    startDate: '',
    endDate: '',
    budget: '',
    status: 'Not Started' as ProjectItem['status'],
    description: '',
};

const emptyTaskForm = {
    project: '',
    title: '',
    description: '',
    status: 'To Do' as TaskItem['status'],
    priority: 'Medium' as TaskItem['priority'],
    assignedTo: '',
    dueDate: '',
};

const emptyIssueForm = {
    project: '',
    title: '',
    description: '',
    priority: 'Medium' as IssueItem['priority'],
    status: 'Open' as IssueItem['status'],
    assignedTo: '',
};

function ProjectPage() {
    const [activeTab, setActiveTab] = useState<TabId>('overview');
    const [projects, setProjects] = useState<ProjectItem[]>([]);
    const [tasks, setTasks] = useState<TaskItem[]>([]);
    const [issues, setIssues] = useState<IssueItem[]>([]);
    const [clients, setClients] = useState<ClientOption[]>([]);
    const [managers, setManagers] = useState<ManagerOption[]>([]);
    const [overview, setOverview] = useState<OverviewData | null>(null);
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [clientFilter, setClientFilter] = useState('All');
    const [managerFilter, setManagerFilter] = useState('All');

    const [projectForm, setProjectForm] = useState(emptyProjectForm);
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
    const [showProjectForm, setShowProjectForm] = useState(false);

    const [taskForm, setTaskForm] = useState(emptyTaskForm);
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [taskSearch, setTaskSearch] = useState('');
    const [taskStatusFilter, setTaskStatusFilter] = useState('All');

    const [issueForm, setIssueForm] = useState(emptyIssueForm);
    const [editingIssueId, setEditingIssueId] = useState<string | null>(null);
    const [showIssueForm, setShowIssueForm] = useState(false);
    const [issueSearch, setIssueSearch] = useState('');
    const [issueStatusFilter, setIssueStatusFilter] = useState('All');

    const apiUrl = import.meta.env.VITE_API_URL?.trim() || '';
    const buildUrl = (path: string) => (apiUrl ? `${apiUrl}${path}` : path);

    const storedUser = localStorage.getItem('user');
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    const userRole = parsedUser?.role || 'Employee';
    const userId = parsedUser?.id || '';
    const canManage = userRole === 'Admin' || userRole === 'Manager';
    const canDelete = userRole === 'Admin';

    const authHeaders = useMemo(
        () => ({
            'Content-Type': 'application/json',
            'x-user-role': userRole,
            'x-user-id': userId,
        }),
        [userRole, userId]
    );

    const parseResponse = async (response: Response) => {
        const text = await response.text();
        const contentType = response.headers.get('content-type') || '';
        const isJson = contentType.includes('application/json');
        if (!response.ok) {
            const error = isJson && text ? JSON.parse(text) : { message: text || 'Server error' };
            throw new Error(error.message || 'Server error');
        }
        return isJson && text ? JSON.parse(text) : null;
    };

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [projectsRes, tasksRes, issuesRes, clientsRes, managersRes, overviewRes] =
                await Promise.all([
                    fetch(buildUrl('/api/projects')),
                    fetch(buildUrl('/api/tasks')),
                    fetch(buildUrl('/api/issues')),
                    fetch(buildUrl('/api/projects/clients')),
                    fetch(buildUrl('/api/projects/managers')),
                    fetch(buildUrl('/api/projects/overview')),
                ]);

            const [projectsData, tasksData, issuesData, clientsData, managersData, overviewData] =
                await Promise.all([
                    parseResponse(projectsRes),
                    parseResponse(tasksRes),
                    parseResponse(issuesRes),
                    parseResponse(clientsRes),
                    parseResponse(managersRes),
                    parseResponse(overviewRes),
                ]);

            setProjects(Array.isArray(projectsData) ? projectsData : []);
            setTasks(Array.isArray(tasksData) ? tasksData : []);
            setIssues(Array.isArray(issuesData) ? issuesData : []);
            setClients(Array.isArray(clientsData) ? clientsData : []);
            setManagers(Array.isArray(managersData) ? managersData : []);
            setOverview(overviewData);
        } catch (err) {
            setMessage(err instanceof Error ? err.message : 'Failed to load project data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    const filteredProjects = useMemo(() => {
        return projects.filter((p) => {
            const statusMatch = statusFilter === 'All' || p.status === statusFilter;
            const clientMatch = clientFilter === 'All' || p.client?._id === clientFilter;
            const managerMatch = managerFilter === 'All' || p.manager?._id === managerFilter;
            const q = searchQuery.trim().toLowerCase();
            const searchMatch =
                !q ||
                p.name.toLowerCase().includes(q) ||
                p.code.toLowerCase().includes(q) ||
                p.client?.name?.toLowerCase().includes(q);
            return statusMatch && clientMatch && managerMatch && searchMatch;
        });
    }, [projects, statusFilter, clientFilter, managerFilter, searchQuery]);

    const filteredTasks = useMemo(() => {
        return tasks.filter((t) => {
            const statusMatch = taskStatusFilter === 'All' || t.status === taskStatusFilter;
            const q = taskSearch.trim().toLowerCase();
            const searchMatch =
                !q ||
                t.title.toLowerCase().includes(q) ||
                t.project?.name?.toLowerCase().includes(q);
            return statusMatch && searchMatch;
        });
    }, [tasks, taskStatusFilter, taskSearch]);

    const filteredIssues = useMemo(() => {
        return issues.filter((i) => {
            const statusMatch = issueStatusFilter === 'All' || i.status === issueStatusFilter;
            const q = issueSearch.trim().toLowerCase();
            const searchMatch =
                !q ||
                i.title.toLowerCase().includes(q) ||
                i.project?.name?.toLowerCase().includes(q);
            return statusMatch && searchMatch;
        });
    }, [issues, issueStatusFilter, issueSearch]);

    const handleProjectSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectForm.name.trim() || !projectForm.client || !projectForm.manager) {
            setMessage('Name, client, and manager are required.');
            return;
        }
        if (!projectForm.startDate || !projectForm.endDate) {
            setMessage('Start and end dates are required.');
            return;
        }

        const payload = {
            ...projectForm,
            budget: Number(projectForm.budget) || 0,
        };

        try {
            setSubmitting(true);
            const url = editingProjectId
                ? buildUrl(`/api/projects/${editingProjectId}`)
                : buildUrl('/api/projects');
            const response = await fetch(url, {
                method: editingProjectId ? 'PUT' : 'POST',
                headers: authHeaders,
                body: JSON.stringify(payload),
            });
            const data = await parseResponse(response);
            setMessage(data?.message || 'Project saved');
            setProjectForm(emptyProjectForm);
            setEditingProjectId(null);
            setShowProjectForm(false);
            await fetchAll();
        } catch (err) {
            setMessage(err instanceof Error ? err.message : 'Failed to save project');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditProject = (project: ProjectItem) => {
        setEditingProjectId(project._id);
        setProjectForm({
            name: project.name,
            client: project.client?._id || '',
            manager: project.manager?._id || '',
            startDate: project.startDate ? project.startDate.slice(0, 10) : '',
            endDate: project.endDate ? project.endDate.slice(0, 10) : '',
            budget: String(project.budget),
            status: project.status,
            description: project.description || '',
        });
        setShowProjectForm(true);
        setActiveTab('projects');
    };

    const handleDeleteProject = async (id: string) => {
        if (!window.confirm('Delete this project and all related tasks/issues?')) return;
        try {
            const response = await fetch(buildUrl(`/api/projects/${id}`), {
                method: 'DELETE',
                headers: authHeaders,
            });
            const data = await parseResponse(response);
            setMessage(data?.message || 'Project deleted');
            await fetchAll();
        } catch (err) {
            setMessage(err instanceof Error ? err.message : 'Failed to delete project');
        }
    };

    const handleTaskSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!taskForm.project || !taskForm.title.trim()) {
            setMessage('Project and task title are required.');
            return;
        }

        const payload = {
            ...taskForm,
            assignedTo: taskForm.assignedTo || null,
            dueDate: taskForm.dueDate || null,
        };

        try {
            setSubmitting(true);
            const url = editingTaskId
                ? buildUrl(`/api/tasks/${editingTaskId}`)
                : buildUrl('/api/tasks');
            const response = await fetch(url, {
                method: editingTaskId ? 'PUT' : 'POST',
                headers: authHeaders,
                body: JSON.stringify(payload),
            });
            const data = await parseResponse(response);
            setMessage(data?.message || 'Task saved');
            setTaskForm(emptyTaskForm);
            setEditingTaskId(null);
            setShowTaskForm(false);
            await fetchAll();
        } catch (err) {
            setMessage(err instanceof Error ? err.message : 'Failed to save task');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditTask = (task: TaskItem) => {
        setEditingTaskId(task._id);
        setTaskForm({
            project: task.project?._id || '',
            title: task.title,
            description: task.description || '',
            status: task.status,
            priority: task.priority,
            assignedTo: task.assignedTo?._id || '',
            dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
        });
        setShowTaskForm(true);
        setActiveTab('tasks');
    };

    const handleDeleteTask = async (id: string) => {
        if (!window.confirm('Delete this task?')) return;
        try {
            const response = await fetch(buildUrl(`/api/tasks/${id}`), {
                method: 'DELETE',
                headers: authHeaders,
            });
            const data = await parseResponse(response);
            setMessage(data?.message || 'Task deleted');
            await fetchAll();
        } catch (err) {
            setMessage(err instanceof Error ? err.message : 'Failed to delete task');
        }
    };

    const handleIssueSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!issueForm.project || !issueForm.title.trim()) {
            setMessage('Project and issue title are required.');
            return;
        }

        const payload = {
            ...issueForm,
            assignedTo: issueForm.assignedTo || null,
        };

        try {
            setSubmitting(true);
            const url = editingIssueId
                ? buildUrl(`/api/issues/${editingIssueId}`)
                : buildUrl('/api/issues');
            const response = await fetch(url, {
                method: editingIssueId ? 'PUT' : 'POST',
                headers: authHeaders,
                body: JSON.stringify(payload),
            });
            const data = await parseResponse(response);
            setMessage(data?.message || 'Issue saved');
            setIssueForm(emptyIssueForm);
            setEditingIssueId(null);
            setShowIssueForm(false);
            await fetchAll();
        } catch (err) {
            setMessage(err instanceof Error ? err.message : 'Failed to save issue');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditIssue = (issue: IssueItem) => {
        setEditingIssueId(issue._id);
        setIssueForm({
            project: issue.project?._id || '',
            title: issue.title,
            description: issue.description || '',
            priority: issue.priority,
            status: issue.status,
            assignedTo: issue.assignedTo?._id || '',
        });
        setShowIssueForm(true);
        setActiveTab('issues');
    };

    const handleDeleteIssue = async (id: string) => {
        if (!window.confirm('Delete this issue?')) return;
        try {
            const response = await fetch(buildUrl(`/api/issues/${id}`), {
                method: 'DELETE',
                headers: authHeaders,
            });
            const data = await parseResponse(response);
            setMessage(data?.message || 'Issue deleted');
            await fetchAll();
        } catch (err) {
            setMessage(err instanceof Error ? err.message : 'Failed to delete issue');
        }
    };

    const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'projects', label: 'Projects', icon: FolderKanban },
        { id: 'tasks', label: 'Tasks', icon: ListTodo },
        { id: 'issues', label: 'Issues', icon: AlertCircle },
    ];

    const summary = overview?.summary || {
        total: projects.length,
        active: projects.filter((p) => p.status === 'In Progress').length,
        completed: projects.filter((p) => p.status === 'Completed').length,
        onHold: projects.filter((p) => p.status === 'On Hold').length,
        totalBudget: projects.reduce((s, p) => s + p.budget, 0),
    };

    const pieData = (overview?.statusDistribution || [])
        .filter((s) => s.count > 0)
        .map((s) => ({ name: s.status, value: s.count }));

    const maxManagerCount = Math.max(...(overview?.topManagers?.map((m) => m.count) || [1]), 1);

    const renderProgressBar = (pct: number) => {
        const color = pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-rose-500';
        return (
            <div className="flex items-center gap-2">
                <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-200">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs font-medium text-slate-600">{pct}%</span>
            </div>
        );
    };

    const renderProjectTable = (rows: ProjectItem[], showActions = true) => (
        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
            <table className="min-w-full text-left text-sm text-slate-700">
                <thead>
                    <tr className="border-b border-slate-200 text-slate-900">
                        <th className="px-4 py-3">Project</th>
                        <th className="px-4 py-3">Client</th>
                        <th className="px-4 py-3">Manager</th>
                        <th className="px-4 py-3">Progress</th>
                        <th className="px-4 py-3">Dates</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Budget</th>
                        {showActions && canManage && <th className="px-4 py-3">Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {rows.length === 0 ? (
                        <tr>
                            <td colSpan={showActions && canManage ? 8 : 7} className="px-4 py-8 text-center text-slate-500">
                                No projects found
                            </td>
                        </tr>
                    ) : (
                        rows.map((project) => (
                            <tr key={project._id} className="border-b border-slate-200 bg-white">
                                <td className="px-4 py-3">
                                    <p className="font-medium text-slate-900">{project.name}</p>
                                    <p className="text-xs text-slate-500">{project.code}</p>
                                </td>
                                <td className="px-4 py-3">{project.client?.name || '-'}</td>
                                <td className="px-4 py-3">{project.manager?.name || '-'}</td>
                                <td className="px-4 py-3">{renderProgressBar(project.progressPercentage || 0)}</td>
                                <td className="px-4 py-3 text-xs">
                                    <p>{formatDate(project.startDate)}</p>
                                    <p className="text-slate-500">{formatDate(project.endDate)}</p>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(project.status)}`}>
                                        {project.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 font-medium">{formatCurrency(project.budget)}</td>
                                {showActions && canManage && (
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleEditProject(project)}
                                                className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            {canDelete && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteProject(project._id)}
                                                    className="rounded-xl bg-rose-50 p-2 text-rose-600 hover:bg-rose-100"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );

    return (
        <section className="min-h-screen w-full bg-slate-100 text-slate-900 lg:flex">
            <Aside />
            <main className="flex-1 p-3 pt-16 sm:p-6 lg:p-8 lg:pt-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                    <div className="mb-5 flex flex-col gap-3 sm:mb-6 md:flex-row md:items-start md:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 sm:text-sm">
                                Projects Module
                            </p>
                            <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">Project Management</h1>
                            <p className="mt-2 text-sm text-slate-600">
                                Manage projects, tasks, and issues with real-time progress tracking.
                            </p>
                        </div>
                        {canManage && activeTab === 'projects' && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingProjectId(null);
                                    setProjectForm(emptyProjectForm);
                                    setShowProjectForm((v) => !v);
                                }}
                                className="inline-flex items-center gap-2 rounded-2xl bg-violet-700 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-800"
                            >
                                <Plus size={16} />
                                New Project
                            </button>
                        )}
                        {activeTab === 'tasks' && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingTaskId(null);
                                    setTaskForm(emptyTaskForm);
                                    setShowTaskForm((v) => !v);
                                }}
                                className="inline-flex items-center gap-2 rounded-2xl bg-violet-700 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-800"
                            >
                                <Plus size={16} />
                                New Task
                            </button>
                        )}
                        {activeTab === 'issues' && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingIssueId(null);
                                    setIssueForm(emptyIssueForm);
                                    setShowIssueForm((v) => !v);
                                }}
                                className="inline-flex items-center gap-2 rounded-2xl bg-violet-700 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-800"
                            >
                                <Plus size={16} />
                                New Issue
                            </button>
                        )}
                    </div>

                    <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200 pb-1">
                        {tabs.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                type="button"
                                onClick={() => setActiveTab(id)}
                                className={`inline-flex items-center gap-2 rounded-t-2xl px-4 py-2.5 text-sm font-medium transition ${
                                    activeTab === id
                                        ? 'border-b-2 border-violet-700 text-violet-700'
                                        : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                <Icon size={16} />
                                {label}
                            </button>
                        ))}
                    </div>

                    {message && (
                        <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                            {message}
                        </div>
                    )}

                    {loading ? (
                        <div className="py-16 text-center text-slate-500">Loading project data...</div>
                    ) : (
                        <>
                            {activeTab === 'overview' && (
                                <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
                                    <div>
                                        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                                <p className="text-sm font-medium text-slate-500">Total Projects</p>
                                                <p className="mt-2 text-3xl font-semibold text-slate-900">{summary.total}</p>
                                                <p className="mt-1 text-xs text-slate-500">All time</p>
                                            </div>
                                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                                <p className="text-sm font-medium text-slate-500">Active</p>
                                                <p className="mt-2 text-3xl font-semibold text-emerald-600">{summary.active}</p>
                                                <p className="mt-1 text-xs text-slate-500">In progress</p>
                                            </div>
                                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                                <p className="text-sm font-medium text-slate-500">Completed</p>
                                                <p className="mt-2 text-3xl font-semibold text-sky-600">{summary.completed}</p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {summary.total ? Math.round((summary.completed / summary.total) * 100) : 0}% of total
                                                </p>
                                            </div>
                                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                                <p className="text-sm font-medium text-slate-500">On Hold</p>
                                                <p className="mt-2 text-3xl font-semibold text-amber-600">{summary.onHold}</p>
                                                <p className="mt-1 text-xs text-slate-500">Not progressing</p>
                                            </div>
                                            <div className="rounded-3xl border border-slate-200 bg-violet-50 p-4 sm:col-span-2 xl:col-span-1">
                                                <p className="text-sm font-medium text-violet-600">Total Value</p>
                                                <p className="mt-2 text-2xl font-semibold text-violet-900">{formatCurrency(summary.totalBudget)}</p>
                                            </div>
                                        </div>

                                        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                                            <div className="relative flex-1 sm:min-w-[200px]">
                                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="search"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    placeholder="Search projects..."
                                                    className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none"
                                                />
                                            </div>
                                            <select
                                                value={statusFilter}
                                                onChange={(e) => setStatusFilter(e.target.value)}
                                                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                                            >
                                                <option value="All">All Status</option>
                                                <option value="Not Started">Not Started</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Completed">Completed</option>
                                                <option value="On Hold">On Hold</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                            <select
                                                value={clientFilter}
                                                onChange={(e) => setClientFilter(e.target.value)}
                                                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                                            >
                                                <option value="All">All Clients</option>
                                                {clients.map((c) => (
                                                    <option key={c._id} value={c._id}>{c.name}</option>
                                                ))}
                                            </select>
                                            <select
                                                value={managerFilter}
                                                onChange={(e) => setManagerFilter(e.target.value)}
                                                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                                            >
                                                <option value="All">All Managers</option>
                                                {managers.map((m) => (
                                                    <option key={m._id} value={m._id}>{m.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {renderProjectTable(filteredProjects, false)}
                                    </div>

                                    <div className="space-y-4">
                                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                            <h3 className="mb-4 text-sm font-semibold text-slate-900">Projects by Status</h3>
                                            {pieData.length > 0 ? (
                                                <ResponsiveContainer width="100%" height={180}>
                                                    <PieChart>
                                                        <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70}>
                                                            {pieData.map((entry, i) => (
                                                                <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <p className="py-8 text-center text-sm text-slate-500">No data</p>
                                            )}
                                            <div className="mt-2 space-y-1">
                                                {pieData.map((s, i) => (
                                                    <div key={s.name} className="flex items-center justify-between text-xs">
                                                        <span className="flex items-center gap-2">
                                                            <span className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                                                            {s.name}
                                                        </span>
                                                        <span className="font-medium">{s.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                            <h3 className="mb-4 text-sm font-semibold text-slate-900">Projects Due Soon</h3>
                                            {(overview?.dueSoon?.length || 0) === 0 ? (
                                                <p className="text-sm text-slate-500">No upcoming deadlines</p>
                                            ) : (
                                                <div className="space-y-3">
                                                    {overview?.dueSoon?.map((p) => (
                                                        <div key={p._id} className="rounded-2xl border border-slate-200 bg-white p-3">
                                                            <p className="text-sm font-medium text-slate-900">{p.name}</p>
                                                            <p className="text-xs text-slate-500">{formatDate(p.endDate)}</p>
                                                            <span className="mt-1 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                                                                {p.daysLeft} days left
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                            <h3 className="mb-4 text-sm font-semibold text-slate-900">Top Project Managers</h3>
                                            {(overview?.topManagers?.length || 0) === 0 ? (
                                                <p className="text-sm text-slate-500">No managers assigned</p>
                                            ) : (
                                                <div className="space-y-3">
                                                    {overview?.topManagers?.map((m) => (
                                                        <div key={m._id}>
                                                            <div className="mb-1 flex justify-between text-sm">
                                                                <span className="font-medium text-slate-800">{m.name}</span>
                                                                <span className="text-slate-500">{m.count} projects</span>
                                                            </div>
                                                            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                                                                <div
                                                                    className="h-full rounded-full bg-violet-600"
                                                                    style={{ width: `${(m.count / maxManagerCount) * 100}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'projects' && (
                                <>
                                    {showProjectForm && canManage && (
                                        <form onSubmit={handleProjectSubmit} className="mb-6 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-6">
                                            <h3 className="mb-4 text-lg font-semibold text-slate-900">
                                                {editingProjectId ? 'Edit Project' : 'Create Project'}
                                            </h3>
                                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-slate-700">Project Name</label>
                                                    <input
                                                        value={projectForm.name}
                                                        onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                                                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-slate-700">Client</label>
                                                    <select
                                                        value={projectForm.client}
                                                        onChange={(e) => setProjectForm({ ...projectForm, client: e.target.value })}
                                                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                                                        required
                                                    >
                                                        <option value="">Select client</option>
                                                        {clients.map((c) => (
                                                            <option key={c._id} value={c._id}>{c.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-slate-700">Project Manager</label>
                                                    <select
                                                        value={projectForm.manager}
                                                        onChange={(e) => setProjectForm({ ...projectForm, manager: e.target.value })}
                                                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                                                        required
                                                    >
                                                        <option value="">Select manager</option>
                                                        {managers.map((m) => (
                                                            <option key={m._id} value={m._id}>{m.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-slate-700">Start Date</label>
                                                    <input
                                                        type="date"
                                                        value={projectForm.startDate}
                                                        onChange={(e) => setProjectForm({ ...projectForm, startDate: e.target.value })}
                                                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-slate-700">End Date</label>
                                                    <input
                                                        type="date"
                                                        value={projectForm.endDate}
                                                        onChange={(e) => setProjectForm({ ...projectForm, endDate: e.target.value })}
                                                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-slate-700">Budget (₹)</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={projectForm.budget}
                                                        onChange={(e) => setProjectForm({ ...projectForm, budget: e.target.value })}
                                                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
                                                    <select
                                                        value={projectForm.status}
                                                        onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value as ProjectItem['status'] })}
                                                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                                                    >
                                                        <option value="Not Started">Not Started</option>
                                                        <option value="In Progress">In Progress</option>
                                                        <option value="Completed">Completed</option>
                                                        <option value="On Hold">On Hold</option>
                                                        <option value="Cancelled">Cancelled</option>
                                                    </select>
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
                                                    <textarea
                                                        value={projectForm.description}
                                                        onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                                                        rows={2}
                                                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <div className="mt-4 flex gap-3">
                                                <button
                                                    type="submit"
                                                    disabled={submitting}
                                                    className="rounded-2xl bg-violet-700 px-6 py-3 text-sm font-semibold text-white hover:bg-violet-800 disabled:opacity-60"
                                                >
                                                    {submitting ? 'Saving...' : editingProjectId ? 'Update Project' : 'Create Project'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowProjectForm(false);
                                                        setEditingProjectId(null);
                                                        setProjectForm(emptyProjectForm);
                                                    }}
                                                    className="rounded-2xl border border-slate-300 px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    )}

                                    <div className="mb-4 grid gap-4 md:grid-cols-4">
                                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                            <p className="text-sm text-slate-500">Total</p>
                                            <p className="mt-2 text-2xl font-semibold">{projects.length}</p>
                                        </div>
                                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                            <p className="text-sm text-slate-500">In Progress</p>
                                            <p className="mt-2 text-2xl font-semibold text-emerald-600">
                                                {projects.filter((p) => p.status === 'In Progress').length}
                                            </p>
                                        </div>
                                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                            <p className="text-sm text-slate-500">Completed</p>
                                            <p className="mt-2 text-2xl font-semibold text-sky-600">
                                                {projects.filter((p) => p.status === 'Completed').length}
                                            </p>
                                        </div>
                                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                            <p className="text-sm text-slate-500">Total Budget</p>
                                            <p className="mt-2 text-xl font-semibold">{formatCurrency(summary.totalBudget)}</p>
                                        </div>
                                    </div>

                                    {renderProjectTable(projects)}
                                </>
                            )}

                            {activeTab === 'tasks' && (
                                <>
                                    {showTaskForm && (
                                        <form onSubmit={handleTaskSubmit} className="mb-6 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-6">
                                            <h3 className="mb-4 text-lg font-semibold text-slate-900">
                                                {editingTaskId ? 'Edit Task' : 'Create Task'}
                                            </h3>
                                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-slate-700">Project</label>
                                                    <select
                                                        value={taskForm.project}
                                                        onChange={(e) => setTaskForm({ ...taskForm, project: e.target.value })}
                                                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                                                        required
                                                    >
                                                        <option value="">Select project</option>
                                                        {projects.map((p) => (
                                                            <option key={p._id} value={p._id}>{p.name} ({p.code})</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-slate-700">Title</label>
                                                    <input
                                                        value={taskForm.title}
                                                        onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                                                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-slate-700">Assigned To</label>
                                                    <select
                                                        value={taskForm.assignedTo}
                                                        onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                                                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                                                    >
                                                        <option value="">Unassigned</option>
                                                        {managers.map((m) => (
                                                            <option key={m._id} value={m._id}>{m.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
                                                    <select
                                                        value={taskForm.status}
                                                        onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value as TaskItem['status'] })}
                                                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                                                    >
                                                        <option value="To Do">To Do</option>
                                                        <option value="In Progress">In Progress</option>
                                                        <option value="Done">Done</option>
                                                        <option value="Blocked">Blocked</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-slate-700">Priority</label>
                                                    <select
                                                        value={taskForm.priority}
                                                        onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as TaskItem['priority'] })}
                                                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                                                    >
                                                        <option value="Low">Low</option>
                                                        <option value="Medium">Medium</option>
                                                        <option value="High">High</option>
                                                        <option value="Critical">Critical</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-slate-700">Due Date</label>
                                                    <input
                                                        type="date"
                                                        value={taskForm.dueDate}
                                                        onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                                                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                                                    />
                                                </div>
                                                <div className="sm:col-span-2 xl:col-span-3">
                                                    <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
                                                    <textarea
                                                        value={taskForm.description}
                                                        onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                                                        rows={2}
                                                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <div className="mt-4 flex gap-3">
                                                <button
                                                    type="submit"
                                                    disabled={submitting}
                                                    className="rounded-2xl bg-violet-700 px-6 py-3 text-sm font-semibold text-white hover:bg-violet-800 disabled:opacity-60"
                                                >
                                                    {submitting ? 'Saving...' : editingTaskId ? 'Update Task' : 'Create Task'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowTaskForm(false);
                                                        setEditingTaskId(null);
                                                        setTaskForm(emptyTaskForm);
                                                    }}
                                                    className="rounded-2xl border border-slate-300 px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    )}

                                    <div className="mb-4 grid gap-4 md:grid-cols-5">
                                        {(['total', 'todo', 'inProgress', 'done', 'blocked'] as const).map((key) => {
                                            const labels = { total: 'Total', todo: 'To Do', inProgress: 'In Progress', done: 'Done', blocked: 'Blocked' };
                                            const counts = {
                                                total: tasks.length,
                                                todo: tasks.filter((t) => t.status === 'To Do').length,
                                                inProgress: tasks.filter((t) => t.status === 'In Progress').length,
                                                done: tasks.filter((t) => t.status === 'Done').length,
                                                blocked: tasks.filter((t) => t.status === 'Blocked').length,
                                            };
                                            return (
                                                <div key={key} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                                    <p className="text-sm text-slate-500">{labels[key]}</p>
                                                    <p className="mt-2 text-2xl font-semibold">{counts[key]}</p>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="mb-4 flex flex-col gap-3 sm:flex-row">
                                        <input
                                            type="search"
                                            value={taskSearch}
                                            onChange={(e) => setTaskSearch(e.target.value)}
                                            placeholder="Search tasks..."
                                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none sm:w-80"
                                        />
                                        <select
                                            value={taskStatusFilter}
                                            onChange={(e) => setTaskStatusFilter(e.target.value)}
                                            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none sm:w-48"
                                        >
                                            <option value="All">All Status</option>
                                            <option value="To Do">To Do</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Done">Done</option>
                                            <option value="Blocked">Blocked</option>
                                        </select>
                                    </div>

                                    <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                                        <table className="min-w-full text-left text-sm text-slate-700">
                                            <thead>
                                                <tr className="border-b border-slate-200 text-slate-900">
                                                    <th className="px-4 py-3">Task</th>
                                                    <th className="px-4 py-3">Project</th>
                                                    <th className="px-4 py-3">Assigned To</th>
                                                    <th className="px-4 py-3">Priority</th>
                                                    <th className="px-4 py-3">Due Date</th>
                                                    <th className="px-4 py-3">Status</th>
                                                    <th className="px-4 py-3">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredTasks.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={7} className="px-4 py-8 text-center text-slate-500">No tasks found</td>
                                                    </tr>
                                                ) : (
                                                    filteredTasks.map((task) => (
                                                        <tr key={task._id} className="border-b border-slate-200 bg-white">
                                                            <td className="px-4 py-3">
                                                                <p className="font-medium text-slate-900">{task.title}</p>
                                                                {task.description && <p className="text-xs text-slate-500 line-clamp-1">{task.description}</p>}
                                                            </td>
                                                            <td className="px-4 py-3">{task.project?.name || '-'}</td>
                                                            <td className="px-4 py-3">{task.assignedTo?.name || 'Unassigned'}</td>
                                                            <td className="px-4 py-3">
                                                                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${priorityBadge(task.priority)}`}>
                                                                    {task.priority}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3">{formatDate(task.dueDate || '')}</td>
                                                            <td className="px-4 py-3">
                                                                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(task.status)}`}>
                                                                    {task.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex gap-2">
                                                                    <button type="button" onClick={() => handleEditTask(task)} className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-slate-200">
                                                                        <Pencil size={14} />
                                                                    </button>
                                                                    {canManage && (
                                                                        <button type="button" onClick={() => handleDeleteTask(task._id)} className="rounded-xl bg-rose-50 p-2 text-rose-600 hover:bg-rose-100">
                                                                            <Trash2 size={14} />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}

                            {activeTab === 'issues' && (
                                <>
                                    {showIssueForm && (
                                        <form onSubmit={handleIssueSubmit} className="mb-6 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-6">
                                            <h3 className="mb-4 text-lg font-semibold text-slate-900">
                                                {editingIssueId ? 'Edit Issue' : 'Report Issue'}
                                            </h3>
                                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-slate-700">Project</label>
                                                    <select
                                                        value={issueForm.project}
                                                        onChange={(e) => setIssueForm({ ...issueForm, project: e.target.value })}
                                                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                                                        required
                                                    >
                                                        <option value="">Select project</option>
                                                        {projects.map((p) => (
                                                            <option key={p._id} value={p._id}>{p.name} ({p.code})</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-slate-700">Title</label>
                                                    <input
                                                        value={issueForm.title}
                                                        onChange={(e) => setIssueForm({ ...issueForm, title: e.target.value })}
                                                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-slate-700">Assigned To</label>
                                                    <select
                                                        value={issueForm.assignedTo}
                                                        onChange={(e) => setIssueForm({ ...issueForm, assignedTo: e.target.value })}
                                                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                                                    >
                                                        <option value="">Unassigned</option>
                                                        {managers.map((m) => (
                                                            <option key={m._id} value={m._id}>{m.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-slate-700">Priority</label>
                                                    <select
                                                        value={issueForm.priority}
                                                        onChange={(e) => setIssueForm({ ...issueForm, priority: e.target.value as IssueItem['priority'] })}
                                                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                                                    >
                                                        <option value="Low">Low</option>
                                                        <option value="Medium">Medium</option>
                                                        <option value="High">High</option>
                                                        <option value="Critical">Critical</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
                                                    <select
                                                        value={issueForm.status}
                                                        onChange={(e) => setIssueForm({ ...issueForm, status: e.target.value as IssueItem['status'] })}
                                                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                                                    >
                                                        <option value="Open">Open</option>
                                                        <option value="In Progress">In Progress</option>
                                                        <option value="Resolved">Resolved</option>
                                                        <option value="Closed">Closed</option>
                                                    </select>
                                                </div>
                                                <div className="sm:col-span-2 xl:col-span-3">
                                                    <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
                                                    <textarea
                                                        value={issueForm.description}
                                                        onChange={(e) => setIssueForm({ ...issueForm, description: e.target.value })}
                                                        rows={2}
                                                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <div className="mt-4 flex gap-3">
                                                <button
                                                    type="submit"
                                                    disabled={submitting}
                                                    className="rounded-2xl bg-violet-700 px-6 py-3 text-sm font-semibold text-white hover:bg-violet-800 disabled:opacity-60"
                                                >
                                                    {submitting ? 'Saving...' : editingIssueId ? 'Update Issue' : 'Create Issue'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowIssueForm(false);
                                                        setEditingIssueId(null);
                                                        setIssueForm(emptyIssueForm);
                                                    }}
                                                    className="rounded-2xl border border-slate-300 px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    )}

                                    <div className="mb-4 grid gap-4 md:grid-cols-5">
                                        {(['total', 'open', 'inProgress', 'resolved', 'critical'] as const).map((key) => {
                                            const labels = { total: 'Total', open: 'Open', inProgress: 'In Progress', resolved: 'Resolved', critical: 'Critical' };
                                            const counts = {
                                                total: issues.length,
                                                open: issues.filter((i) => i.status === 'Open').length,
                                                inProgress: issues.filter((i) => i.status === 'In Progress').length,
                                                resolved: issues.filter((i) => i.status === 'Resolved').length,
                                                critical: issues.filter((i) => i.priority === 'Critical').length,
                                            };
                                            return (
                                                <div key={key} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                                    <p className="text-sm text-slate-500">{labels[key]}</p>
                                                    <p className="mt-2 text-2xl font-semibold">{counts[key]}</p>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="mb-4 flex flex-col gap-3 sm:flex-row">
                                        <input
                                            type="search"
                                            value={issueSearch}
                                            onChange={(e) => setIssueSearch(e.target.value)}
                                            placeholder="Search issues..."
                                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none sm:w-80"
                                        />
                                        <select
                                            value={issueStatusFilter}
                                            onChange={(e) => setIssueStatusFilter(e.target.value)}
                                            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none sm:w-48"
                                        >
                                            <option value="All">All Status</option>
                                            <option value="Open">Open</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Resolved">Resolved</option>
                                            <option value="Closed">Closed</option>
                                        </select>
                                    </div>

                                    <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                                        <table className="min-w-full text-left text-sm text-slate-700">
                                            <thead>
                                                <tr className="border-b border-slate-200 text-slate-900">
                                                    <th className="px-4 py-3">Issue</th>
                                                    <th className="px-4 py-3">Project</th>
                                                    <th className="px-4 py-3">Priority</th>
                                                    <th className="px-4 py-3">Assigned To</th>
                                                    <th className="px-4 py-3">Reported By</th>
                                                    <th className="px-4 py-3">Status</th>
                                                    <th className="px-4 py-3">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredIssues.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={7} className="px-4 py-8 text-center text-slate-500">No issues found</td>
                                                    </tr>
                                                ) : (
                                                    filteredIssues.map((issue) => (
                                                        <tr key={issue._id} className="border-b border-slate-200 bg-white">
                                                            <td className="px-4 py-3">
                                                                <p className="font-medium text-slate-900">{issue.title}</p>
                                                                {issue.description && <p className="text-xs text-slate-500 line-clamp-1">{issue.description}</p>}
                                                            </td>
                                                            <td className="px-4 py-3">{issue.project?.name || '-'}</td>
                                                            <td className="px-4 py-3">
                                                                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${priorityBadge(issue.priority)}`}>
                                                                    {issue.priority}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3">{issue.assignedTo?.name || 'Unassigned'}</td>
                                                            <td className="px-4 py-3">{issue.reportedBy?.name || '-'}</td>
                                                            <td className="px-4 py-3">
                                                                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(issue.status)}`}>
                                                                    {issue.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex gap-2">
                                                                    <button type="button" onClick={() => handleEditIssue(issue)} className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-slate-200">
                                                                        <Pencil size={14} />
                                                                    </button>
                                                                    {canManage && (
                                                                        <button type="button" onClick={() => handleDeleteIssue(issue._id)} className="rounded-xl bg-rose-50 p-2 text-rose-600 hover:bg-rose-100">
                                                                            <Trash2 size={14} />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            </main>
        </section>
    );
}

export default ProjectPage;
