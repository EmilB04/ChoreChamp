import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { createHousehold, getHouseholdMembers, getHouseholdsForUser, getUserHouseholds, joinHousehold, leaveHousehold } from '@/services/householdService';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Header from './Header';

interface MyHouseholdsScreenProps {
    onBack: () => void;
}

interface Member {
    id: string;
    name: string;
    role: 'admin' | 'member';
    avatar?: string;
}

interface Household {
    id: string;
    name: string;
    role: 'admin' | 'member';
    members: Member[];
}

export default function MyHouseholdsScreen({ onBack }: MyHouseholdsScreenProps) {
    const { colors } = useTheme();
    const { userData, refreshUserData } = useUser();
    
    // Fetch households from database
    const [households, setHouseholds] = useState<Household[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newHouseholdName, setNewHouseholdName] = useState('');
    const [showMembersModal, setShowMembersModal] = useState(false);
    const [selectedHousehold, setSelectedHousehold] = useState<Household | null>(null);
    const [householdMembers, setHouseholdMembers] = useState<Member[]>([]);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const [isJoining, setIsJoining] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // Fetch user's households on mount
    useEffect(() => {
        const fetchHouseholds = async () => {
            if (!userData?.id) {
                console.log('⚠️ No user ID available');
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                console.log('🏠 Fetching households for user:', userData.id);
                
                // First, try to fetch households by querying familyMembers
                let userHouseholds = await getHouseholdsForUser(userData.id);
                
                // If no households found via query and user has household array, fetch those
                if (userHouseholds.length === 0 && userData.household && userData.household.length > 0) {
                    console.log('🏠 No households found via query, trying user.household array');
                    userHouseholds = await getUserHouseholds(userData.household);
                }

                // Transform to match the component's Household interface
                const transformedHouseholds: Household[] = userHouseholds.map(h => ({
                    id: h.id,
                    name: h.familyName,
                    role: 'member', // Default to member, you can enhance this later
                    members: [] // Empty for now, can be populated if needed
                }));

                setHouseholds(transformedHouseholds);
                console.log('✅ Loaded households:', transformedHouseholds.map(h => h.name));
            } catch (error) {
                console.error('❌ Error loading households:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHouseholds();
    }, [userData?.id, userData?.household]);

    // Fetch household data
    const fetchHouseholds = async () => {
        if (!userData?.id) {
            console.log('⚠️ No user ID available');
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            console.log('🏠 Fetching households for user:', userData.id);
            
            // First, try to fetch households by querying familyMembers
            let userHouseholds = await getHouseholdsForUser(userData.id);
            
            // If no households found via query and user has household array, fetch those
            if (userHouseholds.length === 0 && userData.household && userData.household.length > 0) {
                console.log('🏠 No households found via query, trying user.household array');
                userHouseholds = await getUserHouseholds(userData.household);
            }

            // Transform to match the component's Household interface
            const transformedHouseholds: Household[] = userHouseholds.map(h => ({
                id: h.id,
                name: h.familyName,
                role: 'member', // Default to member, you can enhance this later
                members: [] // Will be loaded on demand
            }));

            setHouseholds(transformedHouseholds);
            console.log('✅ Loaded households:', transformedHouseholds.map(h => h.name));
        } catch (error) {
            console.error('❌ Error loading households:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateHousehold = async () => {
        if (newHouseholdName.trim() === '') {
            Alert.alert('Feil', 'Husstandsnavnet kan ikke være tomt');
            return;
        }

        if (!userData?.id) {
            Alert.alert('Feil', 'Kunne ikke identifisere brukeren');
            return;
        }

        setIsCreating(true);
        try {
            const householdId = await createHousehold(newHouseholdName.trim(), userData.id);
            
            if (householdId) {
                // Refresh user data to get updated household array
                await refreshUserData();
                
                // Refresh households list
                await fetchHouseholds();
                
                setNewHouseholdName('');
                setShowCreateModal(false);
                Alert.alert('Suksess', `Husstand "${newHouseholdName.trim()}" er opprettet!`);
            } else {
                Alert.alert('Feil', 'Kunne ikke opprette husstanden. Vennligst prøv igjen.');
            }
        } catch (error) {
            console.error('Error creating household:', error);
            Alert.alert('Feil', 'En feil oppstod ved oppretting av husstanden.');
        } finally {
            setIsCreating(false);
        }
    };

    const handleJoinHousehold = async () => {
        if (joinCode.trim() === '') {
            Alert.alert('Feil', 'Vennligst skriv inn en husstandskode');
            return;
        }

        if (!userData?.id) {
            Alert.alert('Feil', 'Kunne ikke identifisere brukeren');
            return;
        }

        setIsJoining(true);
        try {
            // Extract just the code if user pasted full path
            let code = joinCode.trim();
            if (code.includes('/')) {
                code = code.split('/').pop() || code;
            }

            const result = await joinHousehold(code, userData.id);
            
            if (result.success) {
                // Refresh user data to get updated household array
                await refreshUserData();
                
                // Refresh households list
                await fetchHouseholds();
                
                setJoinCode('');
                setShowJoinModal(false);
                Alert.alert('Suksess', `Du er nå medlem av "${result.householdName}"!`);
            } else {
                Alert.alert('Feil', result.error || 'Kunne ikke bli med i husstanden.');
            }
        } catch (error) {
            console.error('Error joining household:', error);
            Alert.alert('Feil', 'En feil oppstod. Vennligst prøv igjen.');
        } finally {
            setIsJoining(false);
        }
    };

    const handleLeaveHousehold = (household: Household) => {
        Alert.alert(
            'Forlat husstand',
            `Er du sikker på at du vil forlate "${household.name}"?`,
            [
                { text: 'Avbryt', style: 'cancel' },
                {
                    text: 'Forlat',
                    style: 'destructive',
                    onPress: async () => {
                        if (!userData?.id) return;
                        
                        try {
                            const result = await leaveHousehold(household.id, userData.id);
                            
                            if (result.success) {
                                // Refresh user data
                                await refreshUserData();
                                
                                // Refresh households list
                                await fetchHouseholds();
                                
                                Alert.alert('Vellykket', `Du har forlatt "${household.name}"`);
                            } else {
                                Alert.alert('Feil', result.error || 'Kunne ikke forlate husstanden.');
                            }
                        } catch (error) {
                            console.error('Error leaving household:', error);
                            Alert.alert('Feil', 'En feil oppstod. Vennligst prøv igjen.');
                        }
                    }
                }
            ]
        );
    };

    const handleShowMembers = async (household: Household) => {
        setSelectedHousehold(household);
        setShowMembersModal(true);
        setLoadingMembers(true);
        
        try {
            const members = await getHouseholdMembers(household.id);
            const transformedMembers: Member[] = members.map(m => ({
                id: m.id,
                name: m.username,
                role: 'member', // Can be enhanced later
                avatar: m.imageUri
            }));
            setHouseholdMembers(transformedMembers);
        } catch (error) {
            console.error('Error loading members:', error);
            Alert.alert('Feil', 'Kunne ikke laste medlemmer');
        } finally {
            setLoadingMembers(false);
        }
    };

    const handleShareHousehold = (household: Household) => {
        const code = household.id;
        const message = `Bli med i vår husstand "${household.name}"!\n\nBruk denne koden: ${code}\n\nEller kopier hele denne linken: households/${code}`;
        
        Alert.alert(
            'Del husstandskode',
            message,
            [
                {
                    text: 'Kopier kode',
                    onPress: () => {
                        // In a real app, you'd use Clipboard API
                        Alert.alert('Kopiert', `Koden "${code}" er kopiert!`);
                    }
                },
                { text: 'Lukk', style: 'cancel' }
            ]
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Header 
                title="Mine husstander" 
                onBack={onBack}
                rightElement={
                    <TouchableOpacity onPress={() => setShowCreateModal(true)}>
                        <Ionicons name="add" size={24} color={colors.darkText} />
                    </TouchableOpacity>
                }
            />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <Text style={[styles.infoText, { color: colors.lightDarkText }]}>
                            Laster husstander...
                        </Text>
                    </View>
                ) : households.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="home-outline" size={64} color={colors.lightDarkText} />
                        <Text style={[styles.emptyText, { color: colors.text }]}>
                            Du er ikke medlem av noen husstander ennå
                        </Text>
                        <Text style={[styles.emptySubtext, { color: colors.lightDarkText }]}>
                            Opprett en ny husstand eller bli med i en eksisterende
                        </Text>
                        
                        {/* Action Buttons */}
                        <View style={styles.emptyActions}>
                            <TouchableOpacity 
                                style={[styles.primaryButton, { backgroundColor: colors.tint }]}
                                onPress={() => setShowCreateModal(true)}
                            >
                                <Ionicons name="add" size={24} color={colors.darkText} />
                                <Text style={[styles.primaryButtonText, { color: colors.darkText }]}>
                                    Opprett husstand
                                </Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[styles.secondaryButton, { 
                                    backgroundColor: colors.contextBackground,
                                    borderColor: colors.tint 
                                }]}
                                onPress={() => setShowJoinModal(true)}
                            >
                                <Ionicons name="enter-outline" size={24} color={colors.tint} />
                                <Text style={[styles.secondaryButtonText, { color: colors.tint }]}>
                                    Bli med med kode
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <>
                        {/* Info Section */}
                        <View style={styles.section}>
                            <Text style={[styles.infoText, { color: colors.lightDarkText }]}>
                                Du er medlem av {households.length} husstand{households.length !== 1 ? 'er' : ''}
                            </Text>
                        </View>

                        {/* Households List */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                Dine husstander
                            </Text>
                            
                            {households.map((household) => (
                        <View key={household.id} style={[styles.householdCard, { backgroundColor: colors.contextBackground }]}>
                            <View style={styles.householdContent}>
                                <View style={styles.householdHeader}>
                                    <View style={styles.householdInfo}>
                                        <Text style={[styles.householdName, { color: colors.text }]}>
                                            {household.name}
                                        </Text>
                                        <View style={styles.roleContainer}>
                                            <View style={[
                                                styles.roleBadge, 
                                                { backgroundColor: household.role === 'admin' ? colors.tint : 'rgba(108, 117, 125, 0.2)' }
                                            ]}>
                                                <Text style={[
                                                    styles.roleText,
                                                    { color: household.role === 'admin' ? colors.darkText : colors.lightDarkText }
                                                ]}>
                                                    {household.role === 'admin' ? 'Administrator' : 'Medlem'}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                                
                                {household.members && household.members.length > 0 && (
                                    <View style={styles.householdStats}>
                                        <View style={styles.statItem}>
                                            <Ionicons name="people-outline" size={16} color={colors.lightDarkText} />
                                            <Text style={[styles.statText, { color: colors.lightDarkText }]}>
                                                {household.members.length} medlemmer
                                            </Text>
                                        </View>
                                    </View>
                                )}
                            </View>
                            
                            {/* Actions */}
                            <View style={styles.householdActions}>
                                {/* Se medlemmer button - only show if we have member data */}
                                {household.members && household.members.length > 0 && (
                                    <TouchableOpacity 
                                        style={[styles.actionButton, { borderColor: colors.lightDarkText }]}
                                        onPress={() => handleShowMembers(household)}
                                    >
                                        <Ionicons name="people-outline" size={16} color={colors.lightDarkText} />
                                        <Text style={[styles.actionButtonText, { color: colors.lightDarkText }]}>
                                            Se medlemmer
                                        </Text>
                                    </TouchableOpacity>
                                )}
                                
                                {household.role === 'admin' ? (
                                    <TouchableOpacity 
                                        style={[styles.actionButton, { borderColor: colors.tint }]}
                                    >
                                        <Ionicons name="settings-outline" size={16} color={colors.tint} />
                                        <Text style={[styles.actionButtonText, { color: colors.tint }]}>
                                            Administrer
                                        </Text>
                                    </TouchableOpacity>
                                ) : (
                                    <>
                                        <TouchableOpacity 
                                            style={[styles.actionButton, { borderColor: colors.tint }]}
                                            onPress={() => handleShareHousehold(household)}
                                        >
                                            <Ionicons name="share-outline" size={16} color={colors.tint} />
                                            <Text style={[styles.actionButtonText, { color: colors.tint }]}>
                                                Del
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            style={[styles.actionButton, styles.leaveButton]}
                                            onPress={() => handleLeaveHousehold(household)}
                                        >
                                            <Ionicons name="exit-outline" size={16} color="#ef4444" />
                                            <Text style={[styles.actionButtonText, { color: '#ef4444' }]}>
                                                Forlat
                                            </Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>
                        </View>
                        ))}
                    </View>

                    {/* Action Buttons Section */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            Handlinger
                        </Text>
                        
                        <TouchableOpacity 
                            style={[styles.actionCardButton, { backgroundColor: colors.contextBackground }]}
                            onPress={() => setShowCreateModal(true)}
                        >
                            <View style={[styles.actionCardIcon, { backgroundColor: colors.tint }]}>
                                <Ionicons name="add" size={24} color={colors.darkText} />
                            </View>
                            <View style={styles.actionCardContent}>
                                <Text style={[styles.actionCardTitle, { color: colors.text }]}>
                                    Opprett ny husstand
                                </Text>
                                <Text style={[styles.actionCardDescription, { color: colors.lightDarkText }]}>
                                    Start en ny husstand og inviter medlemmer
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.lightDarkText} />
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[styles.actionCardButton, { backgroundColor: colors.contextBackground }]}
                            onPress={() => setShowJoinModal(true)}
                        >
                            <View style={[styles.actionCardIcon, { backgroundColor: colors.tint }]}>
                                <Ionicons name="enter-outline" size={24} color={colors.darkText} />
                            </View>
                            <View style={styles.actionCardContent}>
                                <Text style={[styles.actionCardTitle, { color: colors.text }]}>
                                    Bli med i husstand
                                </Text>
                                <Text style={[styles.actionCardDescription, { color: colors.lightDarkText }]}>
                                    Bruk en invitasjonskode for å bli med
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.lightDarkText} />
                        </TouchableOpacity>
                    </View>
                    </>
                )}
            </ScrollView>            {/* Create Household Modal */}
            <Modal
                visible={showCreateModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowCreateModal(false)}
            >
                <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                    <View style={[styles.modalHeader, { borderBottomColor: colors.contextBackground }]}>
                        <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                            <Text style={[styles.cancelText, { color: colors.text }]}>Avbryt</Text>
                        </TouchableOpacity>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Ny husstand</Text>
                        <TouchableOpacity 
                            onPress={handleCreateHousehold}
                            disabled={isCreating}
                        >
                            <Text style={[styles.saveText, { color: isCreating ? colors.lightDarkText : colors.tint }]}>
                                {isCreating ? 'Oppretter...' : 'Opprett'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.modalContent}>
                        <Text style={[styles.inputLabel, { color: colors.text }]}>Husstandsnavn</Text>
                        <TextInput
                            style={[styles.textInput, { 
                                backgroundColor: colors.contextBackground,
                                color: colors.text,
                                borderColor: colors.lightDarkText 
                            }]}
                            value={newHouseholdName}
                            onChangeText={setNewHouseholdName}
                            placeholder="F.eks. Familie Hansen"
                            placeholderTextColor={colors.lightDarkText}
                            maxLength={30}
                        />
                        <Text style={[styles.inputHint, { color: colors.lightDarkText }]}>
                            Du blir automatisk administrator for den nye husstanden
                        </Text>
                    </View>
                </View>
            </Modal>

            {/* Members Modal */}
            <Modal
                visible={showMembersModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowMembersModal(false)}
            >
                <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                    <View style={[styles.modalHeader, { borderBottomColor: colors.contextBackground }]}>
                        <TouchableOpacity onPress={() => setShowMembersModal(false)}>
                            <Text style={[styles.cancelText, { color: colors.text }]}>Lukk</Text>
                        </TouchableOpacity>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>
                            {selectedHousehold?.name} - Medlemmer
                        </Text>
                        <View style={{ width: 40 }} />
                    </View>
                    
                    <ScrollView style={styles.modalContent}>
                        {loadingMembers ? (
                            <View style={styles.loadingContainer}>
                                <Text style={[styles.infoText, { color: colors.lightDarkText }]}>
                                    Laster medlemmer...
                                </Text>
                            </View>
                        ) : (
                            <>
                                <Text style={[styles.memberCountText, { color: colors.lightDarkText }]}>
                                    {householdMembers.length} medlemmer totalt
                                </Text>
                                
                                {householdMembers.map((member) => (
                            <View key={member.id} style={[styles.memberCard, { backgroundColor: colors.contextBackground }]}>
                                <View style={styles.memberInfo}>
                                    <View style={styles.memberAvatar}>
                                        {member.avatar ? (
                                            <Image 
                                                source={{ uri: member.avatar }} 
                                                style={styles.avatarImage}
                                            />
                                        ) : (
                                            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.tint }]}>
                                                <Text style={[styles.avatarText, { color: colors.darkText }]}>
                                                    {member.name.charAt(0)}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                    <View style={styles.memberDetails}>
                                        <Text style={[styles.memberName, { color: colors.text }]}>
                                            {member.name}
                                        </Text>
                                        <View style={styles.memberMeta}>
                                            <View style={[
                                                styles.memberRoleBadge,
                                                { backgroundColor: member.role === 'admin' ? colors.tint : 'rgba(108, 117, 125, 0.2)' }
                                            ]}>
                                                <Text style={[
                                                    styles.memberRoleText,
                                                    { color: member.role === 'admin' ? colors.darkText : colors.lightDarkText }
                                                ]}>
                                                    {member.role === 'admin' ? 'Admin' : 'Medlem'}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        ))}
                            </>
                        )}
                    </ScrollView>
                </View>
            </Modal>

            {/* Join Household Modal */}
            <Modal
                visible={showJoinModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowJoinModal(false)}
            >
                <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                    <View style={[styles.modalHeader, { borderBottomColor: colors.contextBackground }]}>
                        <TouchableOpacity onPress={() => setShowJoinModal(false)}>
                            <Text style={[styles.cancelText, { color: colors.text }]}>Avbryt</Text>
                        </TouchableOpacity>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Bli med i husstand</Text>
                        <TouchableOpacity 
                            onPress={handleJoinHousehold}
                            disabled={isJoining}
                        >
                            <Text style={[styles.saveText, { color: isJoining ? colors.lightDarkText : colors.tint }]}>
                                {isJoining ? 'Bli med...' : 'Bli med'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.modalContent}>
                        <Text style={[styles.inputLabel, { color: colors.text }]}>Husstandskode</Text>
                        <TextInput
                            style={[styles.textInput, { 
                                backgroundColor: colors.contextBackground,
                                color: colors.text,
                                borderColor: colors.lightDarkText 
                            }]}
                            value={joinCode}
                            onChangeText={setJoinCode}
                            placeholder="Skriv inn husstandskode"
                            placeholderTextColor={colors.lightDarkText}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        <Text style={[styles.inputHint, { color: colors.lightDarkText }]}>
                            Koden er på formatet: NMogPiBLWF4nmwsHBTlP{'\n'}
                            Eller du kan lime inn: households/NMogPiBLWF4nmwsHBTlP
                        </Text>
                    </View>
                </View>
            </Modal>
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
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    infoText: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        textAlign: 'center',
    },
    emptyActions: {
        width: '100%',
        marginTop: 32,
        gap: 12,
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        gap: 8,
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        borderWidth: 2,
        gap: 8,
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    householdCard: {
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
    },
    householdContent: {
        padding: 16,
    },
    householdHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    householdInfo: {
        flex: 1,
    },
    householdName: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    roleContainer: {
        marginBottom: 4,
    },
    roleBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    roleText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    householdStats: {
        flexDirection: 'row',
        gap: 16,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        fontSize: 14,
    },
    householdActions: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingBottom: 16,
        gap: 8,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderRadius: 8,
        gap: 4,
    },
    leaveButton: {
        borderColor: '#ef4444',
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '500',
    },
    actionCardButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        gap: 12,
    },
    actionCardIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionCardContent: {
        flex: 1,
    },
    actionCardTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    actionCardDescription: {
        fontSize: 14,
        lineHeight: 18,
    },
    joinButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderStyle: 'dashed',
        gap: 8,
    },
    joinButtonText: {
        fontSize: 16,
        fontWeight: '500',
    },
    modalContainer: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        paddingTop: 60,
        borderBottomWidth: 1,
    },
    cancelText: {
        fontSize: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    saveText: {
        fontSize: 16,
        fontWeight: '600',
    },
    modalContent: {
        padding: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 8,
    },
    textInput: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        marginBottom: 8,
    },
    inputHint: {
        fontSize: 14,
        fontStyle: 'italic',
    },
    memberCountText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        fontWeight: '500',
    },
    memberCard: {
        borderRadius: 12,
        marginBottom: 12,
        padding: 16,
    },
    memberInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    memberAvatar: {
        marginRight: 12,
    },
    avatarImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    avatarPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '600',
    },
    memberDetails: {
        flex: 1,
    },
    memberName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    memberMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    memberRoleBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    memberRoleText: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    joinDate: {
        fontSize: 12,
    },
});