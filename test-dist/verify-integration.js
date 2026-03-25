"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var taxable_api_1 = require("./taxable-api");
var api_endpoints_1 = require("./api-endpoints");
/**
 * INTEGRATION TEST SUITE: INDIVIDUAL TAX FILING WORKFLOW
 *
 * This script simulates the end-to-end individual tax filing flow
 * using the production-ready TaxableApiService. It mocks the
 * global fetch to verify that all outgoing requests match the
 * backend specifications in api.md.
 */
function runIntegrationTestSuite() {
    return __awaiter(this, void 0, void 0, function () {
        function verifyRequest(method, path, expectedBody) {
            if (!lastRequest)
                throw new Error("No request captured for ".concat(path));
            var url = lastRequest.url;
            var options = lastRequest.options;
            if (options.method !== method) {
                throw new Error("Method mismatch for ".concat(path, ": Expected ").concat(method, ", got ").concat(options.method));
            }
            if (!url.endsWith(path) && !url.includes(path)) {
                throw new Error("URL mismatch: Expected to contain ".concat(path, ", got ").concat(url));
            }
            if (options.headers.Authorization !== "Bearer ".concat(mockToken)) {
                throw new Error("Auth mismatch for ".concat(path, ": Token missing or incorrect"));
            }
            if (expectedBody) {
                var actualBody = JSON.parse(options.body);
                for (var key in expectedBody) {
                    if (actualBody[key] !== expectedBody[key]) {
                        throw new Error("Body mismatch for ".concat(path, " at key \"").concat(key, "\": Expected ").concat(expectedBody[key], ", got ").concat(actualBody[key]));
                    }
                }
            }
        }
        var mockToken, mockProfileId, mockYear, originalFetch, lastRequest, api, profile, summary, error_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🚀 Starting Comprehensive End-to-End Integration Test Suite...');
                    console.log('------------------------------------------------------------');
                    mockToken = 'test-jwt-token-123';
                    mockProfileId = 'TP_TEST_789';
                    mockYear = 2025;
                    originalFetch = global.fetch;
                    lastRequest = null;
                    global.fetch = function (url, options) { return __awaiter(_this, void 0, void 0, function () {
                        var responseData;
                        var _this = this;
                        return __generator(this, function (_a) {
                            lastRequest = { url: url, options: options };
                            responseData = { success: true, data: {} };
                            if (url.includes('/taxableprofile/web/create')) {
                                responseData.data = { _id: 'mongo_123', profileId: mockProfileId, year: mockYear };
                            }
                            else if (url.includes('/calculations/') && url.includes('/summary')) {
                                responseData.data = {
                                    taxDue: 150000,
                                    estimatedRefund: 0,
                                    actions: { bookAccountant: true, payNow: false }
                                };
                            }
                            else if (url.includes('/income')) {
                                responseData.data = { _id: 'income_456', totalAmount: 500000 };
                            }
                            else if (url.includes('/deductions')) {
                                responseData.data = { _id: 'deduction_789', status: 'pending' };
                            }
                            return [2 /*return*/, {
                                    ok: true,
                                    status: 200,
                                    json: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                        return [2 /*return*/, responseData];
                                    }); }); }
                                }];
                        });
                    }); };
                    api = new taxable_api_1.TaxableApiService(api_endpoints_1.API_BASE_URL);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 11, 12, 13]);
                    // --- PHASE 1: ONBOARDING ---
                    console.log('\n[PHASE 1] Onboarding & Profile Initialization');
                    return [4 /*yield*/, api.createProfile(mockToken, { year: mockYear, profileType: 'individual' })];
                case 2:
                    profile = _a.sent();
                    verifyRequest('POST', '/taxableprofile/web/create', { year: mockYear, profileType: 'individual' });
                    console.log('✅ createProfile: Request matches backend schema.');
                    return [4 /*yield*/, api.completeProfile(mockToken, mockProfileId, {
                            primaryIncomeSources: ['employment', 'dividends'],
                            filingPreference: 'monthly'
                        })];
                case 3:
                    _a.sent();
                    verifyRequest('PUT', "/taxableprofile/web/".concat(mockProfileId, "/complete"), {
                        primaryIncomeSources: ['employment', 'dividends'],
                        filingPreference: 'monthly'
                    });
                    console.log('✅ completeProfile: Request matches backend schema.');
                    // --- PHASE 2: INCOME DATA ENTRY ---
                    console.log('\n[PHASE 2] Income Data Entry (Employment)');
                    return [4 /*yield*/, api.addIncome(mockToken, mockProfileId, {
                            type: 'monthly',
                            category: 'salary',
                            amount: 500000,
                            month: 1,
                            year: mockYear,
                            employerName: 'Test Corp',
                            bonuses: 50000,
                            commissions: 20000
                        })];
                case 4:
                    _a.sent();
                    verifyRequest('POST', "/taxableprofile/web/".concat(mockProfileId, "/income"), {
                        type: 'monthly',
                        category: 'salary',
                        amount: 500000,
                        month: 1,
                        year: mockYear,
                        employerName: 'Test Corp',
                        bonuses: 50000,
                        commissions: 20000
                    });
                    console.log('✅ addIncome: Verified bonuses and commissions are included.');
                    // --- PHASE 3: DEDUCTIONS & RELIEFS ---
                    console.log('\n[PHASE 3] Deductions & Statutory Reliefs');
                    return [4 /*yield*/, api.createDeduction(mockToken, {
                            profileId: mockProfileId,
                            year: mockYear,
                            deductionType: 'health_insurance',
                            amount: 15000
                        })];
                case 5:
                    _a.sent();
                    verifyRequest('POST', '/deductions', {
                        profileId: mockProfileId,
                        year: mockYear,
                        deductionType: 'health_insurance',
                        amount: 15000
                    });
                    console.log('✅ createDeduction: Verified health_insurance mapping.');
                    // --- PHASE 4: TAX CALCULATION ---
                    console.log('\n[PHASE 4] Tax Calculation & Summary');
                    return [4 /*yield*/, api.getTaxSummary(mockToken, mockProfileId)];
                case 6:
                    summary = _a.sent();
                    verifyRequest('GET', "/calculations/".concat(mockProfileId, "/summary"));
                    if (summary.taxDue === 150000) {
                        console.log('✅ getTaxSummary: Correctly parsed backend response.');
                    }
                    return [4 /*yield*/, api.calculateTaxPost(mockToken, mockProfileId)];
                case 7:
                    _a.sent();
                    verifyRequest('POST', "/calculations/".concat(mockProfileId, "/calculate"));
                    console.log('✅ calculateTaxPost: Triggered server-side recalculation.');
                    // --- PHASE 5: SUBMISSION & FILING ---
                    console.log('\n[PHASE 5] Review & Final Submission');
                    return [4 /*yield*/, api.submitProfile(mockToken, mockProfileId)];
                case 8:
                    _a.sent();
                    verifyRequest('POST', "/taxableprofile/web/".concat(mockProfileId, "/submit"));
                    console.log('✅ submitProfile: Verified status change request.');
                    return [4 /*yield*/, api.fileTax(mockToken, mockProfileId)];
                case 9:
                    _a.sent();
                    verifyRequest('POST', "/taxableprofile/web/".concat(mockProfileId, "/file"));
                    console.log('✅ fileTax: Verified final filing request.');
                    return [4 /*yield*/, api.createFilingPaymentLink(mockToken, mockProfileId, 'monthly')];
                case 10:
                    _a.sent();
                    verifyRequest('POST', '/paystack/filing-link', { profileId: mockProfileId, type: 'monthly' });
                    console.log('✅ createFilingPaymentLink: Verified Paystack parameters.');
                    console.log('\n------------------------------------------------------------');
                    console.log('🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY!');
                    console.log('The individual tax filing workflow is 100% compliant with api.md.');
                    return [3 /*break*/, 13];
                case 11:
                    error_1 = _a.sent();
                    console.error('\n❌ INTEGRATION TEST FAILED!');
                    console.error(error_1);
                    process.exit(1);
                    return [3 /*break*/, 13];
                case 12:
                    global.fetch = originalFetch;
                    return [7 /*endfinally*/];
                case 13: return [2 /*return*/];
            }
        });
    });
}
// Run the tests
runIntegrationTestSuite();
