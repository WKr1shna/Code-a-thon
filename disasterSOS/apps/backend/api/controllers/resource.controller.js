const Resource = require('../models/Resource.model');
const admin = require('../config/firebase');

exports.getResources = async (req, res, next) => {
  try {
    const { type, isActive, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (isActive) filter.isActive = isActive === 'true';

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const total = await Resource.countDocuments(filter);
    const resources = await Resource.find(filter)
      .populate('managedBy', 'name phone email role')
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({
      success: true,
      data: resources,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    next(error);
  }
};

exports.getNearbyResources = async (req, res, next) => {
  try {
    const { lat, lng, radius = 10, type } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Latitude and Longitude are required' });
    }

    const filter = {};
    if (type) filter.type = type;

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

    const resources = await Resource.find(filter).populate('managedBy', 'name phone');
    res.json({ success: true, data: resources });
  } catch (error) {
    next(error);
  }
};

exports.getResourceTypes = async (req, res, next) => {
  try {
    const types = ['shelter', 'food', 'medical', 'water', 'rescue'];
    res.json({ success: true, data: types });
  } catch (error) {
    next(error);
  }
};

exports.getResourceById = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id).populate('managedBy', 'name phone email');
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }
    res.json({ success: true, data: resource });
  } catch (error) {
    next(error);
  }
};

exports.createResource = async (req, res, next) => {
  try {
    const { name, type, location, address, contactPhone, totalCapacity } = req.body;
    if (!name || !type || !location || !location.lat || !location.lng || !address || !contactPhone || !totalCapacity) {
      return res.status(400).json({ success: false, message: 'Missing required resource fields' });
    }

    const resource = new Resource({
      name,
      type,
      location: {
        type: 'Point',
        coordinates: [parseFloat(location.lng), parseFloat(location.lat)]
      },
      address,
      contactPhone,
      totalCapacity,
      availableCapacity: totalCapacity,
      managedBy: req.user._id
    });

    await resource.save();

    res.status(201).json({ success: true, data: resource });
  } catch (error) {
    next(error);
  }
};

exports.updateResourceCapacity = async (req, res, next) => {
  try {
    const { availableCapacity } = req.body;
    if (availableCapacity === undefined) {
      return res.status(400).json({ success: false, message: 'availableCapacity is required' });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    resource.availableCapacity = availableCapacity;
    await resource.save();

    // Broadcast capacity update via Firebase Realtime Database
    try {
      const db = admin.database();
      await db.ref(`/resources/${resource._id}`).set({
        name: resource.name,
        type: resource.type,
        availableCapacity: resource.availableCapacity,
        totalCapacity: resource.totalCapacity,
        updatedAt: Date.now()
      });
    } catch (firebaseErr) {
      console.error('Firebase capacity broadcast failed:', firebaseErr.message);
    }

    res.json({ success: true, data: resource });
  } catch (error) {
    next(error);
  }
};

exports.updateResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    const updates = req.body;
    if (updates.location && updates.location.lat && updates.location.lng) {
      updates.location = {
        type: 'Point',
        coordinates: [parseFloat(updates.location.lng), parseFloat(updates.location.lat)]
      };
    }

    Object.assign(resource, updates);
    await resource.save();

    res.json({ success: true, data: resource });
  } catch (error) {
    next(error);
  }
};

exports.deleteResource = async (req, res, next) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }
    res.json({ success: true, message: 'Resource deleted successfully' });
  } catch (error) {
    next(error);
  }
};
