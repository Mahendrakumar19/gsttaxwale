const db = require('../utils/db');
const { successResponse, errorResponse } = require('../utils/helpers');

async function listServices(req, res) {
  try {
    const services = await db.findMany('Service', {}, 0);
    
    // Parse features JSON for each service
    const formattedServices = services.map(svc => ({
      ...svc,
      features: typeof svc.features === 'string' ? JSON.parse(svc.features) : svc.features
    }));
    
    res.status(200).json(successResponse({ services: formattedServices }, 'Services fetched'));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
}

async function getService(req, res) {
  try {
    const { id } = req.params;
    
    // Try to find by ID first, then by slug
    let svc = await db.findOne('Service', { id });
    if (!svc) {
      svc = await db.findOne('Service', { slug: id });
    }
    
    if (!svc) return res.status(404).json(errorResponse('Service not found', 404));
    
    // Parse features JSON
    const formattedService = {
      ...svc,
      features: typeof svc.features === 'string' ? JSON.parse(svc.features) : svc.features
    };
    
    res.status(200).json(successResponse({ service: formattedService }));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
}

async function createService(req, res) {
  try {
    const { title, description, price, features, slug } = req.body;
    
    const serviceData = {
      id: require('uuid').v4(),
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title,
      description: description || '',
      price: Number(price) || 0,
      features: typeof features === 'string' ? features : JSON.stringify(features || []),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.create('Service', serviceData);
    
    // Parse features for response
    const formattedService = {
      ...serviceData,
      features: JSON.parse(serviceData.features)
    };
    
    res.status(201).json(successResponse({ service: formattedService }, 'Service created'));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
}

async function updateService(req, res) {
  try {
    const { id } = req.params;
    const { title, description, price, features } = req.body;
    
    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (price !== undefined) updateData.price = Number(price);
    if (features) updateData.features = typeof features === 'string' ? features : JSON.stringify(features);
    
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json(errorResponse('No fields to update'));
    }
    
    await db.update('Service', updateData, { id });
    
    const updated = await db.findOne('Service', { id });
    
    // Parse features for response
    const formattedService = {
      ...updated,
      features: JSON.parse(updated.features)
    };
    
    res.status(200).json(successResponse({ service: formattedService }, 'Service updated'));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
}

async function deleteService(req, res) {
  try {
    const { id } = req.params;
    
    await db.deleteRecord('Service', { id });
    
    res.status(200).json(successResponse({}, 'Service deleted'));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
}

module.exports = {
  listServices,
  getService,
  createService,
  updateService,
  deleteService,
};
