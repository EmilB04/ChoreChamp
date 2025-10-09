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

interface MinKontoScreenProps {
    onBack: () => void;
}

export default function MinKontoScreen({ onBack }: MinKontoScreenProps) {
    const { colors } = useTheme();
    const { userData, updateUserData } = useUser();
    
    // Account settings state
    const [isEditing, setIsEditing] = useState(false);
    const [showPersonvernInfo, setShowPersonvernInfo] = useState(false);
    
    // Temporary state for editing
    const [tempEmail, setTempEmail] = useState(userData.email || '');
    const [tempPhone, setTempPhone] = useState(userData.phone || '');

    const handleSaveChanges = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(tempEmail)) {
            Alert.alert('Ugyldig e-post', 'Vennligst skriv inn en gyldig e-postadresse');
            return;
        }
        updateUserData({ 
            email: tempEmail, 
            phone: tempPhone 
        });
        setIsEditing(false);
        Alert.alert('Vellykket', 'Kontoinformasjonen din er oppdatert');
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
            'Slett konto',
            'Er du sikker på at du vil slette kontoen din? Denne handlingen kan ikke angres.',
            [
                { text: 'Avbryt', style: 'cancel' },
                { 
                    text: 'Slett', 
                    style: 'destructive',
                    onPress: () => {
                        // Here you would implement actual account deletion
                        Alert.alert('Konto slettet', 'Din konto har blitt slettet');
                    }
                },
            ]
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Header 
                title="Min konto" 
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
                        Personlig informasjon
                    </Text>
                    
                    <View style={[styles.infoCard, { backgroundColor: colors.contextBackground }]}>
                        <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, { color: colors.lightDarkText }]}>Navn</Text>
                            <Text style={[styles.infoValue, { color: colors.text }]}>{userData.name}</Text>
                        </View>
                        
                        <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, { color: colors.lightDarkText }]}>E-post</Text>
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
                                <Text style={[styles.infoValue, { color: colors.text }]}>{userData.email || 'Ikke angitt'}</Text>
                            )}
                        </View>
                        
                        <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, { color: colors.lightDarkText }]}>Telefon</Text>
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
                                <Text style={[styles.infoValue, { color: colors.text }]}>{userData.phone || 'Ikke angitt'}</Text>
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
                                    Avbryt
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.button, styles.saveButton, { backgroundColor: colors.tint }]}
                                onPress={handleSaveChanges}
                            >
                                <Text style={[styles.saveButtonText, { color: colors.darkText }]}>
                                    Lagre
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
                                Rediger informasjon
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* App Preferences Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        App-innstillinger
                    </Text>
                    
                    <View style={[styles.infoCard, { backgroundColor: colors.contextBackground }]}>
                        <View style={styles.switchRow}>
                            <View style={styles.switchInfo}>
                                <Text style={[styles.switchLabel, { color: colors.text }]}>
                                    Push-varsler
                                </Text>
                                <Text style={[styles.switchDescription, { color: colors.lightDarkText }]}>
                                    Motta varsler om nye oppgaver og meldinger
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
                                    Mørk modus
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
                        Sikkerhet
                    </Text>
                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.contextBackground }]}>
                        <View style={styles.actionButtonContent}>
                            <Ionicons name="key-outline" size={24} color={colors.tint} />
                            <View style={styles.actionButtonText}>
                                <Text style={[styles.actionButtonTitle, { color: colors.text }]}>
                                    Endre passord
                                </Text>
                                <Text style={[styles.actionButtonDescription, { color: colors.lightDarkText }]}>
                                    Oppdater passordet ditt
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
                                    Personvern
                                </Text>
                                <Text style={[styles.actionButtonDescription, { color: colors.lightDarkText }]}>
                                    Se hvordan vi håndterer dataene dine
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
                                Vi lagrer kun nødvendig informasjon for å levere tjenesten{'\n'}
                                All data krypteres og lagres sikkert{'\n'}
                                Du kan når som helst be om innsyn eller sletting av dataen din{'\n'}
                                Vi følger GDPR og norsk personvernlovgivning
                            </Text>
                        </View>
                    )}
                </View>

                {/* Danger Zone */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: '#ef4444' }]}> 
                        Farlig sone 
                    </Text>
                    <TouchableOpacity style={[styles.dangerButton, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]} onPress={handleDeleteAccount}>
                        <Ionicons name="trash-outline" size={24} color="#ef4444" />
                        <View style={styles.dangerButtonText}>
                            <Text style={[styles.dangerButtonTitle, { color: '#ef4444' }]}>
                                Slett konto
                            </Text>
                            <Text style={[styles.dangerButtonDescription, { color: colors.lightDarkText }]}>
                                Permanent slett kontoen din og alle data
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
