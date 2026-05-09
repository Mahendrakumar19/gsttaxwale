const db = require('../utils/db');
const { successResponse, errorResponse } = require('../utils/helpers');

/**
 * Get all service pricing (using Service table fields)
 */
async function getServicePricing(req, res) {
  try {
    const pricings = await db.query(`
      SELECT 
        id as service_id, 
        name as title, 
        description, 
        price as slash_price, 
        discountPrice as discount_price
      FROM Service
      WHERE active = 1
      ORDER BY id
    `);

    return res.status(200).json(
      successResponse('Service pricing retrieved', {
        pricings: pricings || [],
      })
    );
  } catch (error) {
    console.error('❌ Get pricing error:', error);
    return res.status(500).json(errorResponse('Failed to get service pricing'));
  }
}

/**
 * Get pricing for a specific service
 */
async function getServicePrice(req, res) {
  const { serviceId } = req.params;

  try {
    const results = await db.query(
      `SELECT 
         id as service_id, 
         name as title, 
         price as slash_price, 
         discountPrice as discount_price
       FROM Service
       WHERE id = ? OR slug = ?`,
      [serviceId, serviceId]
    );

    if (!results.length) {
      return res.status(404).json(errorResponse('Service not found'));
    }

    const pricing = results[0];
    return res.status(200).json(
      successResponse('Service price retrieved', {
        serviceId: pricing.service_id,
        title: pricing.title,
        slash_price: pricing.slash_price,
        discount_price: pricing.discount_price,
      })
    );
  } catch (error) {
    console.error('❌ Get service price error:', error);
    return res.status(500).json(errorResponse('Failed to get service price'));
  }
}

/**
 * Create or update service pricing (Admin only)
 * In this schema, we update the Service table directly
 */
async function setServicePricing(req, res) {
  const { serviceId, slash_price, discount_price } = req.body;

  if (!serviceId || discount_price === undefined) {
    return res.status(400).json(
      errorResponse('Missing required fields: serviceId, discount_price')
    );
  }

  try {
    // Verify service exists
    const existing = await db.findOne('Service', { id: serviceId });

    if (!existing) {
      return res.status(404).json(errorResponse('Service not found'));
    }

    // Update Service table
    const updateData = {
      price: slash_price || existing.price,
      discountPrice: discount_price,
      updatedAt: new Date()
    };

    await db.update('Service', updateData, { id: serviceId });

    console.log(`✅ Service pricing updated | Service: ${serviceId} | Price: ₹${updateData.price} | Discount: ₹${discount_price}`);

    return res.status(200).json(
      successResponse('Service pricing updated', {
        serviceId,
        slash_price: updateData.price,
        discount_price,
      })
    );
  } catch (error) {
    console.error('❌ Set pricing error:', error);
    return res.status(500).json(errorResponse('Failed to set service pricing'));
  }
}

/**
 * Remove pricing discount (set discountPrice equal to price)
 */
async function removePricing(req, res) {
  const { serviceId } = req.params;

  try {
    const existing = await db.findOne('Service', { id: serviceId });
    if (!existing) {
      return res.status(404).json(errorResponse('Service not found'));
    }

    await db.update('Service', { 
      discountPrice: existing.price,
      updatedAt: new Date() 
    }, { id: serviceId });

    console.log(`✅ Service pricing reset | Service: ${serviceId}`);

    return res.status(200).json(successResponse('Service pricing reset to original'));
  } catch (error) {
    console.error('❌ Remove pricing error:', error);
    return res.status(500).json(errorResponse('Failed to remove service pricing'));
  }
}

/**
 * Get active pricing for frontend display
 */
async function getActivePricing(req, res) {
  try {
    const pricings = await db.query(`
      SELECT 
        id as serviceId, 
        price as slash_price, 
        discountPrice as discount_price, 
        name as title, 
        description
      FROM Service
      WHERE active = 1
    `);

    return res.status(200).json(
      successResponse('Active pricing retrieved', {
        pricing: pricings || [],
      })
    );
  } catch (error) {
    console.error('❌ Get active pricing error:', error);
    return res.status(500).json(errorResponse('Failed to get active pricing'));
  }
}

module.exports = {
  getServicePricing,
  getServicePrice,
  setServicePricing,
  removePricing,
  getActivePricing,
};
