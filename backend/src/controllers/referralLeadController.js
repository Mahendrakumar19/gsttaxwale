const db = require('../utils/db');
const { successResponse, errorResponse } = require('../utils/helpers');
const { generateUniqueReferralCode } = require('../utils/referralHelper');
const emailService = require('../services/emailService');
const authService = require('../services/authService');
const WalletService = require('../services/walletService');
const crypto = require('crypto');

/**
 * Public: Create a new referral lead from guest landing page submission
 */
async function createLead(req, res) {
  const { name, email, phone, serviceInterest, referralCode } = req.body;

  if (!name || !email || !phone || !referralCode) {
    return res.status(400).json(errorResponse('Name, email, phone, and referral code are required'));
  }

  const cleanPhone = phone.replace(/\D/g, '');

  try {
    // 1. Validate if referral code exists in User table or referral_referrers
    let referrerUser = null;
    let referrerGuest = null;
    let referrerName = '';

    const [user] = await db.query(
      'SELECT id, name FROM User WHERE referral_code = ?',
      [referralCode]
    );

    if (user) {
      referrerUser = user;
      referrerName = user.name;
    } else {
      const [guest] = await db.query(
        'SELECT id, name FROM referral_referrers WHERE referral_id = ?',
        [referralCode]
      );
      if (guest) {
        referrerGuest = guest;
        referrerName = guest.name;
      }
    }

    if (!referrerUser && !referrerGuest) {
      return res.status(404).json(errorResponse('Invalid referral code'));
    }

    // 2. Prevent duplicates for the same email or phone
    const [existingLead] = await db.query(
      'SELECT id FROM referral_leads WHERE referred_email = ? OR referred_mobile = ?',
      [email, cleanPhone]
    );

    if (existingLead) {
      return res.status(400).json(errorResponse('A lead with this email or phone number has already been registered'));
    }

    // 3. Insert lead into new referral_leads table
    const result = await db.create('referral_leads', {
      referrer_referral_id: referralCode,
      referred_name: name,
      referred_mobile: cleanPhone,
      referred_email: email,
      service_interest: serviceInterest || null,
      status: 'pending',
      converted_user_id: null,
      reward_given: 0,
      created_at: new Date(),
      updated_at: new Date()
    });

    // 4. Create record in legacy Referral table only if referrer is a registered customer
    if (referrerUser) {
      const [existingReferral] = await db.query(
        'SELECT id FROM Referral WHERE referrerId = ? AND refereeEmail = ?',
        [referrerUser.id, email]
      );
      if (!existingReferral) {
        await db.create('Referral', {
          referrerId: referrerUser.id,
          refereeId: null,
          refereeEmail: email,
          refereePhone: cleanPhone,
          referralStatus: 'pending',
          commissionPercent: 10,
          commissionAmount: 0,
          notes: `Referred Guest Name: ${name}`,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    // 5. Track Event in referral_events
    try {
      const eventMetadata = {
        serviceInterest,
        referral_lead_id: result.id,
        ip_address: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '',
        user_agent: req.headers['user-agent'] || '',
        utm_source: req.body.utm_source || 'referral_link'
      };

      await db.create('referral_events', {
        referral_lead_id: result.id,
        referrer_id: referrerUser ? referrerUser.id : null,
        event_type: 'form_submit',
        ip_address: eventMetadata.ip_address,
        user_agent: eventMetadata.user_agent,
        utm_source: eventMetadata.utm_source,
        metadata: JSON.stringify(eventMetadata),
        created_at: new Date()
      });
    } catch (trackErr) {
      console.warn('Could not write referral event:', trackErr.message);
    }

    // 6. Send invite email asynchronously (non-blocking)
    emailService.sendReferralInviteEmail(email, referrerName, referralCode)
      .catch(err => console.error('Error sending referee invitation email:', err));

    return res.status(201).json(successResponse({
      leadId: result.id,
      referredName: name
    }, 'Referral lead submitted successfully'));

  } catch (error) {
    console.error('❌ Error creating referral lead:', error);
    return res.status(500).json(errorResponse('Failed to submit referral lead: ' + error.message));
  }
}

/**
 * Admin: List all referral leads (consolidated view helper fallback)
 */
async function adminListLeads(req, res) {
  try {
    const { status, search, limit = 50, offset = 0 } = req.query;

    let queryStr = `
      SELECT rl.*,
             rl.referred_name as guest_name,
             rl.referred_email as guest_email,
             rl.referred_mobile as guest_phone,
             COALESCE(u.name, rr.name) as referrerName,
             COALESCE(u.email, rr.email) as referrerEmail
      FROM referral_leads rl
      LEFT JOIN User u ON rl.referrer_referral_id = u.referral_code
      LEFT JOIN referral_referrers rr ON rl.referrer_referral_id = rr.referral_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      queryStr += ' AND rl.status = ?';
      params.push(status);
    }

    if (search) {
      queryStr += ' AND (rl.referred_name LIKE ? OR rl.referred_email LIKE ? OR rl.referred_mobile LIKE ?)';
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
      queryStr += ' AND (rl.referred_name LIKE ? OR rl.referred_email LIKE ? OR rl.referred_mobile LIKE ?)';
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
      SELECT rl.*,
             rl.referred_name as guest_name,
             rl.referred_email as guest_email,
             rl.referred_mobile as guest_phone,
             COALESCE(u.name, rr.name) as referrerName,
             COALESCE(u.email, rr.email) as referrerEmail,
             COALESCE(u.phone, rr.mobile) as referrerPhone
      FROM referral_leads rl
      LEFT JOIN User u ON rl.referrer_referral_id = u.referral_code
      LEFT JOIN referral_referrers rr ON rl.referrer_referral_id = rr.referral_id
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
 * Transaction-safe, handles guest referrals, links existing codes, and credits pending points.
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
    const [existingUser] = await db.query('SELECT id FROM User WHERE email = ?', [lead.referred_email]);
    if (existingUser) {
      return res.status(400).json(errorResponse('A user with this email already exists in the system'));
    }

    // 2. Generate credentials & referral details
    const randomPassword = Math.random().toString(36).slice(-10);
    const hashedPassword = await authService.hashPassword(randomPassword);
    const referralCode = await generateUniqueReferralCode(lead.referred_name, lead.referred_mobile);
    const referenceNumber = `GTW${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 900 + 100)}`;

    // Identify if the referrer is a customer (User) or guest (referral_referrers)
    const [referrerUser] = await db.query(
      'SELECT id, email FROM User WHERE referral_code = ?',
      [lead.referrer_referral_id]
    );

    const [referrerGuest] = await db.query(
      'SELECT id, name FROM referral_referrers WHERE referral_id = ?',
      [lead.referrer_referral_id]
    );

    // 3. Perform transactional database operation
    const connection = await db.pool.getConnection();
    try {
      await connection.beginTransaction();

      // Check if this referee is also a guest referrer (has generated a code as guest referrer)
      const [refereeGuestRecord] = await connection.execute(
        'SELECT * FROM referral_referrers WHERE email = ? OR mobile = ?',
        [lead.referred_email, lead.referred_mobile]
      );

      let finalReferralCode = referralCode;
      let hasPendingPoints = false;
      let pendingPointsAmount = 0;
      let refereeGuestId = null;

      if (refereeGuestRecord && refereeGuestRecord.length > 0) {
        // Reuse their original guest referral code so their links continue to work
        finalReferralCode = refereeGuestRecord[0].referral_id;
        refereeGuestId = refereeGuestRecord[0].id;
        if (refereeGuestRecord[0].pending_points > 0) {
          hasPendingPoints = true;
          pendingPointsAmount = refereeGuestRecord[0].pending_points;
        }
      }

      // Insert User record
      const [userResult] = await connection.execute(`
        INSERT INTO User (
          name, email, phone, password, role, status,
          referral_code, reference_number, referrer_id,
          created_by_admin, points_wallet, createdAt, updatedAt
        )
        VALUES (?, ?, ?, ?, 'user', 'active', ?, ?, ?, 1, 0, NOW(), NOW())
      `, [
        lead.referred_name,
        lead.referred_email,
        lead.referred_mobile,
        hashedPassword,
        finalReferralCode,
        referenceNumber,
        referrerUser ? referrerUser.id : null
      ]);

      const newUserId = userResult.insertId;

      // Update lead status to converted
      await connection.execute(`
        UPDATE referral_leads 
        SET status = 'converted', converted_user_id = ?, updated_at = NOW() 
        WHERE id = ?
      `, [newUserId, id]);

      // If referrer was a customer, update or insert into Referral table
      if (referrerUser) {
        const [existingReferrals] = await connection.execute(
          'SELECT id FROM Referral WHERE referrerId = ? AND refereeEmail = ?',
          [referrerUser.id, lead.referred_email]
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
            referrerUser.id,
            newUserId,
            lead.referred_email,
            lead.referred_mobile
          ]);
        }
      }

      // If referee was a guest referrer, link their record and transfer points
      if (refereeGuestId) {
        await connection.execute(`
          UPDATE referral_referrers 
          SET is_customer = 1, converted_user_id = ?, pending_points = 0, updated_at = NOW() 
          WHERE id = ?
        `, [newUserId, refereeGuestId]);

        if (hasPendingPoints) {
          // Add credit ledger entry in wallet_transactions
          await connection.execute(`
            INSERT INTO wallet_transactions (
              user_id, type, source, points, reference_id, status, description, created_at
            )
            VALUES (?, 'credit', 'referral_pending_transfer', ?, NULL, 'approved', ?, NOW())
          `, [
            newUserId,
            pendingPointsAmount,
            `Transferred pending points from guest referrals (${pendingPointsAmount} points)`
          ]);

          // Update points cached on User
          await connection.execute(`
            UPDATE User SET points_wallet = points_wallet + ? WHERE id = ?
          `, [pendingPointsAmount, newUserId]);
        }
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
        referrerUser ? referrerUser.id : null,
        newUserId,
        JSON.stringify(conversionMetadata)
      ]);

      await connection.commit();

      // Send onboarding email with credentials (outside transaction)
      emailService.sendOnboardingCredentialsEmail(lead.referred_email, lead.referred_name, randomPassword)
        .catch(err => console.error('📧 Onboarding email send failed:', err));

      return res.status(201).json(successResponse({
        userId: newUserId,
        email: lead.referred_email,
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
    const [user] = await db.query('SELECT referral_code FROM User WHERE id = ?', [userId]);
    if (!user || !user.referral_code) {
      return res.status(200).json(successResponse({ leads: [] }, 'No leads found'));
    }

    const leads = await db.query(
      `SELECT id, referred_name as guest_name, referred_email as guest_email, referred_mobile as guest_phone, service_interest, status, created_at
       FROM referral_leads 
       WHERE referrer_referral_id = ? 
       ORDER BY created_at DESC`,
      [user.referral_code]
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
    if (user) {
      return res.status(200).json(successResponse({ name: user.name }, 'Referrer found'));
    }

    const [guest] = await db.query('SELECT name FROM referral_referrers WHERE referral_id = ?', [code]);
    if (guest) {
      return res.status(200).json(successResponse({ name: guest.name }, 'Referrer found'));
    }

    return res.status(404).json(errorResponse('Invalid referral code'));
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
