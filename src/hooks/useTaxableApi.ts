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
    updatePayeEmployee,
    deletePayeEmployee,
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