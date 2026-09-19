const db = require('../utils/db');
const { successResponse, errorResponse } = require('../utils/helpers');
const path = require('path');
const fs = require('fs');
const storageService = require('../services/storageService');

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

    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
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

    const sanitizedName = storageService.sanitizeFileName(file.originalname);
    const fileName = `slider_${Date.now()}_${sanitizedName}`;
    const objectKey = `sliders/${fileName}`;

    // Upload slider image to MinIO S3 bucket
    const s3Result = await storageService.upload({
      filePath: file.path,
      objectKey: objectKey,
      mimeType: file.mimetype
    });

    // Remove temporary multer file
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    const imageUrl = s3Result.url;
    
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
      JSON.stringify({ active: true, order: newOrder, alt: 'Homepage Banner', objectKey })
    ]);

    res.status(201).json(successResponse(null, 'Slider added successfully'));
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
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
    const [slider] = await db.query('SELECT content, metadata FROM PageContent WHERE id = ?', [id]);
    if (!slider) return res.status(404).json(errorResponse('Slider not found'));

    let metadata = {};
    try { metadata = JSON.parse(slider.metadata || '{}'); } catch (_) {}

    // Extract S3 objectKey if available
    let objectKey = metadata.objectKey;
    if (!objectKey && slider.content && slider.content.includes('/sliders/')) {
      objectKey = slider.content.split('/gsttaxwale/')[1] || slider.content.replace(/^\//, '');
    }

    // Delete from S3
    if (objectKey) {
      await storageService.delete(objectKey).catch(err => console.error('Error deleting slider S3 object:', err));
    }

    // Legacy local file cleanup
    const localFilePath = path.join(process.cwd(), 'frontend/public', slider.content);
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

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
