import Notification from "@/components/notifications/notification";
import { useTheme } from "@/contexts/ThemeContext";
import { useUser } from "@/contexts/UserContext";
import { db } from "@/lib/firebase";
import { useFocusEffect } from "@react-navigation/native";
import { collection, doc, onSnapshot, orderBy, query, updateDoc, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import commonStyles from "../commonStyles";

export default function Notifications() {
    const { colors } = useTheme();
    const { t } = useTranslation('app');

    const { userData } = useUser();
    const [selectedTab, setSelectedTab] = useState<'unread' | 'previous'>('unread');
    const [selectedNotification, setSelectedNotification] = useState<any>(null);
    const [refreshing, setRefreshing] = useState(false);

    // Reset to main view when tab is focused
    useFocusEffect(
        React.useCallback(() => {
            setSelectedNotification(null);
        }, [])
    );

    // Fetch notifications from Firestore for the current user
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        if (!userData?.id) return;
        const q = query(
            collection(db, "notifications"),
            where("userId", "==", userData.id),
            orderBy("timestamp", "desc")
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log('Fetched notifications:', notifs);
            if (notifs.length > 0) {
                const readNotifs = notifs.filter(n => (n as any).read === true);
                const unreadNotifs = notifs.filter(n => (n as any).read !== true);
                console.log('Read notifications:', readNotifs);
                console.log('Unread notifications:', unreadNotifs);
            }
            setNotifications(notifs);
        });
        return () => unsubscribe();
    }, [userData?.id]);

    // Group notifications by time periods
    const groupNotificationsByTime = () => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thisWeek = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));

        const groups = {
            today: [] as any[],
            thisWeek: [] as any[],
            earlier: [] as any[],
        };

        notifications.forEach(notification => {
            const notificationDate = notification.timestamp?.toDate ? notification.timestamp.toDate() : new Date(notification.timestamp);
            const notificationDay = new Date(notificationDate.getFullYear(), notificationDate.getMonth(), notificationDate.getDate());

            if (notificationDay >= today) {
                groups.today.push(notification);
            } else if (notificationDate >= thisWeek) {
                groups.thisWeek.push(notification);
            } else {
                groups.earlier.push(notification);
            }
        });

        return groups;
    };

    const groupedNotifications = groupNotificationsByTime();
    const unreadNotifications = notifications.filter(n => !n.read);

    // Function to toggle notification read status
    const toggleReadStatus = async (notificationId: string, readStatus: boolean) => {
        try {
            const notifRef = doc(db, "notifications", notificationId);
            await updateDoc(notifRef, { read: readStatus });
        } catch (error) {
            console.error("Failed to update notification read status", error);
        }
        setSelectedNotification(null);
    };

    // Handle pull-to-refresh
    const onRefresh = async () => {
        setRefreshing(true);
        // In a real app, you would fetch notifications from Firebase here
        // For now, just simulate a refresh
        setTimeout(() => {
            setRefreshing(false);
        }, 500);
    };

    // Function to get relative time
    const getRelativeTime = (timestamp: any) => {
        const now = new Date();
        const notificationTime = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
        const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));

        if (diffInMinutes < 60) return t('notifications.minutesAgo', { count: diffInMinutes });

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return t('notifications.hoursAgo', { count: diffInHours });

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays === 1) return t('notifications.oneDayAgo');

        return t('notifications.daysAgo', { count: diffInDays });
    };

    // If a notification is selected, show the detail view
    if (selectedNotification) {
        return (
            <Notification 
                notification={selectedNotification}
                onBack={() => setSelectedNotification(null)}
                onToggleReadStatus={toggleReadStatus}
            />
        );
    }

    return (
        <View style={[commonStyles.container, { backgroundColor: colors.background }]}>
            <View style={styles.mainContent}>
                <Text style={[commonStyles.headerTitle, { color: colors.text }]}>
                    {t('notifications.title')}
                </Text>
                {unreadNotifications.length > 0 && (
                    <Text style={[styles.subtitle, { color: colors.lightDarkText }]}> 
                        {t('notifications.youHave')}{' '}
                        <Text style={{ color: colors.tint }}>{unreadNotifications.length}</Text>{' '}
                        {t('notifications.unread')}
                    </Text>
                )}

                {/* Content */}
                <View style={styles.contentContainer}>
                    {selectedTab === 'unread' ? (
                        // UNREAD TAB - Show only unread notifications
                        <ScrollView
                            style={styles.notificationsList}
                            showsVerticalScrollIndicator={false}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={onRefresh}
                                    tintColor={colors.tint}
                                    colors={[colors.tint]}
                                />
                            }
                        >
                            {/* Today's unread notifications */}
                            {groupedNotifications.today.filter(n => !n.read).length > 0 && (
                                <>
                                    <View style={[styles.sectionHeader, { borderBottomColor: colors.lightNonInteractiveText }]}>
                                        <Text style={[styles.sectionTitle, { color: colors.lightNonInteractiveText }]}>{t('notifications.today')}</Text>
                                        <Text style={[styles.sectionDivider, {borderColor: colors.white }]}></Text>
                                    </View>
                                    {groupedNotifications.today.filter(n => !n.read).map((notification) => (
                                        <TouchableOpacity
                                            key={notification.id}
                                            style={[styles.notificationCard, { backgroundColor: colors.contextBackground }]}
                                            onPress={() => setSelectedNotification(notification)}
                                        >
                                            <View style={styles.notificationContent}>
                                                <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
                                                    <Text style={styles.avatarText}>
                                                        {notification.avatar}
                                                    </Text>
                                                </View>
                                                <View style={styles.notificationText}>
                                                    <Text style={[styles.notificationTitle, { color: colors.text }]}>
                                                        {notification.title}
                                                    </Text>
                                                    <Text style={[styles.notificationSubtitle, { color: colors.lightDarkText }]}>
                                                        {notification.subtitle}
                                                    </Text>
                                                    <Text style={[styles.notificationPoints, { color: colors.tint }]}>
                                                        {notification.points}
                                                    </Text>
                                                    <Text style={[styles.notificationTime, { color: colors.lightNonInteractiveText }]}>
                                                        {getRelativeTime(notification.timestamp)}
                                                    </Text>
                                                </View>
                                                {!notification.read && <View style={[styles.unreadDot, { backgroundColor: colors.tint }]} />}
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </>
                            )}

                            {/* This week's unread notifications */}
                            {groupedNotifications.thisWeek.filter(n => !n.read).length > 0 && (
                                <>
                                    <View style={[styles.sectionHeader, { borderBottomColor: colors.lightNonInteractiveText }]}>
                                        <Text style={[styles.sectionTitle, { color: colors.lightNonInteractiveText }]}>{t('notifications.thisWeek')}</Text>
                                        <Text style={[styles.sectionDivider, { borderColor: colors.white }]}></Text>
                                    </View>
                                    {groupedNotifications.thisWeek.filter(n => !n.read).map((notification) => (
                                        <TouchableOpacity
                                            key={notification.id}
                                            style={[styles.notificationCard, { backgroundColor: colors.contextBackground }]}
                                            onPress={() => setSelectedNotification(notification)}
                                        >
                                            <View style={styles.notificationContent}>
                                                <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
                                                    <Text style={styles.avatarText}>
                                                        {notification.avatar}
                                                    </Text>
                                                </View>
                                                <View style={styles.notificationText}>
                                                    <Text style={[styles.notificationTitle, { color: colors.text }]}>
                                                        {notification.title}
                                                    </Text>
                                                    <Text style={[styles.notificationSubtitle, { color: colors.lightDarkText }]}>
                                                        {notification.subtitle}
                                                    </Text>
                                                    <Text style={[styles.notificationPoints, { color: colors.tint }]}>
                                                        {notification.points}
                                                    </Text>
                                                    <Text style={[styles.notificationTime, { color: colors.lightNonInteractiveText }]}>
                                                        {getRelativeTime(notification.timestamp)}
                                                    </Text>
                                                </View>
                                                {!notification.read && <View style={[styles.unreadDot, { backgroundColor: colors.tint }]} />}
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </>
                            )}

                            {/* Earlier unread notifications */}
                            {groupedNotifications.earlier.filter(n => !n.read).length > 0 && (
                                <>
                                    <View style={[styles.sectionHeader, { borderBottomColor: colors.lightNonInteractiveText }]}>
                                        <Text style={[styles.sectionTitle, { color: colors.lightNonInteractiveText }]}>{t('notifications.earlier')}</Text>
                                        <Text style={[styles.sectionDivider, { borderColor: colors.white }]}></Text>
                                    </View>
                                    {groupedNotifications.earlier.filter(n => !n.read).map((notification) => (
                                        <TouchableOpacity
                                            key={notification.id}
                                            style={[styles.notificationCard, { backgroundColor: colors.contextBackground }]}
                                            onPress={() => setSelectedNotification(notification)}
                                        >
                                            <View style={styles.notificationContent}>
                                                <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
                                                    <Text style={styles.avatarText}>
                                                        {notification.avatar}
                                                    </Text>
                                                </View>
                                                <View style={styles.notificationText}>
                                                    <Text style={[styles.notificationTitle, { color: colors.text }]}>
                                                        {notification.title}
                                                    </Text>
                                                    <Text style={[styles.notificationSubtitle, { color: colors.lightDarkText }]}>
                                                        {notification.subtitle}
                                                    </Text>
                                                    <Text style={[styles.notificationPoints, { color: colors.tint }]}>
                                                        {notification.points}
                                                    </Text>
                                                    <Text style={[styles.notificationTime, { color: colors.lightNonInteractiveText }]}>
                                                        {getRelativeTime(notification.timestamp)}
                                                    </Text>
                                                </View>
                                                {!notification.read && <View style={[styles.unreadDot, { backgroundColor: colors.tint }]} />}
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </>
                            )}

                            {/* Show message if no unread notifications */}
                            {unreadNotifications.length === 0 && (
                                <View style={styles.emptyState}>
                                    <Text style={{ fontSize: 48, textAlign: 'center', marginBottom: 16 }}>💬</Text>
                                    <Text style={[styles.emptyStateText, { color: colors.tint }]}>{t('notifications.youAreUpToDate')}</Text>
                                </View>
                            )}
                        </ScrollView>
                    ) : (
                        // PREVIOUS TAB - Show only read notifications
                        <ScrollView
                            style={styles.notificationsList}
                            showsVerticalScrollIndicator={false}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={onRefresh}
                                    tintColor={colors.tint}
                                    colors={[colors.tint]}
                                />
                            }
                        >
                            {/* This week's read notifications */}
                            {groupedNotifications.thisWeek.filter(n => n.read === true).length > 0 && (
                                <>
                                    <View style={[styles.sectionHeader, { borderBottomColor: colors.lightNonInteractiveText }]}> 
                                        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('notifications.thisWeek')}</Text>
                                    </View>
                                    {groupedNotifications.thisWeek.filter(n => n.read === true).map((notification) => (
                                        <TouchableOpacity
                                            key={notification.id}
                                            style={[styles.notificationCard, { backgroundColor: colors.contextBackground, opacity: 0.7 }]}
                                            onPress={() => setSelectedNotification(notification)}
                                        >
                                            <View style={styles.notificationContent}>
                                                <View style={[styles.avatar, { backgroundColor: colors.lightNonInteractiveText }]}> 
                                                    <Text style={styles.avatarText}>
                                                        {notification.avatar}
                                                    </Text>
                                                </View>
                                                <View style={styles.notificationText}>
                                                    <Text style={[styles.notificationTitle, { color: colors.lightDarkText }]}> 
                                                        {notification.title}
                                                    </Text>
                                                    {notification.subtitle && (
                                                        <Text style={[styles.notificationSubtitle, { color: colors.lightNonInteractiveText }]}> 
                                                            {notification.subtitle}
                                                        </Text>
                                                    )}
                                                    {notification.points && (
                                                        <Text style={[styles.notificationPoints, { color: colors.lightNonInteractiveText }]}> 
                                                            Mottok {notification.points} poeng
                                                        </Text>
                                                    )}
                                                    <Text style={[styles.notificationTime, { color: colors.lightNonInteractiveText }]}> 
                                                        {getRelativeTime(notification.timestamp)}
                                                    </Text>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </>
                            )}

                            {/* Earlier read notifications */}
                            {groupedNotifications.earlier.filter(n => n.read === true).length > 0 && (
                                <>
                                    <View style={[styles.sectionHeader, { borderBottomColor: colors.lightNonInteractiveText }]}> 
                                        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('notifications.earlier')}</Text>
                                    </View>
                                    {groupedNotifications.earlier.filter(n => n.read === true).map((notification) => (
                                        <TouchableOpacity
                                            key={notification.id}
                                            style={[styles.notificationCard, { backgroundColor: colors.contextBackground, opacity: 0.7 }]}
                                            onPress={() => setSelectedNotification(notification)}
                                        >
                                            <View style={styles.notificationContent}>
                                                <View style={[styles.avatar, { backgroundColor: colors.lightNonInteractiveText }]}> 
                                                    <Text style={styles.avatarText}>
                                                        {notification.avatar}
                                                    </Text>
                                                </View>
                                                <View style={styles.notificationText}>
                                                    <Text style={[styles.notificationTitle, { color: colors.lightDarkText }]}> 
                                                        {notification.title}
                                                    </Text>
                                                    {notification.subtitle && (
                                                        <Text style={[styles.notificationSubtitle, { color: colors.lightNonInteractiveText }]}> 
                                                            {notification.subtitle}
                                                        </Text>
                                                    )}
                                                    {notification.points && (
                                                        <Text style={[styles.notificationPoints, { color: colors.lightNonInteractiveText }]}> 
                                                            {t('notifications.receivedPoints', { count: notification.points })}
                                                        </Text>
                                                    )}
                                                    <Text style={[styles.notificationTime, { color: colors.lightNonInteractiveText }]}> 
                                                        {getRelativeTime(notification.timestamp)}
                                                    </Text>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </>
                            )}

                            {/* Show message if no read notifications */}
                            {notifications.filter(n => n.read === true).length === 0 && (
                                <View style={styles.emptyState}>
                                    <Text style={{ fontSize: 48, textAlign: 'center', marginBottom: 16 }}>💬</Text>
                                    <Text style={[styles.emptyStateText, { color: colors.lightDarkText }]}>{t('notifications.youAreUpToDate')}</Text>
                                </View>
                            )}
                        </ScrollView>
                    )}
                </View>
            </View>
            {/* Switcher Bar for notification-type */}
            <View style={[styles.bottomSwitcherContainer, { backgroundColor: colors.tabBarBackground }]}>
                <TouchableOpacity
                    style={[
                        styles.switcherTab,
                        selectedTab === 'unread' && { borderBottomWidth: 2, borderBottomColor: colors.tint }
                    ]}
                    onPress={() => setSelectedTab('unread')}
                >
                    <Text style={[
                        styles.switcherText,
                        { color: selectedTab === 'unread' ? colors.tint : colors.text }
                    ]}>
                        {t('notifications.unreadTab')}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.switcherTab,
                        selectedTab === 'previous' && { borderBottomWidth: 2, borderBottomColor: colors.tint }
                    ]}
                    onPress={() => setSelectedTab('previous')}
                >
                    <Text style={[
                        styles.switcherText,
                        { color: selectedTab === 'previous' ? colors.tint : colors.text }
                    ]}>
                        {t('notifications.previousTab')}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    subtitle: {
        fontSize: 14,
        marginTop: 4,
        textAlign: "left",
    },
    mainContent: {
        flex: 1,
        paddingBottom: 80, // Space for bottom switcher
    },
    bottomSwitcherContainer: {
        flexDirection: 'row',
        borderRadius: 0,
        padding: 2,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        marginHorizontal: 0,
        paddingHorizontal: 0,
    },
    switcherContainer: {
        flexDirection: 'row',
        borderRadius: 8,
        padding: 2,
        marginTop: 20,
        marginBottom: 20,
    },
    switcherTab: {
        flex: 1,
        paddingVertical: 16,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    switcherText: {
        fontSize: 14,
        fontWeight: '600',
    },
    contentContainer: {
        flex: 1,
        marginTop: 20,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    emptyStateSubtext: {
        fontSize: 14,
    },
    notificationsList: {
        flex: 1,
    },
    notificationCard: {
        padding: 4,
        marginBottom: 12,
        borderRadius: 12,
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.1)',
        elevation: 2,
    },
    readNotificationCard: {
        opacity: 0.7,
    },
    notificationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    notificationIconAndTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    notificationIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
    readNotificationTitle: {
        fontWeight: '500',
    },
    notificationMessage: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 2,
    },
    readNotificationMessage: {
        opacity: 0.8,
    },
    notificationTime: {
        fontSize: 12,
        fontWeight: '500',
    },
    sectionHeader: {
        paddingVertical: 8,
        marginBottom: 0,
        backgroundColor: 'transparent',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionDivider: {
        flex: 1,
        height: 1,
        borderBottomWidth: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'left',
    },
    notificationContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    notificationText: {
        flex: 1,
    },
    notificationSubtitle: {
        fontSize: 14,
        marginTop: 4,
    },
    notificationPoints: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 4,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: 8,
        marginTop: 8,
    },
});
