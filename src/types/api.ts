export type ProfileType = 'Individual' | 'Business';
export type FilingStatus = 'pending_upload' | 'upload_done' | 'pending_accountant_payment' | 'submitted' | 'tax_agent_review' | 'tax_agent_approved' | 'pending_filing_payment' | 'filed';
export type FilingPreference = 'monthly' | 'annual';
export type IncomeType = 'employment' | 'freelance' | 'crypto' | 'rental' | 'investment' | 'business';
export type IncomeCategory = 'salary' | 'freelance_fee' | 'crypto' | 'rental_income' | 'dividends' | 'business_revenue';
export type DeductionVerificationStatus = 'pending' | 'verified' | 'rejected';

export interface TaxPeriod {
  year: number;
  month?: number;
}

export interface UploadSession {
  uploadId: string;
  uploadUrl: string;
}

export interface Profile {
  profileId: string;
  id: string;
  year: number;
  profileType: ProfileType;
  status: string;
  filingStatus: FilingStatus;
  filingPreference?: FilingPreference;
  createdAt: string;
  updatedAt?: string;
  uploadSession?: UploadSession;
  personalInfo?: PersonalInfoRequest;
  // Additional fields from API response at top level
  nin?: string;
  primaryIncomeSources?: string[];
  residency183Days?: boolean;
  paysRent?: boolean;
  rentAnnualAmount?: number;
  rentMonthlyAmount?: number;
  hasHealthInsurance?: boolean;
  healthInsuranceAnnualAmount?: number;
  healthInsuranceMonthlyAmount?: number;
  hasPension?: boolean;
  pensionAnnualAmount?: number;
  pensionMonthlyAmount?: number;
  hasMortgage?: boolean;
  dob?: string;
  street?: string;
  city?: string;
  state?: string;
  fullName?: string;
  email?: string;
  phone?: string;
}

export interface ProfileCompleteRequest {
  nin?: string;
  primaryIncomeSources?: string[];
  residency183Days?: boolean;
  state?: string;
  paysRent?: boolean;
  rentAnnualAmount?: number;
  rentMonthlyAmount?: number;
  hasHealthInsurance?: boolean;
  healthInsuranceAnnualAmount?: number;
  healthInsuranceMonthlyAmount?: number;
  hasPension?: boolean;
  pensionAnnualAmount?: number;
  pensionMonthlyAmount?: number;
  hasMortgage?: boolean;
  filingPreference?: FilingPreference;
  dob?: string;
  street?: string;
  city?: string;
}

export interface PersonalInfoRequest {
  nin?: string;
  residencyStatus?: string;
  fullName?: string;
  dateOfBirth?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
}

export interface AllowedYearsResponse {
  success: boolean;
  data: {
    allowedYears: number[];
    currentYear: number;
    note: string;
  };
}

export interface IncomeSourcesResponse {
  success: boolean;
  data: {
    incomeSources: string[];
    count: number;
  };
}

export interface EmploymentDetails {
  employerName?: string;
  employerTIN?: string;
  annualGrossSalary?: number;
  bonuses?: number;
  commissions?: number;
}

export interface FreelanceDetails {
  clientName?: string;
  freelanceFees?: number;
  royalties?: number;
}

export interface CryptoDetails {
  platformName?: string;
  cryptoType?: string;
  amountInNGN?: number;
}

export interface IncomeRecord {
  _id: string;
  incomeType: IncomeType;
  category: IncomeCategory;
  totalAmount: number;
  netAmount: number;
  period: TaxPeriod;
  employment?: EmploymentDetails;
  freelance?: FreelanceDetails;
  crypto?: CryptoDetails;
  createdAt?: string;
  updatedAt?: string;
}

export interface IncomeListResponse {
  success: boolean;
  data: {
    incomeRecords: IncomeRecord[];
    summary: {
      totalRecords: number;
      totalAmount: number;
      totalNetAmount: number;
      averageAmount: number;
    };
  };
}

export interface AddIncomeRequest {
  type: IncomeType;
  category: IncomeCategory;
  amount: number;
  month: number;
  year: number;
  employerName?: string;
  employerTIN?: string;
  bonuses?: number;
  commissions?: number;
  clientName?: string;
  freelanceFees?: number;
  royalties?: number;
  platformName?: string;
  cryptoType?: string;
  amountInNGN?: number;
}

export interface IncomeResponse {
  success: boolean;
  message: string;
  data: {
    incomeRecord: IncomeRecord;
  };
}

export interface IncomeSummaryResponse {
  success: boolean;
  data: {
    summary: {
      totalRecords: number;
      totalAmount: number;
      totalNetAmount: number;
      averageAmount: number;
      byType: Record<string, { count: number; totalAmount: number }>;
    };
    monthlyBreakdown: { month: number; year: number; totalAmount: number; count: number }[];
  };
}

export interface DeductibleDisplay {
  display: string;
  annualAmount: number;
}

export interface TaxSummaryProfile {
  profileId: string;
  year: number;
  filingStatus: FilingStatus;
  filingPreference: string;
  nin: string;
  taxAuthority: string;
  deductibles: {
    rent: DeductibleDisplay;
    healthInsurance: DeductibleDisplay;
    pension: DeductibleDisplay;
    mortgage: DeductibleDisplay;
  };
}

export interface TaxSummary {
  totalIncome: number;
  totalDeductions: number;
  chargeableIncome: number;
  estimatedAnnualTax: number;
  estimatedMonthlyTax: number;
  isRefund: boolean;
  breakdownAvailable: boolean;
}

export interface ActionButtons {
  canSubmit: boolean;
  canPayAccountantReview: boolean;
  canPayFilingFee: boolean;
  canFile: boolean;
}

export interface PaymentOption {
  type: string;
  amount: number;
  status: string;
}

export interface TaxSummaryResponse {
  success: boolean;
  data: {
    profile: TaxSummaryProfile;
    taxSummary: TaxSummary;
    actions: ActionButtons;
    paymentOptions: PaymentOption[];
  };
}

export interface TaxBracket {
  from: number;
  to: number;
  rate: number;
  amount: number;
}

export interface IncomeSourceSummary {
  type: string;
  category: string;
  amount: number;
}

export interface DeductionSummary {
  type: string;
  amount: number;
  verificationStatus: DeductionVerificationStatus;
}

export interface CalculationDetails {
  grossIncome: number;
  totalDeductions: number;
  totalReliefs: number;
  taxableIncome: number;
  taxBrackets: TaxBracket[];
  grossTax: number;
  netTaxPayable: number;
  calculationDate: string;
}

export interface CalculateTaxResponse {
  success: boolean;
  data: {
    profile: {
      profileId: string;
      year: number;
      profileType: ProfileType;
      primaryTIN?: string;
      nin?: string;
    };
    calculation: CalculationDetails;
    summary: {
      incomeSources: IncomeSourceSummary[];
      deductions: DeductionSummary[];
    };
  };
}

export interface CalculationHistoryItem {
  calculationId: string;
  calculationType: string;
  period: TaxPeriod;
  finalTaxLiability: number;
  isRefund: boolean;
  status: string;
  calculatedAt: string;
}

export interface CalculationHistoryResponse {
  success: boolean;
  data: {
    calculations: CalculationHistoryItem[];
  };
}

export interface CreatePaymentLinkRequest {
  profileId: string;
  type: 'accountant_review' | 'filing_fee';
}

export interface CreatePaymentLinkResponse {
  success: boolean;
  data: {
    authorization_url: string;
    reference: string;
    type: string;
    amountNaira: number;
  };
}

export interface CreateSubscriptionLinkRequest {
  plan: 'monthly' | 'yearly';
  callback_url?: string;
}

export interface SubscriptionStatusResponse {
  success: boolean;
  data: {
    hasActiveSubscription: boolean;
    activeSubscription?: {
      plan: string;
      planName: string;
      paidAt: string;
      currentPeriodEnd: string;
    };
  };
}

export interface CreateFilingPaymentLinkRequest {
  profileId: string;
  month?: number;
}

export interface CreateTaxAgentPaymentLinkRequest {
  profileId: string;
}

export interface PaymentLinkResponse {
  success: boolean;
  data: {
    authorization_url: string;
    reference: string;
  };
}

export interface PaymentRecord {
  id: string;
  profileId: string;
  type: string;
  amount: number;
  status: string;
  reference: string;
  month?: number;
  createdAt: string;
}

export interface PaymentRecordsResponse {
  success: boolean;
  data: {
    payments: PaymentRecord[];
  };
}

export interface VerifyDeductionRequest {
  status: 'verified' | 'rejected';
  notes?: string;
  documentId?: string;
}

export interface DeductionVerificationResponse {
  success: boolean;
  message: string;
  data: {
    deduction: {
      id: string;
      deductionType: string;
      amount: number;
      verificationStatus: DeductionVerificationStatus;
      verificationNotes?: string;
      verifiedBy?: string;
      verifiedAt?: string;
      documentId?: string;
    };
  };
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export type DeductionType =
  | 'nhf'
  | 'nhis'
  | 'insurance'
  | 'health_insurance'
  | 'pension'
  | 'life_insurance'
  | 'mortgage_interest'
  | 'mortgage'
  | 'rent_relief'
  | 'transport_allowance'
  | 'other';

export interface Deduction {
  _id: string;
  deductionType: DeductionType;
  amount: number;
  // Newer API shape support
  type?: string;
  value?: number;
  frequency?: 'annual' | 'monthly' | string;
  month?: number | null;
  year?: number;
  period: {
    year: number;
    startDate: string;
    endDate: string;
  };
  verificationStatus: DeductionVerificationStatus;
  documentUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UploadResponse {
  success: boolean;
  data: {
    url: string;
    documentId: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
  };
}

export interface BatchDeductionItem {
  deductionType: DeductionType;
  amount: number;
  documentUrl?: string;
  frequency?: 'annual' | 'monthly';
  month?: number | null;
}

export interface BatchDeductionRequest {
  profileId: string;
  year: number;
  deductions: BatchDeductionItem[];
}

export interface BatchDeductionResponse {
  success: boolean;
  message: string;
  data: {
    profileId: string;
    profileYear: number;
    deductions: Deduction[];
    deductionsByYear: Record<string, Deduction[]>;
  };
}

export interface DeductionListResponse {
  success: boolean;
  data: {
    profileId: string;
    profileYear: number;
    deductions: Deduction[];
    deductionsByYear: Record<string, Deduction[]>;
    count: number;
  };
}

export interface CreateDeductionRequest {
  profileId: string;
  year: number;
  deductionType: DeductionType;
  amount: number;
}

export interface UpdateDeductionRequest {
  // Legacy support
  amount?: number;
  deductionType?: DeductionType;

  // Newer API shape support
  profileId?: string;
  year?: number;
  type?: string;
  value?: number;
  frequency?: 'annual' | 'monthly';
  month?: number | null;
  documentUrl?: string;
}

export interface DeductionResponse {
  success: boolean;
  message: string;
  data: {
    deduction: Deduction;
  };
}

export interface DeleteDeductionResponse {
  success: boolean;
  message: string;
  data: {
    deletedDeduction: {
      id: string;
      deductionType: string;
      amount: number;
      year: number;
    };
  };
}

export interface ProfileListResponse {
  success: boolean;
  message?: string;
  data: {
    profiles: Profile[];
    total: number;
  };
}

export type IncomeDataType = 'employment' | 'digital_assets' | 'freelance';

export interface IncomeDataEmployment {
  type: 'employment';
  grossSalary: number;
  bonuses: number;
  commissions: number;
  documentUrl?: string;
}

export interface IncomeDataDigitalAssets {
  type: 'digital_assets';
  value: number;
  documentUrl?: string;
}

export interface IncomeDataFreelance {
  type: 'freelance';
  value: number;
  documentUrl?: string;
}

export type IncomeDataItem = IncomeDataEmployment | IncomeDataDigitalAssets | IncomeDataFreelance;

export interface IncomeDataResponse {
  success: boolean;
  data: {
    profileId: string;
    year: number;
    filingPreference: FilingPreference;
    incomes: IncomeDataItem[][];
  };
}

export interface UpdateIncomeDataRequest {
  incomes: IncomeDataItem[];
}

export interface UpdateIncomeDataResponse {
  success: boolean;
  message: string;
  data: {
    profileId: string;
    year: number;
    filingPreference: FilingPreference;
    month?: number;
    incomes: IncomeDataItem[];
  };
}