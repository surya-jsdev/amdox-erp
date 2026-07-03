import Task from '../models/Task.js';
import Project from '../models/Project.js';

export const recalculateProjectProgress = async (projectId) => {
    const tasks = await Task.find({ project: projectId });
    if (tasks.length === 0) {
        await Project.findByIdAndUpdate(projectId, { progressPercentage: 0 });
        return 0;
    }
    const completed = tasks.filter((t) => t.status === 'Done').length;
    const progress = Math.round((completed / tasks.length) * 100);
    await Project.findByIdAndUpdate(projectId, { progressPercentage: progress });
    return progress;
};
