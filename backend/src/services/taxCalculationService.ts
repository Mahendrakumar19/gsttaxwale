// =============================================================================
// TAX CALCULATION ENGINE - Indian tax system implementation
// =============================================================================

interface TaxSlabs {
  lowerLimit: number;
  upperLimit: number | null;
  rate: number;
}

interface TaxCalculationInput {
  totalIncome: number;
  regime: 'old' | 'new';
  age: number;
}

interface TaxCalculationResult {
  taxableIncome: number;
  incomeTax: number;
  surcharge: number;
  cess: number;
  totalTax: number;
  effectiveTaxRate: number;
}

// Old Tax Regime Slabs (2023-24) - FY 2023-24, AY 2024-25
const OLD_REGIME_SLABS: TaxSlabs[] = [
  { lowerLimit: 0, upperLimit: 250000, rate: 0 },
  { lowerLimit: 250001, upperLimit: 500000, rate: 0.05 },
  { lowerLimit: 500001, upperLimit: 1000000, rate: 0.2 },
  { lowerLimit: 1000001, upperLimit: null, rate: 0.3 }
];

// New Tax Regime Slabs (2023-24) - FY 2023-24, AY 2024-25
const NEW_REGIME_SLABS: TaxSlabs[] = [
  { lowerLimit: 0, upperLimit: 300000, rate: 0 },
  { lowerLimit: 300001, upperLimit: 600000, rate: 0.05 },
  { lowerLimit: 600001, upperLimit: 900000, rate: 0.1 },
  { lowerLimit: 900001, upperLimit: 1200000, rate: 0.15 },
  { lowerLimit: 1200001, upperLimit: 1500000, rate: 0.2 },
  { lowerLimit: 1500001, upperLimit: null, rate: 0.3 }
];

// Senior Citizen Old Regime (60+ years)
const SENIOR_CITIZEN_SLABS: TaxSlabs[] = [
  { lowerLimit: 0, upperLimit: 300000, rate: 0 },
  { lowerLimit: 300001, upperLimit: 500000, rate: 0.05 },
  { lowerLimit: 500001, upperLimit: 1000000, rate: 0.2 },
  { lowerLimit: 1000001, upperLimit: null, rate: 0.3 }
];

// Very Senior Citizen Old Regime (80+ years)
const VERY_SENIOR_CITIZEN_SLABS: TaxSlabs[] = [
  { lowerLimit: 0, upperLimit: 500000, rate: 0 },
  { lowerLimit: 500001, upperLimit: 1000000, rate: 0.2 },
  { lowerLimit: 1000001, upperLimit: null, rate: 0.3 }
];

/**
 * Calculate income tax based on slabs
 */
function calculateTaxFromSlabs(income: number, slabs: TaxSlabs[]): number {
  let tax = 0;

  for (const slab of slabs) {
    if (income <= slab.lowerLimit) {
      break;
    }

    const lowerLimit = slab.lowerLimit;
    const upperLimit = slab.upperLimit || income;
    const incomeInSlab = Math.min(income, upperLimit) - lowerLimit;

    if (incomeInSlab > 0) {
      tax += incomeInSlab * slab.rate;
    }
  }

  return tax;
}

/**
 * Calculate surcharge (additional tax on high income)
 */
function calculateSurcharge(income: number, tax: number): number {
  if (income <= 5000000) return 0;
  if (income <= 10000000) return tax * 0.10;
  if (income <= 20000000) return tax * 0.15;
  if (income <= 50000000) return tax * 0.25;
  return tax * 0.37;
}

/**
 * Calculate Health and Education Cess (4% on tax + surcharge)
 */
function calculateCess(tax: number, surcharge: number): number {
  return (tax + surcharge) * 0.04;
}

/**
 * Get applicable slabs based on age and regime
 */
function getApplicableSlabs(age: number, regime: 'old' | 'new'): TaxSlabs[] {
  if (regime === 'new') {
    return NEW_REGIME_SLABS;
  }

  // Old regime - different slabs for different ages
  if (age >= 80) {
    return VERY_SENIOR_CITIZEN_SLABS;
  }
  if (age >= 60) {
    return SENIOR_CITIZEN_SLABS;
  }
  return OLD_REGIME_SLABS;
}

/**
 * Main tax calculation function
 */
export function calculateTax(input: TaxCalculationInput): TaxCalculationResult {
  const { totalIncome, regime, age } = input;

  // Get applicable slabs
  const slabs = getApplicableSlabs(age || 0, regime);

  // Calculate gross tax
  const incomeTax = calculateTaxFromSlabs(totalIncome, slabs);

  // Calculate surcharge
  const surcharge = calculateSurcharge(totalIncome, incomeTax);

  // Calculate cess
  const cess = calculateCess(incomeTax, surcharge);

  // Total tax
  const totalTax = incomeTax + surcharge + cess;

  // Effective tax rate
  const effectiveTaxRate = totalIncome > 0 ? (totalTax / totalIncome) * 100 : 0;

  return {
    taxableIncome: totalIncome,
    incomeTax,
    surcharge,
    cess,
    totalTax,
    effectiveTaxRate
  };
}

/**
 * Calculate standard deduction based on income and regime
 */
export function getStandardDeduction(regime: 'old' | 'new'): number {
  if (regime === 'new') {
    return 75000; // FY 2023-24
  }
  return 0; // No standard deduction in old regime
}

/**
 * Calculate maximum deduction under section 80C
 */
export function getSection80CLimit(): number {
  return 150000;
}

/**
 * Calculate rebate under section 87A (for individuals with total income up to ₹5 lakhs)
 */
export function calculateRebate(
  totalIncome: number,
  tax: number,
  regime: 'old' | 'new'
): number {
  // Rebate not applicable directly in current regime
  // This is for future reference when rebates are introduced
  return 0;
}

/**
 * Compare old vs new regime and return better option
 */
export function compareRegimes(
  totalIncome: number,
  deductions: number,
  age: number
): { oldRegimeTax: number; newRegimeTax: number; betterRegime: 'old' | 'new' } {
  // Old regime calculation (with deductions)
  const taxableIncomeOld = Math.max(0, totalIncome - deductions);
  const oldRegimeResult = calculateTax({
    totalIncome: taxableIncomeOld,
    regime: 'old',
    age
  });

  // New regime calculation (with standard deduction)
  const standardDeduction = getStandardDeduction('new');
  const taxableIncomeNew = Math.max(0, totalIncome - standardDeduction);
  const newRegimeResult = calculateTax({
    totalIncome: taxableIncomeNew,
    regime: 'new',
    age: 0 // No age benefit in new regime
  });

  return {
    oldRegimeTax: oldRegimeResult.totalTax,
    newRegimeTax: newRegimeResult.totalTax,
    betterRegime: oldRegimeResult.totalTax <= newRegimeResult.totalTax ? 'old' : 'new'
  };
}

export default {
  calculateTax,
  getStandardDeduction,
  getSection80CLimit,
  calculateRebate,
  compareRegimes
};
