import { useState } from 'react';
import { formatPhoneNumber, stripCountryCode, validatePhone } from '@/utils/formValidation';

export function usePhoneField(initialCode = "+47") {
    const [phone, setPhone] = useState("");
    const [countryCode, setCountryCode] = useState(initialCode);
    const [showCountryPicker, setShowCountryPicker] = useState(false);
    const [phoneError, setPhoneError] = useState<string | null>(null);

     // Handle phone change
    const handlePhoneChange = (text: string) => {
        setPhone(text);
        setPhoneError(null);
    };

    const handlePhoneBlur = () => {
        // Strip country code and clean the input
        const cleaned = stripCountryCode(phone);

        // Format with spacing when user leaves the field
        const formatted = formatPhoneNumber(cleaned, countryCode);
        setPhone(formatted);

        // Validate phone number
        if (formatted.trim()) {
            const validation = validatePhone(formatted, countryCode);
            if (!validation.isValid) {
                setPhoneError(validation.error || 'Invalid phone number');
            } else {
                setPhoneError(null);
            }
        } else {
        setPhoneError(null);
        }
    };

    const isPhoneValid = () => {
        if (!phone.trim()) return false;
        return validatePhone(phone, countryCode).isValid;
    };

    return {
        phone,
        setPhone,
        countryCode,
        setCountryCode,
        showCountryPicker,
        setShowCountryPicker,
        phoneError,
        setPhoneError,
        handlePhoneChange,
        handlePhoneBlur,
        isPhoneValid,
    };
}