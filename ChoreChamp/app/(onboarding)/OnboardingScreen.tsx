import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';

// Use native driver only on iOS and Android, not on web
const USE_NATIVE_DRIVER = Platform.OS !== 'web';

/*
Onboarding Screen
    - Displays the app logo when the user first opens the app.
    - The logo is an animated gif and moves upward as the app fades in.
    - After the animation finishes, the user is navigated to the startup screen.
*/

const OnboardingScreen = () => {
    const router = useRouter();
    const { colors } = useTheme();
    const translateY = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const INITIAL_DELAY = 1500; // Delay before starting the animation in MS

        const ANIM_DURATION = 3000; // Duration of the animation in MS

        let navTimer: ReturnType<typeof setTimeout> | undefined;

        // Start the animation after delay 
        const delayTimer = setTimeout(() => {
            Animated.timing(translateY, {
                toValue: -800, // How far the logo moves up
                duration: ANIM_DURATION,
                useNativeDriver: USE_NATIVE_DRIVER,
            }).start();

            Animated.timing(opacity, {
                toValue: 0.95,
                duration: 1500, // Fade duration
                useNativeDriver: USE_NATIVE_DRIVER,
            }).start();

                // Navigate to the first onboarding step (language selection) after animation
                navTimer = setTimeout(() => {
                    router.replace('/(onboarding)/LanguageSelection');
                }, ANIM_DURATION + 300);
        }, INITIAL_DELAY);

        return () => {
            clearTimeout(delayTimer);
            if (navTimer) clearTimeout(navTimer);
            translateY.stopAnimation();
            opacity.stopAnimation();
        };
    }, [router, translateY, opacity]);

    return (
        <View style={[styles.container, { backgroundColor: colors.tint }]}>
            <Animated.Image
                source={require('../../assets/images/Logo.gif')}
                style={[styles.logo, { transform: [{ translateY }], opacity }]}
                resizeMode="contain"
            />
        </View>
    );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 400,
        height: 400,
        marginBottom: 50,
    },
});