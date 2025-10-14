import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Modal,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
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
    
    // Sample household data generated with ai
    const [households, setHouseholds] = useState<Household[]>([
        {
            id: '1',
            name: 'Remmen',
            role: 'admin',
            members: [
                { id: '1', name: 'Emil Berglund', role: 'admin', avatar: 'https://i.pravatar.cc/150?u=1' },
                { id: '2', name: 'Ida Tollaksen', role: 'member', avatar: 'https://i.pravatar.cc/150?u=2' },
                { id: '3', name: 'Andreas B. Olaussen', role: 'member', avatar: 'https://i.pravatar.cc/150?u=3' },
                { id: '4', name: 'Sebastian W. Thomsen', role: 'member', avatar: 'https://i.pravatar.cc/150?u=4' }
            ]
        },
        {
            id: '2',
            name: 'Hjemme',
            role: 'admin',
            members: [
                { id: '1', name: 'Emil Berglund', role: 'admin', avatar: 'https://i.pravatar.cc/150?u=1' },
                { id: '5', name: 'Ola Normann', role: 'member', avatar: 'https://i.pravatar.cc/150?u=5' }
            ]
        },
        {
            id: '3',
            name: 'Kollektiv',
            role: 'member',
            members: [
                { id: '1', name: 'Emil Berglund', role: 'member', avatar: 'https://i.pravatar.cc/150?u=1' },
                { id: '6', name: 'Ola Nordmann', role: 'admin', avatar: 'https://i.pravatar.cc/150?u=6' },
                { id: '7', name: 'Ingrid Svendsen', role: 'member', avatar: 'https://i.pravatar.cc/150?u=7' },
                { id: '8', name: 'Martin Johansen', role: 'member', avatar: 'https://i.pravatar.cc/150?u=8' },
                { id: '9', name: 'Lise Kristiansen', role: 'member', avatar: 'https://i.pravatar.cc/150?u=9' },
                { id: '10', name: 'Erik Andersen', role: 'member', avatar: 'https://i.pravatar.cc/150?u=10' }
            ]
        },
        {
            id: '4',
            name: 'Hytta',
            role: 'member',
            members: [
                { id: '1', name: 'Emil Berglund', role: 'member', avatar: 'https://i.pravatar.cc/150?u=1' },
                { id: '11', name: 'Per Hansen', role: 'admin', avatar: 'https://i.pravatar.cc/150?u=11' },
                { id: '12', name: 'Berit Hansen', role: 'member', avatar: 'https://i.pravatar.cc/150?u=12' },
                { id: '13', name: 'Ole Hansen', role: 'member', avatar: 'https://i.pravatar.cc/150?u=13' },
                { id: '14', name: 'Astrid Hansen', role: 'member', avatar: 'https://i.pravatar.cc/150?u=14' },
                { id: '15', name: 'Nils Johansen', role: 'member', avatar: 'https://i.pravatar.cc/150?u=15' },
                { id: '16', name: 'Tone Andersen', role: 'member', avatar: 'https://i.pravatar.cc/150?u=16' },
                { id: '17', name: 'Geir Olsen', role: 'member', avatar: 'https://i.pravatar.cc/150?u=17' }
            ]
        }
    ]);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newHouseholdName, setNewHouseholdName] = useState('');
    const [showMembersModal, setShowMembersModal] = useState(false);
    const [selectedHousehold, setSelectedHousehold] = useState<Household | null>(null);

    const handleCreateHousehold = () => {
        if (newHouseholdName.trim() === '') {
            Alert.alert('Feil', 'Husstandsnavnet kan ikke være tomt');
            return;
        }

        const newHousehold: Household = {
            id: Date.now().toString(),
            name: newHouseholdName.trim(),
            role: 'admin',
            members: [
                { id: '1', name: 'Emil Berglund', role: 'admin', avatar: 'https://i.pravatar.cc/150?u=1' }
            ]
        };

        setHouseholds([...households, newHousehold]);
        setNewHouseholdName('');
        setShowCreateModal(false);
        Alert.alert('Suksess', `Husstand "${newHousehold.name}" er opprettet!`);
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
                    onPress: () => {
                        setHouseholds(households.filter(h => h.id !== household.id));
                        Alert.alert('Vellykket', `Du har forlatt "${household.name}"`);
                    }
                }
            ]
        );
    };

    const handleShowMembers = (household: Household) => {
        setSelectedHousehold(household);
        setShowMembersModal(true);
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
                                
                                <View style={styles.householdStats}>
                                    <View style={styles.statItem}>
                                        <Ionicons name="people-outline" size={16} color={colors.lightDarkText} />
                                        <Text style={[styles.statText, { color: colors.lightDarkText }]}>
                                            {household.members.length} medlemmer
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            
                            {/* Actions */}
                            <View style={styles.householdActions}>
                                {/* Se medlemmer button for all */}
                                <TouchableOpacity 
                                    style={[styles.actionButton, { borderColor: colors.lightDarkText }]}
                                    onPress={() => handleShowMembers(household)}
                                >
                                    <Ionicons name="people-outline" size={16} color={colors.lightDarkText} />
                                    <Text style={[styles.actionButtonText, { color: colors.lightDarkText }]}>
                                        Se medlemmer
                                    </Text>
                                </TouchableOpacity>
                                
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
                                    <TouchableOpacity 
                                        style={[styles.actionButton, styles.leaveButton]}
                                        onPress={() => handleLeaveHousehold(household)}
                                    >
                                        <Ionicons name="exit-outline" size={16} color="#ef4444" />
                                        <Text style={[styles.actionButtonText, { color: '#ef4444' }]}>
                                            Forlat
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    ))}
                </View>

                {/* Join Household Section */}
                <View style={styles.section}>
                    <TouchableOpacity 
                        style={[styles.joinButton, { backgroundColor: colors.contextBackground, borderColor: colors.tint }]}
                    >
                        <Ionicons name="add-circle-outline" size={24} color={colors.tint} />
                        <Text style={[styles.joinButtonText, { color: colors.tint }]}>
                            Bli med i eksisterende husstand
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Create Household Modal */}
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
                        <TouchableOpacity onPress={handleCreateHousehold}>
                            <Text style={[styles.saveText, { color: colors.tint }]}>Opprett</Text>
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
                        <Text style={[styles.memberCountText, { color: colors.lightDarkText }]}>
                            {selectedHousehold?.members.length} medlemmer totalt
                        </Text>
                        
                        {selectedHousehold?.members.map((member) => (
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
                    </ScrollView>
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