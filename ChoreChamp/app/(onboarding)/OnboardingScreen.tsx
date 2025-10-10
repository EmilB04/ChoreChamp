import { StyleSheet, View, Image, Text, Animated } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { replace } from 'expo-router/build/global-state/routing';


const OnboardingScreen = () => {
    const router = useRouter();
    const translateY = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(1)).current;
    
    useEffect(() => {
        Animated.timing(translateY, {
            toValue: -442,
            duration: 1500,
            useNativeDriver: true,
        }).start();
        
        Animated.timing(opacity, {
            toValue: 0.95,
            duration: 3000,
            useNativeDriver: true,
        }).start();

        const timer = setTimeout(() => {
            router.replace('/(tabs)');
        }, 1800);
        
    return () => {
        clearTimeout(timer);
        translateY.stopAnimation();
        opacity.stopAnimation();
        };
    }, [router, translateY, opacity]);

  return (
    <View style={styles.container}>
        <Animated.Image
            source={require('../../assets/images/Logo.png')}
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
        backgroundColor: '#FFB40E',
    },
    logo: {
        width: 300,
        height: 300,
        marginBottom: 50,
    },
});