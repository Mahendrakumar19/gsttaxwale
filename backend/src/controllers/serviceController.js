const { PrismaClient } = require('@prisma/client');
const { successResponse, errorResponse } = require('../utils/helpers');

const prisma = new PrismaClient();

async function listServices(req, res) {
  try {
    const services = await prisma.service.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
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
    const svc = await prisma.service.findFirst({
      where: {
        OR: [
          { id: id },
          { slug: id }
        ]
      }
    });
    
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
    
    const newSvc = await prisma.service.create({
      data: {
        slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        title,
        description: description || '',
        price: Number(price) || 0,
        features: typeof features === 'string' ? features : JSON.stringify(features || []),
      }
    });
    
    // Parse features for response
    const formattedService = {
      ...newSvc,
      features: JSON.parse(newSvc.features)
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
    
    const updated = await prisma.service.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(price !== undefined && { price: Number(price) }),
        ...(features && { features: typeof features === 'string' ? features : JSON.stringify(features) }),
      }
    });
    
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
    
    await prisma.service.delete({
      where: { id }
    });
    
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
