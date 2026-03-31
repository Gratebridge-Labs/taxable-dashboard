'use client';

export const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
] as const;

export const formatNumberWithCommas = (value: string | number): string => {
    if (!value) return '';
    const num = typeof value === 'string' ? value.replace(/,/g, '') : value.toString();
    if (isNaN(Number(num))) return num;
    return Number(num).toLocaleString('en-US');
};

export const stripNumberFormatting = (value: string): string => {
    return value.replace(/,/g, '');
};

export const toIsoDate = (displayDate: string) => {
    const parts = displayDate.split(' / ');
    if (parts.length !== 3) return null;
    const [day, month, year] = parts;
    return `${year}-${month.trim().padStart(2, '0')}-${day.trim().padStart(2, '0')}`;
};

export const fromIsoDate = (isoDate: string) => {
    if (!isoDate) return '';
    const parts = isoDate.split('-');
    if (parts.length < 3) return isoDate;
    const year = parts[0];
    const month = parts[1];
    const day = parts[2].split('T')[0];
    return `${day.padStart(2, '0')} / ${month.padStart(2, '0')} / ${year}`;
};
