const db = require('../utils/db');

/**
 * Get all news items
 */
async function getNews(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50); // cap at 50
    const category = req.query.category;
    
    let query = 'SELECT id, title, description, category, date, source, url FROM `News`';
    const params = [];
    
    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY date DESC LIMIT ?';
    params.push(limit);

    // Hard 5-second timeout so slow DB connections never tie up a process
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('DB_TIMEOUT')), 5000)
    );

    const news = await Promise.race([
      db.query(query, params),
      timeoutPromise
    ]);
    
    const mappedNews = news.map(item => ({
      ...item,
      content: item.description,
      publishDate: item.date
    }));
    
    // Cache for 10 minutes at CDN/proxy level; browser re-validates after 1 minute
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=600, stale-while-revalidate=3600');
    res.json({ success: true, data: { news: mappedNews } });
  } catch (error) {
    if (error.message === 'DB_TIMEOUT') {
      console.warn('[news] DB query timed out after 5s — returning empty');
      res.setHeader('Cache-Control', 'no-store');
      return res.json({ success: true, data: { news: [] } });
    }
    console.error('Error fetching news:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch news' });
  }
}

/**
 * Create news item (Admin)
 */
async function createNews(req, res) {
  try {
    const { title, content, category, source, url } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }
    
    await db.query(
      'INSERT INTO `News` (title, description, category, date, source, url, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), ?, ?, NOW(), NOW())',
      [title, content, category || 'Update', source || 'GST Tax Wale', url || null]
    );
    
    res.json({ success: true, message: 'News item created successfully' });
  } catch (error) {
    console.error('Error creating news:', error);
    res.status(500).json({ success: false, message: 'Failed to create news' });
  }
}

/**
 * Delete news item (Admin)
 */
async function deleteNews(req, res) {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM `News` WHERE id = ?', [id]);
    res.json({ success: true, message: 'News item deleted successfully' });
  } catch (error) {
    console.error('Error deleting news:', error);
    res.status(500).json({ success: false, message: 'Failed to delete news' });
  }
}

module.exports = {
  getNews,
  createNews,
  deleteNews
};
