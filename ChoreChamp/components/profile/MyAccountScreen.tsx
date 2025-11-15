import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import Header from './Header';
import { useTranslation } from 'react-i18next';

interface MyAccountScreenProps {
    onBack: () => void;
}

export default function MyAccountScreen({ onBack }: MyAccountScreenProps) {
    const { colors } = useTheme();
    const { userData, updateUserData } = useUser();
    const { t } = useTranslation('onboarding');
    
    // Account settings state
    const [isEditing, setIsEditing] = useState(false);
    const [showPersonvernInfo, setShowPersonvernInfo] = useState(false);
    
    // Temporary state for editing
    const [tempEmail, setTempEmail] = useState(userData.email || '');
    const [tempPhone, setTempPhone] = useState(userData.phone || '');

    const handleSaveChanges = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(tempEmail)) {
            Alert.alert(t('profileTab.invalidEmail'), t('profileTab.enterValidEmail'));
            return;
        }
        updateUserData({ 
            email: tempEmail, 
            phone: tempPhone 
        });
        setIsEditing(false);
        Alert.alert(t('profileTab.success'), t('profileTab.accountUpdated'));
    };

    const handleCancelEdit = () => {
        setTempEmail(userData.email || '');
        setTempPhone(userData.phone || '');
        setIsEditing(false);
    };

    const handleNotificationToggle = (value: boolean) => {
        updateUserData({ notificationsEnabled: value });
    };

    const handleDarkModeToggle = (value: boolean) => {
        updateUserData({ darkModeEnabled: value });
    };

    const togglePersonvernInfo = () => {
        setShowPersonvernInfo(!showPersonvernInfo);
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            t('profileTab.deleteAccount'),
            t('profileTab.deleteAccountConfirm'),
            [
                { text: t('profileTab.cancel'), style: 'cancel' },
                { 
                    text: t('profileTab.delete'), 
                    style: 'destructive',
                    onPress: () => {
                        // Here you would implement actual account deletion
                        Alert.alert(t('profileTab.accountDeleted'), t('profileTab.accountDeletedMessage'));
                    }
                },
            ]
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Header 
                title={t('profileTab.myAccount')} 
                onBack={onBack}
                rightElement={
                    isEditing ? (
                        <TouchableOpacity onPress={handleSaveChanges}>
                            <Ionicons name="checkmark" size={24} color={colors.darkText} />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity onPress={() => setIsEditing(true)}>
                            <Ionicons name="create-outline" size={24} color={colors.darkText} />
                        </TouchableOpacity>
                    )
                }
            />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Personal Information Section */}
                <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            {t('profileTab.personalInfo')}
                        </Text>
                    
                    <View style={[styles.infoCard, { backgroundColor: colors.contextBackground }]}>
                        <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, { color: colors.lightDarkText }]}>{t('profileTab.nameLabel')}</Text>
                            <Text style={[styles.infoValue, { color: colors.text }]}>{userData.name}</Text>
                        </View>
                        
                        <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, { color: colors.lightDarkText }]}>{t('profileTab.emailLabel')}</Text>
                            {isEditing ? (
                                <TextInput
                                    style={[styles.editInput, { 
                                        color: colors.text,
                                        borderColor: colors.lightDarkText 
                                    }]}
                                    value={tempEmail}
                                    onChangeText={setTempEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            ) : (
                                <Text style={[styles.infoValue, { color: colors.text }]}>{userData.email || t('profileTab.notSpecified')}</Text>
                            )}
                        </View>
                        
                        <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, { color: colors.lightDarkText }]}>{t('profileTab.phoneLabel')}</Text>
                            {isEditing ? (
                                <TextInput
                                    style={[styles.editInput, { 
                                        color: colors.text,
                                        borderColor: colors.lightDarkText 
                                    }]}
                                    value={tempPhone}
                                    onChangeText={setTempPhone}
                                    keyboardType="phone-pad"
                                />
                            ) : (
                                <Text style={[styles.infoValue, { color: colors.text }]}>{userData.phone || t('profileTab.notSpecified')}</Text>
                            )}
                        </View>
                    </View>

                    {/* Edit/Save buttons */}
                    {isEditing ? (
                        <View style={styles.editButtons}>
                            <TouchableOpacity 
                                style={[styles.button, styles.cancelButton, { borderColor: colors.lightDarkText }]}
                                onPress={handleCancelEdit}
                            >
                                <Text style={[styles.cancelButtonText, { color: colors.lightDarkText }]}>
                                    {t('profileTab.cancel')}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.button, styles.saveButton, { backgroundColor: colors.tint }]}
                                onPress={handleSaveChanges}
                            >
                                <Text style={[styles.saveButtonText, { color: colors.darkText }]}>
                                    {t('profileTab.save')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity 
                            style={[styles.editProfileButton, { borderColor: colors.tint }]}
                            onPress={() => setIsEditing(true)}
                        >
                            <Ionicons name="create-outline" size={20} color={colors.tint} />
                            <Text style={[styles.editProfileButtonText, { color: colors.tint }]}>
                                {t('profileTab.editInfo')}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* App Preferences Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        {t('profileTab.appSettings')}
                    </Text>
                    
                    <View style={[styles.infoCard, { backgroundColor: colors.contextBackground }]}>
                        <View style={styles.switchRow}>
                            <View style={styles.switchInfo}>
                                <Text style={[styles.switchLabel, { color: colors.text }]}>
                                    {t('profileTab.notifications')}
                                </Text>
                                <Text style={[styles.switchDescription, { color: colors.lightDarkText }]}>
                                    {t('profileTab.notificationsDesc')}
                                </Text>
                            </View>
                            <Switch
                                value={userData.notificationsEnabled || false}
                                onValueChange={handleNotificationToggle}
                                trackColor={{ false: colors.lightDarkText, true: colors.tint }}
                                thumbColor={colors.background}
                            />
                        </View>
                        
                        <View style={styles.switchRow}>
                            <View style={styles.switchInfo}>
                                <Text style={[styles.switchLabel, { color: colors.text }]}>
                                    {t('profileTab.darkMode')}
                                </Text>
                            </View>
                            <Switch
                                value={userData.darkModeEnabled}
                                onValueChange={handleDarkModeToggle}
                                trackColor={{ false: colors.lightDarkText, true: colors.tint }}
                                thumbColor={colors.background}
                            />
                        </View>
                    </View>
                </View>

                {/* Security Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}> 
                        {t('profileTab.security')}
                    </Text>
                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.contextBackground }]}>
                        <View style={styles.actionButtonContent}>
                            <Ionicons name="key-outline" size={24} color={colors.tint} />
                            <View style={styles.actionButtonText}>
                                <Text style={[styles.actionButtonTitle, { color: colors.text }]}>
                                    {t('profileTab.changePassword')}
                                </Text>
                                <Text style={[styles.actionButtonDescription, { color: colors.lightDarkText }]}>
                                    {t('profileTab.changePasswordDesc')}
                                </Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.lightDarkText} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={[
                            styles.actionButton, 
                            { backgroundColor: colors.contextBackground },
                            showPersonvernInfo && styles.actionButtonExpanded
                        ]}
                        onPress={togglePersonvernInfo}
                    >
                        <View style={styles.actionButtonContent}>
                            <Ionicons name="shield-checkmark-outline" size={24} color={colors.tint} />
                            <View style={styles.actionButtonText}>
                                <Text style={[styles.actionButtonTitle, { color: colors.text }]}>
                                    {t('profileTab.privacyPermissions')}
                                </Text>
                                <Text style={[styles.actionButtonDescription, { color: colors.lightDarkText }]}>
                                    {t('profileTab.privacyShort')}
                                </Text>
                            </View>
                        </View>
                        <Ionicons 
                            name={showPersonvernInfo ? "chevron-down" : "chevron-forward"} 
                            size={20} 
                            color={colors.lightDarkText} 
                        />
                    </TouchableOpacity>

                    {/* Personvern dropdown content */}
                    {showPersonvernInfo && (
                        <View style={[styles.dropdownContent, { backgroundColor: colors.contextBackground }]}>
                            <Text style={[styles.dropdownText, { color: colors.lightDarkText }]}> 
                                {t('profileTab.privacyLong')}
                            </Text>
                        </View>
                    )}
                </View>
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: '#ef4444' }]}> 
                        {t('profileTab.dangerZone')}
                    </Text>
                    <TouchableOpacity style={[styles.dangerButton, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]} onPress={handleDeleteAccount}>
                        <Ionicons name="trash-outline" size={24} color="#ef4444" />
                        <View style={styles.dangerButtonText}>
                            <Text style={[styles.dangerButtonTitle, { color: '#ef4444' }]}>
                                {t('profileTab.deleteAccount')}
                            </Text>
                            <Text style={[styles.dangerButtonDescription, { color: colors.lightDarkText }]}>
                                {t('profileTab.deleteAccountDesc')}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    infoCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    infoLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 16,
        flex: 1,
        textAlign: 'right',
    },
    editInput: {
        flex: 1,
        textAlign: 'right',
        borderBottomWidth: 1,
        paddingVertical: 4,
        paddingHorizontal: 8,
        fontSize: 16,
    },
    editButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        borderWidth: 1,
    },
    saveButton: {
        // backgroundColor set dynamically
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '500',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    editProfileButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderWidth: 1,
        borderRadius: 8,
        gap: 8,
    },
    editProfileButtonText: {
        fontSize: 16,
        fontWeight: '500',
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    switchInfo: {
        flex: 1,
        marginRight: 16,
    },
    switchLabel: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    switchDescription: {
        fontSize: 14,
        lineHeight: 18,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    actionButtonExpanded: {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        marginBottom: 0,
    },
    actionButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    actionButtonText: {
        marginLeft: 12,
        flex: 1,
    },
    actionButtonTitle: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 2,
    },
    actionButtonDescription: {
        fontSize: 14,
    },
    dangerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
    },
    dangerButtonText: {
        marginLeft: 12,
        flex: 1,
    },
    dangerButtonTitle: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 2,
    },
    dangerButtonDescription: {
        fontSize: 14,
    },
    dropdownContent: {
        marginTop: 0,
        padding: 16,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        marginBottom: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.1)',
    },
    dropdownText: {
        fontSize: 14,
        lineHeight: 20,
    },
});
