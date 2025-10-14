import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Switch,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import Header from './Header';

interface AppSettingsScreenProps {
    onBack: () => void;
}

export default function AppSettingsScreen({ onBack }: AppSettingsScreenProps) {
    const { colors } = useTheme();
    
    // State for each toggle
    const [notifications, setNotifications] = useState(false);
    const [location, setLocation] = useState(false);
    const [dataAnalysis, setDataAnalysis] = useState(false);
    const [autoUpdates, setAutoUpdates] = useState(false);

    return(
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Header 
                title="App Innstillinger" 
                onBack={onBack} 
            />

            {/* Settings */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Personvern og tillatelser
                    </Text>
                    
                    <View style={[styles.switchRow, styles.infoCard, { backgroundColor: colors.contextBackground }]}>
                        <View style={styles.switchInfo}>
                            <Text style={[styles.switchLabel, { color: colors.text }]}>
                                Varslinger
                            </Text>
                            <Text style={[styles.switchDescription, { color: colors.lightDarkText }]}>
                                Tillat at vi sender varslinger til deg
                            </Text>
                        </View>
                        <Switch
                            value={notifications}
                            onValueChange={setNotifications}
                            trackColor={{ false: colors.lightDarkText, true: colors.tint }}
                            thumbColor={colors.background}
                        />
                    </View>
                    
                    <View style={[styles.switchRow, styles.infoCard, { backgroundColor: colors.contextBackground }]}>
                        <View style={styles.switchInfo}>
                            <Text style={[styles.switchLabel, { color: colors.text }]}>
                                Lokasjon
                            </Text>
                            <Text style={[styles.switchDescription, { color: colors.lightDarkText }]}>
                                Tillat at vi bruker lokasjonen din
                            </Text>
                        </View>
                        <Switch
                            value={location}
                            onValueChange={setLocation}
                            trackColor={{ false: colors.lightDarkText, true: colors.tint }}
                            thumbColor={colors.background}
                        />
                    </View>
                    
                    <View style={[styles.switchRow, styles.infoCard, { backgroundColor: colors.contextBackground }]}>
                        <View style={styles.switchInfo}>
                            <Text style={[styles.switchLabel, { color: colors.text }]}>
                                Data analysering
                            </Text>
                            <Text style={[styles.switchDescription, { color: colors.lightDarkText }]}>
                                Tillat at vi bruker dataene dine for å forbedre appen
                            </Text>
                        </View>
                        <Switch
                            value={dataAnalysis}
                            onValueChange={setDataAnalysis}
                            trackColor={{ false: colors.lightDarkText, true: colors.tint }}
                            thumbColor={colors.background}
                        />
                    </View>
                    
                    <View style={[styles.switchRow, styles.infoCard, { backgroundColor: colors.contextBackground }]}>
                        <View style={styles.switchInfo}>
                            <Text style={[styles.switchLabel, { color: colors.text }]}>
                                Automatiske oppdateringer
                            </Text>
                            <Text style={[styles.switchDescription, { color: colors.lightDarkText }]}>
                                Oppdaterer appen automatisk ved nye versjoner
                            </Text>
                        </View>
                        <Switch
                            value={autoUpdates}
                            onValueChange={setAutoUpdates}
                            trackColor={{ false: colors.lightDarkText, true: colors.tint }}
                            thumbColor={colors.background}
                        />
                    </View>
                </View>
            </ScrollView>
        </View>
    )
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
