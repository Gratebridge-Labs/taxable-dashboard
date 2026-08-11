import type { Profile } from '@/types/api';

type StatusState = 'In Progress' | 'In Review' | 'Ready to File' | 'Filed';

const IN_REVIEW = new Set([
    'upload_done',
    'tax_agent_review',
    'submitted',
    'review',
    'pending_accountant_payment',
]);

const READY_TO_FILE = new Set([
    'tax_agent_approved',
    'pending_filing_payment',
    'ready',
]);

const FILED = new Set([
    'filed',
    'completed',
    'success',
    'monthly_active',
]);

export function getProfileStatusState(profile: Profile): StatusState {
    const fs = profile.filingStatus;
    const st = profile.status;

    if (FILED.has(fs) || FILED.has(st)) return 'Filed';
    if (READY_TO_FILE.has(fs) || READY_TO_FILE.has(st)) return 'Ready to File';
    if (IN_REVIEW.has(fs) || IN_REVIEW.has(st)) return 'In Review';
    return 'In Progress';
}

export function getProfileStatusLabel(profile: Profile): string {
    const state = getProfileStatusState(profile);

    if (profile.profileType !== 'Business' || !profile.businessSetup) {
        return state;
    }

    const { payeEnabled, vatEnabled, whtEnabled, citEnabled } = profile.businessSetup;
    const types: string[] = [];
    if (payeEnabled) types.push('PAYE');
    if (vatEnabled) types.push('VAT');
    if (whtEnabled) types.push('WHT');
    if (citEnabled) types.push('CIT');

    if (types.length === 0) return state;
    return `${state} · ${types.join(', ')}`;
}
