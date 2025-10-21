import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import OnboardingDots from '../../components/onBoarding/OnboardingDots';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useEntranceAnimation, useStaggeredAnimation } from '@/hooks/useEntranceAnimation';
import BackButton from '@/components/onBoarding/BackButton';

/**
 * LoginCheckScreen
 * - Asks user if they already have an account (logged in) or are new
 * - Directs to appropriate flow based on selection
 */
export default function LoginCheckScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const [selected, setSelected] = useState<'existing' | 'new' | null>(null);

    const { fadeAnim, slideAnim } = useEntranceAnimation();
    const [card1ScaleAnim, card2ScaleAnim] = useStaggeredAnimation(2, 200, 100);
    const buttonSlideAnim = useStaggeredAnimation(1, 400)[0];

    function handleContinue() {
        if (selected === 'existing') {
            // Navigate to login screen
            router.push('/(onboarding)/(account)/Login');
        } else if (selected === 'new') {
            // New users go to language selection first
            router.push('/(onboarding)/LanguageSelection');
        }
    }

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
            <View style={styles.headerRow}>
                <OnboardingDots activeIndex={1} total={5} />
                <BackButton />
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
                        Har du allerede en konto?
                    </Text>

                    <Text style={[styles.subtitle, { color: colors.lightDarkText }]}>
                        Velg om du vil logge inn eller opprette en ny konto
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
                                    Jeg har allerede en konto
                                </Text>
                                <Text style={[styles.optionSubtitle, { color: colors.lightDarkText }]}>
                                    Logg inn for å fortsette
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
                                    Jeg er ny bruker
                                </Text>
                                <Text style={[styles.optionSubtitle, { color: colors.lightDarkText }]}>
                                    Opprett en ny konto
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
                                Fortsett
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
