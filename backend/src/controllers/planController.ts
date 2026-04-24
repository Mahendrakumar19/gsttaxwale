// Plan Controller - Manages pricing plans  
import { Request, Response } from 'express';
import * as planService from '../services/planService';

/**
 * Get all plans
 * GET /api/plans
 */
export async function listPlans(req: Request, res: Response) {
  try {
    const { planType, includeInactive = false } = req.query;

    let filter: any = undefined;
    if (planType) {
      filter = { planType: planType as string };
    }

    const plans = await planService.listPlans(filter);

    res.json({
      success: true,
      data: plans,
    });
  } catch (error: any) {
    console.error('List plans error:', error);
    res.status(500).json({
      error: error.message || 'Failed to list plans',
    });
  }
}

/**
 * Get plan details
 * GET /api/plans/:planId
 */
export async function getPlanDetails(req: Request, res: Response) {
  try {
    const { planId } = req.params;

    const plan = await planService.getPlanDetails(planId);

    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    res.json({
      success: true,
      data: plan,
    });
  } catch (error: any) {
    console.error('Get plan error:', error);
    res.status(500).json({
      error: error.message || 'Failed to get plan',
    });
  }
}

/**
 * Compare multiple plans
 * GET /api/plans/compare?plans=basic,standard,premium
 */
export async function comparePlans(req: Request, res: Response) {
  try {
    const { plans } = req.query;

    if (!plans) {
      return res.status(400).json({ error: 'plans parameter required' });
    }

    const planSlugs = (plans as string).split(',').filter((p) => p.trim());

    if (planSlugs.length < 2) {
      return res.status(400).json({ error: 'At least 2 plans required for comparison' });
    }

    const comparison = await planService.comparePlans(planSlugs);

    res.json({
      success: true,
      data: comparison,
    });
  } catch (error: any) {
    console.error('Compare plans error:', error);
    res.status(500).json({
      error: error.message || 'Failed to compare plans',
    });
  }
}

/**
 * Admin: Create plan
 * POST /api/plans (admin)
 */
export async function createPlan(req: Request, res: Response) {
  try {
    const adminId = req.user?.id;

    if (!adminId || req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { slug, name, planType, originalPrice, discountPercent, features, description } =
      req.body;

    // Validate required fields
    if (!slug || !name || !originalPrice || !planType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const plan = await planService.createOrUpdatePlan({
      slug,
      name,
      planType,
      originalPrice,
      discountPercent: discountPercent || 0,
      features: features || {},
      description,
      isActive: true,
    });

    res.json({
      success: true,
      message: 'Plan created',
      data: plan,
    });
  } catch (error: any) {
    console.error('Create plan error:', error);
    res.status(500).json({
      error: error.message || 'Failed to create plan',
    });
  }
}

/**
 * Admin: Update plan
 * PUT /api/plans/:planId (admin)
 */
export async function updatePlan(req: Request, res: Response) {
  try {
    const { planId } = req.params;
    const adminId = req.user?.id;

    if (!adminId || req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { slug, name, originalPrice, discountPercent, features, description, isActive } =
      req.body;

    const plan = await planService.createOrUpdatePlan(
      {
        slug,
        name,
        originalPrice,
        discountPercent,
        features,
        description,
        isActive,
      },
      planId
    );

    res.json({
      success: true,
      message: 'Plan updated',
      data: plan,
    });
  } catch (error: any) {
    console.error('Update plan error:', error);
    res.status(500).json({
      error: error.message || 'Failed to update plan',
    });
  }
}

/**
 * Admin: Delete plan
 * DELETE /api/plans/:planId (admin)
 */
export async function deletePlan(req: Request, res: Response) {
  try {
    const { planId } = req.params;
    const adminId = req.user?.id;

    if (!adminId || req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await planService.deletePlan(planId);

    res.json({
      success: true,
      message: 'Plan deleted',
    });
  } catch (error: any) {
    console.error('Delete plan error:', error);
    res.status(500).json({
      error: error.message || 'Failed to delete plan',
    });
  }
}

/**
 * Admin: Seed default plans
 * POST /api/plans/seed (admin)
 */
export async function seedPlans(req: Request, res: Response) {
  try {
    const adminId = req.user?.id;

    if (!adminId || req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const plans = await planService.seedPlans();

    res.json({
      success: true,
      message: 'Plans seeded',
      data: plans,
    });
  } catch (error: any) {
    console.error('Seed plans error:', error);
    res.status(500).json({
      error: error.message || 'Failed to seed plans',
    });
  }
}

export default {
  listPlans,
  getPlanDetails,
  comparePlans,
  createPlan,
  updatePlan,
  deletePlan,
  seedPlans,
};
