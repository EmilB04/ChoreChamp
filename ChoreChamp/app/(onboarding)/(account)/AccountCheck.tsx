import BackButton from '@/components/onBoarding/BackButton';
import { useTheme } from '@/contexts/ThemeContext';
import { useEntranceAnimation, useStaggeredAnimation } from '@/hooks/useEntranceAnimation';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import OnboardingDots from '../../../components/onBoarding/OnboardingDots';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n/i18n';
import { useLocalSearchParams } from 'expo-router';

/**
 * LoginCheckScreen
 * - Asks user if they already have an account (logged in) or are new
 * - Directs to appropriate flow based on selection
 */
export default function AccountCheck() {
    const router = useRouter();
    const { colors } = useTheme();
    const [selected, setSelected] = useState<'existing' | 'new' | null>(null);
    const { t } = useTranslation('onboarding');

    const params = useLocalSearchParams();
    const langParam = typeof params.lang === 'string' ? params.lang : undefined;

    const { fadeAnim, slideAnim } = useEntranceAnimation();
    const [card1ScaleAnim, card2ScaleAnim] = useStaggeredAnimation(2, 200, 100);
    const buttonSlideAnim = useStaggeredAnimation(1, 400)[0];

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

    function handleContinue() {
        if (selected === 'existing') {
            // Navigate to login screen
            router.push('/(onboarding)/(account)/LoginChoice');
        } else if (selected === 'new') {
            // --- CHANGED: New users should proceed to Register
            router.push('/(onboarding)/(account)/Register');
        }
    }

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
            <View style={styles.headerRow}>
                <OnboardingDots activeIndex={3} total={5} />
                <BackButton onPress={() => router.replace('/(onboarding)/NotificationsScreen')} />
            </View>

            <ScrollView
                contentContainerStyle={{
                    flexGrow: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: 24,
                }}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View style={[styles.container, {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                }]}>
                    <Text style={[styles.title, { color: colors.text }]}>
                        {t('accountcheck.title')}
                    </Text>

                    <Text style={[styles.subtitle, { color: colors.lightDarkText }]}>
                        {t('accountcheck.subtitle')}
                    </Text>

                    <View style={styles.optionsContainer}>
                        <Animated.View style={{
                            transform: [{ scale: card1ScaleAnim }],
                        }}>
                            <TouchableOpacity
                                style={[
                                    styles.optionCard,
                                    {
                                        backgroundColor: colors.contextBackground,
                                        borderColor: selected === 'existing' ? colors.tint : 'transparent',
                                        borderWidth: 2,
                                    },
                                ]}
                                onPress={() => setSelected('existing')}
                                accessibilityLabel="Jeg har allerede en konto"
                                accessibilityRole="button"
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name="person-circle-outline"
                                    size={48}
                                    color={selected === 'existing' ? colors.tint : colors.text}
                                />
                                <Text style={[styles.optionTitle, { color: colors.text }]}>
                                    {t('accountcheck.existingTitle')}
                                </Text>
                                <Text style={[styles.optionSubtitle, { color: colors.lightDarkText }]}>
                                    {t('accountcheck.existingSubtitle')}
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>

                        <Animated.View style={{
                            transform: [{ scale: card2ScaleAnim }],
                        }}>
                            <TouchableOpacity
                                style={[
                                    styles.optionCard,
                                    {
                                        backgroundColor: colors.contextBackground,
                                        borderColor: selected === 'new' ? colors.tint : 'transparent',
                                        borderWidth: 2,
                                    },
                                ]}
                                onPress={() => setSelected('new')}
                                accessibilityLabel="Jeg er ny bruker"
                                accessibilityRole="button"
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name="add-circle-outline"
                                    size={48}
                                    color={selected === 'new' ? colors.tint : colors.text}
                                />
                                <Text style={[styles.optionTitle, { color: colors.text }]}>
                                    {t('accountcheck.newTitle')}
                                </Text>
                                <Text style={[styles.optionSubtitle, { color: colors.lightDarkText }]}>
                                    {t('accountcheck.newSubtitle')}
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>

                    <Animated.View style={{
                        opacity: fadeAnim,
                        transform: [{ translateY: buttonSlideAnim }],
                    }}>
                        <TouchableOpacity
                            style={[
                                styles.nextBtn,
                                {
                                    backgroundColor: selected ? colors.tint : colors.lightNonInteractiveText,
                                },
                            ]}
                            onPress={handleContinue}
                            disabled={!selected}
                            accessibilityLabel="Fortsett"
                            accessibilityRole="button"
                            activeOpacity={0.7}
                        >
                            <Text
                                style={[
                                    styles.nextText,
                                    { color: selected ? colors.darkText : colors.text },
                                ]}
                            >
                                {t('accountcheck.continue')}
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1 },
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
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        width: '100%',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 40,
    },
    optionsContainer: {
        width: '100%',
        gap: 16,
        marginBottom: 40,
    },
    optionCard: {
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    optionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 12,
        textAlign: 'center',
    },
    optionSubtitle: {
        fontSize: 14,
        marginTop: 4,
        textAlign: 'center',
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
