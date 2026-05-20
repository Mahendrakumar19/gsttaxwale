const db = require('../utils/db');
const { successResponse, errorResponse } = require('../utils/helpers');
const authService = require('../services/authService');
const crypto = require('crypto');

/**
 * Public: Create a new referral lead from guest submission
 */
async function createLead(req, res) {
  const { name, email, phone, serviceInterest, referralCode } = req.body;

  if (!name || !email || !phone || !referralCode) {
    return res.status(400).json(errorResponse('Name, email, phone, and referral code are required'));
  }

  try {
    // 1. Validate if referral code exists
    const [referrer] = await db.query(
      'SELECT id, name FROM User WHERE referral_code = ?',
      [referralCode]
    );

    if (!referrer) {
      return res.status(404).json(errorResponse('Invalid referral code'));
    }

    // 2. Prevent duplicates for the same referrer and same email/phone
    const [existingLead] = await db.query(
      'SELECT id FROM referral_leads WHERE referrer_user_id = ? AND (guest_email = ? OR guest_phone = ?)',
      [referrer.id, email, phone]
    );

    if (existingLead) {
      return res.status(400).json(errorResponse('A lead with this email or phone number has already been registered for this referrer'));
    }

    // 3. Generate secure attribution token
    const attributionToken = crypto.randomBytes(32).toString('hex');

    // 4. Insert lead
    const result = await db.create('referral_leads', {
      referrer_user_id: referrer.id,
      guest_name: name,
      guest_email: email,
      guest_phone: phone,
      service_interest: serviceInterest || null,
      source: req.body.source || 'referral_landing_page',
      status: 'pending',
      attribution_token: attributionToken,
      notes: req.body.notes || '',
      created_at: new Date(),
      updated_at: new Date()
    });

    // 4b. Immediately store referred person details into legacy Referral table (with referralStatus: 'pending')
    const [existingReferral] = await db.query(
      'SELECT id FROM Referral WHERE referrerId = ? AND refereeEmail = ?',
      [referrer.id, email]
    );
    if (!existingReferral) {
      await db.create('Referral', {
        referrerId: referrer.id,
        refereeId: null,
        refereeEmail: email,
        refereePhone: phone,
        referralStatus: 'pending',
        commissionPercent: 10,
        commissionAmount: 0,
        notes: `Referred Guest Name: ${name}`,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // 5. Track Event: form_submit
    const eventMetadata = {
      serviceInterest,
      referral_lead_id: result.id,
      ip_address: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '',
      user_agent: req.headers['user-agent'] || '',
      utm_source: req.body.utm_source || 'referral_link'
    };

    await db.create('referral_events', {
      referrer_id: referrer.id,
      event_type: 'form_submit',
      metadata: JSON.stringify(eventMetadata),
      created_at: new Date()
    });

    return res.status(201).json(successResponse({
      leadId: result.id,
      guestName: name,
      attributionToken
    }, 'Referral lead submitted successfully'));

  } catch (error) {
    console.error('❌ Error creating referral lead:', error);
    return res.status(500).json(errorResponse('Failed to submit referral lead: ' + error.message));
  }
}

/**
 * Admin: List all referral leads
 */
async function adminListLeads(req, res) {
  try {
    const { status, search, limit = 50, offset = 0 } = req.query;

    let queryStr = `
      SELECT rl.*, u.name as referrerName, u.email as referrerEmail
      FROM referral_leads rl
      JOIN User u ON rl.referrer_user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      queryStr += ' AND rl.status = ?';
      params.push(status);
    }

    if (search) {
      queryStr += ' AND (rl.guest_name LIKE ? OR rl.guest_email LIKE ? OR rl.guest_phone LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    queryStr += ' ORDER BY rl.created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const leads = await db.query(queryStr, params);

    // Get total count for pagination
    let countQueryStr = `
      SELECT COUNT(*) as count 
      FROM referral_leads rl
      WHERE 1=1
    `;
    const countParams = [];
    if (status) {
      countQueryStr += ' AND rl.status = ?';
      countParams.push(status);
    }
    if (search) {
      countQueryStr += ' AND (rl.guest_name LIKE ? OR rl.guest_email LIKE ? OR rl.guest_phone LIKE ?)';
      countParams.push(searchPattern, searchPattern, searchPattern);
    }
    const [countResult] = await db.query(countQueryStr, countParams);

    return res.status(200).json(successResponse({
      leads,
      pagination: {
        total: countResult?.count || 0,
        limit: Number(limit),
        offset: Number(offset)
      }
    }, 'Referral leads fetched successfully'));

  } catch (error) {
    console.error('❌ Error listing referral leads:', error);
    return res.status(500).json(errorResponse('Failed to fetch referral leads'));
  }
}

/**
 * Admin: Get details of a single referral lead
 */
async function adminGetLead(req, res) {
  const { id } = req.params;
  try {
    const [lead] = await db.query(`
      SELECT rl.*, u.name as referrerName, u.email as referrerEmail, u.phone as referrerPhone
      FROM referral_leads rl
      JOIN User u ON rl.referrer_user_id = u.id
      WHERE rl.id = ?
    `, [id]);

    if (!lead) {
      return res.status(404).json(errorResponse('Referral lead not found'));
    }

    const allEvents = await db.query(
      'SELECT * FROM referral_events ORDER BY created_at DESC'
    );
    const events = allEvents.filter(e => {
      try {
        const meta = typeof e.metadata === 'string' ? JSON.parse(e.metadata) : e.metadata;
        return meta && String(meta.referral_lead_id) === String(id);
      } catch (err) {
        return false;
      }
    });

    return res.status(200).json(successResponse({
      lead,
      events
    }, 'Referral lead details fetched'));

  } catch (error) {
    console.error('❌ Error fetching lead details:', error);
    return res.status(500).json(errorResponse('Failed to fetch lead details'));
  }
}

/**
 * Admin: Update referral lead status or notes
 */
async function adminUpdateLead(req, res) {
  const { id } = req.params;
  const { status, notes } = req.body;

  try {
    const [lead] = await db.query('SELECT id, status FROM referral_leads WHERE id = ?', [id]);
    if (!lead) {
      return res.status(404).json(errorResponse('Referral lead not found'));
    }

    const updateFields = {};
    if (status) {
      if (!['pending', 'contacted', 'approved', 'rejected', 'converted'].includes(status)) {
        return res.status(400).json(errorResponse('Invalid status value'));
      }
      updateFields.status = status;
    }
    if (notes !== undefined) {
      updateFields.notes = notes;
    }

    updateFields.updated_at = new Date();

    await db.update('referral_leads', updateFields, { id });

    return res.status(200).json(successResponse(null, 'Referral lead updated successfully'));

  } catch (error) {
    console.error('❌ Error updating lead:', error);
    return res.status(500).json(errorResponse('Failed to update referral lead'));
  }
}

/**
 * Admin: Convert referral lead to user (customer)
 */
async function adminConvertLead(req, res) {
  const { id } = req.params;

  try {
    // 1. Retrieve the lead details
    const [lead] = await db.query(
      'SELECT * FROM referral_leads WHERE id = ?',
      [id]
    );

    if (!lead) {
      return res.status(404).json(errorResponse('Referral lead not found'));
    }

    if (lead.status === 'converted') {
      return res.status(400).json(errorResponse('This lead has already been converted to a customer'));
    }

    // Check if email already exists in User table
    const [existingUser] = await db.query('SELECT id FROM User WHERE email = ?', [lead.guest_email]);
    if (existingUser) {
      return res.status(400).json(errorResponse('A user with this email already exists in the system'));
    }

    // 2. Generate credentials & referral details
    const randomPassword = Math.random().toString(36).slice(-10);
    const hashedPassword = await authService.hashPassword(randomPassword);

    const namePart = lead.guest_name.trim().split(/\s+/)[0].toUpperCase().replace(/[^A-Z]/g, '');
    const phonePart = (lead.guest_phone || '0000').replace(/\D/g, '').slice(-4).padStart(4, '0');
    const referralCode = `GTW${namePart}${phonePart}`;
    const referenceNumber = `GTW${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 900 + 100)}`;

    // 3. Perform transactional database operation
    const connection = await db.pool.getConnection();
    try {
      await connection.beginTransaction();

      // Insert User record
      const [userResult] = await connection.execute(`
        INSERT INTO User (
          name, email, phone, password, role, status,
          referral_code, reference_number, referrer_id,
          created_by_admin, points_wallet, createdAt, updatedAt
        )
        VALUES (?, ?, ?, ?, 'user', 'active', ?, ?, ?, 1, 0, NOW(), NOW())
      `, [
        lead.guest_name,
        lead.guest_email,
        lead.guest_phone,
        hashedPassword,
        referralCode,
        referenceNumber,
        lead.referrer_user_id
      ]);

      const newUserId = userResult.insertId;

      // Update lead status to converted
      await connection.execute(`
        UPDATE referral_leads 
        SET status = 'converted', converted_user_id = ?, updated_at = NOW() 
        WHERE id = ?
      `, [newUserId, id]);

      // Create backward-compatible record in Referral table or update existing
      const [referrer] = await connection.execute(
        'SELECT email FROM User WHERE id = ?',
        [lead.referrer_user_id]
      );
      const referrerEmail = referrer[0]?.email || '';

      const [existingReferrals] = await connection.execute(
        'SELECT id FROM Referral WHERE referrerId = ? AND refereeEmail = ?',
        [lead.referrer_user_id, lead.guest_email]
      );

      if (existingReferrals && existingReferrals.length > 0) {
        await connection.execute(`
          UPDATE Referral
          SET refereeId = ?, referralStatus = 'active', updatedAt = NOW()
          WHERE id = ?
        `, [newUserId, existingReferrals[0].id]);
      } else {
        await connection.execute(`
          INSERT INTO Referral (
            referrerId, refereeId, refereeEmail, refereePhone,
            commissionPercent, commissionAmount,
            referralStatus, createdAt, updatedAt
          )
          VALUES (?, ?, ?, ?, 10, 0, 'active', NOW(), NOW())
        `, [
          lead.referrer_user_id,
          newUserId,
          lead.guest_email,
          lead.guest_phone
        ]);
      }

      // Track Event: conversion
      const conversionMetadata = {
        convertedUserId: newUserId,
        referral_lead_id: id,
        ip_address: req.ip || '',
        user_agent: req.headers['user-agent'] || '',
        utm_source: lead.source || 'referral_link'
      };

      await connection.execute(`
        INSERT INTO referral_events (
          referrer_id, referee_id, event_type, metadata, created_at
        )
        VALUES (?, ?, 'conversion', ?, NOW())
      `, [
        lead.referrer_user_id,
        newUserId,
        JSON.stringify(conversionMetadata)
      ]);

      await connection.commit();

      // 4. Send onboarding email with credentials (outside transaction so it doesn't block)
      try {
        await authService.sendUserCreatedEmail(lead.guest_email, randomPassword, referenceNumber);
        console.log(`📧 Welcome/onboarding credentials email sent to ${lead.guest_email}`);
      } catch (mailError) {
        console.error('📧 Failed to send credentials email:', mailError);
      }

      return res.status(201).json(successResponse({
        userId: newUserId,
        email: lead.guest_email,
        password: randomPassword
      }, 'Lead converted to customer successfully'));

    } catch (txError) {
      await connection.rollback();
      throw txError;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('❌ Error converting lead:', error);
    return res.status(500).json(errorResponse('Failed to convert lead: ' + error.message));
  }
}

/**
 * User: List leads referred by logged in user
 */
async function userListLeads(req, res) {
  const userId = req.userId;
  try {
    const leads = await db.query(
      `SELECT id, guest_name, guest_email, guest_phone, service_interest, status, created_at
       FROM referral_leads 
       WHERE referrer_user_id = ? 
       ORDER BY created_at DESC`,
      [userId]
    );

    return res.status(200).json(successResponse({ leads }, 'Your referred leads fetched'));

  } catch (error) {
    console.error('❌ Error fetching user referred leads:', error);
    return res.status(500).json(errorResponse('Failed to fetch your referral history'));
  }
}

/**
 * Public: Get referrer name by referral code
 */
async function getReferrerName(req, res) {
  const { code } = req.params;
  try {
    const [user] = await db.query('SELECT name FROM User WHERE referral_code = ?', [code]);
    if (!user) {
      return res.status(404).json(errorResponse('Invalid referral code'));
    }
    return res.status(200).json(successResponse({ name: user.name }, 'Referrer found'));
  } catch (error) {
    console.error('❌ Error getting referrer name:', error);
    return res.status(500).json(errorResponse(error.message));
  }
}

module.exports = {
  createLead,
  adminListLeads,
  adminGetLead,
  adminUpdateLead,
  adminConvertLead,
  userListLeads,
  getReferrerName
};
