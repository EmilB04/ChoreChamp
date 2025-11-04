import { useTheme } from '@/contexts/ThemeContext';
import { useEntranceAnimation } from '@/hooks/useEntranceAnimation';
import { useBorderAnimations, useFormAnimations, usePickerAnimations } from '@/hooks/useFormAnimations';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import OnboardingDots from '../../../components/onBoarding/OnboardingDots';
import { formatPhoneNumber, stripCountryCode, validatePhone } from './FormValidation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n/i18n';

export default function Login() {
    const router = useRouter();
    const { colors } = useTheme();
    const { t } = useTranslation('onboarding');
    const params = useLocalSearchParams();
    const langParam = typeof params.lang === 'string' ? params.lang : undefined;
    const scrollViewRef = useRef<ScrollView>(null);
    const phoneRef = useRef<TextInput>(null);
    const passwordRef = useRef<TextInput>(null);

    const [phone, setPhone] = useState('');
    const [countryCode, setCountryCode] = useState('+47');
    const [showCountryPicker, setShowCountryPicker] = useState(false);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [phoneError, setPhoneError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [activeField, setActiveField] = useState<'phone' | 'password' | null>(null);

    const countryCodes = [
        { code: '+47', country: 'Norge', flag: '🇳🇴' },
        { code: '+44', country: 'Storbritannia', flag: '🇬🇧' },
        { code: '+34', country: 'Spania', flag: '🇪🇸' },
        { code: '+49', country: 'Tyskland', flag: '🇩🇪' },
    ];

    // Use entrance animation hook for initial page load
    const { fadeAnim, slideAnim } = useEntranceAnimation();

    // Use form animations hook
    const { buttonOpacityAnim, errorAnim, fieldErrorAnims, animateButtonOpacity } = useFormAnimations({
        errorCount: 2,
        hasError: !!error,
        fieldErrors: [phoneError, passwordError],
    });
    const [phoneErrorAnim, passwordErrorAnim] = fieldErrorAnims;

    // Use border animations hook
    const { borderAnims, animateBorder } = useBorderAnimations({ fieldCount: 2 });
    const [phoneBorderAnim, passwordBorderAnim] = borderAnims;

    // Use picker animations hook
    const { pickerAnim: countryPickerAnim, chevronAnim: countryChevronAnim, animatePicker } = usePickerAnimations();

    // Animate button opacity when form validity changes
    useEffect(() => {
        const isValid = !!(phone.trim() && password.trim() && password.length >= 6);
        animateButtonOpacity(isValid);
    }, [phone, password, animateButtonOpacity]);

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

    // Animate country picker
    useEffect(() => {
        animatePicker(showCountryPicker);
    }, [showCountryPicker, animatePicker]);

    // Check if form is valid
    const isFormValid = (): boolean => {
        if (!phone.trim() || !password.trim() || password.length < 6) {
            return false;
        }
        const validation = validatePhone(phone, countryCode);
        return validation.isValid;
    };

    // Handle phone blur
    const handlePhoneBlur = () => {
        setTimeout(() => {
            // Strip country code and clean the input
            const cleaned = stripCountryCode(phone);

            // Format with spacing when user leaves the field
            const formatted = formatPhoneNumber(cleaned, countryCode);

            setPhone(formatted);

            // Validate phone number
            if (formatted.trim()) {
                const validation = validatePhone(formatted, countryCode);
                if (!validation.isValid) {
                    setPhoneError(validation.error || t('login.errorInvalidPhone'));
                } else {
                    setPhoneError(null);
                }
            } else {
                setPhoneError(null);
            }
        }, 100);
    };

    // Handle password blur
    const handlePasswordBlur = () => {
        setTimeout(() => {
            if (password.trim()) {
                if (password.length < 6) {
                    setPasswordError(t('login.errorPasswordMin'));
                } else {
                    setPasswordError(null);
                }
            } else {
                setPasswordError(null);
            }
        }, 100);
    };

    // Handle login
    async function handleLogin() {
        // Validate
        if (!phone.trim()) {
            setError(t('login.errorPhoneRequired'));
            return;
        }
        const phoneValidation = validatePhone(phone, countryCode);
        if (!phoneValidation.isValid) {
            setError(phoneValidation.error || t('login.errorInvalidPhone'));
            return;
        }
        if (!password.trim()) {
            setError(t('login.errorPasswordRequired'));
            return;
        }
        if (password.length < 6) {
            setError(t('login.errorPasswordMin'));
            return;
        }

        setError(null);
        setLoading(true);
        try {
            await new Promise((r) => setTimeout(r, 700));
            // TODO: Implement actual login logic
            router.replace('/(tabs)');
        } catch {
            setError(t('login.errorInvalidCredentials'));
        } finally {
            setLoading(false);
        }
    }

    const openField = (fieldName: 'phone' | 'password') => {
        animateBorder(phoneBorderAnim, fieldName === 'phone' ? 1 : 0);
        animateBorder(passwordBorderAnim, fieldName === 'password' ? 1 : 0);
        setActiveField(activeField === fieldName ? null : fieldName);
    };

    // Toggle country picker
    const toggleCountryPicker = () => {
        setShowCountryPicker(!showCountryPicker);
    };

    // Select country code
    const selectCountryCode = (code: string) => {
        setCountryCode(code);
        setShowCountryPicker(false);
    };

    // Handle phone change
    const handlePhoneChange = (text: string) => {
        setPhone(text);
        setError(null);
        setPhoneError(null);
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
                behavior={Platform.select({ ios: 'padding', android: 'height', default: 'padding' })}
                style={styles.keyboardAvoid}
                keyboardVerticalOffset={Platform.select({ ios: 0, android: 0, default: 0 })}
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
                        <Text style={[styles.title, { color: colors.text }]}>{t('login.title')}</Text>
                        <Text style={[styles.subtitle, { color: colors.lightDarkText }]}>
                            {t('login.subtitle')}
                        </Text>

                        <View style={styles.iconWrapper}>
                            <View style={[styles.profileIcon, { backgroundColor: colors.tint }]}>
                                <Ionicons name="log-in" size={40} color={colors.darkText} />
                            </View>
                        </View>

                        <View style={styles.form}>
                            {/* Phone Number */}
                            <View style={styles.inputGroup}>
                                <View style={[styles.inputLabelRow]}>
                                    <Ionicons name="call-outline" size={18} color={colors.tint} />
                                    <Text style={[styles.label, { color: colors.text }]}>{t('login.phoneLabel')}</Text>
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
                                            placeholder={t('login.phonePlaceholder')}
                                            placeholderTextColor={colors.lightDarkText}
                                            keyboardType="phone-pad"
                                            textContentType="telephoneNumber"
                                            autoComplete="tel"
                                            importantForAutofill="yes"
                                            style={[styles.phoneInput, { color: colors.text }]}
                                            onFocus={() => openField('phone')}
                                            onBlur={handlePhoneBlur}
                                            maxLength={15}
                                            returnKeyType="next"
                                            onSubmitEditing={() => passwordRef.current?.focus()}
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

                            {/* Password */}
                            <View style={styles.inputGroup}>
                                <View style={[styles.inputLabelRow]}>
                                    <Ionicons name="lock-closed-outline" size={18} color={colors.tint} />
                                    <Text style={[styles.label, { color: colors.text }]}>{t('login.passwordLabel')}</Text>
                                </View>
                                <Animated.View style={[
                                    styles.inputContainer,
                                    {
                                        backgroundColor: colors.contextBackground,
                                        borderColor: passwordBorderAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: ['transparent', colors.tint],
                                        }),
                                        borderWidth: 2,
                                    }
                                ]}>
                                    <View style={styles.passwordInputRow}>
                                        <TextInput
                                            ref={passwordRef}
                                            value={password}
                                            onChangeText={(text) => {
                                                setPassword(text);
                                                setError(null);
                                                setPasswordError(null);
                                            }}
                                            placeholder={t('login.passwordPlaceholder')}
                                            placeholderTextColor={colors.lightDarkText}
                                            secureTextEntry={!showPassword}
                                            autoCapitalize="none"
                                            autoComplete="password"
                                            textContentType="password"
                                            style={[styles.passwordInput, { color: colors.text }]}
                                            onFocus={() => openField('password')}
                                            onBlur={handlePasswordBlur}
                                            returnKeyType="done"
                                            onSubmitEditing={handleLogin}
                                        />
                                        <TouchableOpacity
                                            onPress={() => setShowPassword(!showPassword)}
                                            style={styles.eyeButton}
                                            hitSlop={10}
                                        >
                                            <Ionicons
                                                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                                size={22}
                                                color={colors.lightDarkText}
                                            />
                                        </TouchableOpacity>
                                    </View>
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

                            {/* Forgot Password */}
                                <TouchableOpacity
                                    onPress={() => console.log('Forgot password')}
                                    style={styles.forgotPasswordButton}
                                >
                                    <Text style={[styles.forgotPasswordText, { color: colors.tint }]}>
                                        {t('login.forgotPassword')}
                                    </Text>
                                </TouchableOpacity>
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
                            onPress={handleLogin}
                            disabled={!isFormValid() || loading}
                            activeOpacity={0.7}
                        >
                            <Animated.View style={[
                                styles.loginBtn,
                                {
                                    backgroundColor: isFormValid() ? colors.tint : colors.lightNonInteractiveText,
                                    opacity: buttonOpacityAnim,
                                }
                            ]}>
                                {loading ? (
                                    <View style={styles.loadingContainer}>
                                        <Text style={[styles.loginText, { color: colors.darkText }]}>{t('login.loggingIn')}</Text>
                                        <View style={styles.loadingDots}>
                                            <View style={[styles.dot, { backgroundColor: colors.darkText }]} />
                                            <View style={[styles.dot, { backgroundColor: colors.darkText }]} />
                                            <View style={[styles.dot, { backgroundColor: colors.darkText }]} />
                                        </View>
                                    </View>
                                ) : (
                                    <View style={styles.buttonContent}>
                                        <Text style={[styles.loginText, { color: isFormValid() ? colors.darkText : colors.text }]}>{t('login.login')}</Text>
                                        <Ionicons name="arrow-forward" size={20} color={isFormValid() ? colors.darkText : colors.text} />
                                    </View>
                                )}
                            </Animated.View>
                        </TouchableOpacity>

                        <View style={styles.dividerContainer}>
                            <View style={[styles.dividerLine, { backgroundColor: colors.lightDarkText }]} />
                            <Text style={[styles.dividerText, { color: colors.lightDarkText }]}>Eller fortsett med</Text>
                            <View style={[styles.dividerLine, { backgroundColor: colors.lightDarkText }]} />
                        </View>

                        <View style={styles.socialIconRow}>
                            <TouchableOpacity
                                onPress={() => console.log('Google login')}
                                activeOpacity={0.7}
                                style={[styles.socialIconButton, { backgroundColor: colors.contextBackground }]}
                            >
                                <Image source={require('@/assets/images/Google.png')} style={styles.socialIconLarge} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => console.log('Facebook login')}
                                activeOpacity={0.7}
                                style={[styles.socialIconButton, { backgroundColor: colors.contextBackground }]}
                            >
                                <Ionicons name="logo-facebook" size={28} color="#4267B2" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => console.log('Apple login')}
                                activeOpacity={0.7}
                                style={[styles.socialIconButton, { backgroundColor: colors.contextBackground }]}
                            >
                                <Ionicons name="logo-apple" size={28} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.registerHintContainer}>
                            <Text style={[styles.registerHintText, { color: colors.lightDarkText }]}>
                                {t('login.noAccount')}{' '}
                                <Text
                                    style={[styles.registerLink, { color: colors.tint }]}
                                    onPress={() => router.replace('/(onboarding)/(account)/Register')}
                                >
                                    {t('login.registerLink')}
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    form: {
        width: '100%',
        marginBottom: 16,
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
    passwordInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    passwordInput: {
        fontSize: 16,
        paddingVertical: 12,
        flex: 1,
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
    eyeButton: {
        padding: 8,
    },
    forgotPasswordButton: {
        alignSelf: 'flex-end',
        marginTop: -8,
    },
    forgotPasswordText: {
        fontSize: 14,
        fontWeight: '600',
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
    loginBtn: {
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
    loginText: {
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
    registerHintContainer: {
        marginTop: 24,
        alignItems: 'center',
    },
    registerHintText: {
        fontSize: 15,
        textAlign: 'center',
    },
    registerLink: {
        fontWeight: '700',
        textDecorationLine: 'underline',
    },
});
