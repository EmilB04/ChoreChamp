import { useRef, useEffect } from "react";
import { Animated } from "react-native";

// Created with the assistance of AI Claude Sonnet 4.5
/*
    Prompt: Help me create a custom hook for entrance animations in React Native, with fade-in and slide-up effects.
    Response: See below.
*/

/**
 * Hook for creating entrance animations with fade and slide effects
 * @param delay - Optional delay before starting animation (in ms)
 * @returns Animated values for fade and slide animations
 */
export function useEntranceAnimation(delay = 0) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                delay,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                delay,
                tension: 80,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { fadeAnim, slideAnim };
}

/**
 * Hook for creating scale animations (useful for images, icons, cards)
 * @param delay - Optional delay before starting animation (in ms)
 * @param fromScale - Starting scale value (default: 0.8)
 * @returns Animated value for scale animation
 */
export function useScaleAnimation(delay = 0, fromScale = 0.8) {
    const scaleAnim = useRef(new Animated.Value(fromScale)).current;

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            delay,
            tension: 80,
            friction: 8,
            useNativeDriver: true,
        }).start();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return scaleAnim;
}

/**
 * Hook for creating staggered animations for lists of items
 * @param count - Number of items to animate
 * @param baseDelay - Base delay before starting animations (in ms)
 * @param staggerDelay - Delay between each item animation (in ms)
 * @returns Array of animated scale values
 */
export function useStaggeredAnimation(
    count: number,
    baseDelay = 0,
    staggerDelay = 100
) {
    const animations = useRef(
        Array.from({ length: count }, () => new Animated.Value(0.9))
    ).current;

    useEffect(() => {
        const animatedSequence = animations.map((anim, index) =>
            Animated.spring(anim, {
                toValue: 1,
                delay: baseDelay + index * staggerDelay,
                tension: 80,
                friction: 8,
                useNativeDriver: true,
            })
        );

        Animated.parallel(animatedSequence).start();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return animations;
}

/**
 * Hook for button press animations
 * @returns Functions and animated value for button press/release
 */
export function useButtonPressAnimation() {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.95,
            useNativeDriver: true,
            tension: 100,
            friction: 3,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 100,
            friction: 3,
        }).start();
    };

    return { scaleAnim, handlePressIn, handlePressOut };
}
