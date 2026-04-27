// Plan Service - Manages plans and pricing
import prisma from '../utils/prisma';

const DEFAULT_PLANS = [
  {
    slug: 'basic',
    name: 'Basic',
    description: 'GST filing only - Perfect for small businesses',
    planType: 'basic',
    originalPrice: 2999,
    discountPercent: 0,
    features: [
      'Monthly GST filing (GSTR-1, GSTR-3B)',
      'Email support',
      'Basic dashboard',
      'Document storage',
    ],
    billingCycle: 3,
    cancellationPolicy:
      'No refund within 30 days. After 30 days, pro-rata refunds available.',
  },
  {
    slug: 'standard',
    name: 'Standard',
    description: 'GST + ITR - Best for freelancers and employees',
    planType: 'standard',
    originalPrice: 9999,
    discountPercent: 15,
    features: [
      'Monthly GST filing (GSTR-1, GSTR-3B)',
      'Annual ITR filing',
      'Basic income tracking',
      'Deduction management',
      'Phone + Email support',
      'Dashboard with deadline reminders',
      'Document organization',
      'GST review included',
    ],
    billingCycle: 12,
    cancellationPolicy:
      'No refund within 30 days. After 30 days, pro-rata refunds available.',
  },
  {
    slug: 'premium',
    name: 'Premium',
    description: 'Complete tax compliance - For growing businesses',
    planType: 'premium',
    originalPrice: 14999,
    discountPercent: 20,
    features: [
      'Monthly GST filing (GSTR-1, GSTR-3B)',
      'Annual ITR filing with CA review',
      'Advanced income tracking',
      'Comprehensive deduction planning',
      'Priority phone + email support',
      'Advanced dashboard with analytics',
      'Quarterly consultations included',
      'Document organization',
      'Advanced GST optimization',
      'Tax planning guidance',
    ],
    billingCycle: 12,
    cancellationPolicy:
      'No refund within 30 days. After 30 days, pro-rata refunds available.',
  },
  {
    slug: 'business',
    name: 'Business',
    description: 'Enterprise solution - For established businesses',
    planType: 'business',
    originalPrice: 24999,
    discountPercent: 25,
    features: [
      'Monthly GST filing (GSTR-1, GSTR-3B)',
      'Annual ITR filing with CA review',
      'Advanced income tracking',
      'Comprehensive deduction planning',
      '24/7 dedicated support',
      'Advanced dashboard with analytics',
      'Monthly consultations included',
      'Advanced tax planning',
      'Turnover-based optimization',
      'Priority document processing',
      'Custom reports and analysis',
    ],
    billingCycle: 12,
    cancellationPolicy:
      'No refund within 30 days. After 30 days, pro-rata refunds available.',
  },
];

/**
 * Seed default plans if they don't exist
 */
export async function seedPlans() {
  try {
    for (const plan of DEFAULT_PLANS) {
      const existingPlan = await prisma.plan.findUnique({
        where: { slug: plan.slug },
      });

      if (!existingPlan) {
        const finalPrice = plan.originalPrice - (plan.originalPrice * plan.discountPercent) / 100;
        const gstAmount = finalPrice * 0.18;

        await prisma.plan.create({
          data: {
            slug: plan.slug,
            name: plan.name,
            description: plan.description,
            planType: plan.planType,
            originalPrice: plan.originalPrice,
            discountPercent: plan.discountPercent,
            finalPrice,
            gstAmount,
            features: JSON.stringify(plan.features),
            billingCycle: plan.billingCycle,
            cancellationPolicy: plan.cancellationPolicy,
            isActive: true,
          },
        });

        console.log(`✓ Seeded plan: ${plan.name}`);
      }
    }

    console.log('✓ All plans seeded successfully');
  } catch (error: any) {
    console.error('Failed to seed plans:', error);
  }
}

/**
 * Get all active plans
 */
export async function listPlans(filter?: { planType?: string; isActive?: boolean }) {
  try {
    const plans = await prisma.plan.findMany({
      where: {
        isActive: filter?.isActive ?? true,
        ...(filter?.planType && { planType: filter.planType }),
      },
      orderBy: { createdat: 'asc' },
    });

    return plans.map((plan) => ({
      ...plan,
      features: JSON.parse(plan.features as string),
    }));
  } catch (error: any) {
    throw new Error(`Failed to list plans: ${error.message}`);
  }
}

/**
 * Get plan by ID or slug
 */
export async function getPlanDetails(identifier: string) {
  try {
    const plan = await prisma.plan.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
        isActive: true,
      },
    });

    if (!plan) {
      throw new Error('Plan not found');
    }

    return {
      ...plan,
      features: JSON.parse(plan.features as string),
    };
  } catch (error: any) {
    throw new Error(`Failed to get plan details: ${error.message}`);
  }
}

/**
 * Compare plans
 */
export async function comparePlans(planSlugs: string[]) {
  try {
    const plans = await prisma.plan.findMany({
      where: {
        slug: { in: planSlugs },
        isActive: true,
      },
    });

    return plans.map((plan) => ({
      ...plan,
      features: JSON.parse(plan.features as string),
    }));
  } catch (error: any) {
    throw new Error(`Failed to compare plans: ${error.message}`);
  }
}

/**
 * Create/update plan (admin only)
 */
export async function createOrUpdatePlan(
  data: {
    slug: string;
    name: string;
    description?: string;
    planType: string;
    originalPrice: number;
    discountPercent: number;
    features: string[];
    billingCycle?: number;
    cancellationPolicy?: string;
  },
  planId?: string
) {
  try {
    const finalPrice = data.originalPrice - (data.originalPrice * data.discountPercent) / 100;
    const gstAmount = finalPrice * 0.18;

    if (planId) {
      // Update existing plan
      return await prisma.plan.update({
        where: { id: planId },
        data: {
          slug: data.slug,
          name: data.name,
          description: data.description,
          planType: data.planType,
          originalPrice: data.originalPrice,
          discountPercent: data.discountPercent,
          finalPrice,
          gstAmount,
          features: JSON.stringify(data.features),
          billingCycle: data.billingCycle,
          cancellationPolicy: data.cancellationPolicy,
        },
      });
    } else {
      // Create new plan
      return await prisma.plan.create({
        data: {
          slug: data.slug,
          name: data.name,
          description: data.description,
          planType: data.planType,
          originalPrice: data.originalPrice,
          discountPercent: data.discountPercent,
          finalPrice,
          gstAmount,
          features: JSON.stringify(data.features),
          billingCycle: data.billingCycle,
          cancellationPolicy: data.cancellationPolicy,
          isActive: true,
        },
      });
    }
  } catch (error: any) {
    throw new Error(`Failed to save plan: ${error.message}`);
  }
}

/**
 * Delete plan (admin only)
 */
export async function deletePlan(planId: string) {
  try {
    return await prisma.plan.delete({
      where: { id: planId },
    });
  } catch (error: any) {
    throw new Error(`Failed to delete plan: ${error.message}`);
  }
}

export default {
  seedPlans,
  listPlans,
  getPlanDetails,
  comparePlans,
  createOrUpdatePlan,
  deletePlan,
};
