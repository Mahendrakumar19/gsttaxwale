const db = require('../utils/db');
const { successResponse, errorResponse } = require('../utils/helpers');
const path = require('path');
const fs = require('fs');

/**
 * Get all slider images
 */
async function getSliders(req, res) {
  try {
    const sliders = await db.query(`
      SELECT id, content, metadata, updatedAt
      FROM PageContent
      WHERE page = 'home' AND section = 'slider'
      ORDER BY JSON_EXTRACT(metadata, '$.order') ASC
    `);

    const formattedSliders = sliders.map(s => {
      let metadata = {};
      try { metadata = JSON.parse(s.metadata || '{}'); } catch(e) {}
      return {
        id: s.id,
        imageUrl: s.content,
        isActive: metadata.active !== false,
        order: metadata.order || 0,
        alt: metadata.alt || ''
      };
    });

    res.status(200).json(successResponse({ sliders: formattedSliders }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
}

/**
 * Create/Upload new slider
 */
async function addSlider(req, res) {
  try {
    const file = req.file;
    if (!file) return res.status(400).json(errorResponse('No image provided'));

    // Move from temp to public banners
    const bannerDir = path.resolve(process.cwd(), 'frontend/public/banners');
    if (!fs.existsSync(bannerDir)) fs.mkdirSync(bannerDir, { recursive: true });

    const fileName = `slider_${Date.now()}${path.extname(file.originalname)}`;
    const finalPath = path.join(bannerDir, fileName);
    
    fs.copyFileSync(file.path, finalPath);
    fs.unlinkSync(file.path);

    const imageUrl = `/banners/${fileName}`;
    
    // Get current max order
    const [maxOrder] = await db.query(`
      SELECT MAX(JSON_EXTRACT(metadata, '$.order')) as maxOrder 
      FROM PageContent 
      WHERE page = 'home' AND section = 'slider'
    `);
    
    const newOrder = (maxOrder?.maxOrder || 0) + 1;

    await db.query(`
      INSERT INTO PageContent (page, section, \`key\`, content, type, metadata, updatedAt)
      VALUES ('home', 'slider', ?, ?, 'image', ?, NOW())
    `, [
      `slider_${Date.now()}`,
      imageUrl,
      JSON.stringify({ active: true, order: newOrder, alt: 'Homepage Banner' })
    ]);

    res.status(201).json(successResponse(null, 'Slider added successfully'));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
}

/**
 * Toggle active status
 */
async function toggleSlider(req, res) {
  const { id } = req.params;
  const { active } = req.body;
  try {
    const [slider] = await db.query('SELECT metadata FROM PageContent WHERE id = ?', [id]);
    if (!slider) return res.status(404).json(errorResponse('Slider not found'));

    let metadata = JSON.parse(slider.metadata || '{}');
    metadata.active = active;

    await db.query('UPDATE PageContent SET metadata = ?, updatedAt = NOW() WHERE id = ?', [
      JSON.stringify(metadata),
      id
    ]);

    res.status(200).json(successResponse(null, 'Slider status updated'));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
}

/**
 * Delete slider
 */
async function deleteSlider(req, res) {
  const { id } = req.params;
  try {
    const [slider] = await db.query('SELECT content FROM PageContent WHERE id = ?', [id]);
    if (!slider) return res.status(404).json(errorResponse('Slider not found'));

    // Delete file
    const filePath = path.join(process.cwd(), 'frontend/public', slider.content);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await db.query('DELETE FROM PageContent WHERE id = ?', [id]);
    res.status(200).json(successResponse(null, 'Slider deleted'));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
}

module.exports = {
  getSliders,
  addSlider,
  toggleSlider,
  deleteSlider
};
