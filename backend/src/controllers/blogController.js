const db = require('../utils/db');

/**
 * Get all published blog posts (public)
 */
async function getBlogs(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const category = req.query.category;

    let query = 'SELECT * FROM `Blog` WHERE published = 1';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY publishedAt DESC LIMIT ?';
    params.push(limit);

    const blogs = await db.query(query, params);
    res.json({ success: true, data: { blogs } });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch blogs' });
  }
}

/**
 * Get a single blog post by id (public)
 */
async function getBlogById(req, res) {
  try {
    const { id } = req.params;
    const blogs = await db.query('SELECT * FROM `Blog` WHERE id = ? AND published = 1', [id]);
    if (!blogs.length) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    res.json({ success: true, data: { blog: blogs[0] } });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch blog' });
  }
}

/**
 * Get all blog posts (Admin — includes drafts)
 */
async function adminGetBlogs(req, res) {
  try {
    const blogs = await db.query('SELECT * FROM `Blog` ORDER BY createdAt DESC');
    res.json({ success: true, data: { blogs } });
  } catch (error) {
    console.error('Error fetching blogs (admin):', error);
    res.status(500).json({ success: false, message: 'Failed to fetch blogs' });
  }
}

/**
 * Create a blog post (Admin)
 */
async function createBlog(req, res) {
  try {
    const {
      title, excerpt, content, category,
      author, image, readTime, metaTitle,
      metaDescription, tags, published
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const isPublished = published === true || published === 1 || published === 'true' ? 1 : 0;
    const publishedAt = isPublished ? new Date() : null;

    await db.query(
      `INSERT INTO \`Blog\`
        (title, excerpt, content, category, author, image, readTime, metaTitle, metaDescription, tags, published, publishedAt, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        title,
        excerpt || '',
        content,
        category || 'General',
        author || 'GST Tax Wale Team',
        image || '📝',
        readTime || '5 min read',
        metaTitle || title,
        metaDescription || excerpt || '',
        tags || '',
        isPublished,
        publishedAt,
      ]
    );

    res.json({ success: true, message: 'Blog post created successfully' });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ success: false, message: 'Failed to create blog post' });
  }
}

/**
 * Update a blog post (Admin)
 */
async function updateBlog(req, res) {
  try {
    const { id } = req.params;
    const {
      title, excerpt, content, category,
      author, image, readTime, metaTitle,
      metaDescription, tags, published
    } = req.body;

    const isPublished = published === true || published === 1 || published === 'true' ? 1 : 0;

    // Fetch current published status to set publishedAt if newly publishing
    const existing = await db.query('SELECT published, publishedAt FROM `Blog` WHERE id = ?', [id]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    let publishedAt = existing[0].publishedAt;
    if (isPublished && !publishedAt) {
      publishedAt = new Date();
    }
    if (!isPublished) {
      publishedAt = null;
    }

    await db.query(
      `UPDATE \`Blog\` SET
        title = ?, excerpt = ?, content = ?, category = ?, author = ?,
        image = ?, readTime = ?, metaTitle = ?, metaDescription = ?,
        tags = ?, published = ?, publishedAt = ?, updatedAt = NOW()
       WHERE id = ?`,
      [
        title,
        excerpt || '',
        content,
        category || 'General',
        author || 'GST Tax Wale Team',
        image || '📝',
        readTime || '5 min read',
        metaTitle || title,
        metaDescription || excerpt || '',
        tags || '',
        isPublished,
        publishedAt,
        id,
      ]
    );

    res.json({ success: true, message: 'Blog post updated successfully' });
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ success: false, message: 'Failed to update blog post' });
  }
}

/**
 * Delete a blog post (Admin)
 */
async function deleteBlog(req, res) {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM `Blog` WHERE id = ?', [id]);
    res.json({ success: true, message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ success: false, message: 'Failed to delete blog post' });
  }
}

module.exports = {
  getBlogs,
  getBlogById,
  adminGetBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
};
