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

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


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
    const { loadSpecificUser, resetToAuthUser } = useUser();
    const { colors } = useTheme();
    const { t } = useTranslation('app');
    const [loading, setLoading] = useState(false);

    // Remove userId state and input, always load Emil's user
    const handleLoadAdminUser = async () => {
        const adminUserId = 'mRExgH1pI1e6TpGkj76Cn7Me9od2';
        
        setLoading(true);
        try {
            await loadSpecificUser(adminUserId);
            Alert.alert(t('alerts.successTitle'), 'Loaded admin user: ' + adminUserId);
        } catch (error) {
            const errMsg = error && typeof error === 'object' && 'message' in error ? (error as any).message : String(error);
            Alert.alert(t('alerts.errorTitle'), t('profile.testUserLoader.failed', { error: errMsg }));
        } finally {
            setLoading(false);
        }
    };

    // 🧪 TEST FUNCTION: Load regular test user
    const handleLoadRegularUser = async () => {
        const regularUserId = 'test_lars_1762445448147_hqxoc67vl';
        setLoading(true);
        try {
            await loadSpecificUser(regularUserId);
            Alert.alert(t('alerts.successTitle'), 'Loaded regular user: ' + regularUserId);
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
                <TouchableOpacity 
                    style={[
                        styles.button,
                        { backgroundColor: colors.tint },
                        loading && styles.buttonDisabled
                    ]}
                    onPress={handleLoadAdminUser}
                    disabled={loading}
                >
                    <Text style={[styles.buttonText, { color: colors.darkText }]}> 
                        {loading ? t('profile.testUserLoader.loading') : 'Load Admin User'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[
                        styles.button,
                        { backgroundColor: colors.tint, marginTop: 12 },
                        loading && styles.buttonDisabled
                    ]}
                    onPress={handleLoadRegularUser}
                    disabled={loading}
                >
                    <Text style={[styles.buttonText, { color: colors.darkText }]}> 
                        {loading ? t('profile.testUserLoader.loading') : 'Load Regular User'}
                    </Text>
                </TouchableOpacity>
                <Text style={[styles.hint, { color: colors.lightDarkText }]}> 
                    Loads admin (mRExgH1pI1e6TpGkj76Cn7Me9od2) or regular (test_lars_1762445448147_hqxoc67vl) user for testing
                </Text>
            </View>
        </KeyboardAvoidingView>
    );
}
