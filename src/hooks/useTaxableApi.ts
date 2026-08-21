'use client';
import { useCallback } from 'react';
import taxableApi from '@/lib/taxable-api';
import { useUser } from '@/contexts/UserContext';
import type {
  ProfileCompleteRequest,
  PersonalInfoRequest,
  AddIncomeRequest,
  CreateProfileOptions,
  BusinessCompanyInfoRequest,
  CreatePayeEmployeeRequest,
  UpdatePayeEmployeeRequest,
  CsvImportType,
  CsvPayeEmployeeRow,
  UpsertVatRequest,
  FileVatRequest,
  CreateWhtDeductionRequest,
  UpdateWhtDeductionRequest,
  FileWhtMonthRequest,
  CreateWhtCreditRequest,
  UpdateWhtCreditRequest,
  UpsertCitRequest,
  FileCitRequest,
  CreateCitWhtCreditRequest,
  UpdateCitWhtCreditRequest,
  PayCitQuarterRequest,
  DeferCitQuarterRequest,
  CreateSubscriptionLinkRequest,
  VerifyDeductionRequest,
  BatchDeductionRequest,
  UpdateDeductionRequest,
  UpdateIncomeDataRequest,
} from '@/types/api';

export const useTaxableApi = () => {
  const { token } = useUser();

  const createProfile = useCallback(async (year: number, profileType: 'Individual' | 'Business', options?: CreateProfileOptions) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.createProfile(token, year, profileType, options);
  }, [token]);

  const getAllowedYears = useCallback(async () => {
    return taxableApi.getAllowedYears();
  }, []);

  const getIncomeSources = useCallback(async () => {
    return taxableApi.getIncomeSources();
  }, []);

  const completeProfile = useCallback(async (profileId: string, data: ProfileCompleteRequest) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.completeProfile(token, profileId, data);
  }, [token]);

  const updatePersonalInfo = useCallback(async (profileId: string, data: PersonalInfoRequest) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.updatePersonalInfo(token, profileId, data);
  }, [token]);

  const createUploadSession = useCallback(async (profileId: string) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.createUploadSession(token, profileId);
  }, [token]);

  const submitProfile = useCallback(async (profileId: string) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.submitProfile(token, profileId);
  }, [token]);

  const fileTax = useCallback(async (profileId: string) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.fileTax(token, profileId);
  }, [token]);

  const getIncomeList = useCallback(async (profileId: string, params?: { year?: number; month?: number; incomeType?: string; category?: string }) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.getIncomeList(token, profileId, params);
  }, [token]);

  const addIncome = useCallback(async (profileId: string, data: AddIncomeRequest) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.addIncome(token, profileId, data);
  }, [token]);

  const updateIncome = useCallback(async (profileId: string, incomeId: string, data: Partial<AddIncomeRequest>) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.updateIncome(token, profileId, incomeId, data);
  }, [token]);

  const deleteIncome = useCallback(async (profileId: string, incomeId: string) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.deleteIncome(token, profileId, incomeId);
  }, [token]);

  const getIncomeSummary = useCallback(async (profileId: string) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.getIncomeSummary(token, profileId);
  }, [token]);

  const getTaxSummary = useCallback(async (profileId: string, year?: number) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.getTaxSummary(token, profileId, year);
  }, [token]);

  const calculateTaxPost = useCallback(async (profileId: string, data: { year: number; calculationType: string; month?: number }) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.calculateTaxPost(token, profileId, data);
  }, [token]);

  const calculateTaxGet = useCallback(async (profileId: string) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.calculateTaxGet(token, profileId);
  }, [token]);

  const getCalculationBreakdown = useCallback(async (profileId: string, year?: number) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.getCalculationBreakdown(token, profileId, year);
  }, [token]);

  const getCalculationHistory = useCallback(async (profileId: string) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.getCalculationHistory(token, profileId);
  }, [token]);

  const createFilingPaymentLink = useCallback(async (profileId: string, month?: number) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.createFilingPaymentLink(token, profileId, month);
  }, [token]);

  const createTaxAgentPaymentLink = useCallback(async (profileId: string) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.createTaxAgentPaymentLink(token, profileId);
  }, [token]);

  const getPaymentRecords = useCallback(async (profileId: string) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.getPaymentRecords(token, profileId);
  }, [token]);

  const createSubscriptionPaymentLink = useCallback(async (data: CreateSubscriptionLinkRequest) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.createSubscriptionPaymentLink(token, data);
  }, [token]);

  const getSubscriptionStatus = useCallback(async () => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.getSubscriptionStatus(token);
  }, [token]);

  const verifyDeduction = useCallback(async (deductionId: string, data: VerifyDeductionRequest) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.verifyDeduction(token, deductionId, data);
  }, [token]);

  const getProfileList = useCallback(async () => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.getProfileList(token);
  }, [token]);

  const getProfile = useCallback(async (profileId: string) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.getProfile(token, profileId);
  }, [token]);

  const getBusinessCompanyInfo = useCallback(async (profileId: string) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.getBusinessCompanyInfo(token, profileId);
  }, [token]);

  const updateBusinessCompanyInfo = useCallback(async (profileId: string, data: BusinessCompanyInfoRequest) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.updateBusinessCompanyInfo(token, profileId, data);
  }, [token]);

  const listPayeEmployees = useCallback(async (profileId: string, month: number, year?: number) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.listPayeEmployees(token, profileId, month, year);
  }, [token]);

  const createPayeEmployee = useCallback(async (profileId: string, data: CreatePayeEmployeeRequest) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.createPayeEmployee(token, profileId, data);
  }, [token]);

  const bulkCreatePayeEmployees = useCallback(async (
    profileId: string,
    month: number,
    employees: CsvPayeEmployeeRow[]
  ) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.bulkCreatePayeEmployees(token, profileId, month, employees);
  }, [token]);

  const parseCsvImport = useCallback(async (
    profileId: string,
    file: File,
    importType: CsvImportType
  ) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.parseCsvImport(token, profileId, file, importType);
  }, [token]);

  const updatePayeEmployee = useCallback(async (
    profileId: string,
    employeeId: string,
    data: UpdatePayeEmployeeRequest
  ) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.updatePayeEmployee(token, profileId, employeeId, data);
  }, [token]);

  const deletePayeEmployee = useCallback(async (profileId: string, employeeId: string) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.deletePayeEmployee(token, profileId, employeeId);
  }, [token]);

  const getVat = useCallback(async (profileId: string, year: number, month?: number) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.getVat(token, profileId, year, month);
  }, [token]);

  const upsertVat = useCallback(async (profileId: string, data: UpsertVatRequest) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.upsertVat(token, profileId, data);
  }, [token]);

  const fileVat = useCallback(async (profileId: string, data: FileVatRequest) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.fileVat(token, profileId, data);
  }, [token]);

  const deleteVatMonth = useCallback(async (profileId: string, year: number, month: number) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.deleteVatMonth(token, profileId, year, month);
  }, [token]);

  const listWhtDeductions = useCallback(async (profileId: string, year: number, month: number) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.listWhtDeductions(token, profileId, year, month);
  }, [token]);

  const createWhtDeduction = useCallback(async (profileId: string, data: CreateWhtDeductionRequest) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.createWhtDeduction(token, profileId, data);
  }, [token]);

  const updateWhtDeduction = useCallback(async (
    profileId: string,
    deductionId: string,
    data: UpdateWhtDeductionRequest
  ) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.updateWhtDeduction(token, profileId, deductionId, data);
  }, [token]);

  const deleteWhtDeduction = useCallback(async (profileId: string, deductionId: string) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.deleteWhtDeduction(token, profileId, deductionId);
  }, [token]);

  const fileWhtMonth = useCallback(async (profileId: string, data: FileWhtMonthRequest) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.fileWhtMonth(token, profileId, data);
  }, [token]);

  const listWhtCredits = useCallback(async (profileId: string, year: number, month?: number) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.listWhtCredits(token, profileId, year, month);
  }, [token]);

  const createWhtCredit = useCallback(async (profileId: string, data: CreateWhtCreditRequest) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.createWhtCredit(token, profileId, data);
  }, [token]);

  const updateWhtCredit = useCallback(async (
    profileId: string,
    creditId: string,
    data: UpdateWhtCreditRequest
  ) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.updateWhtCredit(token, profileId, creditId, data);
  }, [token]);

  const deleteWhtCredit = useCallback(async (profileId: string, creditId: string) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.deleteWhtCredit(token, profileId, creditId);
  }, [token]);

  const getCit = useCallback(async (profileId: string, year: number) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.getCit(token, profileId, year);
  }, [token]);

  const upsertCit = useCallback(async (profileId: string, data: UpsertCitRequest) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.upsertCit(token, profileId, data);
  }, [token]);

  const fileCit = useCallback(async (profileId: string, data: FileCitRequest) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.fileCit(token, profileId, data);
  }, [token]);

  const listCitWhtCredits = useCallback(async (profileId: string, year: number) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.listCitWhtCredits(token, profileId, year);
  }, [token]);

  const createCitWhtCredit = useCallback(async (profileId: string, data: CreateCitWhtCreditRequest) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.createCitWhtCredit(token, profileId, data);
  }, [token]);

  const updateCitWhtCredit = useCallback(async (
    profileId: string,
    creditId: string,
    data: UpdateCitWhtCreditRequest
  ) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.updateCitWhtCredit(token, profileId, creditId, data);
  }, [token]);

  const deleteCitWhtCredit = useCallback(async (profileId: string, creditId: string) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.deleteCitWhtCredit(token, profileId, creditId);
  }, [token]);

  const getCitQuarterly = useCallback(async (profileId: string, year: number) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.getCitQuarterly(token, profileId, year);
  }, [token]);

  const payCitQuarter = useCallback(async (profileId: string, data: PayCitQuarterRequest) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.payCitQuarter(token, profileId, data);
  }, [token]);

  const deferCitQuarter = useCallback(async (profileId: string, data: DeferCitQuarterRequest) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.deferCitQuarter(token, profileId, data);
  }, [token]);

  const deleteProfile = useCallback(async (profileId: string) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.deleteProfile(token, profileId);
  }, [token]);

  const getDeductionList = useCallback(async (profileId: string, year?: number) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.getDeductionList(token, profileId, year);
  }, [token]);

  const uploadFile = useCallback(async (profileId: string, file: File, category?: string, description?: string) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.uploadFile(token, profileId, file, category, description);
  }, [token]);

  const batchCreateDeductions = useCallback(async (data: BatchDeductionRequest) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.batchCreateDeductions(token, data);
  }, [token]);

  const updateDeduction = useCallback(async (deductionId: string, data: UpdateDeductionRequest) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.updateDeduction(token, deductionId, data);
  }, [token]);

  const deleteDeduction = useCallback(async (deductionId: string) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.deleteDeduction(token, deductionId);
  }, [token]);

  const getIncomeData = useCallback(async (profileId: string) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.getIncomeData(token, profileId);
  }, [token]);

  const updateMonthlyIncomeData = useCallback(async (profileId: string, month: number, data: UpdateIncomeDataRequest) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.updateMonthlyIncomeData(token, profileId, month, data);
  }, [token]);

  const updateAnnualIncomeData = useCallback(async (profileId: string, data: UpdateIncomeDataRequest) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.updateAnnualIncomeData(token, profileId, data);
  }, [token]);

  const uploadSimple = useCallback(async (file: File) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.uploadSimple(token, file);
  }, [token]);

  const calculateTaxByMonth = useCallback(async (profileId: string, month: number) => {
    if (!token) throw new Error('Authentication required');
    return taxableApi.calculateTaxByMonth(token, profileId, month);
  }, [token]);

  return {
    createProfile,
    getAllowedYears,
    getIncomeSources,
    completeProfile,
    updatePersonalInfo,
    createUploadSession,
    submitProfile,
    fileTax,
    getIncomeList,
    addIncome,
    updateIncome,
    deleteIncome,
    getIncomeSummary,
    getTaxSummary,
    calculateTaxPost,
    calculateTaxGet,
    calculateTaxByMonth,
    getCalculationBreakdown,
    getCalculationHistory,
    createFilingPaymentLink,
    createTaxAgentPaymentLink,
    getPaymentRecords,
    createSubscriptionPaymentLink,
    getSubscriptionStatus,
    verifyDeduction,
    getProfileList,
    getProfile,
    getBusinessCompanyInfo,
    updateBusinessCompanyInfo,
    listPayeEmployees,
    createPayeEmployee,
    bulkCreatePayeEmployees,
    parseCsvImport,
    updatePayeEmployee,
    deletePayeEmployee,
    getVat,
    upsertVat,
    fileVat,
    deleteVatMonth,
    listWhtDeductions,
    createWhtDeduction,
    updateWhtDeduction,
    deleteWhtDeduction,
    fileWhtMonth,
    listWhtCredits,
    createWhtCredit,
    updateWhtCredit,
    deleteWhtCredit,
    getCit,
    upsertCit,
    fileCit,
    listCitWhtCredits,
    createCitWhtCredit,
    updateCitWhtCredit,
    deleteCitWhtCredit,
    getCitQuarterly,
    payCitQuarter,
    deferCitQuarter,
    deleteProfile,
    getDeductionList,
    uploadFile,
    batchCreateDeductions,
    updateDeduction,
    deleteDeduction,
    getIncomeData,
    updateMonthlyIncomeData,
    updateAnnualIncomeData,
    uploadSimple,
  };
};

export default useTaxableApi;