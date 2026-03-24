// =============================================================================
// TAX FILING CONTROLLER - Create, Update, Calculate, File Tax Returns
// =============================================================================
const reportService = require('../services/reportService');
const prisma = require('../utils/prisma').default || require('../utils/prisma');

// ────────────────────────────────────────────────────────────────────
// CREATE TAX FILING - Start a new tax filing for assessment year
// ────────────────────────────────────────────────────────────────────
async function createTaxFiling(req, res) {
  try {
    const userId = req.userId;
    const { assessmentYear, itrType, regime } = req.body;

    // Validate input
    if (!assessmentYear || !itrType || !regime) {
      return res.status(400).json({
        success: false,
        message: 'Assessment year, ITR type, and regime are required',
      });
    }

    // Create tax filing
    const filing = await prisma.taxFiling.create({
      data: {
        userId,
        assessmentYear,
        filingYear: parseInt(assessmentYear) + 1,
        itrType,
        regime,
        status: 'draft',
        income: {
          create: {
            salaryBasic: 0,
            salaryTA: 0,
            salaryDA: 0,
            salaryHRA: 0,
            salaryMedical: 0,
            businessIncome: 0,
            propertyIncome: 0,
            capitalGains: 0,
            otherIncome: 0,
          },
        },
        deductions: {
          create: {
            sec80C_PF: 0,
            sec80C_LIC: 0,
            sec80C_NSC: 0,
            sec80C_Tuition: 0,
            sec80D_Medical: 0,
            sec80E_Education: 0,
            sec80G_Donations: 0,
            sec24_HRA: 0,
          },
        },
      },
      include: {
        income: true,
        deductions: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Tax filing created successfully',
      data: { filing },
    });
  } catch (error) {
    console.error('Create filing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create tax filing',
      error: error.message,
    });
  }
}

// ────────────────────────────────────────────────────────────────────
// GET TAX FILING - Get single tax filing by ID
// ────────────────────────────────────────────────────────────────────
async function getTaxFiling(req, res) {
  try {
    const { filingId } = req.params;
    const userId = req.userId;

    const filing = await prisma.taxFiling.findUnique({
      where: { id: filingId },
      include: {
        income: true,
        deductions: true,
        documents: true,
        payment: true,
      },
    });

    if (!filing || filing.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Tax filing not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Tax filing fetched',
      data: { filing },
    });
  } catch (error) {
    console.error('Get filing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tax filing',
      error: error.message,
    });
  }
}

// ────────────────────────────────────────────────────────────────────
// LIST TAX FILINGS - Get all filings for user
// ────────────────────────────────────────────────────────────────────
async function getTaxFilings(req, res) {
  try {
    const userId = req.userId;
    const { limit = 20, offset = 0 } = req.query;

    const filings = await prisma.taxFiling.findMany({
      where: { userId },
      include: {
        income: true,
        deductions: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    const total = await prisma.taxFiling.count({ where: { userId } });

    res.status(200).json({
      success: true,
      message: 'Tax filings fetched',
      data: {
        filings,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    console.error('Get filings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tax filings',
      error: error.message,
    });
  }
}

// ────────────────────────────────────────────────────────────────────
// UPDATE INCOME - Update income details for filing
// ────────────────────────────────────────────────────────────────────
async function updateIncome(req, res) {
  try {
    const { filingId } = req.params;
    const userId = req.userId;
    const incomeData = req.body;

    // Verify filing belongs to user
    const filing = await prisma.taxFiling.findUnique({
      where: { id: filingId },
      include: { income: true },
    });

    if (!filing || filing.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Tax filing not found',
      });
    }

    // Update income
    const updatePayload = {
      salaryBasic: incomeData.salaryBasic || 0,
      salaryTA: incomeData.salaryTA || 0,
      salaryDA: incomeData.salaryDA || 0,
      salaryHRA: incomeData.salaryHRA || 0,
      salaryMedical: incomeData.salaryMedical || 0,
      businessIncome: incomeData.businessIncome || 0,
      propertyIncome: incomeData.propertyIncome || 0,
      capitalGains: incomeData.capitalGains || 0,
      otherIncome: incomeData.otherIncome || 0,
    };

    const income = await prisma.income.update({
      where: { filingId },
      data: updatePayload,
    });

    // Calculate total income
    const totalIncome = Object.values(updatePayload).reduce((a, b) => a + b, 0);

    // Update filing with total income
    const updatedFiling = await prisma.taxFiling.update({
      where: { id: filingId },
      data: { totalIncome },
      include: { income: true, deductions: true },
    });

    res.status(200).json({
      success: true,
      message: 'Income updated successfully',
      data: { filing: updatedFiling },
    });
  } catch (error) {
    console.error('Update income error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update income',
      error: error.message,
    });
  }
}

// ────────────────────────────────────────────────────────────────────
// UPDATE DEDUCTIONS - Update deductions for filing
// ────────────────────────────────────────────────────────────────────
async function updateDeductions(req, res) {
  try {
    const { filingId } = req.params;
    const userId = req.userId;
    const deductionData = req.body;

    // Verify filing belongs to user
    const filing = await prisma.taxFiling.findUnique({
      where: { id: filingId },
      include: { deductions: true },
    });

    if (!filing || filing.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Tax filing not found',
      });
    }

    // Update deductions
    const deduction = await prisma.deduction.update({
      where: { filingId },
      data: {
        sec80C_PF: deductionData.sec80C_PF || 0,
        sec80C_LIC: deductionData.sec80C_LIC || 0,
        sec80C_NSC: deductionData.sec80C_NSC || 0,
        sec80C_Tuition: deductionData.sec80C_Tuition || 0,
        sec80D_Medical: deductionData.sec80D_Medical || 0,
        sec80E_Education: deductionData.sec80E_Education || 0,
        sec80G_Donations: deductionData.sec80G_Donations || 0,
        sec24_HRA: deductionData.sec24_HRA || 0,
      },
    });

    // Calculate total deductions
    const totalDeductions =
      (deductionData.sec80C_PF || 0) +
      (deductionData.sec80C_LIC || 0) +
      (deductionData.sec80C_NSC || 0) +
      (deductionData.sec80C_Tuition || 0) +
      (deductionData.sec80D_Medical || 0) +
      (deductionData.sec80E_Education || 0) +
      (deductionData.sec80G_Donations || 0) +
      (deductionData.sec24_HRA || 0);

    // Update filing with total deductions
    const updatedFiling = await prisma.taxFiling.update({
      where: { id: filingId },
      data: { totalDeductions },
      include: { income: true, deductions: true },
    });

    res.status(200).json({
      success: true,
      message: 'Deductions updated successfully',
      data: { filing: updatedFiling },
    });
  } catch (error) {
    console.error('Update deductions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update deductions',
      error: error.message,
    });
  }
}

// ────────────────────────────────────────────────────────────────────
// CALCULATE TAX - Calculate tax for filing
// ────────────────────────────────────────────────────────────────────
async function calculateTax(req, res) {
  try {
    const { filingId } = req.params;
    const userId = req.userId;
    const { dateOfBirth } = req.body;

    // Get filing with income and deductions
    const filing = await prisma.taxFiling.findUnique({
      where: { id: filingId },
      include: { income: true, deductions: true, user: true },
    });

    if (!filing || filing.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Tax filing not found',
      });
    }

    // Calculate age from dateOfBirth
    let age = 0;
    if (filing.user.dateOfBirth) {
      const dob = new Date(filing.user.dateOfBirth);
      age = new Date().getFullYear() - dob.getFullYear();
    }

    // Calculate taxable income based on regime
    let taxableIncome = filing.totalIncome;
    if (filing.regime === 'new') {
      taxableIncome = Math.max(0, filing.totalIncome - 75000);
    } else {
      taxableIncome = Math.max(0, filing.totalIncome - filing.totalDeductions);
    }

    // Tax slabs (simplified)
    let incomeTax = 0;
    if (filing.regime === 'old') {
      // Old regime slabs
      if (taxableIncome > 10000000) incomeTax = 500000 + (taxableIncome - 10000000) * 0.3;
      else if (taxableIncome > 5000000) incomeTax = 200000 + (taxableIncome - 5000000) * 0.2;
      else if (taxableIncome > 2500000) incomeTax = (taxableIncome - 2500000) * 0.05;
    } else {
      // New regime slabs
      if (taxableIncome > 15000000) incomeTax = 2550000 + (taxableIncome - 15000000) * 0.3;
      else if (taxableIncome > 12000000) incomeTax = 1950000 + (taxableIncome - 12000000) * 0.2;
      else if (taxableIncome > 9000000) incomeTax = 1350000 + (taxableIncome - 9000000) * 0.15;
      else if (taxableIncome > 6000000) incomeTax = 750000 + (taxableIncome - 6000000) * 0.1;
      else if (taxableIncome > 3000000) incomeTax = (taxableIncome - 3000000) * 0.05;
    }

    // Surcharge (if income > 50L)
    let surcharge = 0;
    if (filing.totalIncome > 5000000) {
      surcharge = incomeTax * 0.1;
    }

    // Health & Education Cess
    const cess = (incomeTax + surcharge) * 0.04;

    const totalTax = incomeTax + surcharge + cess;
    const effectiveTaxRate = filing.totalIncome > 0 ? (totalTax / filing.totalIncome) * 100 : 0;

    // Update filing with calculated tax
    const updatedFiling = await prisma.taxFiling.update({
      where: { id: filingId },
      data: {
        taxableIncome,
        incomeTax,
        surcharge,
        cess,
        totalTaxPayable: totalTax,
        effectiveTaxRate,
      },
      include: { income: true, deductions: true },
    });

    res.status(200).json({
      success: true,
      message: 'Tax calculated successfully',
      data: {
        filing: updatedFiling,
        calculation: {
          grossIncome: filing.totalIncome,
          deductionsTotal: filing.totalDeductions,
          taxableIncome,
          incomeTax,
          surcharge,
          cess,
          totalTaxPayable: totalTax,
          effectiveTaxRate: effectiveTaxRate.toFixed(2) + '%',
        },
      },
    });
  } catch (error) {
    console.error('Calculate tax error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate tax',
      error: error.message,
    });
  }
}

// ────────────────────────────────────────────────────────────────────
// SUBMIT FILING - Submit filing (change status from draft to submitted)
// ────────────────────────────────────────────────────────────────────
async function submitFiling(req, res) {
  try {
    const { filingId } = req.params;
    const userId = req.userId;

    const filing = await prisma.taxFiling.findUnique({
      where: { id: filingId },
    });

    if (!filing || filing.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Tax filing not found',
      });
    }

    if (filing.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft filings can be submitted',
      });
    }

    const updatedFiling = await prisma.taxFiling.update({
      where: { id: filingId },
      data: {
        status: 'submitted',
        submittedAt: new Date(),
      },
      include: { income: true, deductions: true },
    });

    res.status(200).json({
      success: true,
      message: 'Filing submitted successfully',
      data: { filing: updatedFiling },
    });
  } catch (error) {
    console.error('Submit filing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit filing',
      error: error.message,
    });
  }
}

// ────────────────────────────────────────────────────────────────────
// FILE RETURN - File return (change status to filed)
// ────────────────────────────────────────────────────────────────────
async function fileReturn(req, res) {
  try {
    const { filingId } = req.params;
    const userId = req.userId;

    const filing = await prisma.taxFiling.findUnique({
      where: { id: filingId },
    });

    if (!filing || filing.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Tax filing not found',
      });
    }

    if (filing.status !== 'submitted') {
      return res.status(400).json({
        success: false,
        message: 'Only submitted filings can be filed',
      });
    }

    const updatedFiling = await prisma.taxFiling.update({
      where: { id: filingId },
      data: {
        status: 'filed',
        filedAt: new Date(),
      },
      include: { income: true, deductions: true },
    });

    res.status(200).json({
      success: true,
      message: 'Return filed successfully',
      data: { filing: updatedFiling },
    });
  } catch (error) {
    console.error('File return error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to file return',
      error: error.message,
    });
  }
}

module.exports = {
  createTaxFiling,
  getTaxFiling,
  getTaxFilings,
  updateIncome,
  updateDeductions,
  calculateTax,
  submitFiling,
  fileReturn,
};
