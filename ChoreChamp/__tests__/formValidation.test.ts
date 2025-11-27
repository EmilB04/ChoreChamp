import {
  validateFirstName,
  validateLastName,
  validatePhone,
  validateBirthDate,
  validatePassword,
  validateRegistrationForm,
  isFormComplete,
  formatPhoneNumber,
  stripCountryCode,
  type RegisterFormData,
} from '@/utils/formValidation';

// Mock i18n
jest.mock('../app/i18n/i18n', () => ({
  t: (key: string, options?: any) => {
    const translations: { [key: string]: string } = {
      'register.errorFirstNameRequired': 'First name is required',
      'register.errorFirstNameMin': 'First name must be at least 2 characters',
      'register.errorLastNameRequired': 'Last name is required',
      'register.errorLastNameMin': 'Last name must be at least 2 characters',
      'register.errorPhoneRequired': 'Phone number is required',
      'register.errorPhoneMin': `Phone number must be at least ${options?.min || 8} digits`,
      'register.errorPhoneMax': 'Phone number cannot exceed 15 digits',
      'register.errorPhoneDigits': 'Phone number can only contain digits',
      'register.errorBirthRequired': 'Birth date is required',
      'register.errorBirthInvalid': 'Invalid birth date',
      'register.errorTooYoung': 'You must be at least 6 years old',
      'register.errorBirthYearInvalid': 'Invalid birth year',
      'register.errorPasswordRequired': 'Password is required',
      'register.errorPasswordMin': 'Password must be at least 6 characters',
    };
    return translations[key] || key;
  },
}));

describe('formValidation', () => {
  describe('validateFirstName', () => {
    it('accepts valid first names', () => {
      expect(validateFirstName('Test').isValid).toBe(true);
      expect(validateFirstName('Testing User').isValid).toBe(true);
    });

    it('rejects empty or too short first name', () => {
      expect(validateFirstName('').isValid).toBe(false);
      expect(validateFirstName('   ').isValid).toBe(false);
      expect(validateFirstName('A').isValid).toBe(false);
    });
  });

  describe('validateLastName', () => {
    it('accepts valid last names', () => {
      expect(validateLastName('Hansen').isValid).toBe(true);
      expect(validateLastName('Berg Johansen').isValid).toBe(true);
    });

    it('rejects empty or too short last name', () => {
      expect(validateLastName('').isValid).toBe(false);
      expect(validateLastName('   ').isValid).toBe(false);
      expect(validateLastName('B').isValid).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('accepts valid phone numbers', () => {
      expect(validatePhone('12345678', '+47').isValid).toBe(true);
      expect(validatePhone('123 45 678', '+47').isValid).toBe(true);
      expect(validatePhone('1234567890', '+1').isValid).toBe(true);
    });

    it('rejects invalid phone numbers', () => {
      expect(validatePhone('', '+47').isValid).toBe(false);
      expect(validatePhone('1234567', '+47').isValid).toBe(false);
      expect(validatePhone('1234567890123456', '+47').isValid).toBe(false);
      expect(validatePhone('12345abc', '+47').isValid).toBe(false);
    });
  });

  describe('validateBirthDate', () => {
    it('accepts valid birth dates', () => {
      expect(validateBirthDate('15/06/1990').isValid).toBe(true);
      expect(validateBirthDate('01/01/2000').isValid).toBe(true);
    });

    it('rejects invalid birth dates', () => {
      expect(validateBirthDate('').isValid).toBe(false);
      expect(validateBirthDate('1990-06-15').isValid).toBe(false);
      expect(validateBirthDate('15/13/1990').isValid).toBe(false);
      expect(validateBirthDate('32/06/1990').isValid).toBe(false);
      expect(validateBirthDate('15/06/1899').isValid).toBe(false);
    });

    it('rejects birth date for person under 6 years old', () => {
      const now = new Date();
      const fiveYearsAgo = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
      const dateString = `${fiveYearsAgo.getDate().toString().padStart(2, '0')}/${(fiveYearsAgo.getMonth() + 1).toString().padStart(2, '0')}/${fiveYearsAgo.getFullYear()}`;
      
      expect(validateBirthDate(dateString).isValid).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('accepts valid passwords', () => {
      expect(validatePassword('password123').isValid).toBe(true);
      expect(validatePassword('123456').isValid).toBe(true);
    });

    it('rejects invalid passwords', () => {
      expect(validatePassword('').isValid).toBe(false);
      expect(validatePassword('12345').isValid).toBe(false);
    });
  });

  describe('validateRegistrationForm', () => {
    const validForm: RegisterFormData = {
      firstName: 'John',
      lastName: 'Doe',
      phone: '12345678',
      countryCode: '+47',
      birth: '15/06/1990',
      password: 'password123',
    };

    it('accepts completely valid form', () => {
      expect(validateRegistrationForm(validForm).isValid).toBe(true);
    });

    it('rejects form with invalid first name', () => {
      const result = validateRegistrationForm({ ...validForm, firstName: 'A' });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('First name');
    });

    it('rejects form with invalid last name', () => {
      const result = validateRegistrationForm({ ...validForm, lastName: 'B' });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Last name');
    });

    it('rejects form with invalid phone', () => {
      const result = validateRegistrationForm({ ...validForm, phone: '123' });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Phone');
    });

    it('rejects form with invalid birth date', () => {
      const result = validateRegistrationForm({ ...validForm, birth: '32/13/1990' });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('birth');
    });

    it('rejects form with invalid password', () => {
      const result = validateRegistrationForm({ ...validForm, password: '12345' });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Password');
    });

    it('returns first validation error encountered', () => {
      const invalidForm: RegisterFormData = {
        firstName: 'A',
        lastName: 'B',
        phone: '123',
        countryCode: '+47',
        birth: 'invalid',
        password: '12',
      };
      const result = validateRegistrationForm(invalidForm);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('First name'); // First error
    });
  });

  describe('isFormComplete', () => {
    const completeForm: RegisterFormData = {
      firstName: 'John',
      lastName: 'Doe',
      phone: '12345678',
      countryCode: '+47',
      birth: '15/06/1990',
      password: 'password123',
    };

    it('returns true for complete form', () => {
      expect(isFormComplete(completeForm)).toBe(true);
    });

    it('returns false when any field is missing', () => {
      expect(isFormComplete({ ...completeForm, firstName: '' })).toBe(false);
      expect(isFormComplete({ ...completeForm, phone: '' })).toBe(false);
      expect(isFormComplete({ ...completeForm, password: '' })).toBe(false);
    });
  });

  describe('formatPhoneNumber', () => {
    it('formats Norwegian numbers correctly', () => {
      expect(formatPhoneNumber('12345678', '+47')).toBe('123 45 678');
      expect(formatPhoneNumber('123-456-78', '+47')).toBe('123 45 678');
    });

    it('formats US numbers correctly', () => {
      expect(formatPhoneNumber('1234567890', '+1')).toBe('(123) 456-7890');
    });

    it('handles empty input', () => {
      expect(formatPhoneNumber('', '+47')).toBe('');
    });
  });

  describe('stripCountryCode', () => {
    it('strips country codes correctly', () => {
      expect(stripCountryCode('+4712345678')).toBe('12345678');
      expect(stripCountryCode('+11234567890')).toBe('1234567890');
      expect(stripCountryCode('004712345678')).toBe('12345678');
    });

    it('handles numbers without country code', () => {
      expect(stripCountryCode('12345678')).toBe('12345678');
      expect(stripCountryCode('+47 123 45 678')).toBe('12345678');
    });
  });
});
