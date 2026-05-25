const Volunteer = require('../models/Volunteer.model');
const Task = require('../models/Task.model');

exports.registerVolunteer = async (req, res, next) => {
  try {
    const { skills, location } = req.body;
    if (!location || !location.lat || !location.lng) {
      return res.status(400).json({ success: false, message: 'Location with lat/lng coordinates is required' });
    }

    let volunteer = await Volunteer.findOne({ userId: req.user._id });
    if (volunteer) {
      return res.status(400).json({ success: false, message: 'You are already registered as a volunteer' });
    }

    volunteer = new Volunteer({
      userId: req.user._id,
      skills: skills || [],
      location: {
        type: 'Point',
        coordinates: [parseFloat(location.lng), parseFloat(location.lat)]
      }
    });

    await volunteer.save();

    res.status(201).json({ success: true, data: volunteer });
  } catch (error) {
    next(error);
  }
};

exports.getVolunteers = async (req, res, next) => {
  try {
    const { status, skill, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (skill) filter.skills = skill;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const total = await Volunteer.countDocuments(filter);
    const volunteers = await Volunteer.find(filter)
      .populate('userId', 'name phone email role district')
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({
      success: true,
      data: volunteers,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    next(error);
  }
};

exports.getNearbyVolunteers = async (req, res, next) => {
  try {
    const { lat, lng, radius = 20, skill } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Latitude and Longitude are required' });
    }

    const filter = {};
    if (skill) filter.skills = skill;

    const radiusInMeters = parseFloat(radius) * 1000;
    filter.location = {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)]
        },
        $maxDistance: radiusInMeters
      }
    };

    const volunteers = await Volunteer.find(filter).populate('userId', 'name phone email');
    res.json({ success: true, data: volunteers });
  } catch (error) {
    next(error);
  }
};

exports.getMyTasks = async (req, res, next) => {
  try {
    const volunteer = await Volunteer.findOne({ userId: req.user._id });
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer profile not found for this user' });
    }

    const tasks = await Task.find({ assignedTo: volunteer._id })
      .populate('alertId')
      .populate('createdBy', 'name phone role');

    res.json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
};

exports.getVolunteerById = async (req, res, next) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id).populate('userId', 'name phone email role district');
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer not found' });
    }
    res.json({ success: true, data: volunteer });
  } catch (error) {
    next(error);
  }
};

exports.updateVolunteerStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['available', 'deployed', 'resting', 'unavailable'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid volunteer status value' });
    }

    const volunteer = await Volunteer.findById(req.params.id);
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer not found' });
    }

    volunteer.status = status;
    await volunteer.save();

    res.json({ success: true, data: volunteer });
  } catch (error) {
    next(error);
  }
};

exports.updateMyTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'in-progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid task status value' });
    }

    const volunteer = await Volunteer.findOne({ userId: req.user._id });
    if (!volunteer) {
      return res.status(403).json({ success: false, message: 'You are not registered as a volunteer' });
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.taskId, assignedTo: volunteer._id },
      { status },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found or not assigned to you' });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};
