/*
    My Households Screen Component for ChoreChamp Application
    This component allows users to view, create, join, and manage their households.
    Users can see the list of households they belong to, view members, share join codes,
    set a standard household, and leave households.
*/

import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { createHousehold, getHouseholdMembers, getHouseholdsForUser, getUserHouseholds, joinHousehold, leaveHousehold, addAdminToHousehold } from '@/services/householdService';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { useStandardHousehold } from '@/contexts/StandardHouseholdContext';

interface MyHouseholdsScreenProps {
    onBack: () => void;
}

interface Member {
    id: string;
    name: string;
    avatar?: string;
}

interface Household {
    id: string;
    familyName: string;
    familyMembers: string[];
    adminUsers: string[];
    createdAt?: any;
    createdBy?: string;
    points?: Record<string, number>;
}

export default function MyHouseholdsScreen({ onBack }: MyHouseholdsScreenProps) {
        // Add admin to household (must be inside component to access selectedHousehold and handleShowMembers)
        const handleMakeAdmin = async (householdId: string, memberId: string) => {
            try {
                await addAdminToHousehold(householdId, memberId);
                // Refresh members and households
                await fetchHouseholds();
                // Refresh members modal if open
                if (selectedHousehold) {
                    await handleShowMembers(selectedHousehold);
                }
            } catch {
                Alert.alert('Error', 'Could not make user admin.');
            }
        };
    const { colors } = useTheme();
    const { userData, refreshUserData } = useUser();
    const { t } = useTranslation('app');
    const { standardHouseholdId, setStandardHouseholdId } = useStandardHousehold();
    
    // Fetch households from database
    const [households, setHouseholds] = useState<Household[]>([]);
    const [loading, setLoading] = useState(true);

    // Default household selection
    // Remove local defaultHouseholdId state and AsyncStorage logic

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

    // Fetch household data
    const fetchHouseholds = React.useCallback(async () => {
        if (!userData?.id) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            let userHouseholds = await getHouseholdsForUser(userData.id);
            if (userHouseholds.length === 0 && userData.household && userData.household.length > 0) {
                userHouseholds = await getUserHouseholds(userData.household);
            }
            const transformedHouseholds: Household[] = userHouseholds.map(h => ({
                id: h.id,
                familyName: h.familyName,
                familyMembers: h.familyMembers || [],
                adminUsers: (h as any).adminUsers || [],
                points: h.points || {},
            }));
            setHouseholds(transformedHouseholds);
            console.log('✅ Loaded households:', transformedHouseholds.map(h => h.familyName));
        } catch (error) {
            console.error('❌ Error loading households:', error);
        } finally {
            setLoading(false);
        }
    }, [userData?.id, userData?.household]);

    // Fetch user's households on mount
    useEffect(() => {
        fetchHouseholds();
    }, [fetchHouseholds]);

    const handleCreateHousehold = async () => {
        if (newHouseholdName.trim() === '') {
            Alert.alert(t('alerts.errorTitle'), t('profile.households.nameEmptyMessage'));
            return;
        }

        if (!userData?.id) {
            Alert.alert(t('alerts.errorTitle'), t('profile.households.userNotIdentifiedMessage'));
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
                Alert.alert(t('alerts.successTitle'), t('profile.households.createSuccessMessage', { name: newHouseholdName.trim() }));
            } else {
                Alert.alert(t('alerts.errorTitle'), t('profile.households.createFailedMessage'));
            }
        } catch (error) {
            console.error('Error creating household:', error);
            Alert.alert(t('alerts.errorTitle'), t('profile.households.createErrorMessage'));
        } finally {
            setIsCreating(false);
        }
    };

    const handleJoinHousehold = async () => {
        if (joinCode.trim() === '') {
            Alert.alert(t('alerts.errorTitle'), t('profile.households.joinCodeEmptyMessage'));
            return;
        }

        if (!userData?.id) {
            Alert.alert(t('alerts.errorTitle'), t('profile.households.userNotIdentifiedMessage'));
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
                Alert.alert(t('alerts.successTitle'), t('profile.households.joinSuccessMessage', { name: result.householdName }));
            } else {
                Alert.alert(t('alerts.errorTitle'), result.error || t('profile.households.joinFailedMessage'));
            }
        } catch (error) {
            console.error('Error joining household:', error);
            Alert.alert(t('alerts.errorTitle'), t('profile.households.joinErrorMessage'));
        } finally {
            setIsJoining(false);
        }
    };

    const handleLeaveHousehold = (household: Household) => {
        Alert.alert(
            t('profile.households.leaveConfirmTitle'),
            t('profile.households.leaveConfirmMessage', { name: household.familyName }),
            [
                { text: t('profile.cancel'), style: 'cancel' },
                {
                    text: t('profile.households.leaveConfirmAction'),
                    style: 'destructive',
                    onPress: async () => {
                        if (!userData?.id) return;
                        try {
                            const result = await leaveHousehold(household.id, userData.id);
                            if (result.success) {
                                await refreshUserData();
                                await fetchHouseholds();
                                Alert.alert(t('alerts.successTitle'), t('profile.households.leaveSuccessMessage', { name: household.familyName }));
                            } else {
                                Alert.alert(t('alerts.errorTitle'), result.error || t('profile.households.leaveFailedMessage'));
                            }
                        } catch (error) {
                            console.error('Error leaving household:', error);
                            Alert.alert(t('alerts.errorTitle'), t('profile.households.leaveErrorMessage'));
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
            const transformedMembers: Member[] = members.map(m => {
                const realName = `${m.firstName || ''} ${m.lastName || ''}`.trim();
                return {
                    id: m.id,
                    name: realName !== '' ? realName : (m.username || ''),
                    avatar: m.imageUri
                };
            });
            setHouseholdMembers(transformedMembers);
        } catch (error) {
            console.error('Error loading members:', error);
            Alert.alert(t('alerts.errorTitle'), t('profile.households.loadMembersErrorMessage'));
        } finally {
            setLoadingMembers(false);
        }
    };

    const handleShareHousehold = (household: Household) => {
        const code = household.id;
        const message = t('profile.households.shareMessage', { name: household.familyName, code });
        Alert.alert(
            t('profile.households.shareTitle'),
            message,
            [
                {
                    text: t('profile.households.copyCodeLabel'),
                    onPress: () => {
                        Alert.alert(t('alerts.successTitle'), t('profile.households.copiedMessage', { code }));
                    }
                },
                { text: t('profile.cancel'), style: 'cancel' }
            ]
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}> 
            <Header 
                title={t('profile.households.title')}
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
                            {t('profile.households.loading')}
                        </Text>
                    </View>
                ) : households.length === 0 ? (
                    <View style={styles.emptyContainer}>
                            <Ionicons name="home-outline" size={64} color={colors.lightDarkText} />
                            <Text style={[styles.emptyText, { color: colors.text }]}> 
                                {t('profile.households.emptyTitle')}
                            </Text>
                            <Text style={[styles.emptySubtext, { color: colors.lightDarkText }]}> 
                                {t('profile.households.emptyBody')}
                            </Text>
                        
                        {/* Action Buttons */}
                        <View style={styles.emptyActions}>
                            <TouchableOpacity 
                                style={[styles.primaryButton, { backgroundColor: colors.tint }]}
                                onPress={() => setShowCreateModal(true)}
                            >
                                <Ionicons name="add" size={24} color={colors.darkText} />
                                <Text style={[styles.primaryButtonText, { color: colors.darkText }]}>
                                    {t('profile.households.createHousehold')}
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
                                    {t('profile.households.joinWithCode')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <>
                        {/* Info Section */}
                                <View style={styles.section}>
                                    <Text style={[styles.infoText, { color: colors.lightDarkText }]}>
                                        {t('profile.households.youAreMemberOf', { count: households.length })}
                                    </Text>
                                </View>

                        {/* Households List */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                {t('profile.households.yourHouseholdsTitle')}
                            </Text>
                            
                            {households.map((household) => (
                        <View key={household.id} style={[styles.householdCard, { backgroundColor: colors.contextBackground, borderWidth: standardHouseholdId === household.id ? 2 : 0, borderColor: standardHouseholdId === household.id ? colors.tint : 'transparent' }]}> 
                            <View style={styles.householdContent}>
                                {households.length > 1 && (
                                    <TouchableOpacity
                                        style={{
                                            position: 'absolute', top: 8, right: 8, zIndex: 2,
                                            backgroundColor: standardHouseholdId === household.id ? colors.tint : colors.contextBackground,
                                            borderRadius: 20, paddingVertical: 6, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center',
                                            shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 2, elevation: 2
                                        }}
                                        onPress={() => setStandardHouseholdId(household.id)}
                                        activeOpacity={0.85}
                                    >
                                        <Ionicons name={standardHouseholdId === household.id ? 'star' : 'star-outline'} size={18} color={standardHouseholdId === household.id ? colors.darkText : colors.tint} style={{ marginRight: 6 }} />
                                        <Text style={{
                                            color: standardHouseholdId === household.id ? colors.darkText : colors.tint,
                                            fontWeight: '700', fontSize: 15
                                        }}>
                                            {standardHouseholdId === household.id ? 'Standard' : 'Sett standard'}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                                <View style={styles.householdHeader}>
                                    <View style={styles.householdInfo}>
                                        <Text style={[styles.householdName, { color: colors.text }]}>
                                            {household.familyName}
                                        </Text>
                                        <View style={styles.roleContainer}>
                                            {(() => {
                                                const isAdmin = userData?.id && household.adminUsers && household.adminUsers.includes(`/users/${userData.id}`);
                                                return (
                                                    <View style={[
                                                        styles.roleBadge,
                                                        { backgroundColor: isAdmin ? colors.tint : 'rgba(108, 117, 125, 0.2)' }
                                                    ]}>
                                                        <Text style={[
                                                            styles.roleText,
                                                            { color: isAdmin ? colors.darkText : colors.lightDarkText }
                                                        ]}>
                                                            {isAdmin
                                                                ? t('profile.households.roleAdmin')
                                                                : t('profile.households.roleMember')}
                                                        </Text>
                                                    </View>
                                                );
                                            })()}
                                        </View>
                                    </View>
                                </View>
                                
                                {/* Fjernet household.members visning, da dette ikke finnes i Household-modellen */}
                            </View>
                            
                            {/* Actions */}
                            <View style={styles.householdActions}>
                                <View style={styles.actionRow}>
                                    <TouchableOpacity 
                                        style={[styles.actionButton, { borderColor: colors.lightDarkText, flex: 1 }]}
                                        onPress={() => handleShowMembers(household)}
                                    >
                                        <Ionicons name="people-outline" size={16} color={colors.lightDarkText} />
                                        <Text style={[styles.actionButtonText, { color: colors.lightDarkText }]}> {t('profile.households.viewMembers')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={[styles.actionButton, { borderColor: colors.tint, marginLeft: 8, flex: 1 }]}
                                        onPress={() => handleShareHousehold(household)}
                                    >
                                        <Ionicons name="share-outline" size={16} color={colors.tint} />
                                        <Text style={[styles.actionButtonText, { color: colors.tint }]}> {t('profile.households.share')}</Text>
                                    </TouchableOpacity>
                                </View>
                                <TouchableOpacity 
                                    style={[styles.actionButton, styles.leaveButton, { marginTop: 12, width: '100%' }]}
                                    onPress={() => handleLeaveHousehold(household)}
                                >
                                    <Ionicons name="exit-outline" size={16} color="#ef4444" />
                                    <Text style={[styles.actionButtonText, { color: '#ef4444' }]}>{t('profile.households.leave')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        ))}
                    </View>
                    {/* Action Buttons Section */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}> 
                            {t('profile.households.actionsTitle')}
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
                                    {t('profile.households.createNewTitle')}
                                </Text>
                                <Text style={[styles.actionCardDescription, { color: colors.lightDarkText }]}> 
                                    {t('profile.households.createNewDescription')}
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
                                    {t('profile.households.joinTitle')}
                                </Text>
                                <Text style={[styles.actionCardDescription, { color: colors.lightDarkText }]}> 
                                    {t('profile.households.joinDescription')}
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.lightDarkText} />
                        </TouchableOpacity>
                    </View>
                    </>
                )}
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
                            <Text style={[styles.cancelText, { color: colors.text }]}>{t('profile.cancel')}</Text>
                        </TouchableOpacity>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>{t('profile.households.createModalTitle')}</Text>
                        <TouchableOpacity 
                            onPress={handleCreateHousehold}
                            disabled={isCreating}
                        >
                            <Text style={[styles.saveText, { color: isCreating ? colors.lightDarkText : colors.tint }]}>
                                {isCreating ? t('profile.households.creating') : t('profile.households.create')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.modalContent}>
                        <Text style={[styles.inputLabel, { color: colors.text }]}>{t('profile.households.householdNameLabel')}</Text>
                        <TextInput
                            style={[styles.textInput, { 
                                backgroundColor: colors.contextBackground,
                                color: colors.text,
                                borderColor: colors.lightDarkText 
                            }]}
                            value={newHouseholdName}
                            onChangeText={setNewHouseholdName}
                            placeholder={t('profile.households.householdNamePlaceholder')}
                            placeholderTextColor={colors.lightDarkText}
                            maxLength={30}
                        />
                        <Text style={[styles.inputHint, { color: colors.lightDarkText }]}> 
                            {t('profile.households.createHint')}
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
                            <Text style={[styles.cancelText, { color: colors.text }]}>{t('profile.cancel')}</Text>
                        </TouchableOpacity>
                        <Text style={[styles.modalTitle, { color: colors.text }]}> 
                            {selectedHousehold?.familyName} - {t('profile.households.membersTitle')}
                        </Text>
                        <View style={{ width: 40 }} />
                    </View>
                    
                    <ScrollView style={styles.modalContent}>
                        {loadingMembers ? (
                            <View style={styles.loadingContainer}>
                                <Text style={[styles.infoText, { color: colors.lightDarkText }]}> 
                                    {t('profile.households.loadingMembers')}
                                </Text>
                            </View>
                        ) : (
                            <>
                                <Text style={[styles.memberCountText, { color: colors.lightDarkText }]}>
                                    {t('profile.households.membersTotal', { count: householdMembers.length })}
                                </Text>
                                
                                {householdMembers.map((member) => {
                                    const isAdmin = selectedHousehold?.adminUsers.includes(`/users/${member.id}`);
                                    const currentUserIsAdmin = userData?.id && selectedHousehold?.adminUsers.includes(`/users/${userData.id}`);
                                    return (
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
                                                                {(() => {
                                                                    const names = member.name.split(' ');
                                                                    const first = names[0]?.charAt(0) || '';
                                                                    const last = names[1]?.charAt(0) || '';
                                                                    return `${first}${last}`;
                                                                })()}
                                                            </Text>
                                                        </View>
                                                    )}
                                                </View>
                                                <View style={styles.memberDetails}>
                                                    <Text style={[styles.memberName, { color: colors.text }]}> 
                                                        {member.name}
                                                    </Text>
                                                    <View style={styles.memberMeta}>
                                                        <View style={[styles.memberMetaRow]}>
                                                            <View style={[styles.memberRoleBadge, isAdmin ? styles.memberRoleBadgeAdmin : styles.memberRoleBadgeMember, { backgroundColor: isAdmin ? colors.tint : 'rgba(108, 117, 125, 0.2)' }]}> 
                                                                <Text style={[styles.memberRoleText, isAdmin ? styles.memberRoleTextAdmin : styles.memberRoleTextMember, { color: isAdmin ? colors.darkText : colors.lightDarkText }]}> 
                                                                    {isAdmin
                                                                        ? t('profile.households.memberRoleAdmin')
                                                                        : t('profile.households.memberRoleMember')}
                                                                </Text>
                                                            </View>
                                                            <View style={styles.memberMetaSpacer} />
                                                            {!isAdmin && currentUserIsAdmin && selectedHousehold?.id && (
                                                                <TouchableOpacity
                                                                    style={[styles.makeAdminButton, { backgroundColor: colors.tint }]}
                                                                    onPress={() => handleMakeAdmin(selectedHousehold.id, member.id)}
                                                                >
                                                                    <Text style={[styles.makeAdminButtonText, { color: colors.darkText }]}>{t('profile.households.makeAdmin')}</Text>
                                                                </TouchableOpacity>
                                                            )}
                                                        </View>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    );
                                })}
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
                            <Text style={[styles.cancelText, { color: colors.text }]}>{t('profile.cancel')}</Text>
                        </TouchableOpacity>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>{t('profile.households.joinModalTitle')}</Text>
                        <TouchableOpacity 
                            onPress={handleJoinHousehold}
                            disabled={isJoining}
                        >
                            <Text style={[styles.saveText, { color: isJoining ? colors.lightDarkText : colors.tint }]}>
                                {isJoining ? t('profile.households.joining') : t('profile.households.join')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.modalContent}>
                        <Text style={[styles.inputLabel, { color: colors.text }]}>{t('profile.households.joinCodeLabel')}</Text>
                        <TextInput
                            style={[styles.textInput, { 
                                backgroundColor: colors.contextBackground,
                                color: colors.text,
                                borderColor: colors.lightDarkText 
                            }]}
                            value={joinCode}
                            onChangeText={setJoinCode}
                            placeholder={t('profile.households.joinCodePlaceholder')}
                            placeholderTextColor={colors.lightDarkText}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        <Text style={[styles.inputHint, { color: colors.lightDarkText }]}>
                            {t('profile.households.joinCodeHint')}
                        </Text>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
            memberMetaRow: {
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
            },
            memberMetaSpacer: {
                flex: 1,
            },
            makeAdminButton: {
                marginLeft: 12,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 8,
                alignSelf: 'flex-end',
            },
            makeAdminButtonText: {
                fontWeight: '600',
                fontSize: 12,
            },
            memberRoleBadgeAdmin: {},
            memberRoleBadgeMember: {},
            memberRoleTextAdmin: {},
            memberRoleTextMember: {},
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
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
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
        flexDirection: 'column',
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 0,
        width: '100%',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderRadius: 8,
        gap: 8,
        marginBottom: 6,
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