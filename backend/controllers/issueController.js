import Issue from '../models/Issue.js';
import Project from '../models/Project.js';
import User from '../models/User.js';

const issuePopulate = [
    { path: 'project', select: 'name code status' },
    { path: 'reportedBy', select: 'name email role profilePicture' },
    { path: 'assignedTo', select: 'name email role profilePicture' },
];

export const getIssues = async (req, res) => {
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

        const issues = await Issue.find(filter).populate(issuePopulate).sort({ createdAt: -1 });
        res.json(issues);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to load issues' });
    }
};

export const getIssue = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id).populate(issuePopulate);
        if (!issue) {
            return res.status(404).json({ message: 'Issue not found' });
        }
        res.json(issue);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to load issue' });
    }
};

export const createIssue = async (req, res) => {
    try {
        const { project, title, description, priority, status, assignedTo } = req.body;

        if (!project) {
            return res.status(400).json({ message: 'Project is required' });
        }
        if (!title?.trim()) {
            return res.status(400).json({ message: 'Issue title is required' });
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

        const issue = await Issue.create({
            project,
            title: title.trim(),
            description: description?.trim() || '',
            priority: priority || 'Medium',
            status: status || 'Open',
            assignedTo: assignedTo || null,
            reportedBy: req.get('x-user-id') || null,
        });

        const populated = await Issue.findById(issue._id).populate(issuePopulate);
        res.status(201).json({ message: 'Issue created successfully', issue: populated });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to create issue' });
    }
};

export const updateIssue = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);
        if (!issue) {
            return res.status(404).json({ message: 'Issue not found' });
        }

        const { project, title, description, priority, status, assignedTo } = req.body;

        if (project && project !== String(issue.project)) {
            const projectExists = await Project.findById(project);
            if (!projectExists) {
                return res.status(400).json({ message: 'Selected project does not exist' });
            }
            issue.project = project;
        }

        if (title !== undefined) issue.title = title.trim();
        if (description !== undefined) issue.description = description?.trim() || '';
        if (priority) issue.priority = priority;
        if (status) issue.status = status;

        if (assignedTo !== undefined) {
            if (assignedTo) {
                const userExists = await User.findById(assignedTo);
                if (!userExists) {
                    return res.status(400).json({ message: 'Assigned user does not exist' });
                }
            }
            issue.assignedTo = assignedTo || null;
        }

        await issue.save();
        const populated = await Issue.findById(issue._id).populate(issuePopulate);
        res.json({ message: 'Issue updated successfully', issue: populated });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to update issue' });
    }
};

export const deleteIssue = async (req, res) => {
    try {
        const deleted = await Issue.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Issue not found' });
        }
        res.json({ message: 'Issue deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to delete issue' });
    }
};

export const getIssueStats = async (req, res) => {
    try {
        const issues = await Issue.find();
        res.json({
            total: issues.length,
            open: issues.filter((i) => i.status === 'Open').length,
            inProgress: issues.filter((i) => i.status === 'In Progress').length,
            resolved: issues.filter((i) => i.status === 'Resolved').length,
            closed: issues.filter((i) => i.status === 'Closed').length,
            critical: issues.filter((i) => i.priority === 'Critical').length,
        });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to load issue stats' });
    }
};
