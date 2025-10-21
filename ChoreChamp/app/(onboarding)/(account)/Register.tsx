import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Platform, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Animated, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import OnboardingDots from '../../../components/onBoarding/OnboardingDots';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEntranceAnimation } from '@/hooks/useEntranceAnimation';

export default function Register() {
  const router = useRouter();
  const { colors } = useTheme();
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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeField, setActiveField] = useState<'firstName' | 'lastName' | 'phone' | 'birth' | null>(null);

  // Use entrance animation hook for initial page load
  const { fadeAnim, slideAnim } = useEntranceAnimation();

  // Animated values for smooth transitions
  const firstNameBorderAnim = useRef(new Animated.Value(0)).current;
  const lastNameBorderAnim = useRef(new Animated.Value(0)).current;
  const phoneBorderAnim = useRef(new Animated.Value(0)).current;
  const birthBorderAnim = useRef(new Animated.Value(0)).current;
  const buttonOpacityAnim = useRef(new Animated.Value(0.5)).current;
  const datePickerAnim = useRef(new Animated.Value(0)).current;
  const errorAnim = useRef(new Animated.Value(0)).current;
  const chevronRotateAnim = useRef(new Animated.Value(0)).current;
  const countryPickerAnim = useRef(new Animated.Value(0)).current;
  const countryChevronAnim = useRef(new Animated.Value(0)).current;

  // Common country codes
  const countryCodes = [
    { code: '+47', country: 'Norge', flag: '🇳🇴' },
    { code: '+44', country: 'Storbritannia', flag: '🇬🇧' },
    { code: '+34', country: 'Spania', flag: '🇪🇸' },
    { code: '+49', country: 'Tyskland', flag: '🇩🇪' },
  ];

  // Animate button opacity when form validity changes
  useEffect(() => {
    const isValid = firstName.trim() && lastName.trim() && phone.trim() && birth && phone.replace(/\s/g, '').length >= 8;

    Animated.timing(buttonOpacityAnim, {
      toValue: isValid ? 1 : 0.5,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [firstName, lastName, phone, birth, buttonOpacityAnim]);

  // Animate error message appearance
  useEffect(() => {
    if (error) {
      Animated.spring(errorAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.timing(errorAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [error, errorAnim]);

  // Check if all fields are filled and valid
  function isFormValid() {
    // Check if all fields have values
    if (!firstName.trim() || !lastName.trim() || !phone.trim() || !birth) {
      return false;
    }

    // Validate phone number format (at least 8 digits)
    const cleanPhone = phone.replace(/\s/g, '');
    if (cleanPhone.length < 8) {
      return false;
    }

    return true;
  }

  // Basic validation for registration fields
  function validate() {
    if (!firstName.trim()) return 'Vennligst skriv inn fornavn';
    if (!lastName.trim()) return 'Vennligst skriv inn etternavn';
    if (!phone.trim()) return 'Vennligst skriv inn telefonnummer';
    if (!birth) return 'Vennligst velg fødselsdato';

    // Basic phone validation (at least 8 digits)
    const cleanPhone = phone.replace(/\s/g, '');
    if (cleanPhone.length < 8) {
      return 'Ugyldig telefonnummer';
    }

    return null;
  }

  // TODO: Implement actual registration logic
  async function handleNext() {
    const v = validate();
    if (v) return setError(v);
    setError(null);
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 700));
      // TODO: Save user data
      router.replace('/(tabs)');
    } catch {
      setError('Noe gikk galt. Prøv igjen.');
    } finally {
      setLoading(false);
    }
  }

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      setActiveField(null);
      return;
    }
    const currentDate = selectedDate || new Date();
    const day = currentDate.getDate().toString().padStart(2, '0');
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const year = currentDate.getFullYear();
    setBirth(`${day}/${month}/${year}`);
  };

  const handlePhoneChange = (text: string) => {
    const prevLength = phone.length;
    // Just store the raw input while typing
    setPhone(text);
    setError(null);
    
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
    // Remove all non-numeric characters except + at the start
    let cleaned = phone.replace(/[^\d+]/g, '');

    // Strip country codes from autofill
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
        // Only strip if minimum length requirement is met (for +1 edge case)
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
    cleaned = cleaned.replace(/[^\d]/g, '');

    // Format with spacing only when user leaves the field
    let displayValue = '';
    if (countryCode === '+47') {
      // Norwegian format: 123 45 678
      if (cleaned.length <= 3) displayValue = cleaned;
      else if (cleaned.length <= 5) displayValue = `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
      else displayValue = `${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)}`;
    } else {
      // Generic format with spacing every 3 digits
      displayValue = cleaned.replace(/(\d{3})(?=\d)/g, '$1 ');
    }

    setPhone(displayValue);
    closeField();
  };

  const toggleCountryPicker = () => {
    const newValue = !showCountryPicker;
    setShowCountryPicker(newValue);

    Animated.parallel([
      Animated.spring(countryPickerAnim, {
        toValue: newValue ? 1 : 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(countryChevronAnim, {
        toValue: newValue ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const selectCountryCode = (code: string) => {
    setCountryCode(code);
    setShowCountryPicker(false);
    Animated.parallel([
      Animated.timing(countryPickerAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(countryChevronAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateBorder = (animValue: Animated.Value, toValue: number) => {
    Animated.timing(animValue, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const openField = (fieldName: 'firstName' | 'lastName' | 'phone' | 'birth') => {
    // Animate all borders
    animateBorder(firstNameBorderAnim, fieldName === 'firstName' ? 1 : 0);
    animateBorder(lastNameBorderAnim, fieldName === 'lastName' ? 1 : 0);
    animateBorder(phoneBorderAnim, fieldName === 'phone' ? 1 : 0);
    animateBorder(birthBorderAnim, fieldName === 'birth' ? 1 : 0);

    // Animate date picker appearance and chevron
    if (fieldName === 'birth') {
      Animated.spring(datePickerAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
      Animated.timing(chevronRotateAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(datePickerAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
      Animated.timing(chevronRotateAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
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

  const closeField = () => {
    // Animate all borders to closed state
    animateBorder(firstNameBorderAnim, 0);
    animateBorder(lastNameBorderAnim, 0);
    animateBorder(phoneBorderAnim, 0);
    animateBorder(birthBorderAnim, 0);

    // Animate date picker disappearance
    Animated.timing(datePickerAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();

    // Animate chevron back
    Animated.timing(chevronRotateAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();

    setActiveField(null);
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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={() => {
          Keyboard.dismiss();
          closeField();
        }}>
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
              <Text style={[styles.title, { color: colors.text }]}>Lag din profil</Text>
              <Text style={[styles.subtitle, { color: colors.lightDarkText }]}>
                Fyll inn informasjonen din for å komme i gang
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
                      <Text style={[styles.label, { color: colors.text }]}>Fornavn</Text>
                    </View>
                    <Animated.View style={[
                      styles.inputContainer,
                      {
                        backgroundColor: colors.contextBackground,
                        borderColor: firstNameBorderAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['transparent', colors.tint],
                        }),
                        borderWidth: 2,
                      }
                    ]}>
                      <TextInput
                        ref={firstNameRef}
                        value={firstName}
                        onChangeText={(text) => {
                          const prevLength = firstName.length;
                          setFirstName(text);
                          setError(null);
                          // Auto-advance if autocomplete filled a full name
                          if (prevLength === 0 && text.length > 2) {
                            setTimeout(() => lastNameRef.current?.focus(), 100);
                          }
                        }}
                        placeholder="Fornavn"
                        placeholderTextColor={colors.lightDarkText}
                        style={[styles.input, { color: colors.text }]}
                        onFocus={() => openField('firstName')}
                        onBlur={() => closeField()}
                        autoCapitalize="words"
                        autoComplete="name-given"
                        textContentType="givenName"
                        returnKeyType="next"
                        onSubmitEditing={() => lastNameRef.current?.focus()}
                      />
                    </Animated.View>
                  </View>

                  {/* Last Name */}
                  <View style={styles.nameInputGroup}>
                    <View style={[styles.inputLabelRow]}>
                      <Ionicons name="person-outline" size={18} color={colors.tint} />
                      <Text style={[styles.label, { color: colors.text }]}>Etternavn</Text>
                    </View>
                    <Animated.View style={[
                      styles.inputContainer,
                      {
                        backgroundColor: colors.contextBackground,
                        borderColor: lastNameBorderAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['transparent', colors.tint],
                        }),
                        borderWidth: 2,
                      }
                    ]}>
                      <TextInput
                        ref={lastNameRef}
                        value={lastName}
                        onChangeText={(text) => {
                          const prevLength = lastName.length;
                          setLastName(text);
                          setError(null);
                          // Auto-advance if autocomplete filled a full name
                          if (prevLength === 0 && text.length > 2) {
                            setTimeout(() => phoneRef.current?.focus(), 100);
                          }
                        }}
                        placeholder="Etternavn"
                        placeholderTextColor={colors.lightDarkText}
                        style={[styles.input, { color: colors.text }]}
                        onFocus={() => openField('lastName')}
                        onBlur={() => closeField()}
                        autoCapitalize="words"
                        autoComplete="name-family"
                        textContentType="familyName"
                        returnKeyType="next"
                        onSubmitEditing={() => phoneRef.current?.focus()}
                      />
                    </Animated.View>
                  </View>
                </View>

                {/* Phone Number */}
                <View style={styles.inputGroup}>
                  <View style={[styles.inputLabelRow]}>
                    <Ionicons name="call-outline" size={18} color={colors.tint} />
                    <Text style={[styles.label, { color: colors.text }]}>Telefonnummer</Text>
                  </View>
                  <Animated.View style={[
                    styles.inputContainer,
                    {
                      backgroundColor: colors.contextBackground,
                      borderColor: phoneBorderAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['transparent', colors.tint],
                      }),
                      borderWidth: 2,
                    }
                  ]}>
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
                        placeholder="12345678"
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
                    >
                      <ScrollView
                        style={styles.countryPickerScroll}
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled={true}
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
                </View>

                {/* Date of Birth */}
                <View ref={birthFieldRef} style={styles.inputGroup}>
                  <View style={[styles.inputLabelRow]}>
                    <Ionicons name="calendar-outline" size={18} color={colors.tint} />
                    <Text style={[styles.label, { color: colors.text }]}>Fødselsdato</Text>
                  </View>
                  {Platform.OS === 'web' ? (
                    <Animated.View style={[
                      styles.inputContainer,
                      {
                        backgroundColor: colors.contextBackground,
                        borderColor: birthBorderAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['transparent', colors.tint],
                        }),
                        borderWidth: 2,
                      }
                    ]}>
                      <TextInput
                        value={birth}
                        onChangeText={(text) => {
                          setBirth(text);
                          setError(null);
                        }}
                        placeholder="DD/MM/YYYY"
                        placeholderTextColor={colors.lightDarkText}
                        style={[styles.input, { color: colors.text }]}
                        onFocus={() => openField('birth')}
                        onBlur={() => closeField()}
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
                        <Animated.View style={[
                          styles.inputContainer,
                          {
                            backgroundColor: colors.contextBackground,
                            borderColor: birthBorderAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['transparent', colors.tint],
                            }),
                            borderWidth: 2,
                          }
                        ]}>
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
                </View>
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
                <Text style={[styles.dividerText, { color: colors.lightDarkText }]}>Eller fortsett med</Text>
                <View style={[styles.dividerLine, { backgroundColor: colors.lightDarkText }]} />
              </View>

              <View style={styles.socialIconRow}>
                <TouchableOpacity
                  onPress={() => console.log('Google register')}
                  activeOpacity={0.7}
                  style={[styles.socialIconButton, { backgroundColor: colors.contextBackground }]}
                >
                  <Image source={require('@/assets/images/Google.png')} style={styles.socialIconLarge} />
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
                <Animated.View style={[
                  styles.nextBtn,
                  {
                    backgroundColor: isFormValid() ? colors.tint : colors.lightNonInteractiveText,
                    opacity: buttonOpacityAnim,
                  }
                ]}>
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
                      <Text style={[styles.nextText, { color: isFormValid() ? colors.darkText : colors.text }]}>Fullfør registrering</Text>
                      <Ionicons name="arrow-forward" size={20} color={isFormValid() ? colors.darkText : colors.text} />
                    </View>
                  )}
                </Animated.View>
              </TouchableOpacity>

              <View style={styles.loginHintContainer}>
                <Text style={[styles.loginHintText, { color: colors.lightDarkText }]}>
                  Har du allerede en konto?{' '}
                  <Text
                    style={[styles.loginLink, { color: colors.tint }]}
                    onPress={() => router.replace('/(onboarding)/(account)/Login')}
                  >
                    Logg inn
                  </Text>
                </Text>
              </View>
            </Animated.View>
          </ScrollView>
        </TouchableWithoutFeedback>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  form: {
    width: '100%',
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  nameInputGroup: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
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
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  input: {
    fontSize: 16,
    paddingVertical: 12,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
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
  nextBtn: {
    marginTop: 12,
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
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
    marginBottom: 20,
  },
  socialIconButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  socialIconLarge: {
    width: 28,
    height: 28,
    resizeMode: 'contain'
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
