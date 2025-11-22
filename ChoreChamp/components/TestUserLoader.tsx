/**
 * 🧪 TEST COMPONENT: User Loader Button
 * 
 * Drop this component anywhere in your app to quickly load test users.
 * 
 * Usage:
 * ```tsx
 * import TestUserLoader from '@/components/TestUserLoader';
 * 
 * // In your component:
 * <TestUserLoader />
 * ```
 * 
 * ⚠️ IMPORTANT: Remove this component before production deployment!
 */

import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { useSegments } from 'expo-router';

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';


const styles = StyleSheet.create({
    container: {
        borderWidth: 2,
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        marginBottom: 12,
    },
    button: {
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    hint: {
        fontSize: 12,
        marginTop: 8,
        fontStyle: 'italic',
    },
});

export default function TestUserLoader() {
    const { loadSpecificUser, userData, resetToAuthUser } = useUser();
    const { colors } = useTheme();
    const { t } = useTranslation('app');
    const [userId, setUserId] = useState('');
    const [loading, setLoading] = useState(false);
    const segments = useSegments();

    // Clear input if logged out or on onboarding
    useEffect(() => {
        // If user logs out or route is onboarding, clear
        const isOnboarding = segments.some(seg => typeof seg === 'string' && seg.includes('onboarding'));
        if (!userData || isOnboarding) {
            setUserId('');
        }
    }, [userData, segments]);

    const handleLoadUser = async () => {
        if (!userId.trim()) {
            Alert.alert(t('alerts.errorTitle'), t('profile.testUserLoader.enterId'));
            return;
        }

        setLoading(true);
        try {
            await loadSpecificUser(userId.trim());
            Alert.alert(t('alerts.successTitle'), t('profile.testUserLoader.loaded', { userId: userId.trim() }));
        } catch (error) {
            const errMsg = error && typeof error === 'object' && 'message' in error ? (error as any).message : String(error);
            Alert.alert(t('alerts.errorTitle'), t('profile.testUserLoader.failed', { error: errMsg }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
            keyboardVerticalOffset={64}
        >
            <View style={[styles.container, { 
                backgroundColor: colors.contextBackground,
                borderColor: colors.tint,
            }]}> 
                <View style={styles.header}>
                    <Ionicons name="flask" size={20} color={colors.tint} />
                    <Text style={[styles.title, { color: colors.text }]}> 
                        {t('profile.testUserLoader.title')}
                    </Text>
                </View>
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: colors.background, marginBottom: 8, borderWidth: 1, borderColor: colors.tint }]}
                    onPress={resetToAuthUser}
                >
                    <Text style={[styles.buttonText, { color: colors.tint }]}>{t('profile.testUserLoader.reset')}</Text>
                </TouchableOpacity>
                <TextInput
                    style={[styles.input, { 
                        backgroundColor: colors.background,
                        borderColor: colors.tint,
                        color: colors.text,
                    }]}
                    placeholder={t('profile.testUserLoader.placeholder')}
                    placeholderTextColor={colors.lightDarkText}
                    value={userId}
                    onChangeText={setUserId}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="default"
                />
                <TouchableOpacity 
                    style={[
                        styles.button,
                        { backgroundColor: colors.tint },
                        loading && styles.buttonDisabled
                    ]}
                    onPress={handleLoadUser}
                    disabled={loading}
                >
                    <Text style={[styles.buttonText, { color: colors.darkText }]}> 
                        {loading ? t('profile.testUserLoader.loading') : t('profile.testUserLoader.load')}
                    </Text>
                </TouchableOpacity>
                <Text style={[styles.hint, { color: colors.lightDarkText }]}> 
                    {t('profile.testUserLoader.hint')}
                </Text>
            </View>
        </KeyboardAvoidingView>
    );
}
