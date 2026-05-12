const configUtil = require('../utils/config');
const db = require('../utils/db');
const { successResponse, errorResponse } = require('../utils/helpers');

/**
 * Get all system settings (Admin only)
 */
async function getAllSettings(req, res) {
  try {
    const settings = await db.query('SELECT * FROM SiteSettings');
    
    // Format for easier use on frontend
    const formattedSettings = settings.map(s => {
      let value = s.value;
      if (s.type === 'boolean') value = s.value === 'true' || s.value === '1';
      if (s.type === 'number') value = Number(s.value);
      if (s.type === 'json') {
        try { value = JSON.parse(s.value); } catch(e) {}
      }
      return { ...s, value };
    });

    res.status(200).json(successResponse(formattedSettings, 'Settings fetched successfully'));
  } catch (error) {
    console.error('Get all settings error:', error);
    res.status(500).json(errorResponse('Failed to fetch settings'));
  }
}

/**
 * Update system settings (Admin only)
 */
async function updateSettings(req, res) {
  try {
    const { settings } = req.body; // Array of {key, value, type}

    if (!Array.isArray(settings)) {
      return res.status(400).json(errorResponse('Settings must be an array'));
    }

    for (const item of settings) {
      const { key, value, type } = item;
      await configUtil.setSetting(key, value, type);
    }

    res.status(200).json(successResponse(null, 'Settings updated successfully'));
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json(errorResponse('Failed to update settings'));
  }
}

/**
 * Get public settings (Available to everyone)
 */
async function getPublicSettings(req, res) {
  try {
    const otpEnabled = await configUtil.getSetting('ENABLE_OTP', true);
    const referralEnabled = await configUtil.getSetting('ENABLE_REFERRAL', true);
    
    res.status(200).json(successResponse({
      otpEnabled,
      referralEnabled
    }, 'Public settings fetched'));
  } catch (error) {
    res.status(500).json(errorResponse('Failed to fetch public settings'));
  }
}

module.exports = {
  getAllSettings,
  updateSettings,
  getPublicSettings
};
