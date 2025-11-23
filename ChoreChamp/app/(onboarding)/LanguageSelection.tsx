import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useEntranceAnimation, useScaleAnimation, useStaggeredAnimation } from '@/hooks/useEntranceAnimation';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import OnboardingDots from '../../components/onBoarding/OnboardingDots';

// TODO: Remove when language is incorporated throughout app
const CHOOSE_LANGUAGE_TEXTS: Record<string, string> = {
    en: 'Select your language',
    nb: 'Velg språk',
    es: 'Selecciona tu idioma',
    de: 'Wähle deine Sprache',
};

const CONTINUE_TEXTS: Record<string, string> = {
    en: 'Continue',
    nb: 'Fortsett',
    es: 'Continuar',
    de: 'Weiter',
};

export default function LanguageSelection() {
    const router = useRouter();
    const { colors } = useTheme();
    const { user } = useAuth();
    const [selected, setSelected] = useState<string | null>(null);

    // If already logged in, redirect to dashboard
    React.useEffect(() => {
        if (user) {
            router.replace('/(tabs)');
        }
    }, [user, router]);

    const { fadeAnim } = useEntranceAnimation();
    const logoScaleAnim = useScaleAnimation(100);
    const titleSlideAnim = useScaleAnimation(200, 1);
    const [button1ScaleAnim, button2ScaleAnim, button3ScaleAnim, button4ScaleAnim] = useStaggeredAnimation(4, 300, 50);
    const buttonSlideAnim = useStaggeredAnimation(1, 500)[0];

    function handleContinue() {
        if (selected) {
            // --- CHANGED: route to WelcomeScreen first, carrying the selected language
            router.push(`/(onboarding)/WelcomeScreen?lang=${encodeURIComponent(selected)}`);
        }
    }

    return (
        <View style={[styles.safe, { backgroundColor: colors.background }]}>
            {/* Gradient Header Background */}
            <View style={styles.headerBackground}>
                <LinearGradient
                    colors={[colors.tint, colors.background]}
                    style={styles.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                />
            </View>

            <SafeAreaView style={styles.safeContent}>
                <View style={styles.headerRow}>
                    <OnboardingDots activeIndex={0} total={5} />
                </View>

                <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
                    {/* Language Icon Badge */}
                    <Animated.View style={[styles.logoBadge, {
                        backgroundColor: colors.background,
                        transform: [{ scale: logoScaleAnim }],
                    }]}>
                        <View style={[styles.iconInner, { backgroundColor: colors.tint }]}>
                            <Ionicons name="language" size={70} color={colors.darkText} />
                        </View>
                    </Animated.View>

                    {/* Title with Icon */}
                    <Animated.View style={[styles.titleContainer, {
                        transform: [{ scale: titleSlideAnim }],
                    }]}>
                        <View style={[styles.titleBadge, { backgroundColor: colors.contextBackground }]}>
                            <Text style={[styles.title, { color: colors.text }]}>
                                {selected ? CHOOSE_LANGUAGE_TEXTS[selected] : 'Select your language'}
                            </Text>
                        </View>
                    </Animated.View>

                    {/* Language Options */}
                    <View style={styles.buttons}>
                        <Animated.View 
                            style={{ transform: [{ scale: button1ScaleAnim }] }}
                            importantForAccessibility="no-hide-descendants"
                        >
                            <TouchableOpacity
                                style={[
                                    styles.langBtn,
                                    {
                                        backgroundColor: colors.contextBackground,
                                        borderColor: selected === 'en' ? colors.tint : 'transparent',
                                        borderWidth: 2,
                                    }
                                ]}
                                onPress={() => setSelected('en')}
                                accessibilityRole="button"
                                accessibilityLabel="English"
                                activeOpacity={0.7}
                            >
                                <Image 
                                    source={require('../../assets/images/GB.png')} 
                                    style={styles.flagImage}
                                    contentFit="cover"
                                />
                                <Text style={[styles.langText, { color: colors.text }]}>English</Text>
                                {selected === 'en' && <Ionicons name="checkmark-circle" size={24} color={colors.tint} />}
                            </TouchableOpacity>
                        </Animated.View>

                        <Animated.View 
                            style={{ transform: [{ scale: button2ScaleAnim }] }}
                            importantForAccessibility="no-hide-descendants"
                        >
                            <TouchableOpacity
                                style={[
                                    styles.langBtn,
                                    {
                                        backgroundColor: colors.contextBackground,
                                        borderColor: selected === 'nb' ? colors.tint : 'transparent',
                                        borderWidth: 2,
                                    }
                                ]}
                                onPress={() => setSelected('nb')}
                                accessibilityRole="button"
                                accessibilityLabel="Norsk"
                                activeOpacity={0.7}
                            >
                                <Image 
                                    source={require('../../assets/images/NO.png')} 
                                    style={styles.flagImage}
                                    contentFit="cover"
                                />
                                <Text style={[styles.langText, { color: colors.text }]}>Norsk</Text>
                                {selected === 'nb' && <Ionicons name="checkmark-circle" size={24} color={colors.tint} />}
                            </TouchableOpacity>
                        </Animated.View>

                        <Animated.View 
                            style={{ transform: [{ scale: button3ScaleAnim }] }}
                            importantForAccessibility="no-hide-descendants"
                        >
                            <TouchableOpacity
                                style={[
                                    styles.langBtn,
                                    {
                                        backgroundColor: colors.contextBackground,
                                        borderColor: selected === 'es' ? colors.tint : 'transparent',
                                        borderWidth: 2,
                                    }
                                ]}
                                onPress={() => setSelected('es')}
                                accessibilityRole="button"
                                accessibilityLabel="Español"
                                activeOpacity={0.7}
                            >
                                <Image 
                                    source={require('../../assets/images/ES.png')} 
                                    style={styles.flagImage}
                                    contentFit="cover"
                                />
                                <Text style={[styles.langText, { color: colors.text }]}>Español</Text>
                                {selected === 'es' && <Ionicons name="checkmark-circle" size={24} color={colors.tint} />}
                            </TouchableOpacity>
                        </Animated.View>

                        <Animated.View 
                            style={{ transform: [{ scale: button4ScaleAnim }] }}
                            importantForAccessibility="no-hide-descendants"
                        >
                            <TouchableOpacity
                                style={[
                                    styles.langBtn,
                                    {
                                        backgroundColor: colors.contextBackground,
                                        borderColor: selected === 'de' ? colors.tint : 'transparent',
                                        borderWidth: 2,
                                    }
                                ]}
                                onPress={() => setSelected('de')}
                                accessibilityRole="button"
                                accessibilityLabel="Deutsch"
                                activeOpacity={0.7}
                            >
                                <Image 
                                    source={require('../../assets/images/DE.png')} 
                                    style={styles.flagImage}
                                    contentFit="cover"
                                />
                                <Text style={[styles.langText, { color: colors.text }]}>Deutsch</Text>
                                {selected === 'de' && <Ionicons name="checkmark-circle" size={24} color={colors.tint} />}
                            </TouchableOpacity>
                        </Animated.View>
                    </View>

                    {/* Next Button */}
                    <Animated.View 
                        style={{
                            transform: [{ scale: buttonSlideAnim }],
                        }}
                        importantForAccessibility="no-hide-descendants"
                    >
                        <TouchableOpacity
                            style={[
                                styles.nextBtn,
                                {
                                    backgroundColor: selected ? colors.tint : colors.lightNonInteractiveText,
                                },
                            ]}
                            onPress={handleContinue}
                            disabled={!selected}
                            accessibilityLabel={selected ? CONTINUE_TEXTS[selected] : 'Continue'}
                            accessibilityRole="button"
                            activeOpacity={0.7}
                        >
                            <Text
                                style={[
                                    styles.nextText,
                                    { color: selected ? colors.darkText : colors.text },
                                ]}
                            >
                                {selected ? CONTINUE_TEXTS[selected] : 'Continue'}
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                </Animated.View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
    },
    headerBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 300,
        overflow: 'hidden',
    },
    gradient: {
        flex: 1,
    },
    safeContent: {
        flex: 1,
    },
    headerRow: {
        width: '100%',
        paddingHorizontal: 24,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    container: {
        flex: 1,
        justifyContent: 'space-evenly',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 20,
    },
    logoBadge: {
        width: 140,
        height: 140,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.15)',
        elevation: 5,
    },
    iconInner: {
        width: 120,
        height: 120,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleContainer: {
        alignItems: 'center',
    },
    titleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 16,
        gap: 10,
        boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
        elevation: 2,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
    buttons: {
        width: '100%',
        gap: 12,
    },
    langBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 14,
        paddingVertical: 16,
        paddingHorizontal: 20,
        boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
        elevation: 2,
        gap: 16,
    },
    flagImage: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    langText: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
    nextBtn: {
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 30,
        minWidth: 200,
        alignItems: 'center',
    },
    nextText: {
        fontSize: 18,
        fontWeight: '700',
    },
});