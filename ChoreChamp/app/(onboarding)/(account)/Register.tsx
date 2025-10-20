import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Platform, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import OnboardingDots from '../../../components/OnboardingDots';
import DateTimePicker from '@react-native-community/datetimepicker';

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
  const [birth, setBirth] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeField, setActiveField] = useState<'firstName' | 'lastName' | 'phone' | 'birth' | null>(null);

  // Animated values for smooth transitions
  const firstNameBorderAnim = useRef(new Animated.Value(0)).current;
  const lastNameBorderAnim = useRef(new Animated.Value(0)).current;
  const phoneBorderAnim = useRef(new Animated.Value(0)).current;
  const birthBorderAnim = useRef(new Animated.Value(0)).current;
  const buttonOpacityAnim = useRef(new Animated.Value(0.5)).current;
  const datePickerAnim = useRef(new Animated.Value(0)).current;
  const errorAnim = useRef(new Animated.Value(0)).current;
  const chevronRotateAnim = useRef(new Animated.Value(0)).current;

  // Animate button opacity when form validity changes
  useEffect(() => {
    const phoneRegex = /^(\+47)?[0-9]{8}$/;
    const isValid = firstName.trim() && lastName.trim() && phone.trim() && birth && phoneRegex.test(phone.replace(/\s/g, ''));
    
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
    
    // Validate phone number format (Norwegian format)
    const phoneRegex = /^(\+47)?[0-9]{8}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
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
    
    // Basic phone validation (Norwegian format)
    const phoneRegex = /^(\+47)?[0-9]{8}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
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

  // Format phone number to Norwegian format: xxx xx xxx
  const formatPhoneNumber = (text: string) => {
    // Remove all non-numeric characters
    const cleaned = text.replace(/\D/g, '');
    
    // Limit to 8 digits
    const limited = cleaned.slice(0, 8);
    
    // Format as xxx xx xxx
    if (limited.length <= 3) {
      return limited;
    } else if (limited.length <= 5) {
      return `${limited.slice(0, 3)} ${limited.slice(3)}`;
    } else {
      return `${limited.slice(0, 3)} ${limited.slice(3, 5)} ${limited.slice(5)}`;
    }
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhone(formatted);
    setError(null);
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
          () => {}
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
          {/* First Name */}
          <View style={styles.inputGroup}>
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
                  setFirstName(text);
                  setError(null);
                }}
                placeholder="Skriv inn fornavn"
                placeholderTextColor={colors.lightDarkText}
                style={[styles.input, { color: colors.text }]}
                onFocus={() => openField('firstName')}
                onBlur={() => closeField()}
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => lastNameRef.current?.focus()}
              />
            </Animated.View>
          </View>

          {/* Last Name */}
          <View style={styles.inputGroup}>
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
                  setLastName(text);
                  setError(null);
                }}
                placeholder="Skriv inn etternavn"
                placeholderTextColor={colors.lightDarkText}
                style={[styles.input, { color: colors.text }]}
                onFocus={() => openField('lastName')}
                onBlur={() => closeField()}
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => phoneRef.current?.focus()}
              />
            </Animated.View>
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
              <TextInput
                ref={phoneRef}
                value={phone}
                onChangeText={handlePhoneChange}
                placeholder="123 45 678"
                placeholderTextColor={colors.lightDarkText}
                keyboardType="phone-pad"
                style={[styles.input, { color: colors.text }]}
                onFocus={() => openField('phone')}
                onBlur={() => closeField()}
                maxLength={10}
                returnKeyType="next"
                onSubmitEditing={() => {
                  Keyboard.dismiss();
                  openField('birth');
                }}
              />
            </Animated.View>
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
        </View>
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
});
