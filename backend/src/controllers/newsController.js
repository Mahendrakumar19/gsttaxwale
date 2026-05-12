const db = require('../utils/db');

/**
 * Get all news items
 */
async function getNews(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    
    let query = 'SELECT * FROM News';
    const params = [];
    
    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY date DESC LIMIT ?';
    params.push(limit);
    
    const news = await db.query(query, params);
    
    // Map database fields to frontend expectations if necessary
    const mappedNews = news.map(item => ({
      ...item,
      content: item.description, // For admin UI
      publishDate: item.date     // For admin UI
    }));
    
    res.json({ success: true, data: { news: mappedNews } });
  } catch (error) {
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
      'INSERT INTO News (title, description, category, date, source, url, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), ?, ?, NOW(), NOW())',
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
    await db.query('DELETE FROM News WHERE id = ?', [id]);
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
