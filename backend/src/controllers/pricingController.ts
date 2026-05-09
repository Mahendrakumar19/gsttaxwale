import db from '../utils/db';
import { successResponse, errorResponse } from '../utils/helpers';

/**
 * Get all service pricing (with slash prices)
 */
async function getServicePricing(req, res) {
  try {
    const [pricings] = await db.query(`
      SELECT sp.*, s.title, s.description, s.price as original_price
      FROM service_pricing sp
      LEFT JOIN services s ON sp.service_id = s.id
      ORDER BY sp.service_id
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
    const [pricings] = await db.query(
      `SELECT sp.*, s.title, s.price as original_price
       FROM service_pricing sp
       LEFT JOIN services s ON sp.service_id = s.id
       WHERE sp.service_id = ?`,
      [serviceId]
    );

    if (!pricings.length) {
      // Return default pricing if no custom pricing exists
      const [services] = await db.query('SELECT id, title, price FROM services WHERE id = ?', [
        serviceId,
      ]);

      if (!services.length) {
        return res.status(404).json(errorResponse('Service not found'));
      }

      const service = services[0];
      return res.status(200).json(
        successResponse('Service price retrieved', {
          serviceId: service.id,
          title: service.title,
          original_price: service.price,
          slash_price: null,
          discount_price: service.price,
        })
      );
    }

    const pricing = pricings[0];
    return res.status(200).json(
      successResponse('Service price retrieved', {
        serviceId: pricing.service_id,
        title: pricing.title,
        original_price: pricing.original_price,
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
 * slash_price: the original price to show with strikethrough
 * discount_price: the new discounted price
 */
async function setServicePricing(req, res) {
  const { serviceId, slash_price, discount_price } = req.body;

  if (!serviceId || discount_price === undefined) {
    return res.status(400).json(
      errorResponse('Missing required fields: serviceId, discount_price, slash_price')
    );
  }

  try {
    // Verify service exists
    const [services] = await db.query('SELECT id, price FROM services WHERE id = ?', [serviceId]);

    if (!services.length) {
      return res.status(404).json(errorResponse('Service not found'));
    }

    const service = services[0];
    const finalSlashPrice = slash_price || service.price;

    // Insert or update pricing
    const [result] = await db.query(
      `INSERT INTO service_pricing (service_id, slash_price, discount_price, updated_by, updated_at)
       VALUES (?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE
         slash_price = ?,
         discount_price = ?,
         updated_by = ?,
         updated_at = NOW()`,
      [serviceId, finalSlashPrice, discount_price, req.user.id, finalSlashPrice, discount_price, req.user.id]
    );

    console.log(`✅ Service pricing updated | Service: ${serviceId} | Slash: ₹${finalSlashPrice} | Discount: ₹${discount_price}`);

    return res.status(200).json(
      successResponse('Service pricing updated', {
        serviceId,
        slash_price: finalSlashPrice,
        discount_price,
      })
    );
  } catch (error) {
    console.error('❌ Set pricing error:', error);
    return res.status(500).json(errorResponse('Failed to set service pricing'));
  }
}

/**
 * Remove pricing discount (revert to original price)
 */
async function removePricing(req, res) {
  const { serviceId } = req.params;

  try {
    const [result] = await db.query('DELETE FROM service_pricing WHERE service_id = ?', [
      serviceId,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json(errorResponse('Pricing not found'));
    }

    console.log(`✅ Service pricing removed | Service: ${serviceId}`);

    return res.status(200).json(successResponse('Service pricing removed'));
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
    const [pricings] = await db.query(`
      SELECT sp.service_id, sp.slash_price, sp.discount_price, s.title, s.description
      FROM service_pricing sp
      JOIN services s ON sp.service_id = s.id
      WHERE sp.is_active = 1
      ORDER BY s.id
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
