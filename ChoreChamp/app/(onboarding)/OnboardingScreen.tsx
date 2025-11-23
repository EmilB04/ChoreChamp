
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Image, Platform, StyleSheet, View } from 'react-native';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

const OnboardingScreen = () => {
    const router = useRouter();
    const { colors } = useTheme();
    const { user } = useAuth();
    const translateY = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // If already logged in, redirect to dashboard immediately
        if (user) {
            router.replace('/(tabs)');
            return;
        }

        const INITIAL_DELAY = 400; // Reduced delay for faster experience
        const ANIM_DURATION = 1200; // Shorter animation
        let navTimer: ReturnType<typeof setTimeout> | undefined;

        // Start the animation after delay 
        const delayTimer = setTimeout(() => {
            Animated.timing(translateY, {
                toValue: -400, // Move logo up, but less aggressively
                duration: ANIM_DURATION,
                useNativeDriver: USE_NATIVE_DRIVER,
            }).start();

            Animated.timing(opacity, {
                toValue: 0.95,
                duration: 700, // Fade duration
                useNativeDriver: USE_NATIVE_DRIVER,
            }).start();

            // Navigate to the first onboarding step (language selection) after animation
            navTimer = setTimeout(() => {
                router.replace('/(onboarding)/LanguageSelection');
            }, ANIM_DURATION + 200);
        }, INITIAL_DELAY);

        return () => {
            clearTimeout(delayTimer);
            if (navTimer) clearTimeout(navTimer);
            translateY.stopAnimation();
            opacity.stopAnimation();
        };
    }, [router, translateY, opacity, user]);


    return (
        <View style={[styles.container, { backgroundColor: colors.tint }]}> 
            <Animated.View style={{ transform: [{ translateY }], opacity }}>
                <Image
                    source={require('../../assets/images/Logo.gif')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </Animated.View>
            <Animated.Text
                style={{
                    fontSize: 38,
                    fontWeight: 'bold',
                    color: colors.background,
                    opacity,
                    marginTop: -40,
                    letterSpacing: 1.5,
                    textShadowColor: 'rgba(0,0,0,0.18)',
                    textShadowOffset: { width: 0, height: 2 },
                    textShadowRadius: 8,
                }}
            >
                ChoreChamp
            </Animated.Text>
        </View>
    );
};

// (removed duplicate styles definition)

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