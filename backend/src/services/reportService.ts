// =============================================================================
// REPORT SERVICE - Tax filing and ITR management
// =============================================================================

import prisma from '../utils/prisma';
import { calculateTax, compareRegimes, getStandardDeduction, getSection80CLimit } from './taxCalculationService';

export interface CreateFilingInput {
  assessmentYear: number;
  filingYear: number;
  itrType?: string;
  regime?: 'old' | 'new';
}

export interface IncomeInput {
  salaryIncome?: number;
  businessIncome?: number;
  propertyIncome?: number;
  capitalGains?: number;
  otherIncome?: number;
}

export interface DeductionInput {
  section80C?: number;
  section80D?: number;
  section80E?: number;
  section80G?: number;
  section24HRA?: number;
  otherDeductions?: number;
}

/**
 * Create a new tax filing
 */
export async function createTaxFiling(
  userId: string,
  input: CreateFilingInput
): Promise<any> {
  // Check if filing already exists for this year
  const existing = await prisma.taxFiling.findUnique({
    where: {
      userId_assessmentYear: {
        userId,
        assessmentYear: input.assessmentYear
      }
    }
  });

  if (existing) {
    throw new Error('Filing already exists for this assessment year');
  }

  const filing = await prisma.taxFiling.create({
    data: {
      userId,
      assessmentYear: input.assessmentYear,
      filingYear: input.filingYear,
      itrType: input.itrType || 'ITR1',
      regime: input.regime || 'old',
      status: 'draft'
    }
  });

  // Create empty income and deduction records
  await prisma.income.create({
    data: {
      userId,
      taxFilingId: filing.id
    }
  });

  await prisma.deduction.create({
    data: {
      userId,
      taxFilingId: filing.id
    }
  });

  return filing;
}

/**
 * Add or update income for a filing
 */
export async function updateIncome(
  userId: string,
  filingId: string,
  input: IncomeInput
): Promise<any> {
  const filing = await prisma.taxFiling.findUnique({
    where: { id: filingId }
  });

  if (!filing || filing.userId !== userId) {
    throw new Error('Filing not found');
  }

  const income = await prisma.income.findFirst({
    where: { taxFilingId: filingId }
  });

  const totalIncome = (input.salaryIncome || 0) +
    (input.businessIncome || 0) +
    (input.propertyIncome || 0) +
    (input.capitalGains || 0) +
    (input.otherIncome || 0);

  const updatedIncome = await prisma.income.update({
    where: { id: income!.id },
    data: {
      salaryIncome: input.salaryIncome || 0,
      businessIncome: input.businessIncome || 0,
      capitalGains: input.capitalGains || 0,
      otherIncome: input.otherIncome || 0
    }
  });

  // Update filing with total income
  await prisma.taxFiling.update({
    where: { id: filingId },
    data: {
      grossSalary: input.salaryIncome || 0,
      businessIncome: input.businessIncome || 0,
      capitalGains: input.capitalGains || 0,
      otherIncome: input.otherIncome || 0,
      totalIncome
    }
  });

  return updatedIncome;
}

/**
 * Add or update deductions for a filing
 */
export async function updateDeductions(
  userId: string,
  filingId: string,
  input: DeductionInput
): Promise<any> {
  const filing = await prisma.taxFiling.findUnique({
    where: { id: filingId }
  });

  if (!filing || filing.userId !== userId) {
    throw new Error('Filing not found');
  }

  const deduction = await prisma.deduction.findFirst({
    where: { taxFilingId: filingId }
  });

  const totalDeductions = (input.section80C || 0) +
    (input.section80D || 0) +
    (input.section80E || 0) +
    (input.section80G || 0) +
    (input.section24HRA || 0) +
    (input.otherDeductions || 0);

  const updatedDeduction = await prisma.deduction.update({
    where: { id: deduction!.id },
    data: {
      section80C: input.section80C || 0,
      section80D: input.section80D || 0,
      section80E: input.section80E || 0,
      section80G: input.section80G || 0,
      section24HRA: input.section24HRA || 0,
      totalDeductions
    }
  });

  // Update filing with deductions
  await prisma.taxFiling.update({
    where: { id: filingId },
    data: { totalDeductions }
  });

  return updatedDeduction;
}

/**
 * Calculate tax for a filing
 */
export async function calculateFilingTax(
  userId: string,
  filingId: string,
  userAge?: number
): Promise<any> {
  const filing = await prisma.taxFiling.findUnique({
    where: { id: filingId },
    include: {
      incomes: true,
      deductions: true
    }
  });

  if (!filing || filing.userId !== userId) {
    throw new Error('Filing not found');
  }

  const totalIncome = filing.totalIncome;
  const totalDeductions = filing.totalDeductions || 0;

  // Calculate based on regime
  let taxableIncome = totalIncome;
  let calculatedTax;

  if (filing.regime === 'new') {
    const standardDeduction = getStandardDeduction('new');
    taxableIncome = Math.max(0, totalIncome - standardDeduction);
    calculatedTax = calculateTax({
      totalIncome: taxableIncome,
      regime: 'new',
      age: 0
    });
  } else {
    taxableIncome = Math.max(0, totalIncome - totalDeductions);
    calculatedTax = calculateTax({
      totalIncome: taxableIncome,
      regime: 'old',
      age: userAge || 0
    });
  }

  // Update filing with tax calculations
  const updatedFiling = await prisma.taxFiling.update({
    where: { id: filingId },
    data: {
      taxableIncome,
      incomeTax: calculatedTax.incomeTax,
      surcharge: calculatedTax.surcharge,
      cess: calculatedTax.cess,
      totalTax: calculatedTax.totalTax,
      totalTaxPayable: calculatedTax.totalTax
    }
  });

  return updatedFiling;
}

/**
 * Submit filing for review
 */
export async function submitFiling(userId: string, filingId: string): Promise<any> {
  const filing = await prisma.taxFiling.findUnique({
    where: { id: filingId }
  });

  if (!filing || filing.userId !== userId) {
    throw new Error('Filing not found');
  }

  if (filing.status !== 'draft') {
    throw new Error('Only draft filings can be submitted');
  }

  return prisma.taxFiling.update({
    where: { id: filingId },
    data: {
      status: 'submitted',
      submittedAt: new Date()
    }
  });
}

/**
 * File return with ITR
 */
export async function fileReturn(userId: string, filingId: string): Promise<any> {
  const filing = await prisma.taxFiling.findUnique({
    where: { id: filingId }
  });

  if (!filing || filing.userId !== userId) {
    throw new Error('Filing not found');
  }

  if (filing.status !== 'submitted') {
    throw new Error('Filing must be submitted before filing');
  }

  return prisma.taxFiling.update({
    where: { id: filingId },
    data: {
      status: 'filed',
      filedAt: new Date()
    }
  });
}

/**
 * Compare old vs new regime
 */
export async function compareRegimesForFiling(
  userId: string,
  filingId: string,
  userAge?: number
): Promise<any> {
  const filing = await prisma.taxFiling.findUnique({
    where: { id: filingId }
  });

  if (!filing || filing.userId !== userId) {
    throw new Error('Filing not found');
  }

  const comparison = compareRegimes(filing.totalIncome, filing.totalDeductions, userAge || 0);

  return {
    totalIncome: filing.totalIncome,
    totalDeductions: filing.totalDeductions,
    oldRegimeTax: comparison.oldRegimeTax,
    newRegimeTax: comparison.newRegimeTax,
    betterRegime: comparison.betterRegime,
    savings: Math.abs(comparison.oldRegimeTax - comparison.newRegimeTax)
  };
}

export default {
  createTaxFiling,
  updateIncome,
  updateDeductions,
  calculateFilingTax,
  submitFiling,
  fileReturn,
  compareRegimesForFiling
};
