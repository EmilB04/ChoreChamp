/**
 * Form Validation Utilities
 * Centralized validation logic for form fields
 */

import i18n from '../../i18n/i18n';

// Validation result interface
export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

// Form data interface
export interface RegisterFormData {
    firstName: string;
    lastName: string;
    phone: string;
    countryCode: string;
    birth: string;
}

/**
 * Validates first name field
 * @param firstName - The first name to validate
 * @returns ValidationResult with validation status and error message
 */
export function validateFirstName(firstName: string): ValidationResult {
    const trimmedName = firstName.trim();

    if (!trimmedName) {
        return { isValid: false, error: i18n.t('register.errorFirstNameRequired') };
    }

    if (trimmedName.length < 2) {
        return { isValid: false, error: i18n.t('register.errorFirstNameMin') };
    }

    return { isValid: true };
}

/**
 * Validates last name field
 * @param lastName - The last name to validatef
 * @returns ValidationResult with validation status and error message
 */
export function validateLastName(lastName: string): ValidationResult {
    const trimmedName = lastName.trim();

    if (!trimmedName) {
        return { isValid: false, error: i18n.t('register.errorLastNameRequired') };
    }

    if (trimmedName.length < 2) {
        return { isValid: false, error: i18n.t('register.errorLastNameMin') };
    }

    return { isValid: true };
}

/**
 * Validates phone number field
 * @param phone - The phone number to validate
 * @param countryCode - The country code for the phone number
 * @returns ValidationResult with validation status and error message
 */
export function validatePhone(phone: string, countryCode: string): ValidationResult {
    const trimmedPhone = phone.trim();

    if (!trimmedPhone) {
        return { isValid: false, error: i18n.t('register.errorPhoneRequired') };
    }

    // Remove all non-numeric characters
    const cleanPhone = trimmedPhone.replace(/\s/g, '');

    // Validate minimum length based on country code
    const minLength = getMinPhoneLength(countryCode);
    if (cleanPhone.length < minLength) {
        return { isValid: false, error: i18n.t('register.errorPhoneMin', { min: minLength }) };
    }

    // Validate maximum length
    if (cleanPhone.length > 15) {
        return { isValid: false, error: i18n.t('register.errorPhoneMax') };
    }

    // Check if phone contains only digits
    if (!/^\d+$/.test(cleanPhone)) {
        return { isValid: false, error: i18n.t('register.errorPhoneDigits') };
    }

    return { isValid: true };
}

/**
 * Get minimum phone length based on country code
 * @param countryCode - The country code
 * @returns Minimum required phone length
 */
function getMinPhoneLength(countryCode: string): number {
    const lengthMap: { [key: string]: number } = {
        '+47': 8, // Norway
        '+44': 10, // UK
        '+34': 9, // Spain
        '+49': 10, // Germany
        '+1': 10, // US/Canada
    };

    return lengthMap[countryCode] || 8;
}

/**
 * Validates birth date field
 * @param birth - The birth date string in format DD/MM/YYYY
 * @returns ValidationResult with validation status and error message
 */
export function validateBirthDate(birth: string): ValidationResult {
    if (!birth) {
        return { isValid: false, error: i18n.t('register.errorBirthRequired') };
    }

    // Parse date (assuming format DD/MM/YYYY)
    const dateParts = birth.split('/');
    if (dateParts.length !== 3) {
        return { isValid: false, error: i18n.t('register.errorBirthInvalid') };
    }

    const day = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10);
    const year = parseInt(dateParts[2], 10);

    // Validate date components
    if (isNaN(day) || isNaN(month) || isNaN(year)) {
        return { isValid: false, error: i18n.t('register.errorBirthInvalid') };
    }

    // Check date ranges
    if (month < 1 || month > 12) {
        return { isValid: false, error: i18n.t('register.errorBirthInvalid') };
    }

    if (day < 1 || day > 31) {
        return { isValid: false, error: i18n.t('register.errorBirthInvalid') };
    }

    // Check if year is reasonable (must be at least 13 years old)
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

    if (actualAge < 6) {
        return { isValid: false, error: i18n.t('register.errorTooYoung') };
    }

    if (year < 1900 || year > today.getFullYear()) {
        return { isValid: false, error: i18n.t('register.errorBirthYearInvalid') };
    }

    return { isValid: true };
}

/**
 * Validates the entire registration form
 * @param formData - The form data to validate
 * @returns ValidationResult with validation status and first error message
 */
export function validateRegistrationForm(formData: RegisterFormData): ValidationResult {
    // Validate first name
    const firstNameValidation = validateFirstName(formData.firstName);
    if (!firstNameValidation.isValid) {
        return firstNameValidation;
    }

    // Validate last name
    const lastNameValidation = validateLastName(formData.lastName);
    if (!lastNameValidation.isValid) {
        return lastNameValidation;
    }

    // Validate phone
    const phoneValidation = validatePhone(formData.phone, formData.countryCode);
    if (!phoneValidation.isValid) {
        return phoneValidation;
    }

    // Validate birth date
    const birthValidation = validateBirthDate(formData.birth);
    if (!birthValidation.isValid) {
        return birthValidation;
    }

    return { isValid: true };
}

/**
 * Checks if the form has all required fields filled
 * @param formData - The form data to check
 * @returns Boolean indicating if form is complete
 */
export function isFormComplete(formData: RegisterFormData): boolean {
    return !!(
        formData.firstName.trim() &&
        formData.lastName.trim() &&
        formData.phone.trim() &&
        formData.birth
    );
}

/**
 * Phone number formatting utilities
 */

/**
 * Formats phone number based on country code
 * @param phone - The raw phone number
 * @param countryCode - The country code
 * @returns Formatted phone number with spacing
 */
export function formatPhoneNumber(phone: string, countryCode: string): string {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/[^\d]/g, '');

    if (!cleaned) return '';

    // Format based on country code
    switch (countryCode) {
        case '+47': // Norway: 123 45 678
            if (cleaned.length <= 3) return cleaned;
            if (cleaned.length <= 5) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
            return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)}`;

        case '+44': // UK: 1234 567890
            if (cleaned.length <= 4) return cleaned;
            return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 10)}`;

        case '+1': // US/Canada: (123) 456-7890
            if (cleaned.length <= 3) return cleaned;
            if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
            return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;

        default: // Generic: 123 456 789
            return cleaned.replace(/(\d{3})(?=\d)/g, '$1 ');
    }
}

/**
 * Strips country code from phone number if present
 * @param phone - The phone number potentially with country code
 * @returns Phone number without country code
 */
export function stripCountryCode(phone: string): string {
    // Remove all non-numeric characters except + at the start
    let cleaned = phone.replace(/[^\d+]/g, '');

    const countryCodePrefixes = [
        { prefix: '+47', length: 3 },
        { prefix: '+44', length: 3 },
        { prefix: '+49', length: 3 },
        { prefix: '+34', length: 3 },
        { prefix: '+1', length: 2, minLength: 10 },
        { prefix: '0047', length: 4 },
        { prefix: '0044', length: 4 },
    ];

    for (const { prefix, length, minLength } of countryCodePrefixes) {
        if (cleaned.startsWith(prefix)) {
            // Only strip if minimum length requirement is met
            if (!minLength || cleaned.length > minLength) {
                cleaned = cleaned.slice(length);
                break;
            }
        }
    }

    // Fallback: remove any other + prefix with digits
    if (cleaned.startsWith('+')) {
        cleaned = cleaned.replace(/^\+\d{1,3}/, '');
    }

    // Keep only digits
    return cleaned.replace(/[^\d]/g, '');
}
