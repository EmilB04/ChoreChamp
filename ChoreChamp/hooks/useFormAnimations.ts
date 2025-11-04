import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

interface UseFormAnimationsOptions {
    errorCount?: number;
    hasError?: boolean;
    fieldErrors?: (string | null)[];
}

export function useFormAnimations(options: UseFormAnimationsOptions = {}) {
    const { errorCount = 0, hasError = false, fieldErrors = [] } = options;

    // Animated values for smooth transitions
    const buttonOpacityAnim = useRef(new Animated.Value(0.5)).current;
    const errorAnim = useRef(new Animated.Value(0)).current;

    // Create error animations for each field
    const fieldErrorAnims = useRef(
        Array(errorCount)
            .fill(0)
            .map(() => new Animated.Value(0))
    ).current;

    // Animate global error message
    useEffect(() => {
        if (hasError) {
            Animated.spring(errorAnim, {
                toValue: 1,
                useNativeDriver: true,
                tension: 100,
                friction: 8,
            }).start();
        } else {
            Animated.timing(errorAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [hasError, errorAnim]);

    // Animate individual field errors
    useEffect(() => {
        fieldErrors.forEach((error, index) => {
            if (fieldErrorAnims[index]) {
                if (error) {
                    Animated.spring(fieldErrorAnims[index], {
                        toValue: 1,
                        useNativeDriver: true,
                        tension: 100,
                        friction: 8,
                    }).start();
                } else {
                    Animated.timing(fieldErrorAnims[index], {
                        toValue: 0,
                        duration: 200,
                        useNativeDriver: true,
                    }).start();
                }
            }
        });
    }, [fieldErrors, fieldErrorAnims]);

    // Animate button opacity based on form validity
    const animateButtonOpacity = (isValid: boolean) => {
        Animated.timing(buttonOpacityAnim, {
            toValue: isValid ? 1 : 0.5,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    return {
        buttonOpacityAnim,
        errorAnim,
        fieldErrorAnims,
        animateButtonOpacity,
    };
}

interface UseBorderAnimationsOptions {
    fieldCount: number;
}

export function useBorderAnimations(options: UseBorderAnimationsOptions) {
    const { fieldCount } = options;

    // Create border animations for each field
    const borderAnims = useRef(
        Array(fieldCount)
            .fill(0)
            .map(() => new Animated.Value(0))
    ).current;

    const animateBorder = (animValue: Animated.Value, toValue: number) => {
        Animated.timing(animValue, {
            toValue,
            duration: 200,
            useNativeDriver: false,
        }).start();
    };

    return {
        borderAnims,
        animateBorder,
    };
}

interface UsePickerAnimationsResult {
    pickerAnim: Animated.Value;
    chevronAnim: Animated.Value;
    animatePicker: (show: boolean) => void;
}

export function usePickerAnimations(): UsePickerAnimationsResult {
    const pickerAnim = useRef(new Animated.Value(0)).current;
    const chevronAnim = useRef(new Animated.Value(0)).current;

    const animatePicker = (show: boolean) => {
        Animated.parallel([
            Animated.spring(pickerAnim, {
                toValue: show ? 1 : 0,
                useNativeDriver: true,
                tension: 100,
                friction: 8,
            }),
            Animated.timing(chevronAnim, {
                toValue: show ? 1 : 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();
    };

    return {
        pickerAnim,
        chevronAnim,
        animatePicker,
    };
}
