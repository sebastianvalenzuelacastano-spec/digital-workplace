// Format Chilean RUT to xx.xxx.xxx-x format
export function formatRUT(value: string): string {
    // Remove all non-alphanumeric characters
    const cleaned = value.replace(/[^0-9kK]/g, '');

    if (cleaned.length === 0) return '';

    // Separate body and verifier digit
    const body = cleaned.slice(0, -1);
    const verifier = cleaned.slice(-1).toLowerCase();

    // Format body with dots
    let formatted = '';
    for (let i = body.length - 1, count = 0; i >= 0; i--, count++) {
        if (count > 0 && count % 3 === 0) {
            formatted = '.' + formatted;
        }
        formatted = body[i] + formatted;
    }

    // Add verifier with dash
    if (cleaned.length > 0) {
        formatted += '-' + verifier;
    }

    return formatted;
}

// Clean RUT for storage (remove formatting)
export function cleanRUT(value: string): string {
    return value.replace(/[^0-9kK]/g, '');
}

// Validate Chilean RUT
export function validateRUT(rut: string): boolean {
    const cleaned = cleanRUT(rut);
    if (cleaned.length < 2) return false;

    const body = cleaned.slice(0, -1);
    const verifier = cleaned.slice(-1).toLowerCase();

    // Calculate verifier digit
    let sum = 0;
    let multiplier = 2;

    for (let i = body.length - 1; i >= 0; i--) {
        sum += parseInt(body[i]) * multiplier;
        multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }

    const expectedVerifier = 11 - (sum % 11);
    const calculatedVerifier = expectedVerifier === 11 ? '0' : expectedVerifier === 10 ? 'k' : expectedVerifier.toString();

    return verifier === calculatedVerifier;
}
