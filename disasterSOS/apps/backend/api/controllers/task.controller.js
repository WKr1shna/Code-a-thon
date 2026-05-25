const Task = require('../models/Task.model');
const Volunteer = require('../models/Volunteer.model');
const admin = require('../config/firebase');

exports.createTask = async (req, res, next) => {
  try {
    const { title, description, priority, alertId, volunteerId } = req.body;
    if (!title || !description || !alertId || !volunteerId) {
      return res.status(400).json({ success: false, message: 'Missing required task fields' });
    }

    const volunteer = await Volunteer.findById(volunteerId).populate('userId');
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Assigned volunteer not found' });
    }

    const task = new Task({
      title,
      description,
      priority: priority || 'LOW',
      alertId,
      assignedTo: volunteerId,
      createdBy: req.user._id
    });

    await task.save();

    // Notify volunteer via FCM push notifications
    if (volunteer.userId && volunteer.userId.fcmTokens && volunteer.userId.fcmTokens.length > 0) {
      try {
        const payload = {
          notification: {
            title: `New Task Assigned: ${task.title}`,
            body: task.description
          },
          data: {
            taskId: task._id.toString(),
            priority: task.priority
          }
        };

        const messaging = admin.messaging();
        for (const token of volunteer.userId.fcmTokens) {
          await messaging.send({ token, ...payload }).catch(err => console.error('FCM single token delivery failed:', err.message));
        }
      } catch (fcmErr) {
        console.error('FCM task alert failed:', fcmErr.message);
      }
    }

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

exports.getTasks = async (req, res, next) => {
  try {
    const { alertId, status, assignedTo, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (alertId) filter.alertId = alertId;
    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const total = await Task.countDocuments(filter);
    const tasks = await Task.find(filter)
      .populate('alertId')
      .populate({
        path: 'assignedTo',
        populate: { path: 'userId', select: 'name phone email' }
      })
      .populate('createdBy', 'name phone role')
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({
      success: true,
      data: tasks,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    next(error);
  }
};

exports.getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('alertId')
      .populate({
        path: 'assignedTo',
        populate: { path: 'userId', select: 'name phone email' }
      })
      .populate('createdBy', 'name phone role');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    Object.assign(task, req.body);
    await task.save();

    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

exports.updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['open', 'accepted', 'in-progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid task status' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task.status = status;
    await task.save();

    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};
