const db = require('../utils/db');
const { successResponse, errorResponse } = require('../utils/helpers');

async function listServices(req, res) {
  try {
    // Map database fields to the expected frontend format
    const services = await db.query(`
      SELECT 
        id, 
        slug, 
        COALESCE(name, slug) as title, 
        description, 
        shortDescription,
        price, 
        discountPrice as discountedPrice, 
        features, 
        requirements,
        turnaroundDays,
        active, 
        category,
        createdAt,
        updatedAt
      FROM Service
      WHERE active = 1
      ORDER BY id
    `);
    
    // Parse features JSON for each service
    const formattedServices = services.map(svc => {
      let parsedFeatures = [];
      try {
        let featuresRaw = svc.features;
        // Handle Buffer from MySQL if necessary
        if (featuresRaw && typeof featuresRaw !== 'string' && Buffer.isBuffer(featuresRaw)) {
          featuresRaw = featuresRaw.toString('utf8');
        }
        
        if (featuresRaw && typeof featuresRaw === 'string') {
          parsedFeatures = JSON.parse(featuresRaw);
        } else if (Array.isArray(featuresRaw)) {
          parsedFeatures = featuresRaw;
        }
      } catch (e) {
        console.warn(`Failed to parse features for service ${svc.id}:`, e.message);
        parsedFeatures = [];
      }
      
      return {
        ...svc,
        features: parsedFeatures
      };
    });
    
    res.status(200).json(successResponse({ services: formattedServices }, 'Services fetched'));
  } catch (err) {
    console.error('List services error:', err);
    res.status(500).json(errorResponse(err.message));
  }
}

async function getService(req, res) {
  try {
    const { id } = req.params;
    
    // Map database fields to the expected frontend format
    const results = await db.query(`
      SELECT 
        id, 
        slug, 
        COALESCE(name, slug) as title, 
        description, 
        shortDescription,
        price, 
        discountPrice as discountedPrice, 
        features, 
        requirements,
        turnaroundDays,
        active, 
        category,
        createdAt,
        updatedAt
      FROM Service
      WHERE id = ? OR slug = ?
      LIMIT 1
    `, [id, id]);
    
    if (!results || results.length === 0) {
      return res.status(404).json(errorResponse('Service not found', 404));
    }
    
    const svc = results[0];
    
    // Parse features safely for response
    let parsedFeatures = [];
    try {
      let featuresRaw = svc.features;
      if (featuresRaw && typeof featuresRaw !== 'string' && Buffer.isBuffer(featuresRaw)) {
        featuresRaw = featuresRaw.toString('utf8');
      }
      
      if (featuresRaw && typeof featuresRaw === 'string') {
        parsedFeatures = JSON.parse(featuresRaw);
      } else if (Array.isArray(featuresRaw)) {
        parsedFeatures = featuresRaw;
      }
    } catch (e) {
      parsedFeatures = [];
    }
    
    const formattedService = {
      ...svc,
      features: parsedFeatures
    };
    
    res.status(200).json(successResponse({ service: formattedService }));
  } catch (err) {
    console.error('Get service error:', err);
    res.status(500).json(errorResponse(err.message));
  }
}

async function createService(req, res) {
  try {
    const { title, description, price, discountedPrice, features, slug, requirements } = req.body;

    const parsedPrice = Number(price) || 0;
    const parsedDiscountPrice = discountedPrice === undefined || discountedPrice === null || discountedPrice === ''
      ? 0
      : Number(discountedPrice);

    const serviceData = {
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: title,
      description: description || '',
      price: parsedPrice,
      discountPrice: parsedDiscountPrice,
      features: typeof features === 'string' ? features : JSON.stringify(features || []),
      requirements: requirements || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      active: 1
    };

    const result = await db.create('Service', serviceData);
    
    res.status(201).json(successResponse({ service: result }, 'Service created'));
  } catch (err) {
    console.error('Create service error:', err);
    res.status(500).json(errorResponse(err.message));
  }
}

async function updateService(req, res) {
  try {
    const { id } = req.params;
    const { 
      title, description, price, discountedPrice, 
      features, requirements, turnaroundDays, faqs 
    } = req.body;

    const updateData = {};
    if (title) updateData.name = title;
    if (description) updateData.description = description;
    if (requirements) updateData.requirements = requirements;
    
    if (price !== undefined) {
      const parsedPrice = Number(price);
      if (!Number.isNaN(parsedPrice)) updateData.price = parsedPrice;
    }

    if (discountedPrice !== undefined) {
      const parsedDiscountPrice = discountedPrice === null || discountedPrice === '' ? 0 : Number(discountedPrice);
      if (!Number.isNaN(parsedDiscountPrice)) updateData.discountPrice = parsedDiscountPrice;
    }

    if (turnaroundDays !== undefined) {
      const parsedDays = Number(turnaroundDays);
      if (!Number.isNaN(parsedDays)) updateData.turnaroundDays = parsedDays;
    }

    if (features) {
      updateData.features = typeof features === 'string' ? features : JSON.stringify(features);
    }

    if (faqs) {
      updateData.faqs = typeof faqs === 'string' ? faqs : JSON.stringify(faqs);
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json(errorResponse('No fields to update'));
    }

    updateData.updatedAt = new Date();
    
    await db.update('Service', updateData, { id });
    
    const updated = await db.findOne('Service', { id });
    if (!updated) {
      return res.status(404).json(errorResponse('Service not found after update'));
    }
    
    // Map back for response
    const formattedService = {
      ...updated,
      title: updated.name,
      discountedPrice: updated.discountPrice,
      features: typeof updated.features === 'string' ? JSON.parse(updated.features || '[]') : (updated.features || []),
      faqs: typeof updated.faqs === 'string' ? JSON.parse(updated.faqs || '[]') : (updated.faqs || [])
    };
    
    res.status(200).json(successResponse({ service: formattedService }, 'Service updated successfully'));
  } catch (err) {
    console.error('Update service error:', err);
    res.status(500).json(errorResponse(err.message));
  }
}

async function deleteService(req, res) {
  try {
    const { id } = req.params;
    
    // Instead of deleting, we can set active = 0 for safety
    await db.update('Service', { active: 0, updatedAt: new Date() }, { id });
    
    res.status(200).json(successResponse({}, 'Service deactivated'));
  } catch (err) {
    console.error('Delete service error:', err);
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
