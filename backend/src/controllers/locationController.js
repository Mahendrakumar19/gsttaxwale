const db = require('../utils/db');
const { successResponse, errorResponse } = require('../utils/helpers');

/**
 * Get all active locations
 */
async function listLocations(req, res) {
  try {
    const locations = await db.query('SELECT * FROM Location WHERE active = 1 ORDER BY id DESC');
    return res.status(200).json(successResponse({ locations: locations || [] }, 'Locations fetched'));
  } catch (error) {
    console.error('List locations error:', error);
    return res.status(500).json(errorResponse('Failed to fetch locations'));
  }
}

/**
 * Get all locations (including inactive) for admin
 */
async function adminListLocations(req, res) {
  try {
    const locations = await db.query('SELECT * FROM Location ORDER BY id DESC');
    return res.status(200).json(successResponse({ locations: locations || [] }, 'All locations fetched'));
  } catch (error) {
    console.error('Admin list locations error:', error);
    return res.status(500).json(errorResponse('Failed to fetch locations for admin'));
  }
}

/**
 * Create a new location
 */
async function createLocation(req, res) {
  try {
    const { name, address, city, state, pincode, email, phone, mapUrl } = req.body;
    
    if (!name || !address) {
      return res.status(400).json(errorResponse('Name and address are required'));
    }

    const locationData = {
      name,
      address,
      city: city || null,
      state: state || null,
      pincode: pincode || null,
      email: email || null,
      phone: phone || null,
      mapUrl: mapUrl || null,
      active: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.create('Location', locationData);
    return res.status(201).json(successResponse({ location: result }, 'Location created successfully'));
  } catch (error) {
    console.error('Create location error:', error);
    return res.status(500).json(errorResponse('Failed to create location'));
  }
}

/**
 * Update a location
 */
async function updateLocation(req, res) {
  try {
    const { id } = req.params;
    const { name, address, city, state, pincode, email, phone, mapUrl, active } = req.body;

    const existing = await db.findOne('Location', { id });
    if (!existing) {
      return res.status(404).json(errorResponse('Location not found'));
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (address) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (pincode !== undefined) updateData.pincode = pincode;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (mapUrl !== undefined) updateData.mapUrl = mapUrl;
    if (active !== undefined) updateData.active = active ? 1 : 0;
    
    updateData.updatedAt = new Date();

    await db.update('Location', updateData, { id });
    const updated = await db.findOne('Location', { id });
    
    return res.status(200).json(successResponse({ location: updated }, 'Location updated successfully'));
  } catch (error) {
    console.error('Update location error:', error);
    return res.status(500).json(errorResponse('Failed to update location'));
  }
}

/**
 * Delete a location (hard delete)
 */
async function deleteLocation(req, res) {
  try {
    const { id } = req.params;
    
    const existing = await db.findOne('Location', { id });
    if (!existing) {
      return res.status(404).json(errorResponse('Location not found'));
    }

    await db.deleteRecord('Location', { id });
    return res.status(200).json(successResponse({}, 'Location deleted successfully'));
  } catch (error) {
    console.error('Delete location error:', error);
    return res.status(500).json(errorResponse('Failed to delete location'));
  }
}

module.exports = {
  listLocations,
  adminListLocations,
  createLocation,
  updateLocation,
  deleteLocation
};
