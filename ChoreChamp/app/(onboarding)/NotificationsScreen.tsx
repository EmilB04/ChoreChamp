import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Animated } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import OnboardingDots from "../../components/onBoarding/OnboardingDots";
import { useTheme } from '@/contexts/ThemeContext';
import { useEntranceAnimation, useScaleAnimation, useStaggeredAnimation } from '@/hooks/useEntranceAnimation';
import BackButton from '@/components/onBoarding/BackButton';

export default function NotificationsScreen() {
    const router = useRouter();
    const { colors } = useTheme();

    const { fadeAnim } = useEntranceAnimation();
    const iconScaleAnim = useScaleAnimation(100);
    const titleSlideAnim = useScaleAnimation(200, 1);
    const [button1SlideAnim, button2SlideAnim] = useStaggeredAnimation(2, 300, 100);

    function handleAllow() {
        router.push('/(onboarding)/(account)/Register');
    }

    function handleSkip() {
        router.push('/(onboarding)/(account)/Register');
    }

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
            <View style={styles.headerRow}>
                <OnboardingDots activeIndex={3} total={5} />
                <BackButton />
            </View>

            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }} showsVerticalScrollIndicator={false}>
                <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
                    <Animated.Image
                        source={require('../../assets/images/bell.png')}
                        style={[styles.icon, {
                            transform: [{ scale: iconScaleAnim }],
                        }]}
                        resizeMode='contain'
                        accessibilityLabel="Notifications bell icon"
                    />

                    <Animated.View style={{
                        transform: [{ scale: titleSlideAnim }],
                    }}>
                        <Text style={[styles.title, { color: colors.text }]}>Skru på varsler?</Text>
                        <Text style={[styles.subtitle, { color: colors.lightNonInteractiveText }]}>Få påminnelser når det er din tur til å gjøre en oppgave.</Text>
                    </Animated.View>

                    <Animated.View style={{
                        opacity: fadeAnim,
                        transform: [{ scale: button1SlideAnim }],
                    }}>
                        <TouchableOpacity
                            style={[styles.primaryBtn, { backgroundColor: colors.tint }]}
                            onPress={handleAllow}
                            accessibilityLabel="Skru på varsler"
                            accessibilityRole="button"
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.primaryText, { color: colors.darkText }]}>Ja</Text>
                        </TouchableOpacity>
                    </Animated.View>

                    <Animated.View style={{
                        opacity: fadeAnim,
                        transform: [{ scale: button2SlideAnim }],
                    }}>
                        <TouchableOpacity
                            style={[styles.secondaryBtn, { backgroundColor: colors.contextBackground }]}
                            onPress={handleSkip}
                            accessibilityLabel="Ikke nå"
                            accessibilityRole="button"
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.secondaryText, { color: colors.text }]}>Ikke nå</Text>
                        </TouchableOpacity>
                    </Animated.View>

                    <Text style={[styles.footer, { color: colors.lightNonInteractiveText }]}>Du kan endre dette i innstillinger senere.</Text>
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
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
    icon: { width: 100, height: 100, marginBottom: 32 },
    title: { fontSize: 24, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
    subtitle: { fontSize: 14, marginBottom: 32, textAlign: 'center' },
    primaryBtn: { paddingVertical: 14, paddingHorizontal: 83, borderRadius: 30, marginBottom: 12 },
    primaryText: { fontSize: 18, fontWeight: '700' },
    secondaryBtn: { paddingVertical: 14, paddingHorizontal: 60, borderRadius: 30, marginBottom: 12 },
    secondaryText: { fontSize: 18, fontWeight: '700' },
    footer: { fontSize: 12, textAlign: 'center' },
});
