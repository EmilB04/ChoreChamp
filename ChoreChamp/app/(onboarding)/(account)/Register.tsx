import { useTheme } from '@/contexts/ThemeContext';
import { useEntranceAnimation } from '@/hooks/useEntranceAnimation';
import { useBorderAnimations, useFormAnimations, usePickerAnimations } from '@/hooks/useFormAnimations';
import {
  formatPhoneNumber,
  isFormComplete,
  stripCountryCode,
  validateBirthDate,
  validateFirstName,
  validateLastName,
  validatePassword,
  validatePhone,
  validateRegistrationForm,
  type RegisterFormData
} from '@/utils/formValidation';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Image, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import OnboardingDots from '../../../components/onBoarding/OnboardingDots';
import i18n from '../../i18n/i18n';
import { useAuth } from "@/contexts/AuthContext";

// Use native driver only on iOS and Android, not on web
const USE_NATIVE_DRIVER = Platform.OS !== 'web';

export default function Register() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation('onboarding');

  const { signUpWithPhoneProfile } = useAuth();
  const params = useLocalSearchParams();
  const langParam = typeof params.lang === 'string' ? params.lang : undefined;
  const scrollViewRef = useRef<ScrollView>(null);
  const birthFieldRef = useRef<View>(null);
  const firstNameRef = useRef<TextInput>(null);
  const lastNameRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+47');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [birth, setBirth] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [firstNameError, setFirstNameError] = useState<string | null>(null);
  const [lastNameError, setLastNameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [birthError, setBirthError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeField, setActiveField] = useState<'firstName' | 'lastName' | 'phone' | 'birth' | 'password' | 'confirmPassword' | null>(null);

  // Use entrance animation hook for initial page load
  const { fadeAnim, slideAnim } = useEntranceAnimation();

  // Use form animations hook
  const { buttonOpacityAnim, errorAnim, fieldErrorAnims, animateButtonOpacity } = useFormAnimations({
    errorCount: 6,
    hasError: !!error,
    fieldErrors: [firstNameError, lastNameError, phoneError, birthError, passwordError, confirmPasswordError],
  });
  const [firstNameErrorAnim, lastNameErrorAnim, phoneErrorAnim, birthErrorAnim, passwordErrorAnim, confirmPasswordErrorAnim] = fieldErrorAnims;

  // Use border animations hook
  const { borderAnims, animateBorder } = useBorderAnimations({ fieldCount: 6 });
  const [firstNameBorderAnim, lastNameBorderAnim, phoneBorderAnim, birthBorderAnim, passwordBorderAnim, confirmPasswordBorderAnim] = borderAnims;

  // Use picker animations hook for country picker
  const { pickerAnim: countryPickerAnim, chevronAnim: countryChevronAnim, animatePicker: animateCountryPicker } = usePickerAnimations();

  // Separate animations for date picker (not using the hook because it has different behavior)
  const datePickerAnim = useRef(new Animated.Value(0)).current;
  const chevronRotateAnim = useRef(new Animated.Value(0)).current;

  // Common country codes
  const countryCodes = [
    { code: '+47', country: 'Norge', flag: '🇳🇴' },
    { code: '+44', country: 'Storbritannia', flag: '🇬🇧' },
    { code: '+34', country: 'Spania', flag: '🇪🇸' },
    { code: '+49', country: 'Tyskland', flag: '🇩🇪' },
  ];

  // Memoize form validity to avoid expensive validation on every render
  const isFormValidMemoized = useMemo(() => {
    const formData: RegisterFormData = {
      firstName,
      lastName,
      phone,
      countryCode,
      birth,
      password,
    };
    return isFormComplete(formData) && validateRegistrationForm(formData).isValid && password === confirmPassword && confirmPassword.length > 0;
  }, [firstName, lastName, phone, countryCode, birth, password, confirmPassword]);

  // Animate button opacity when form validity changes
  useEffect(() => {
    animateButtonOpacity(isFormValidMemoized);
  }, [isFormValidMemoized, animateButtonOpacity]);

  useEffect(() => {
    async function applyLanguage() {
      if (!langParam) return;
      if (i18n.language === langParam) return;
      try {
        await i18n.changeLanguage(langParam);
        await AsyncStorage.setItem('appLanguage', langParam);
      } catch (e) {
        console.warn('Language change failed', e);
      }
    }
    applyLanguage();
  }, [langParam]);

  // Check if all fields are filled and valid
  function isFormValid(): boolean {
    const formData: RegisterFormData = {
      firstName,
      lastName,
      phone,
      countryCode,
      birth,
      password,
    };

    return isFormComplete(formData) && validateRegistrationForm(formData).isValid;
  }

  // Validate registration form and return error message
  function validate(): string | null {
    const formData: RegisterFormData = {
      firstName,
      lastName,
      phone,
      countryCode,
      birth,
      password,
    };

    const validation = validateRegistrationForm(formData);
    if (!validation.isValid) {
      return validation.error || t('register.error');
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return t('register.errorPasswordMismatch') || 'Passwords do not match';
    }

    return null;
  }

  async function handleNext() {
    const v = validate();
    if (v) return setError(v);
    setError(null);
    setLoading(true);
    try {
      await signUpWithPhoneProfile({
        firstName,
        lastName,
        phone,
        countryCode,
        birthDate: birth,
        password,
      });

      router.replace('/(tabs)');
    } catch (e: any) {
      console.error(e);
      setError(t('register.error') ?? 'Noe gikk galt. Prøv igjen.');
    } finally {
      setLoading(false);
    }
  }

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      setActiveField(null);
      handleBirthBlur();
      return;
    }
    const currentDate = selectedDate || new Date();
    const day = currentDate.getDate().toString().padStart(2, '0');
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const year = currentDate.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;
    setBirth(formattedDate);
    setBirthError(null); // Clear error while selecting
    
    // Validate immediately after selection
    const validation = validateBirthDate(formattedDate);
    if (!validation.isValid) {
      setBirthError(validation.error || t('register.error'));
    }
  };

  const handlePhoneChange = (text: string) => {
    const prevLength = phone.length;
    // Just store the raw input while typing
    setPhone(text);
    setError(null);
    setPhoneError(null); // Clear phone error while typing
    
    // Auto-advance if autocomplete filled a full phone number
    // Check if length jumped significantly (autocomplete) and has at least 8 digits
    const digitsOnly = text.replace(/[^\d]/g, '');
    if (prevLength === 0 && digitsOnly.length >= 8) {
      setTimeout(() => {
        Keyboard.dismiss();
        openField('birth');
      }, 100);
    }
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
        setPhoneError(validation.error || t('register.error'));
      } else {
        setPhoneError(null);
      }
    } else {
      setPhoneError(null);
    }
  };

  const handleFirstNameBlur = () => {
    // Use setTimeout to allow focus event to fire first if moving to another field
    setTimeout(() => {
      if (firstName.trim()) {
        const validation = validateFirstName(firstName);
        if (!validation.isValid) {
          setFirstNameError(validation.error || t('register.error'));
        } else {
          setFirstNameError(null);
        }
      } else {
        setFirstNameError(null);
      }
    }, 100);
  };

  const handleLastNameBlur = () => {
    setTimeout(() => {
      if (lastName.trim()) {
        const validation = validateLastName(lastName);
        if (!validation.isValid) {
          setLastNameError(validation.error || t('register.error'));
        } else {
          setLastNameError(null);
        }
      } else {
        setLastNameError(null);
      }
    }, 100);
  };

  const handleBirthBlur = () => {
    setTimeout(() => {
      if (birth) {
        const validation = validateBirthDate(birth);
        if (!validation.isValid) {
          setBirthError(validation.error || t('register.error'));
        } else {
          setBirthError(null);
        }
      } else {
        setBirthError(null);
      }
    }, 100);
  };

  const handlePasswordBlur = () => {
    setTimeout(() => {
      if (password) {
        const validation = validatePassword(password);
        if (!validation.isValid) {
          setPasswordError(validation.error || t('register.error'));
        } else {
          setPasswordError(null);
        }
      } else {
        setPasswordError(null);
      }
    }, 100);
  };

  const handleConfirmPasswordBlur = () => {
    setTimeout(() => {
      if (confirmPassword) {
        if (confirmPassword !== password) {
          setConfirmPasswordError(t('register.errorPasswordMismatch') || 'Passwords do not match');
        } else {
          setConfirmPasswordError(null);
        }
      } else {
        setConfirmPasswordError(null);
      }
    }, 100);
  };

  const toggleCountryPicker = () => {
    const newValue = !showCountryPicker;
    setShowCountryPicker(newValue);
    animateCountryPicker(newValue);
  };

  const selectCountryCode = (code: string) => {
    setCountryCode(code);
    setShowCountryPicker(false);
    animateCountryPicker(false);
  };

  const openField = (fieldName: 'firstName' | 'lastName' | 'phone' | 'birth' | 'password' | 'confirmPassword') => {
    // Animate all borders
    animateBorder(firstNameBorderAnim, fieldName === 'firstName' ? 1 : 0);
    animateBorder(lastNameBorderAnim, fieldName === 'lastName' ? 1 : 0);
    animateBorder(phoneBorderAnim, fieldName === 'phone' ? 1 : 0);
    animateBorder(birthBorderAnim, fieldName === 'birth' ? 1 : 0);
    animateBorder(passwordBorderAnim, fieldName === 'password' ? 1 : 0);
    animateBorder(confirmPasswordBorderAnim, fieldName === 'confirmPassword' ? 1 : 0);

    // Animate date picker appearance and chevron
    if (fieldName === 'birth') {
      Animated.spring(datePickerAnim, {
        toValue: 1,
        useNativeDriver: USE_NATIVE_DRIVER,
        tension: 100,
        friction: 8,
      }).start();
      Animated.timing(chevronRotateAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: USE_NATIVE_DRIVER,
      }).start();
    } else {
      Animated.timing(datePickerAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: USE_NATIVE_DRIVER,
      }).start();
      Animated.timing(chevronRotateAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: USE_NATIVE_DRIVER,
      }).start();
    }

    // Close keyboard first if opening date picker
    if (fieldName === 'birth') {
      Keyboard.dismiss();

      // Scroll to the birth field to ensure date picker is visible
      setTimeout(() => {
        birthFieldRef.current?.measureLayout(
          scrollViewRef.current as any,
          (x, y) => {
            scrollViewRef.current?.scrollTo({
              y: y + 100, // Add extra offset to ensure date picker is fully visible
              animated: true,
            });
          },
          () => { }
        );
      }, 100);
    }
    // Toggle if same field, otherwise open new field
    setActiveField(activeField === fieldName ? null : fieldName);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          style={styles.backButton}
          hitSlop={10}
        >
          <Ionicons name="chevron-back" size={22} color={colors.tint} />
        </TouchableOpacity>
        <OnboardingDots activeIndex={4} total={5} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.select({ default: 'padding' })}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.select({ default: 0 })}
        enabled
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
            <Animated.View style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}>
              <Text style={[styles.title, { color: colors.text }]}>{t('register.title')}</Text>
              <Text style={[styles.subtitle, { color: colors.lightDarkText }]}>
                {t('register.subtitle')}
              </Text>

              <View style={styles.iconWrapper}>
                <View style={[styles.profileIcon, { backgroundColor: colors.tint }]}>
                  <Ionicons name="person" size={40} color={colors.darkText} />
                </View>
              </View>

              <View style={styles.form}>
                {/* First Name and Last Name Row */}
                <View style={styles.nameRow}>
                  {/* First Name */}
                  <View style={styles.nameInputGroup}>
                    <View style={[styles.inputLabelRow]}>
                      <Ionicons name="person-outline" size={18} color={colors.tint} />
                      <Text style={[styles.label, { color: colors.text }]}>{t('register.firstNameLabel')}</Text>
                    </View>
                    <Animated.View 
                      style={[
                        styles.inputContainer,
                        {
                          backgroundColor: colors.contextBackground,
                          borderColor: firstNameBorderAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['transparent', colors.tint],
                          }),
                          borderWidth: 2,
                        }
                      ]}
                      importantForAccessibility="no-hide-descendants"
                    >
                      <TextInput
                        ref={firstNameRef}
                        value={firstName}
                        onChangeText={(text) => {
                          const prevLength = firstName.length;
                          setFirstName(text);
                          setError(null);
                          setFirstNameError(null);
                          // Auto-advance if autocomplete filled a full name
                          if (prevLength === 0 && text.length > 2) {
                            setTimeout(() => lastNameRef.current?.focus(), 100);
                          }
                        }}
                        placeholder={t('register.firstNamePlaceholder')}
                        placeholderTextColor={colors.lightDarkText}
                        style={[styles.input, { color: colors.text }]}
                        onFocus={() => openField('firstName')}
                        onBlur={handleFirstNameBlur}
                        autoCapitalize="words"
                        autoComplete="name-given"
                        textContentType="givenName"
                        returnKeyType="next"
                        onSubmitEditing={() => lastNameRef.current?.focus()}
                      />
                    </Animated.View>

                    {/* First Name Error Message */}
                    {firstNameError && (
                      <Animated.View
                        style={[
                          styles.fieldErrorContainer,
                          {
                            backgroundColor: colors.statusFailedBackground,
                            opacity: firstNameErrorAnim,
                            transform: [{
                              translateY: firstNameErrorAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [-10, 0],
                              }),
                            }],
                          }
                        ]}
                      >
                        <Ionicons name="alert-circle" size={16} color={colors.statusFailedText} />
                        <Text style={[styles.fieldError, { color: colors.statusFailedText }]}>{firstNameError}</Text>
                      </Animated.View>
                    )}
                  </View>

                  {/* Last Name */}
                  <View style={styles.nameInputGroup}>
                    <View style={[styles.inputLabelRow]}>
                      <Ionicons name="person-outline" size={18} color={colors.tint} />
                      <Text style={[styles.label, { color: colors.text }]}>{t('register.lastNameLabel')}</Text>
                    </View>
                    <Animated.View 
                      style={[
                        styles.inputContainer,
                        {
                          backgroundColor: colors.contextBackground,
                          borderColor: lastNameBorderAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['transparent', colors.tint],
                          }),
                          borderWidth: 2,
                        }
                      ]}
                      importantForAccessibility="no-hide-descendants"
                    >
                      <TextInput
                        ref={lastNameRef}
                        value={lastName}
                        onChangeText={(text) => {
                          const prevLength = lastName.length;
                          setLastName(text);
                          setError(null);
                          setLastNameError(null);
                          // Auto-advance if autocomplete filled a full name
                          if (prevLength === 0 && text.length > 2) {
                            setTimeout(() => phoneRef.current?.focus(), 100);
                          }
                        }}
                        placeholder={t('register.lastNamePlaceholder')}
                        placeholderTextColor={colors.lightDarkText}
                        style={[styles.input, { color: colors.text }]}
                        onFocus={() => openField('lastName')}
                        onBlur={handleLastNameBlur}
                        autoCapitalize="words"
                        autoComplete="name-family"
                        textContentType="familyName"
                        returnKeyType="next"
                        onSubmitEditing={() => phoneRef.current?.focus()}
                      />
                    </Animated.View>

                    {/* Last Name Error Message */}
                    {lastNameError && (
                      <Animated.View
                        style={[
                          styles.fieldErrorContainer,
                          {
                            backgroundColor: colors.statusFailedBackground,
                            opacity: lastNameErrorAnim,
                            transform: [{
                              translateY: lastNameErrorAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [-10, 0],
                              }),
                            }],
                          }
                        ]}
                      >
                        <Ionicons name="alert-circle" size={16} color={colors.statusFailedText} />
                        <Text style={[styles.fieldError, { color: colors.statusFailedText }]}>{lastNameError}</Text>
                      </Animated.View>
                    )}
                  </View>
                </View>

                {/* Phone Number */}
                <View style={styles.inputGroup}>
                    <View style={[styles.inputLabelRow]}>
                    <Ionicons name="call-outline" size={18} color={colors.tint} />
                    <Text style={[styles.label, { color: colors.text }]}>{t('register.phoneLabel')}</Text>
                  </View>
                  <Animated.View 
                    style={[
                      styles.inputContainer,
                      {
                        backgroundColor: colors.contextBackground,
                        borderColor: phoneBorderAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['transparent', colors.tint],
                        }),
                        borderWidth: 2,
                      }
                    ]}
                    importantForAccessibility="no-hide-descendants"
                  >
                    <View style={styles.phoneInputRow}>
                      <TouchableOpacity
                        onPress={toggleCountryPicker}
                        style={styles.countryCodeButton}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.countryCodeText, { color: colors.text }]}>
                          {countryCodes.find(c => c.code === countryCode)?.flag} {countryCode}
                        </Text>
                        <Animated.View style={{
                          transform: [{
                            rotate: countryChevronAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0deg', '180deg'],
                            }),
                          }],
                        }}>
                          <Ionicons
                            name="chevron-down"
                            size={16}
                            color={colors.lightDarkText}
                          />
                        </Animated.View>
                      </TouchableOpacity>
                      <View style={[styles.phoneInputDivider, { backgroundColor: colors.lightDarkText }]} />
                      <TextInput
                        ref={phoneRef}
                        value={phone}
                        onChangeText={handlePhoneChange}
                        placeholder={t('register.phonePlaceholder')}
                        placeholderTextColor={colors.lightDarkText}
                        keyboardType="phone-pad"
                        textContentType="telephoneNumber"
                        autoComplete="tel"
                        dataDetectorTypes="phoneNumber"
                        style={[styles.phoneInput, { color: colors.text }]}
                        onFocus={() => openField('phone')}
                        onBlur={handlePhoneBlur}
                        maxLength={15}
                        returnKeyType="next"
                        onSubmitEditing={() => {
                          Keyboard.dismiss();
                          openField('birth');
                        }}
                      />
                    </View>
                  </Animated.View>

                  {showCountryPicker && (
                    <Animated.View
                      style={[
                        styles.countryPickerContainer,
                        {
                          backgroundColor: colors.contextBackground,
                          opacity: countryPickerAnim,
                          transform: [{
                            translateY: countryPickerAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [-20, 0],
                            }),
                          }],
                        }
                      ]}
                      importantForAccessibility="no-hide-descendants"
                      accessibilityViewIsModal={true}
                      accessibilityElementsHidden={false}
                    >
                      <ScrollView
                        style={styles.countryPickerScroll}
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled={true}
                        importantForAccessibility="no-hide-descendants"
                      >
                        {countryCodes.map((item) => (
                          <TouchableOpacity
                            key={item.code}
                            onPress={() => selectCountryCode(item.code)}
                            style={[
                              styles.countryCodeOption,
                              { backgroundColor: countryCode === item.code ? colors.tint + '20' : 'transparent' }
                            ]}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.countryFlag}>{item.flag}</Text>
                            <Text style={[styles.countryName, { color: colors.text }]}>{item.country}</Text>
                            <Text style={[styles.countryCodeInList, { color: colors.lightDarkText }]}>{item.code}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </Animated.View>
                  )}

                  {/* Phone Error Message */}
                  {phoneError && (
                    <Animated.View
                      style={[
                        styles.fieldErrorContainer,
                        {
                          backgroundColor: colors.statusFailedBackground,
                          opacity: phoneErrorAnim,
                          transform: [{
                            translateY: phoneErrorAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [-10, 0],
                            }),
                          }],
                        }
                      ]}
                    >
                      <Ionicons name="alert-circle" size={16} color={colors.statusFailedText} />
                      <Text style={[styles.fieldError, { color: colors.statusFailedText }]}>{phoneError}</Text>
                    </Animated.View>
                  )}
                </View>

                {/* Date of Birth */}
                <View ref={birthFieldRef} style={styles.inputGroup}>
                    <View style={[styles.inputLabelRow]}>
                    <Ionicons name="calendar-outline" size={18} color={colors.tint} />
                    <Text style={[styles.label, { color: colors.text }]}>{t('register.birthLabel')}</Text>
                  </View>
                  {Platform.OS === 'web' ? (
                    <Animated.View 
                      style={[
                        styles.inputContainer,
                        {
                          backgroundColor: colors.contextBackground,
                          borderColor: birthBorderAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['transparent', colors.tint],
                          }),
                          borderWidth: 2,
                        }
                      ]}
                      importantForAccessibility="no-hide-descendants"
                    >
                        <TextInput
                        value={birth}
                        onChangeText={(text) => {
                          setBirth(text);
                          setError(null);
                          setBirthError(null);
                        }}
                        placeholder={t('register.birthPlaceholder')}
                        placeholderTextColor={colors.lightDarkText}
                        style={[styles.input, { color: colors.text }]}
                        onFocus={() => openField('birth')}
                        onBlur={handleBirthBlur}
                        autoComplete="birthdate-day"
                        textContentType="none"
                      />
                    </Animated.View>
                  ) : (
                    <>
                      <TouchableOpacity
                        onPress={() => openField('birth')}
                        activeOpacity={0.7}
                      >
                        <Animated.View 
                          style={[
                            styles.inputContainer,
                            {
                              backgroundColor: colors.contextBackground,
                              borderColor: birthBorderAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['transparent', colors.tint],
                              }),
                              borderWidth: 2,
                            }
                          ]}
                          importantForAccessibility="no-hide-descendants"
                        >
                          <View style={styles.datePickerTouchable}>
                            <Text style={[
                              styles.dateText,
                              { color: birth ? colors.text : colors.lightDarkText }
                            ]}>
                              {birth || 'DD/MM/YYYY'}
                            </Text>
                            <Animated.View style={{
                              transform: [{
                                rotate: chevronRotateAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: ['0deg', '180deg'],
                                }),
                              }],
                            }}>
                              <Ionicons
                                name="chevron-down"
                                size={20}
                                color={activeField === 'birth' ? colors.tint : colors.lightDarkText}
                              />
                            </Animated.View>
                          </View>
                        </Animated.View>
                      </TouchableOpacity>

                      {activeField === 'birth' && (
                        <Animated.View
                          onStartShouldSetResponder={() => true}
                          onTouchEnd={(e) => e.stopPropagation()}
                          style={{
                            opacity: datePickerAnim,
                            transform: [{
                              translateY: datePickerAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [-20, 0],
                              }),
                            }],
                          }}
                        >
                          <DateTimePicker
                            value={birth ? new Date(birth.split('/').reverse().join('-')) : new Date()}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={handleDateChange}
                            maximumDate={new Date()}
                          />
                        </Animated.View>
                      )}
                    </>
                  )}

                  {/* Birth Date Error Message */}
                  {birthError && (
                    <Animated.View
                      style={[
                        styles.fieldErrorContainer,
                        {
                          backgroundColor: colors.statusFailedBackground,
                          opacity: birthErrorAnim,
                          transform: [{
                            translateY: birthErrorAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [-10, 0],
                            }),
                          }],
                        }
                      ]}
                    >
                      <Ionicons name="alert-circle" size={16} color={colors.statusFailedText} />
                      <Text style={[styles.fieldError, { color: colors.statusFailedText }]}>{birthError}</Text>
                    </Animated.View>
                  )}
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <View style={[styles.inputLabelRow]}>
                  <Ionicons name="lock-closed-outline" size={18} color={colors.tint} />
                  <Text style={[styles.label, { color: colors.text }]}>{t('register.password')}</Text>
                </View>
                <Animated.View
                  style={[
                    styles.inputContainer,
                    {
                      backgroundColor: colors.contextBackground,
                      borderColor: passwordBorderAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['transparent', colors.tint],
                      }),
                      borderWidth: 2,
                    },
                  ]}
                >
                  <TextInput
                    style={[
                      styles.input,
                      { color: colors.text, flex: 1 },
                    ]}
                    placeholder={t('register.passwordPlaceholder')}
                    placeholderTextColor={colors.lightDarkText}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (passwordError) setPasswordError(null);
                    }}
                    onFocus={() => {
                      setActiveField('password');
                      openField('password');
                    }}
                    onBlur={handlePasswordBlur}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="password-new"
                    textContentType="newPassword"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={22}
                      color={colors.lightDarkText}
                    />
                  </TouchableOpacity>
                </Animated.View>

                {/* Password Error Message */}
                {passwordError && (
                  <Animated.View
                    style={[
                      styles.fieldErrorContainer,
                      {
                        backgroundColor: colors.statusFailedBackground,
                        opacity: passwordErrorAnim,
                        transform: [{
                          translateY: passwordErrorAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-10, 0],
                          }),
                        }],
                      }
                    ]}
                  >
                    <Ionicons name="alert-circle" size={16} color={colors.statusFailedText} />
                    <Text style={[styles.fieldError, { color: colors.statusFailedText }]}>{passwordError}</Text>
                  </Animated.View>
                )}
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputGroup}>
                <View style={[styles.inputLabelRow]}>
                  <Ionicons name="lock-closed-outline" size={18} color={colors.tint} />
                  <Text style={[styles.label, { color: colors.text }]}>{t('register.confirmPassword')}</Text>
                </View>
                <Animated.View
                  style={[
                    styles.inputContainer,
                    {
                      backgroundColor: colors.contextBackground,
                      borderColor: confirmPasswordBorderAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['transparent', colors.tint],
                      }),
                      borderWidth: 2,
                    },
                  ]}
                >
                  <TextInput
                    style={[
                      styles.input,
                      { color: colors.text, flex: 1 },
                    ]}
                    placeholder={t('register.confirmPasswordPlaceholder')}
                    placeholderTextColor={colors.lightDarkText}
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (confirmPasswordError) setConfirmPasswordError(null);
                    }}
                    onFocus={() => {
                      setActiveField('confirmPassword');
                      openField('confirmPassword');
                    }}
                    onBlur={handleConfirmPasswordBlur}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="password-new"
                    textContentType="newPassword"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={22}
                      color={colors.lightDarkText}
                    />
                  </TouchableOpacity>
                </Animated.View>

                {/* Confirm Password Error Message */}
                {confirmPasswordError && (
                  <Animated.View
                    style={[
                      styles.fieldErrorContainer,
                      {
                        backgroundColor: colors.statusFailedBackground,
                        opacity: confirmPasswordErrorAnim,
                        transform: [{
                          translateY: confirmPasswordErrorAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-10, 0],
                          }),
                        }],
                      }
                    ]}
                  >
                    <Ionicons name="alert-circle" size={16} color={colors.statusFailedText} />
                    <Text style={[styles.fieldError, { color: colors.statusFailedText }]}>{confirmPasswordError}</Text>
                  </Animated.View>
                )}
              </View>

              {error && (
                <Animated.View
                  style={[
                    styles.errorContainer,
                    {
                      backgroundColor: colors.statusFailedBackground,
                      opacity: errorAnim,
                      transform: [{
                        translateY: errorAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-10, 0],
                        }),
                      }],
                    }
                  ]}
                >
                  <Ionicons name="alert-circle" size={20} color={colors.statusFailedText} />
                  <Text style={[styles.error, { color: colors.statusFailedText }]}>{error}</Text>
                </Animated.View>
              )}

                <View style={styles.dividerContainer}>
                <View style={[styles.dividerLine, { backgroundColor: colors.lightDarkText }]} />
                <Text style={[styles.dividerText, { color: colors.lightDarkText }]}>{t('register.orContinueWith')}</Text>
                <View style={[styles.dividerLine, { backgroundColor: colors.lightDarkText }]} />
              </View>

              <View style={styles.socialIconRow}>
                <TouchableOpacity
                  onPress={() => console.log('Google register')}
                  activeOpacity={0.7}
                  style={[styles.socialIconButton, { backgroundColor: colors.contextBackground }]}
                >
                  <Image 
                    source={require('@/assets/images/Google.png')} 
                    style={styles.socialIconLarge}
                    resizeMode="contain"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => console.log('Facebook register')}
                  activeOpacity={0.7}
                  style={[styles.socialIconButton, { backgroundColor: colors.contextBackground }]}
                >
                  <Ionicons name="logo-facebook" size={28} color="#4267B2" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => console.log('Apple register')}
                  activeOpacity={0.7}
                  style={[styles.socialIconButton, { backgroundColor: colors.contextBackground }]}
                >
                  <Ionicons name="logo-apple" size={28} color="#fff" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={handleNext}
                disabled={!isFormValid() || loading}
                activeOpacity={0.7}
              >
                <Animated.View 
                  style={[
                    styles.nextBtn,
                    {
                      backgroundColor: isFormValid() ? colors.tint : colors.lightNonInteractiveText,
                      opacity: buttonOpacityAnim,
                    }
                  ]}
                  importantForAccessibility="no-hide-descendants"
                >
                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <Text style={[styles.nextText, { color: colors.darkText }]}>Oppretter profil</Text>
                      <View style={styles.loadingDots}>
                        <View style={[styles.dot, { backgroundColor: colors.darkText }]} />
                        <View style={[styles.dot, { backgroundColor: colors.darkText }]} />
                        <View style={[styles.dot, { backgroundColor: colors.darkText }]} />
                      </View>
                    </View>
                  ) : (
                    <View style={styles.buttonContent}>
                      <Text style={[styles.nextText, { color: isFormValid() ? colors.darkText : colors.text }]}>{t('register.submit')}</Text>
                      <Ionicons name="arrow-forward" size={20} color={isFormValid() ? colors.darkText : colors.text} />
                    </View>
                  )}
                </Animated.View>
              </TouchableOpacity>

              <View style={styles.loginHintContainer}>
                <Text style={[styles.loginHintText, { color: colors.lightDarkText }]}>
                  {t('register.alreadyHaveAccount')}{' '}
                  <Text
                    style={[styles.loginLink, { color: colors.tint }]}
                    onPress={() => router.replace('/(onboarding)/(account)/LoginChoice')}
                  >
                    {t('register.loginLink')}
                  </Text>
                </Text>
              </View>
            </Animated.View>
          </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    width: '100%',
    paddingHorizontal: 24,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 8,
    height: '100%',
    justifyContent: 'center',
    padding: 8,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
  },
  iconWrapper: {
    alignItems: 'center',
    marginBottom: 32,
  },
  profileIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 3px 6px 0 rgba(0, 0, 0, 0.1)',
    elevation: 4,
  },
  avatarWrap: {
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.15)',
    elevation: 5,
  },
  form: {
    width: '100%',
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  nameInputGroup: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 10,
  },
  inputLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  input: {
    fontSize: 16,
    paddingVertical: 12,
  },
  eyeIcon: {
    padding: 8,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingRight: 8,
    gap: 4,
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  phoneInputDivider: {
    width: 1,
    height: 24,
    opacity: 0.3,
    marginHorizontal: 8,
  },
  phoneInput: {
    fontSize: 16,
    paddingVertical: 12,
    flex: 1,
  },
  countryPickerContainer: {
    marginTop: 8,
    borderRadius: 16,
    maxHeight: 240,
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.1)',
    elevation: 4,
  },
  countryPickerScroll: {
    maxHeight: 240,
  },
  countryCodeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  countryFlag: {
    fontSize: 24,
  },
  countryName: {
    fontSize: 15,
    flex: 1,
  },
  countryCodeInList: {
    fontSize: 15,
    fontWeight: '600',
  },
  datePickerTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  dateText: {
    fontSize: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  error: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  fieldErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
    gap: 6,
  },
  fieldError: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  nextBtn: {
    marginTop: 12,
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)',
    elevation: 5,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  nextText: {
    fontSize: 17,
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    opacity: 0.3,
  },
  dividerText: {
    fontSize: 14,
    fontWeight: '500',
    marginHorizontal: 16,
    opacity: 0.7,
  },
  socialIconRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 10,
  },
  socialIconButton: {
    width: 60,
    height: 60,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  socialIconLarge: {
    width: 23,
    height: 23,
  },
  loginHintContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  loginHintText: {
    fontSize: 15,
    textAlign: 'center',
  },
  loginLink: {
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
