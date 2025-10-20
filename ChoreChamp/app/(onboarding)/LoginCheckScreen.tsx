import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import OnboardingDots from '../../components/OnboardingDots';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

/**
 * LoginCheckScreen
 * - Asks user if they already have an account (logged in) or are new
 * - Directs to appropriate flow based on selection
 */
export default function LoginCheckScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const [selected, setSelected] = useState<'existing' | 'new' | null>(null);

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

                <TouchableOpacity
                    onPress={() => router.back()}
                    accessibilityRole="button"
                    hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}
                    style={styles.backButton}
                >
                    <Ionicons name="chevron-back" size={22} color={colors.tint} />
                </TouchableOpacity>
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
                <View style={styles.container}>
                    <Text style={[styles.title, { color: colors.text }]}>
                        Har du allerede en konto?
                    </Text>

                    <Text style={[styles.subtitle, { color: colors.lightDarkText }]}>
                        Velg om du vil logge inn eller opprette en ny konto
                    </Text>

                    <View style={styles.optionsContainer}>
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
                    </View>

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
                </View>
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
    backButton: {
        position: 'absolute',
        left: 5,
        height: '100%',
        justifyContent: 'center',
        padding: 8,
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
