import Task from '../models/Task.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { recalculateProjectProgress } from '../utils/projectProgress.js';

const taskPopulate = [
    { path: 'project', select: 'name code status' },
    { path: 'assignedTo', select: 'name email role profilePicture' },
    { path: 'createdBy', select: 'name email' },
];

export const getTasks = async (req, res) => {
    try {
        const { projectId, status, priority, search, assignedTo } = req.query;
        const filter = {};

        if (projectId) filter.project = projectId;
        if (status) filter.status = status;
        if (priority) filter.priority = priority;
        if (assignedTo) filter.assignedTo = assignedTo;

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        const tasks = await Task.find(filter).populate(taskPopulate).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to load tasks' });
    }
};

export const getTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id).populate(taskPopulate);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to load task' });
    }
};

export const createTask = async (req, res) => {
    try {
        const { project, title, description, status, priority, assignedTo, dueDate } = req.body;

        if (!project) {
            return res.status(400).json({ message: 'Project is required' });
        }
        if (!title?.trim()) {
            return res.status(400).json({ message: 'Task title is required' });
        }

        const projectExists = await Project.findById(project);
        if (!projectExists) {
            return res.status(400).json({ message: 'Selected project does not exist' });
        }

        if (assignedTo) {
            const userExists = await User.findById(assignedTo);
            if (!userExists) {
                return res.status(400).json({ message: 'Assigned user does not exist' });
            }
        }

        const task = await Task.create({
            project,
            title: title.trim(),
            description: description?.trim() || '',
            status: status || 'To Do',
            priority: priority || 'Medium',
            assignedTo: assignedTo || null,
            dueDate: dueDate ? new Date(dueDate) : null,
            createdBy: req.get('x-user-id') || null,
        });

        await recalculateProjectProgress(project);

        const populated = await Task.findById(task._id).populate(taskPopulate);
        res.status(201).json({ message: 'Task created successfully', task: populated });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to create task' });
    }
};

export const updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const { project, title, description, status, priority, assignedTo, dueDate } = req.body;

        if (project && project !== String(task.project)) {
            const projectExists = await Project.findById(project);
            if (!projectExists) {
                return res.status(400).json({ message: 'Selected project does not exist' });
            }
            task.project = project;
        }

        if (title !== undefined) task.title = title.trim();
        if (description !== undefined) task.description = description?.trim() || '';
        if (status) task.status = status;
        if (priority) task.priority = priority;

        if (assignedTo !== undefined) {
            if (assignedTo) {
                const userExists = await User.findById(assignedTo);
                if (!userExists) {
                    return res.status(400).json({ message: 'Assigned user does not exist' });
                }
            }
            task.assignedTo = assignedTo || null;
        }

        if (dueDate !== undefined) {
            task.dueDate = dueDate ? new Date(dueDate) : null;
        }

        const previousProjectId = task.project;
        await task.save();

        await recalculateProjectProgress(task.project);
        if (project && String(previousProjectId) !== String(task.project)) {
            await recalculateProjectProgress(previousProjectId);
        }

        const populated = await Task.findById(task._id).populate(taskPopulate);
        res.json({ message: 'Task updated successfully', task: populated });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to update task' });
    }
};

export const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const projectId = task.project;
        await Task.findByIdAndDelete(req.params.id);
        await recalculateProjectProgress(projectId);

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to delete task' });
    }
};

export const getTaskStats = async (req, res) => {
    try {
        const tasks = await Task.find();
        res.json({
            total: tasks.length,
            todo: tasks.filter((t) => t.status === 'To Do').length,
            inProgress: tasks.filter((t) => t.status === 'In Progress').length,
            done: tasks.filter((t) => t.status === 'Done').length,
            blocked: tasks.filter((t) => t.status === 'Blocked').length,
        });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to load task stats' });
    }
};
