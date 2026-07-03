import Project from '../models/Project.js';
import Client from '../models/Client.js';
import User from '../models/User.js';
import Task from '../models/Task.js';
import Issue from '../models/Issue.js';

const generateProjectCode = async () => {
    const count = await Project.countDocuments();
    return `PRJ-${String(count + 1).padStart(4, '0')}`;
};

const projectPopulate = [
    { path: 'client', select: 'name company email phone' },
    { path: 'manager', select: 'name email role profilePicture' },
    { path: 'createdBy', select: 'name email' },
];

export const getProjectOverview = async (req, res) => {
    try {
        const projects = await Project.find().populate('client', 'name').populate('manager', 'name');

        const total = projects.length;
        const active = projects.filter((p) => p.status === 'In Progress').length;
        const completed = projects.filter((p) => p.status === 'Completed').length;
        const onHold = projects.filter((p) => p.status === 'On Hold').length;
        const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);

        const statusDistribution = [
            'Not Started',
            'In Progress',
            'Completed',
            'On Hold',
            'Cancelled',
        ].map((status) => ({
            status,
            count: projects.filter((p) => p.status === status).length,
        }));

        const now = new Date();
        const thirtyDaysLater = new Date(now);
        thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

        const dueSoon = projects
            .filter(
                (p) =>
                    p.endDate &&
                    p.status !== 'Completed' &&
                    p.status !== 'Cancelled' &&
                    new Date(p.endDate) >= now &&
                    new Date(p.endDate) <= thirtyDaysLater
            )
            .sort((a, b) => new Date(a.endDate) - new Date(b.endDate))
            .slice(0, 5)
            .map((p) => ({
                _id: p._id,
                name: p.name,
                code: p.code,
                endDate: p.endDate,
                daysLeft: Math.ceil((new Date(p.endDate) - now) / (1000 * 60 * 60 * 24)),
            }));

        const managerMap = {};
        projects.forEach((p) => {
            if (!p.manager) return;
            const id = String(p.manager._id);
            if (!managerMap[id]) {
                managerMap[id] = { _id: p.manager._id, name: p.manager.name, count: 0 };
            }
            managerMap[id].count += 1;
        });
        const topManagers = Object.values(managerMap)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        res.json({
            summary: { total, active, completed, onHold, totalBudget },
            statusDistribution,
            dueSoon,
            topManagers,
        });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to load project overview' });
    }
};

export const getProjects = async (req, res) => {
    try {
        const { status, clientId, managerId, search, startDate, endDate } = req.query;
        const filter = {};

        if (status) filter.status = status;
        if (clientId) filter.client = clientId;
        if (managerId) filter.manager = managerId;

        if (startDate || endDate) {
            filter.startDate = {};
            if (startDate) filter.startDate.$gte = new Date(startDate);
            if (endDate) filter.startDate.$lte = new Date(endDate);
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { code: { $regex: search, $options: 'i' } },
            ];
        }

        const projects = await Project.find(filter)
            .populate(projectPopulate)
            .sort({ createdAt: -1 });

        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to load projects' });
    }
};

export const getProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id).populate(projectPopulate);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.json(project);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to load project' });
    }
};

export const createProject = async (req, res) => {
    try {
        const { name, code, client, manager, startDate, endDate, budget, status, description } =
            req.body;

        if (!name?.trim()) {
            return res.status(400).json({ message: 'Project name is required' });
        }
        if (!client) {
            return res.status(400).json({ message: 'Client is required' });
        }
        if (!manager) {
            return res.status(400).json({ message: 'Project manager is required' });
        }
        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Start and end dates are required' });
        }

        const clientExists = await Client.findById(client);
        if (!clientExists) {
            return res.status(400).json({ message: 'Selected client does not exist' });
        }

        const managerExists = await User.findById(manager);
        if (!managerExists) {
            return res.status(400).json({ message: 'Selected manager does not exist' });
        }

        const generatedCode = code?.trim() || (await generateProjectCode());

        const project = await Project.create({
            name: name.trim(),
            code: generatedCode,
            client,
            manager,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            budget: Number(budget) || 0,
            status: status || 'Not Started',
            description: description?.trim() || '',
            createdBy: req.get('x-user-id') || null,
        });

        const populated = await Project.findById(project._id).populate(projectPopulate);
        res.status(201).json({ message: 'Project created successfully', project: populated });
    } catch (error) {
        if (error.code === 11000 && error.keyPattern?.code) {
            return res.status(409).json({ message: 'Project code already exists' });
        }
        res.status(500).json({ message: error.message || 'Failed to create project' });
    }
};

export const updateProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const { name, client, manager, startDate, endDate, budget, status, description } =
            req.body;

        if (name !== undefined) project.name = name.trim();
        if (description !== undefined) project.description = description?.trim() || '';

        if (client && client !== String(project.client)) {
            const clientExists = await Client.findById(client);
            if (!clientExists) {
                return res.status(400).json({ message: 'Selected client does not exist' });
            }
            project.client = client;
        }

        if (manager && manager !== String(project.manager)) {
            const managerExists = await User.findById(manager);
            if (!managerExists) {
                return res.status(400).json({ message: 'Selected manager does not exist' });
            }
            project.manager = manager;
        }

        if (startDate) project.startDate = new Date(startDate);
        if (endDate) project.endDate = new Date(endDate);
        if (budget !== undefined) project.budget = Number(budget) || 0;
        if (status) project.status = status;

        await project.save();
        const populated = await Project.findById(project._id).populate(projectPopulate);
        res.json({ message: 'Project updated successfully', project: populated });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to update project' });
    }
};

export const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        await Task.deleteMany({ project: project._id });
        await Issue.deleteMany({ project: project._id });
        await Project.findByIdAndDelete(req.params.id);

        res.json({ message: 'Project and related data deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to delete project' });
    }
};

export const getClients = async (req, res) => {
    try {
        const clients = await Client.find().sort({ name: 1 });
        res.json(clients);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to load clients' });
    }
};

export const createClient = async (req, res) => {
    try {
        const { name, email, phone, company } = req.body;
        if (!name?.trim()) {
            return res.status(400).json({ message: 'Client name is required' });
        }
        const client = await Client.create({
            name: name.trim(),
            email: email?.trim() || '',
            phone: phone?.trim() || '',
            company: company?.trim() || '',
        });
        res.status(201).json({ message: 'Client created successfully', client });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to create client' });
    }
};

export const getProjectManagers = async (req, res) => {
    try {
        const managers = await User.find({
            role: { $in: ['Admin', 'Manager'] },
        }).select('name email role profilePicture');
        res.json(managers);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to load managers' });
    }
};
