const db = require('./db');

/**
 * Get a system setting by key
 * @param {string} key - Setting key
 * @param {any} defaultValue - Default value if not found
 * @returns {Promise<any>} - Setting value
 */
async function getSetting(key, defaultValue = null) {
  try {
    const setting = await db.findOne('SiteSettings', { key });
    if (!setting) return defaultValue;

    // Parse value based on type
    switch (setting.type) {
      case 'boolean':
        return setting.value === 'true' || setting.value === '1';
      case 'number':
        return Number(setting.value);
      case 'json':
        try {
          return JSON.parse(setting.value);
        } catch (e) {
          return defaultValue;
        }
      default:
        return setting.value;
    }
  } catch (error) {
    console.error(`Error fetching setting ${key}:`, error);
    return defaultValue;
  }
}

/**
 * Get multiple settings at once
 * @param {string[]} keys - Setting keys
 * @returns {Promise<Object>} - Object with key-value pairs
 */
async function getSettings(keys) {
  const results = {};
  await Promise.all(
    keys.map(async (key) => {
      results[key] = await getSetting(key);
    })
  );
  return results;
}

/**
 * Update or create a system setting
 * @param {string} key - Setting key
 * @param {any} value - Setting value
 * @param {string} type - Setting type (text, boolean, number, json)
 */
async function setSetting(key, value, type = 'text') {
  try {
    const existing = await db.findOne('SiteSettings', { key });
    const stringValue = typeof value === 'string' ? value : String(value);

    if (existing) {
      await db.query('UPDATE SiteSettings SET value = ?, type = ? WHERE key = ?', [stringValue, type, key]);
    } else {
      await db.query('INSERT INTO SiteSettings (\`key\`, value, type) VALUES (?, ?, ?)', [key, stringValue, type]);
    }
  } catch (error) {
    console.error(`Error setting ${key}:`, error);
    throw error;
  }
}

module.exports = {
  getSetting,
  getSettings,
  setSetting
};
