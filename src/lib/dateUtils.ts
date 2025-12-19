// Utility function to format dates without timezone issues
export const formatDate = (dateString: string): string => {
    if (!dateString || dateString === '-') return '-';

    // Parse the date string directly without timezone conversion
    const [year, month, day] = dateString.split('-');

    // Return in DD-MM-YYYY format
    return `${day}-${month}-${year}`;
};

// Alternative format for display (e.g., "1 de diciembre de 2025")
export const formatDateLong = (dateString: string): string => {
    if (!dateString || dateString === '-') return '-';

    const [year, month, day] = dateString.split('-');
    const months = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    return `${parseInt(day)} de ${months[parseInt(month) - 1]} de ${year}`;
};

// Helper to parse YYYY-MM-DD string into integers
export const parseDateString = (dateString: string) => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split('-').map(Number);
    return { year, month, day };
};

// Helper to check if a date string matches a specific month and year
export const isSameMonth = (dateString: string, targetMonth: number, targetYear: number): boolean => {
    const date = parseDateString(dateString);
    if (!date) return false;
    // targetMonth is 0-indexed (0 = Jan, 11 = Dec)
    return date.month === targetMonth + 1 && date.year === targetYear;
};

// Helper to check if a date string matches a specific year
export const isSameYear = (dateString: string, targetYear: number): boolean => {
    const date = parseDateString(dateString);
    if (!date) return false;
    return date.year === targetYear;
};

// Get today's date as YYYY-MM-DD string
export const getTodayString = (): string => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

// Get yesterday's date as YYYY-MM-DD string
export const getYesterdayString = (): string => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
};
