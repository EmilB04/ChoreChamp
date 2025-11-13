import AppSettingsScreen from '@/components/profile/AppSettingsScreen';
import EditProfileModal from '@/components/profile/EditProfileModal';
import MyHouseholdsScreen from '@/components/profile/MyHouseholdsScreen';
import UserLoadingState from '@/components/UserLoadingState';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { Ionicons } from "@expo/vector-icons";
import { router } from 'expo-router';
import React, { useState } from "react";
import {
    Image,
    Linking,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import MyAccountScreen from '../../components/profile/MyAccountScreen';
import commonStyles from "../commonStyles";

//TODO: Implement log out functionality

export default function Profile() {
    const { colors } = useTheme();
    const { userData, updateUserData } = useUser();
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [showMyAccount, setShowMyAccount] = useState(false);
    const [showMyHouseholds, setShowMyHouseholds] = useState(false);
    const [showAppSettings, setShowAppSettings] = useState(false);
    const [showHelpSupport, setShowHelpSupport] = useState(false);
    const [showAboutApp, setShowAboutApp] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Show loading state if userData is not available
    if (!userData) {
        return <UserLoadingState pageName="Profile" />;
    }

    // Toggle About App section

    const toggleAboutApp = () => {
        setShowAboutApp(!showAboutApp);
    };

    // Toggle Help and Support section

    const toggleHelpSupport = () => {
        setShowHelpSupport(!showHelpSupport);
    };

    // Handler for saving profile changes
    const handleSaveProfile = async (newUsername: string, newImageUri: string) => {
        try {
            console.log('💾 Saving profile to Firestore:', { 
                username: newUsername,
                imageUri: newImageUri 
            });
            
            // Update in Firestore via UserContext
            await updateUserData({ 
                username: newUsername,
                imageUri: newImageUri 
            });
            
            console.log('✅ Profile saved successfully!');
        } catch (error) {
            console.error('❌ Error saving profile:', error);
            // Show error to user
            alert('Kunne ikke lagre profilen. Vennligst prøv igjen.');
        }
    };

    // Handle pull-to-refresh
    const onRefresh = async () => {
        setRefreshing(true);
        // Profile data is managed by UserContext, so we just simulate a refresh
        // In a real app, you might want to re-fetch user data from Firebase
        setTimeout(() => {
            setRefreshing(false);
        }, 500);
    };

    // If showing My Account screen, render it instead
    if (showMyAccount) {
        return <MyAccountScreen onBack={() => setShowMyAccount(false)} />;
    }

    // If showing My Households screen, render it instead
    if (showMyHouseholds) {
        return <MyHouseholdsScreen onBack={() => setShowMyHouseholds(false)} />;
    }

    // If showing App Settings screen, render it instead
    if (showAppSettings) {
        return <AppSettingsScreen onBack={() => setShowAppSettings(false)} />;
    }

    return (
        <View style={[{ backgroundColor: colors.background, flex: 1 }]}>
            {/* Header - Outside Safe Area */}
            <View style={[styles.header, { backgroundColor: colors.tint }]}>
                {/* Adjust marginTop to keep title level with rest */}
                <Text style={[styles.headerTitle, commonStyles.headerTitle]}>
                    Profil & {"\n"}Innstillinger
                </Text>
                {userData.imageUri ? (
                    <Image
                        source={{ uri: userData.imageUri }}
                        style={styles.avatar}
                    />
                ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                        <Ionicons name="person" size={40} color={colors.darkText} />
                    </View>
                )}
                <Text style={[styles.name, { color: colors.darkText }]}>{userData.username}</Text>
                <View style={styles.separator} />
                <TouchableOpacity 
                    style={{ flexDirection: "row", alignItems: "flex-end", alignContent: "center", paddingVertical: 8, gap: 4 }}
                    onPress={() => setIsEditModalVisible(true)}
                >
                    <Text style={styles.editProfile}>Rediger profil</Text>
                    <Ionicons name="create-outline" size={20} color={colors.darkText} />
                </TouchableOpacity>
            </View>

            {/* Settings */}
            <ScrollView 
                style={[commonStyles.container, styles.menu, { flex: 1 }]}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.tint}
                        colors={[colors.tint]}
                    />
                }
            >
                <MenuItem
                    icon="person-circle"
                    title="Min konto"
                    description="Administrer konto informasjon og personlige innstillinger"
                    onPress={() => setShowMyAccount(true)}
                />

                <MenuItem
                    icon="people"
                    title="Mine husstander"
                    description="Se og administrer dine tilknyttede husstander"
                    onPress={() => setShowMyHouseholds(true)}
                />

                <MenuItem
                    icon="cog"
                    title="App innstillinger"
                    description="Tilpass appens funksjonalitet og utseende"
                    onPress={() => setShowAppSettings(true)}
                />

                <MenuItem
                    icon="log-out"
                    title="Logg ut"
                    description="Logg ut av din konto"
                    onPress={() => {
                        // Navigate to WelcomeScreen
                        router.push('/WelcomeScreen');
                    }}
                />

                <Text style={[styles.more, { color: colors.lightDarkText }]}>Mer</Text>

                <TouchableOpacity 
                    style={[
                        styles.actionButton, 
                        { backgroundColor: colors.contextBackground },
                        showHelpSupport && styles.actionButtonExpanded
                    ]}
                    onPress={toggleHelpSupport}
                >
                    <View style={styles.actionButtonContent}>
                        <Ionicons name="help-circle-outline" size={24} color={colors.tint} />
                        <View style={styles.actionButtonText}>
                            <Text style={[styles.actionButtonTitle, { color: colors.text }]}>
                                Hjelp og støtte
                            </Text>
                            <Text style={[styles.actionButtonDescription, { color: colors.lightDarkText }]}>
                                Kontaktinformasjon og support
                            </Text>
                        </View>
                    </View>
                    <Ionicons 
                        name={showHelpSupport ? "chevron-down" : "chevron-forward"} 
                        size={20} 
                        color={colors.lightDarkText} 
                    />
                </TouchableOpacity>

                {/* Help and Support dropdown content */}
                {showHelpSupport && (
                    <View style={[styles.dropdownContent, { backgroundColor: colors.contextBackground }]}>
                        <Text style={[styles.dropdownText, { color: colors.lightDarkText }]}>
                            E-post: 
                            <Text style={[styles.linkText, { color: colors.tint }]} onPress={() => Linking.openURL('mailto:support@chorechamp.com')}>
                                support@chorechamp.com
                            </Text>
                            {'\n\n'}
                            Telefon: 
                            <Text style={[styles.linkText, { color: colors.tint }]} onPress={() => Linking.openURL('tel:+4712345678')}>
                                +47 123 45 678
                            </Text>
                        </Text>
                    </View>
                )}

                <TouchableOpacity 
                    style={[
                        styles.actionButton, 
                        { backgroundColor: colors.contextBackground },
                        showAboutApp && styles.actionButtonExpanded
                    ]}
                    onPress={toggleAboutApp}
                >
                    <View style={styles.actionButtonContent}>
                        <Ionicons name="information-circle-outline" size={24} color={colors.tint} />
                        <View style={styles.actionButtonText}>
                            <Text style={[styles.actionButtonTitle, { color: colors.text }]}>
                                Om Appen
                            </Text>
                            <Text style={[styles.actionButtonDescription, { color: colors.lightDarkText }]}>
                                Informasjon om ChoreChamp og utviklerne
                            </Text>
                        </View>
                    </View>
                    <Ionicons 
                        name={showAboutApp ? "chevron-down" : "chevron-forward"} 
                        size={20} 
                        color={colors.lightDarkText} 
                    />
                </TouchableOpacity>

                {/* About App dropdown content */}
                {showAboutApp && (
                    <View style={[styles.dropdownContent, { backgroundColor: colors.contextBackground }]}>
                        <Text style={[styles.dropdownText, { color: colors.lightDarkText }]}>
                            ChoreChamp er en app for å organisere og administrere oppgaver i hjemmet. 
                            Man kan opprette husstander, tildele oppgaver, og følge med på fremdriften i leaderboards med et poengsystem. 
                            Appen er utviklet for å gjøre vanlige husoppgaver til en morsom og engasjerende konkurranse for hele familien.{'\n\n'}
                            Appen er utviklet av:{'\n'}
                            - Emil Berglund{'\n'}
                            - Andreas B. O. Skaarberg{'\n'}
                            - Sebastian W. Thomsen{'\n'}
                            - Ida Tollaksen{'\n'}
                            - Khalid H. Osman
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Edit Profile Modal */}
            <EditProfileModal
                visible={isEditModalVisible}
                onClose={() => setIsEditModalVisible(false)}
                currentUsername={userData.username}
                currentImageUri={userData.imageUri || ''}
                onSave={handleSaveProfile}
            />
        </View>
    );
}

function MenuItem({
    icon,
    title,
    description,
    onPress,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    description?: string;
    onPress?: () => void;
}) {
    const { colors } = useTheme();

    return (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={styles.iconContainer}>
                <Ionicons
                    name={icon}
                    size={24}
                    color={colors.tint}
                />
            </View>
            <View style={styles.menuContent}>
                <Text style={[styles.menuText, { color: colors.text }]}>{title}</Text>
                {description && <Text style={[styles.description, { color: colors.lightDarkText }]}>{description}</Text>}
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.lightDarkText} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    header: {
        width: "100%",
        alignItems: "center",
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        paddingBottom: 20,
    },
    headerTitle: {
        alignSelf: 'flex-start',
    },
    profileSection: {
        alignItems: "center",
        paddingBottom: 15,
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 10,
    },
    profileName: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 4,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: "rgba(255, 255, 255, 0.3)",
        marginBottom: 10,
    },
    avatarPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    name: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1f2937",
        marginBottom: 4,
    },
    separator: {
        width: '80%',
        height: 1.5,
        backgroundColor: "black",
        opacity: 0.8,
        marginTop: 5,
        marginBottom: 0,
    },
    editProfile: {
        fontSize: 16,
        color: "#1f2937",
        fontWeight: "500",
        padding: 0,
    },
    menu: {
        flex: 1,
        paddingTop: 20,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "stretch",
        paddingVertical: 12,
        borderRadius: 12,
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        elevation: 1,
        justifyContent: "space-between",
    },
    iconContainer: {
        width: 32,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    menuContent: {
        flex: 1,
        justifyContent: "center",
    },
    menuHeader: {
        flexDirection: "row",
        alignItems: "center",
    },
    menuText: {
        fontSize: 16,
        fontWeight: "500",
    },
    description: {
        fontSize: 14,
        marginTop: 4,
        wordWrap: 'break-word',
    },
    more: {
        paddingLeft: 0,
        paddingBlock: 10,
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
    linkText: {
        textDecorationLine: 'underline',
        fontWeight: '500',
    },
});
