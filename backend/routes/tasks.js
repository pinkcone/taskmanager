const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');

// Add new task
router.post('/', auth, async (req, res) => {
    const { title, description, dueDate, priority, category } = req.body;

    try {
        const taskData = {
            title,
            description,
            dueDate,
            priority,
            category,
            user: req.user.id
        };

        const task = new Task(taskData);
        await task.save();
        res.json(task);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Update task
router.put('/:id', auth, async (req, res) => {
    const { title, description, dueDate, priority, category, status } = req.body;

    try {
        let task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ msg: 'Task not found' });
        }

        if (task.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        task.title = title || task.title;
        task.description = description || task.description;
        task.dueDate = dueDate || task.dueDate;
        task.priority = priority || task.priority;
        task.category = category || task.category;
        task.status = status || task.status;
        task.notificationRead = false; // Reset notification read status

        task = await task.save();
        res.json(task);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ msg: 'Task not found' });
        }

        if (task.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await Task.deleteOne({ _id: req.params.id });
        res.json({ msg: 'Task removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get notifications
router.get('/notifications', auth, async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user.id });
        const today = new Date();
        const notifications = tasks.filter(task => {
            const dueDate = new Date(task.dueDate);
            return (dueDate.getTime() - today.getTime() < 24 * 60 * 60 * 1000 &&
                   task.status !== 'Zakończone') || (dueDate.getTime() < today.getTime() && task.status !== 'Zakończone');
        }).map(task => ({
            _id: task._id, // Ensure we are using the task's ID here
            title: task.title,
            description: task.description,
            dueDate: task.dueDate,
            notificationRead: task.notificationRead
        }));
        res.json(notifications);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// Mark notification as read
router.put('/notifications/:id/read', auth, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ msg: 'Task not found' });
        }
        task.notificationRead = true;
        await task.save();
        res.json(task);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get task by ID (note: placed after more specific routes)
router.get('/:id', auth, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ msg: 'Task not found' });
        }

        res.json(task);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get all tasks
router.get('/', auth, async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user.id });
        res.json(tasks);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
