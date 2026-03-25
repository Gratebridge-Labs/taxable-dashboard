"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TAXABLE_ENDPOINTS = exports.API_BASE_URL = void 0;
exports.API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || (typeof window !== 'undefined' ? '/api/proxy' : 'https://api.gettaxable.com/api');
exports.TAXABLE_ENDPOINTS = {
    PROFILE: {
        CREATE: '/taxableprofile/web/create',
        LIST: '/taxableprofile/web',
        GET: function (profileId) { return "/taxableprofile/web/".concat(profileId); },
        DELETE: function (profileId) { return "/taxableprofile/web/".concat(profileId); },
        COMPLETE: function (profileId) { return "/taxableprofile/web/".concat(profileId, "/complete"); },
        PERSONAL_INFO: function (profileId) { return "/taxableprofile/web/".concat(profileId, "/personal-info"); },
        UPLOAD_SESSION: function (profileId) { return "/taxableprofile/web/".concat(profileId, "/upload-session"); },
        SUBMIT: function (profileId) { return "/taxableprofile/web/".concat(profileId, "/submit"); },
        FILE: function (profileId) { return "/taxableprofile/web/".concat(profileId, "/file"); },
        CALCULATE: function (profileId) { return "/taxableprofile/web/".concat(profileId, "/calculate"); },
        ALLOWED_YEARS: '/taxableprofile/web/allowed-years',
        INCOME_SOURCES: '/taxableprofile/web/income-sources',
    },
    INCOME: {
        LIST: function (profileId) { return "/taxableprofile/web/".concat(profileId, "/income"); },
        ADD: function (profileId) { return "/taxableprofile/web/".concat(profileId, "/income"); },
        UPDATE: function (profileId, incomeId) { return "/taxableprofile/web/".concat(profileId, "/income/").concat(incomeId); },
        DELETE: function (profileId, incomeId) { return "/taxableprofile/web/".concat(profileId, "/income/").concat(incomeId); },
        SUMMARY: function (profileId) { return "/taxableprofile/web/".concat(profileId, "/income/summary"); },
    },
    CALCULATIONS: {
        SUMMARY: function (profileId) { return "/calculations/".concat(profileId, "/summary"); },
        CALCULATE: function (profileId) { return "/calculations/".concat(profileId, "/calculate"); },
        BREAKDOWN: function (profileId) { return "/calculations/".concat(profileId, "/breakdown"); },
        HISTORY: function (profileId) { return "/calculations/".concat(profileId, "/history"); },
    },
    DEDUCTIONS: {
        LIST: function (profileId) { return "/deductions/".concat(profileId); },
        CREATE: '/deductions',
        UPDATE: function (deductionId) { return "/deductions/".concat(deductionId); },
        DELETE: function (deductionId) { return "/deductions/".concat(deductionId); },
        VERIFY: function (deductionId) { return "/deductions/".concat(deductionId, "/verify"); },
    },
    PAYSTACK: {
        FILING_LINK: '/paystack/filing-link',
        SUBSCRIPTION_LINK: '/paystack/create-link',
        SUBSCRIPTION_STATUS: '/paystack/subscription/status',
    },
};
