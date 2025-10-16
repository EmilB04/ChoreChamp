import { StyleSheet, View, Image, Text, Animated } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
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
                useNativeDriver: true,
            }).start();

            Animated.timing(opacity, {
                toValue: 0.95,
                duration: 1500, // Fade duration
                useNativeDriver: true,
            }).start();

            // Navigate to the main app screen after animation
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
            style = {[styles.logo, { transform: [{ translateY }], opacity }]}
            resizeMode= "contain"
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