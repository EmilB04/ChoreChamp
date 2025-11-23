import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Header from './Header';

interface MyAccountScreenProps {
    onBack: () => void;
}

export default function MyAccountScreen({ onBack }: MyAccountScreenProps) {
    const { colors } = useTheme();
    const { userData, updateUserData } = useUser();
    const { t } = useTranslation('app');
    
    // Account settings state
    const [isEditing, setIsEditing] = useState(false);
    const [showPersonvernInfo, setShowPersonvernInfo] = useState(false);
    
    // Temporary state for editing
    const [tempFirstName, setTempFirstName] = useState(userData?.firstName || '');
    const [tempLastName, setTempLastName] = useState(userData?.lastName || '');
    const [tempEmail, setTempEmail] = useState(userData?.email || '');
    const [tempPhone, setTempPhone] = useState(userData?.phone || '');

    const handleSaveChanges = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (tempEmail && !emailRegex.test(tempEmail)) {
            Alert.alert(t('profile.account.invalidEmailTitle'), t('profile.account.invalidEmailMessage'));
            return;
        }
        
        if (!tempFirstName.trim()) {
            Alert.alert(t('profile.account.invalidNameTitle'), t('profile.account.invalidNameMessage'));
            return;
        }
        
        updateUserData({ 
            firstName: tempFirstName.trim(),
            lastName: tempLastName.trim(),
            email: tempEmail, 
            phone: tempPhone 
        });
        setIsEditing(false);
        Alert.alert(t('profile.account.successTitle'), t('profile.account.successMessage'));
    };

    const handleCancelEdit = () => {
        setTempFirstName(userData?.firstName || '');
        setTempLastName(userData?.lastName || '');
        setTempEmail(userData?.email || '');
        setTempPhone(userData?.phone || '');
        setIsEditing(false);
    };

    const togglePersonvernInfo = () => {
        setShowPersonvernInfo(!showPersonvernInfo);
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            t('profile.account.deleteConfirmTitle'),
            t('profile.account.deleteConfirmMessage'),
            [
                { text: t('profile.cancel'), style: 'cancel' },
                { 
                    text: t('profile.account.deleteConfirmAction'), 
                    style: 'destructive',
                    onPress: () => {
                        // Here you would implement actual account deletion
                        Alert.alert(t('profile.account.deleteSuccessTitle'), t('profile.account.deleteSuccessMessage'));
                    }
                },
            ]
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Header 
                title={t('profile.account.title')}
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
                        {t('profile.account.personalInfoTitle')}
                    </Text>
                    
                    <View style={[styles.infoCard, { backgroundColor: colors.contextBackground }]}>
                        <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, { color: colors.lightDarkText }]}>{t('profile.account.firstNameLabel')}</Text>
                            {isEditing ? (
                                <TextInput
                                    style={[styles.editInput, { 
                                        color: colors.text,
                                        borderColor: colors.lightDarkText 
                                    }]}
                                    value={tempFirstName}
                                    onChangeText={setTempFirstName}
                                    placeholder={t('profile.account.firstNamePlaceholder')}
                                    placeholderTextColor={colors.lightDarkText}
                                />
                                ) : (
                                <Text style={[styles.infoValue, { color: colors.text }]}>{userData?.firstName || t('profile.notSpecified')}</Text>
                            )}
                        </View>
                        
                        <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, { color: colors.lightDarkText }]}>{t('profile.account.lastNameLabel')}</Text>
                            {isEditing ? (
                                <TextInput
                                    style={[styles.editInput, { 
                                        color: colors.text,
                                        borderColor: colors.lightDarkText 
                                    }]}
                                    value={tempLastName}
                                    onChangeText={setTempLastName}
                                    placeholder={t('profile.account.lastNamePlaceholder')}
                                    placeholderTextColor={colors.lightDarkText}
                                />
                                ) : (
                                <Text style={[styles.infoValue, { color: colors.text }]}>{userData?.lastName || t('profile.notSpecified')}</Text>
                            )}
                        </View>
                        
                        <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, { color: colors.lightDarkText }]}>{t('profile.account.emailLabel')}</Text>
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
                                <Text style={[styles.infoValue, { color: colors.text }]}>{userData?.email || t('profile.notSpecified')}</Text>
                            )}
                        </View>
                        
                        <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, { color: colors.lightDarkText }]}>{t('profile.account.phoneLabel')}</Text>
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
                                <Text style={[styles.infoValue, { color: colors.text }]}>{userData?.phone || t('profile.notSpecified')}</Text>
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
                                    {t('profile.cancel')}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.button, styles.saveButton, { backgroundColor: colors.tint }]}
                                onPress={handleSaveChanges}
                            >
                                <Text style={[styles.saveButtonText, { color: colors.darkText }]}>
                                    {t('profile.save')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity 
                            style={[styles.editProfileButton, { borderColor: colors.tint }]}
                            onPress={() => setIsEditing(true)}
                        >
                            <Ionicons name="create-outline" size={20} color={colors.tint} />
                            <Text style={[styles.editProfileButtonText, { color: colors.tint }]}>{t('profile.account.editInfo')}</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Security Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        {t('profile.account.securityTitle')}
                    </Text>
                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.contextBackground }]}>
                        <View style={styles.actionButtonContent}>
                            <Ionicons name="key-outline" size={24} color={colors.tint} />
                            <View style={styles.actionButtonText}>
                                <Text style={[styles.actionButtonTitle, { color: colors.text }]}> {t('profile.account.changePassword')}</Text>
                                <Text style={[styles.actionButtonDescription, { color: colors.lightDarkText }]}>{t('profile.account.changePasswordDescription')}</Text>
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
                                <Text style={[styles.actionButtonTitle, { color: colors.text }]}>{t('profile.account.privacy')}</Text>
                                <Text style={[styles.actionButtonDescription, { color: colors.lightDarkText }]}>{t('profile.account.privacyDescription')}</Text>
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
                                {t('profile.account.privacyBody')}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Danger Zone */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: '#ef4444' }]}> 
                        {t('profile.account.dangerZoneTitle')}
                    </Text>
                    <TouchableOpacity style={[styles.dangerButton, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]} onPress={handleDeleteAccount}>
                        <Ionicons name="trash-outline" size={24} color="#ef4444" />
                        <View style={styles.dangerButtonText}>
                            <Text style={[styles.dangerButtonTitle, { color: '#ef4444' }]}>
                                {t('profile.account.deleteAccount')}
                            </Text>
                            <Text style={[styles.dangerButtonDescription, { color: colors.lightDarkText }]}>
                                {t('profile.account.deleteAccountDescription')}
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
