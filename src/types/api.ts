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
  status: FilingStatus | 'draft';
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
  displayName?: string;
  isComplete?: boolean;
  canFile?: boolean;
  intent?: string;
  businessCompanyInfo?: {
    RCNumber?: string;
    [key: string]: unknown;
  };
  businessSetup?: {
    payeEnabled?: boolean;
    vatEnabled?: boolean;
    whtEnabled?: boolean;
    citEnabled?: boolean;
    [key: string]: unknown;
  };
}

export interface CreateProfileTaxTypes {
  paye: boolean;
  vatWht: boolean;
  cit: boolean;
}

export interface CreateProfileOptions {
  intent?: string;
  taxId?: string;
  taxTypes?: CreateProfileTaxTypes;
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
  tin?: string;
  residencyStatus?: string;
  fullName?: string;
  dob?: string;
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

export interface MonthlyTaxResponse {
  success: boolean;
  data: {
    profileId: string;
    year: number;
    filingPreference: string;
    month: number;
    taxSummary: {
      totalIncome: number;
      totalCalculatedRelief: number;
      taxableIncome: number;
      totalTaxAmount: number;
      monthlyTax: number;
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

export type Income = IncomeDataItem[];

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
    count?: number;
    total?: number;
  };
}

export interface BusinessAddress {
  street?: string;
  city?: string;
  state?: string;
  lga?: string;
  country?: string;
}

export interface BusinessCompanyInfoData {
  businessAddress?: BusinessAddress;
  companyName?: string;
  RCNumber?: string;
  industrySector?: string;
  dateOfIncorporation?: string;
}

export interface BusinessCitEstimate {
  payCitQuarterly?: boolean;
  estimatedGrossRevenue?: number;
  estimatedProfitMargin?: number;
  estimatedAnnualProfit?: number;
  estimatedAnnualCit?: number;
  quarterlyInstallment?: number;
}

export interface BusinessCompanyInfoRequest {
  companyName?: string;
  industrySector?: string;
  dateOfIncorporation?: string;
  businessAddress?: BusinessAddress;
  payCitQuarterly?: boolean;
  estimatedGrossRevenue?: number;
  estimatedProfitMargin?: number;
}

export interface BusinessCompanyInfoResponse {
  success: boolean;
  message?: string;
  data: {
    profileId: string;
    year?: number;
    companyInfo: BusinessCompanyInfoData;
    citEstimate?: BusinessCitEstimate;
  };
}

export interface PayeEmployeeDeductions {
  pension: boolean;
  nhf: boolean;
  hmo: boolean;
  annualRent: boolean;
}

export interface PayeEmployeePayroll {
  grossIncome: number;
  annualGrossIncome: number;
  taxableIncome: number;
  hmo: number;
  pension: number;
  nhf: number;
  annualRent: number;
  rentRelief: number;
  annualPaye: number;
  payeThisMonth: number;
}

export interface PayeEmployee {
  id: string;
  employeeId?: string;
  month: number;
  year: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  jtbTaxId: string;
  monthlySalary: number;
  statutoryDeductions: PayeEmployeeDeductions;
  annualRentAmount?: number;
  deductionAmounts?: {
    pension: number;
    nhf: number;
    hmo: number;
  };
  payroll?: PayeEmployeePayroll;
  totalDeductions?: number;
  status?: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface PayeEmployeesListResponse {
  success: boolean;
  message?: string;
  data: {
    profileId: string;
    month: number;
    monthName: string;
    year: number;
    employees: PayeEmployee[];
    summary?: {
      totalEmployees: number;
      totalGross: number;
      totalPayeThisMonth: number;
    };
  };
}

export interface CreatePayeEmployeeRequest {
  month: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobPosition: string;
  jtbTaxId: string;
  monthlySalary: number;
  deductions: PayeEmployeeDeductions;
  annualRentAmount?: number;
}

export interface UpdatePayeEmployeeRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  jobPosition?: string;
  jtbTaxId?: string;
  monthlySalary?: number;
  deductions?: PayeEmployeeDeductions;
  annualRentAmount?: number;
}

export interface PayeEmployeeResponse {
  success: boolean;
  message?: string;
  data: {
    employee: PayeEmployee;
  };
}

export interface DeletePayeEmployeeResponse {
  success: boolean;
  message?: string;
  data: {
    deletedEmployee: {
      id: string;
      employeeId?: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

// ── Business VAT ─────────────────────────────────────────

export type VatFilingStatus = 'draft' | 'filed';

export interface VatComputed {
  outputVAT: number;
  netPosition: number;
  isCredit: boolean;
}

export interface VatFiling {
  id: string;
  year: number;
  month: number;
  monthName?: string;
  status: VatFilingStatus;
  filed: boolean;
  filedAt?: string;
  standardSales: number;
  exemptSales: number;
  wvatCredit: number;
  allowableInputVAT: number;
  nonAllowableOverheads: number;
  nonAllowableCapEx: number;
  broughtForwardCredit: number;
  salesScheduleUrl?: string;
  purchaseInvoicesUrl?: string;
  disclaimerAccepted?: boolean;
  computed?: VatComputed;
  updatedAt?: string;
}

export interface VatMonthSummary {
  month: number;
  monthName: string;
  status: VatFilingStatus;
  filed: boolean;
  summary?: {
    outputVAT: number;
    netPosition: number;
  };
}

export interface UpsertVatRequest {
  year: number;
  month: number;
  standardSales: number;
  exemptSales?: number;
  wvatCredit?: number;
  allowableInputVAT?: number;
  nonAllowableOverheads?: number;
  nonAllowableCapEx?: number;
  broughtForwardCredit?: number;
  salesScheduleUrl?: string;
  purchaseInvoicesUrl?: string;
  disclaimerAccepted?: boolean;
}

export interface FileVatRequest {
  year: number;
  month: number;
}

export interface VatListResponse {
  success: boolean;
  message?: string;
  data: {
    profileId: string;
    year: number;
    months: VatMonthSummary[];
  };
}

export interface VatFilingResponse {
  success: boolean;
  message?: string;
  data: {
    filing: VatFiling;
  };
}

export interface DeleteVatMonthResponse {
  success: boolean;
  message?: string;
  data?: {
    deletedMonth: {
      year: number;
      month: number;
    };
  };
}

// ── Business WHT Deductions ──────────────────────────────

export type WhtDeductionType =
  | 'consultancy'
  | 'contracts'
  | 'transport'
  | 'rent'
  | 'director_fees'
  | string;

export interface WhtDeduction {
  id: string;
  payee: string;
  tin: string;
  whtType: WhtDeductionType;
  gross: number;
  whtRate: number;
  whtDeducted: number;
  netPaid: number;
  date: string;
  receiptUrl?: string;
  month?: number;
  year?: number;
  createdAt?: string;
}

export interface CreateWhtDeductionRequest {
  year: number;
  month: number;
  payee: string;
  tin: string;
  whtType: WhtDeductionType;
  gross: number;
  whtRate: number;
  date: string;
  receiptUrl?: string;
}

export interface UpdateWhtDeductionRequest {
  payee?: string;
  tin?: string;
  whtType?: WhtDeductionType;
  gross?: number;
  whtRate?: number;
  date?: string;
  receiptUrl?: string;
}

export interface FileWhtMonthRequest {
  year: number;
  month: number;
}

export interface WhtDeductionsListResponse {
  success: boolean;
  message?: string;
  data: {
    profileId: string;
    year: number;
    month: number;
    monthName: string;
    status: 'draft' | 'filed';
    deductions: WhtDeduction[];
    summary?: {
      totalDeductions: number;
      totalWhtToRemit: number;
    };
  };
}

export interface WhtDeductionResponse {
  success: boolean;
  message?: string;
  data: {
    deduction: WhtDeduction;
  };
}

export interface DeleteWhtDeductionResponse {
  success: boolean;
  message?: string;
  data?: {
    deletedDeduction: {
      id: string;
      payee: string;
    };
  };
}

export interface FileWhtMonthResponse {
  success: boolean;
  message?: string;
  data: {
    year: number;
    month: number;
    status: 'filed';
    filed: true;
    filedAt?: string;
  };
}

// ── Business WHT Credits ─────────────────────────────────

export type WhtCreditType =
  | 'services'
  | 'rent'
  | 'dividends'
  | 'interest'
  | 'royalties'
  | 'construction'
  | 'haulage'
  | string;

export interface WhtCredit {
  id: string;
  payee: string;
  tin: string;
  whtType: WhtCreditType;
  gross: number;
  whtRate?: number;
  whtDeducted?: number;
  date: string;
  receiptUrl?: string;
  month?: number;
  year?: number;
  createdAt?: string;
}

export interface CreateWhtCreditRequest {
  year: number;
  month?: number;
  payee: string;
  tin: string;
  whtType: WhtCreditType;
  gross: number;
  date: string;
  receiptUrl?: string;
}

export interface UpdateWhtCreditRequest {
  payee?: string;
  tin?: string;
  whtType?: WhtCreditType;
  gross?: number;
  date?: string;
  receiptUrl?: string;
  month?: number;
}

export interface WhtCreditsListResponse {
  success: boolean;
  message?: string;
  data: {
    profileId: string;
    year: number;
    month?: number;
    credits: WhtCredit[];
    summary?: {
      totalCredits: number;
      totalWhtSuffered: number;
    };
  };
}

export interface WhtCreditResponse {
  success: boolean;
  message?: string;
  data: {
    credit: WhtCredit;
  };
}

export interface DeleteWhtCreditResponse {
  success: boolean;
  message?: string;
  data?: {
    deletedCredit: {
      id: string;
      payee: string;
    };
  };
}

// ── Business CIT ─────────────────────────────────────────

export type CitFilingStatus = 'draft' | 'filed';
export type CitSettlementPreference = 'rollover' | 'refund';
export type CitQuarterStatus = 'pending' | 'paid' | 'deferred';

export interface CitFinancials {
  totalRevenue: number;
  cogs: number;
  opex: number;
  govFines: number;
  accountingDepreciation: number;
  generalProvisions: number;
}

export interface CitCapitalAllowances {
  class1Assets: number;
  class2Assets: number;
  class3Assets: number;
}

export interface CitDocuments {
  auditedFinancialsUrl?: string;
  trialBalanceUrl?: string;
}

export interface CitComputed {
  accountingProfit: number;
  nonDeductibleTotal: number;
  totalCapitalAllowances: number;
  assessableProfit: number;
  bracketRate: number;
  baseCIT: number;
  developmentLevy: number;
  totalObligation: number;
  totalWhtCredits: number;
  totalQuarterlyPaid: number;
  finalPosition: number;
}

export interface CitFiling {
  profileId: string;
  year: number;
  status: CitFilingStatus;
  filed: boolean;
  filedAt?: string;
  financials: CitFinancials;
  capitalAllowances: CitCapitalAllowances;
  documents?: CitDocuments;
  settlementPreference?: CitSettlementPreference | null;
  computed?: CitComputed;
  updatedAt?: string;
}

export interface UpsertCitRequest {
  year: number;
  totalRevenue: number;
  cogs?: number;
  opex?: number;
  govFines?: number;
  accountingDepreciation?: number;
  generalProvisions?: number;
  class1Assets?: number;
  class2Assets?: number;
  class3Assets?: number;
  auditedFinancialsUrl?: string;
  trialBalanceUrl?: string;
  settlementPreference?: CitSettlementPreference;
}

export interface FileCitRequest {
  year: number;
  legalConfirmAccuracy: boolean;
  legalConfirmAuthority: boolean;
  settlementPreference?: CitSettlementPreference;
}

export interface CitFilingResponse {
  success: boolean;
  message?: string;
  data: CitFiling;
}

export interface FileCitResponse {
  success: boolean;
  message?: string;
  data: {
    profileId: string;
    year: number;
    status: 'filed';
    filed: true;
    filedAt?: string;
    settlementPreference?: CitSettlementPreference;
  };
}

export interface CitWhtCredit {
  id: string;
  clientName: string;
  clientTIN: string;
  creditRef: string;
  grossValue: number;
  withheldAmount: number;
  certificateUrl?: string;
  year?: number;
  createdAt?: string;
}

export interface CreateCitWhtCreditRequest {
  year: number;
  clientName: string;
  clientTIN: string;
  creditRef: string;
  grossValue: number;
  withheldAmount: number;
  certificateUrl?: string;
}

export interface UpdateCitWhtCreditRequest {
  clientName?: string;
  clientTIN?: string;
  creditRef?: string;
  grossValue?: number;
  withheldAmount?: number;
  certificateUrl?: string;
}

export interface CitWhtCreditsListResponse {
  success: boolean;
  message?: string;
  data: {
    profileId: string;
    year: number;
    credits: CitWhtCredit[];
    summary?: {
      totalCredits: number;
      totalWithheld: number;
    };
  };
}

export interface CitWhtCreditResponse {
  success: boolean;
  message?: string;
  data: {
    credit: CitWhtCredit;
  };
}

export interface DeleteCitWhtCreditResponse {
  success: boolean;
  message?: string;
  data?: {
    deletedCredit: {
      id: string;
      clientName: string;
    };
  };
}

export interface CitQuarter {
  quarter: number;
  status: CitQuarterStatus;
  amountDue: number;
  amountPaid: number;
  paidAt?: string | null;
}

export interface CitQuarterlyData {
  year: number;
  payCitQuarterly: boolean;
  estimatedGrossRevenue?: number;
  estimatedProfitMargin?: number;
  estimatedAnnualProfit?: number;
  estimatedAnnualCit?: number;
  quarterlyInstallment?: number;
  quarters: CitQuarter[];
  summary?: {
    totalPaid: number;
    remaining: number;
  };
}

export interface CitQuarterlyResponse {
  success: boolean;
  message?: string;
  data: CitQuarterlyData;
}

export interface PayCitQuarterRequest {
  year: number;
  quarter: number;
  amount: number;
}

export interface DeferCitQuarterRequest {
  year: number;
  quarter: number;
}

export interface CitQuarterActionResponse {
  success: boolean;
  message?: string;
  data: {
    year: number;
    quarter: number;
    status: CitQuarterStatus;
    amountPaid?: number;
    paidAt?: string | null;
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

/** PIT UI income fields (comma-stripped numbers on the wire) */
export interface PitIncomeFields {
  salaryTakeHome?: number;
  businessRevenue?: number;
  businessExpenses?: number;
  freelanceInvoiced?: number;
  freelanceWHT?: number;
  investmentIncome?: number;
  rentalIncome?: number;
  digitalGains?: number;
}

export interface PitDeductionFields {
  rent?: number;
  healthInsurance?: number;
  pension?: number;
  mortgageInterest?: number;
}

export interface PitIncomeDocuments {
  salaryUrl?: string | null;
  businessUrl?: string | null;
  freelanceUrl?: string | null;
  investmentUrl?: string | null;
  rentalUrl?: string | null;
  cryptoUrl?: string | null;
  rentUrl?: string | null;
  healthUrl?: string | null;
  pensionUrl?: string | null;
  mortgageUrl?: string | null;
}

export interface PitMonthIncomeData {
  month: number;
  monthName?: string;
  recorded?: boolean;
  income?: PitIncomeFields;
  deductions?: PitDeductionFields;
  documents?: PitIncomeDocuments;
  computed?: {
    businessNet?: number;
    freelanceNet?: number;
    grossIncome?: number;
    totalDeductions?: number;
  };
}

export interface UpdateIncomeDataRequest {
  year?: number;
  income?: PitIncomeFields;
  deductions?: PitDeductionFields;
  documents?: PitIncomeDocuments;
  markRecorded?: boolean;
  /** Legacy shape — kept for compatibility */
  incomes?: IncomeDataItem[];
}

export interface IncomeDataResponse {
  success: boolean;
  message?: string;
  data: {
    profileId: string;
    year: number;
    filingPreference: FilingPreference;
    months?: PitMonthIncomeData[];
    annual?: {
      income?: PitIncomeFields;
      deductions?: PitDeductionFields;
      documents?: PitIncomeDocuments;
      computed?: {
        grossIncome?: number;
        totalDeductions?: number;
        taxableIncome?: number;
        estimatedAnnualTax?: number;
        estimatedMonthlyTax?: number;
      };
    };
    /** Legacy shape */
    incomes?: IncomeDataItem[][];
  };
}

export interface UpdateIncomeDataResponse {
  success: boolean;
  message: string;
  data: {
    profileId: string;
    year: number;
    filingPreference?: FilingPreference;
    month?: number;
    recorded?: boolean;
    income?: PitIncomeFields;
    deductions?: PitDeductionFields;
    computed?: PitMonthIncomeData['computed'];
    incomes?: IncomeDataItem[];
  };
}

// ── Auth types ───────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  tin?: string;
  whatsappReminders?: boolean;
  name?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
}

export interface AuthVerifyResponse {
  success: boolean;
  data: {
    token?: string;
    user?: User;
    resetToken?: string;
  };
}

export interface AuthResetPasswordResponse {
  success: boolean;
  data: {
    message: string;
  };
}