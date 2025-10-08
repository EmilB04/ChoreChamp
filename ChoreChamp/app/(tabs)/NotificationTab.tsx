import { useTheme } from "@/contexts/ThemeContext";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import commonStyles from "../commonStyles";
import { ThemedText } from '@/components/themed-text';

export default function Notifications() {
    const { colors } = useTheme();
    const [selectedTab, setSelectedTab] = useState<'unread' | 'previous'>('unread');



    // Simulated notification data - Replace with real data from DB or API
    const [notifications] = useState([
        {
            id: 1,
            title: "Mamma laget oppgaven",
            subtitle: "Rydde rom",
            message: "Gjentagende annenhver dag",
            timestamp: "2025-10-08T09:30:00Z",
            read: false,
            type: "task_assigned" as const,
            avatar: "M",
            points: null,
        },
        {
            id: 2,
            title: "Ida T. fullførte Gå med søpla",
            subtitle: null,
            message: "Mottok 10 poeng",
            timestamp: "2025-10-07T15:30:00Z",
            read: false,
            type: "task_completed" as const,
            avatar: "I",
            points: 10,
        },
        {
            id: 3,
            title: "Pappa fullførte Støvsuge",
            subtitle: null,
            message: "Mottok 15 poeng",
            timestamp: "2025-10-05T10:00:00Z",
            read: true,
            type: "task_completed" as const,
            avatar: "P",
            points: 15,
        },
        {
            id: 4,
            title: "Emil fullførte Vaske opp",
            subtitle: null,
            message: "Mottok 8 poeng",
            timestamp: "2025-09-30T14:20:00Z",
            read: true,
            type: "task_completed" as const,
            avatar: "E",
            points: 8,
        },
    ]);

    // Group notifications by time periods
    const groupNotificationsByTime = () => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thisWeek = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));

        const groups = {
            today: [] as typeof notifications,
            thisWeek: [] as typeof notifications,
            earlier: [] as typeof notifications,
        };

        notifications.forEach(notification => {
            const notificationDate = new Date(notification.timestamp);
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

    // Function to get relative time
    const getRelativeTime = (timestamp: string) => {
        const now = new Date();
        const notificationTime = new Date(timestamp);
        const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));

        if (diffInMinutes < 60) return `${diffInMinutes} min siden`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} timer siden`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays === 1) return "1 dag siden";

        return `${diffInDays} dager siden`;
    };


    return (
        <View style={[commonStyles.container, { backgroundColor: colors.background }]}>
            <View style={styles.mainContent}>
                <Text style={[commonStyles.headerTitle, { color: colors.text }]}>
                    Varsler
                </Text>
                {unreadNotifications.length > 0 && (
                    <Text style={[styles.subtitle, { color: colors.lightDarkText }]}>
                        Du har <Text style={{ color: colors.tint }}>{unreadNotifications.length} uleste varslinger</Text>
                    </Text>
                )}

                {/* Content */}
                <View style={styles.contentContainer}>
                    {selectedTab === 'unread' ? (
                        // UNREAD TAB - Show only unread notifications
                        <ScrollView
                            style={styles.notificationsList}
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Today's unread notifications */}
                            {groupedNotifications.today.filter(n => !n.read).length > 0 && (
                                <>
                                    <View style={[styles.sectionHeader, { borderBottomColor: colors.lightNonInteractiveText }]}>
                                        <ThemedText style={[styles.sectionTitle, { color: colors.lightNonInteractiveText }]}>I dag</ThemedText>
                                    </View>
                                    {groupedNotifications.today.filter(n => !n.read).map((notification) => (
                                        <View
                                            key={notification.id}
                                            style={[styles.notificationCard, { backgroundColor: colors.contextBackground }]}
                                        >
                                            <View style={styles.notificationContent}>
                                                <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
                                                    <ThemedText style={styles.avatarText}>
                                                        {notification.avatar}
                                                    </ThemedText>
                                                </View>
                                                <View style={styles.notificationText}>
                                                    <ThemedText style={[styles.notificationTitle, { color: colors.text }]}>
                                                        {notification.title}
                                                    </ThemedText>
                                                    <ThemedText style={[styles.notificationSubtitle, { color: colors.lightDarkText }]}>
                                                        {notification.subtitle}
                                                    </ThemedText>
                                                    <ThemedText style={[styles.notificationPoints, { color: colors.tint }]}>
                                                        {notification.points}
                                                    </ThemedText>
                                                    <ThemedText style={[styles.notificationTime, { color: colors.lightNonInteractiveText }]}>
                                                        {getRelativeTime(notification.timestamp)}
                                                    </ThemedText>
                                                </View>
                                                {!notification.read && <View style={[styles.unreadDot, { backgroundColor: colors.tint }]} />}
                                            </View>
                                        </View>
                                    ))}
                                </>
                            )}

                            {/* This week's unread notifications */}
                            {groupedNotifications.thisWeek.filter(n => !n.read).length > 0 && (
                                <>
                                    <View style={[styles.sectionHeader, { borderBottomColor: colors.lightNonInteractiveText }]}>
                                        <ThemedText style={[styles.sectionTitle, { color: colors.lightNonInteractiveText }]}>Denne uken</ThemedText>
                                    </View>
                                    {groupedNotifications.thisWeek.filter(n => !n.read).map((notification) => (
                                        <View
                                            key={notification.id}
                                            style={[styles.notificationCard, { backgroundColor: colors.contextBackground }]}
                                        >
                                            <View style={styles.notificationContent}>
                                                <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
                                                    <ThemedText style={styles.avatarText}>
                                                        {notification.avatar}
                                                    </ThemedText>
                                                </View>
                                                <View style={styles.notificationText}>
                                                    <ThemedText style={[styles.notificationTitle, { color: colors.text }]}>
                                                        {notification.title}
                                                    </ThemedText>
                                                    <ThemedText style={[styles.notificationSubtitle, { color: colors.lightDarkText }]}>
                                                        {notification.subtitle}
                                                    </ThemedText>
                                                    <ThemedText style={[styles.notificationPoints, { color: colors.tint }]}>
                                                        {notification.points}
                                                    </ThemedText>
                                                    <ThemedText style={[styles.notificationTime, { color: colors.lightNonInteractiveText }]}>
                                                        {getRelativeTime(notification.timestamp)}
                                                    </ThemedText>
                                                </View>
                                                {!notification.read && <View style={[styles.unreadDot, { backgroundColor: colors.tint }]} />}
                                            </View>
                                        </View>
                                    ))}
                                </>
                            )}

                            {/* Earlier unread notifications */}
                            {groupedNotifications.earlier.filter(n => !n.read).length > 0 && (
                                <>
                                    <View style={[styles.sectionHeader, { borderBottomColor: colors.lightNonInteractiveText }]}>
                                        <ThemedText style={[styles.sectionTitle, { color: colors.lightNonInteractiveText }]}>Tidligere</ThemedText>
                                    </View>
                                    {groupedNotifications.earlier.filter(n => !n.read).map((notification) => (
                                        <View
                                            key={notification.id}
                                            style={[styles.notificationCard, { backgroundColor: colors.contextBackground }]}
                                        >
                                            <View style={styles.notificationContent}>
                                                <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
                                                    <ThemedText style={styles.avatarText}>
                                                        {notification.avatar}
                                                    </ThemedText>
                                                </View>
                                                <View style={styles.notificationText}>
                                                    <ThemedText style={[styles.notificationTitle, { color: colors.text }]}>
                                                        {notification.title}
                                                    </ThemedText>
                                                    <ThemedText style={[styles.notificationSubtitle, { color: colors.lightDarkText }]}>
                                                        {notification.subtitle}
                                                    </ThemedText>
                                                    <ThemedText style={[styles.notificationPoints, { color: colors.tint }]}>
                                                        {notification.points}
                                                    </ThemedText>
                                                    <ThemedText style={[styles.notificationTime, { color: colors.lightNonInteractiveText }]}>
                                                        {getRelativeTime(notification.timestamp)}
                                                    </ThemedText>
                                                </View>
                                                {!notification.read && <View style={[styles.unreadDot, { backgroundColor: colors.tint }]} />}
                                            </View>
                                        </View>
                                    ))}
                                </>
                            )}

                            {/* Show message if no unread notifications */}
                            {unreadNotifications.length === 0 && (
                                <View style={styles.emptyState}>
                                    <Text style={{ fontSize: 48, textAlign: 'center', marginBottom: 16 }}>💬</Text>
                                    <ThemedText style={[styles.emptyStateText, { color: colors.tint }]}>Du er ajour</ThemedText>
                                </View>
                            )}
                        </ScrollView>
                    ) : (
                        // PREVIOUS TAB - Show only read notifications
                        <ScrollView
                            style={styles.notificationsList}
                            showsVerticalScrollIndicator={false}
                        >
                            {/* This week's read notifications */}
                            {groupedNotifications.thisWeek.filter(n => n.read).length > 0 && (
                                <>
                                    <View style={[styles.sectionHeader, { borderBottomColor: colors.lightNonInteractiveText }]}>
                                        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Denne uken</ThemedText>
                                    </View>
                                    {groupedNotifications.thisWeek.filter(n => n.read).map((notification) => (
                                        <View
                                            key={notification.id}
                                            style={[styles.notificationCard, { backgroundColor: colors.contextBackground, opacity: 0.7 }]}
                                        >
                                            <View style={styles.notificationContent}>
                                                <View style={[styles.avatar, { backgroundColor: colors.lightNonInteractiveText }]}>
                                                    <ThemedText style={styles.avatarText}>
                                                        {notification.avatar}
                                                    </ThemedText>
                                                </View>
                                                <View style={styles.notificationText}>
                                                    <ThemedText style={[styles.notificationTitle, { color: colors.lightDarkText }]}>
                                                        {notification.title}
                                                    </ThemedText>
                                                    {notification.subtitle && (
                                                        <ThemedText style={[styles.notificationSubtitle, { color: colors.lightNonInteractiveText }]}>
                                                            {notification.subtitle}
                                                        </ThemedText>
                                                    )}
                                                    {notification.points && (
                                                        <ThemedText style={[styles.notificationPoints, { color: colors.lightNonInteractiveText }]}>
                                                            Mottok {notification.points} poeng
                                                        </ThemedText>
                                                    )}
                                                    <ThemedText style={[styles.notificationTime, { color: colors.lightNonInteractiveText }]}>
                                                        {getRelativeTime(notification.timestamp)}
                                                    </ThemedText>
                                                </View>
                                            </View>
                                        </View>
                                    ))}
                                </>
                            )}

                            {/* Earlier read notifications */}
                            {groupedNotifications.earlier.filter(n => n.read).length > 0 && (
                                <>
                                    <View style={[styles.sectionHeader, { borderBottomColor: colors.lightNonInteractiveText }]}>
                                        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Tidligere</ThemedText>
                                    </View>
                                    {groupedNotifications.earlier.filter(n => n.read).map((notification) => (
                                        <View
                                            key={notification.id}
                                            style={[styles.notificationCard, { backgroundColor: colors.contextBackground, opacity: 0.7 }]}
                                        >
                                            <View style={styles.notificationContent}>
                                                <View style={[styles.avatar, { backgroundColor: colors.lightNonInteractiveText }]}>
                                                    <ThemedText style={styles.avatarText}>
                                                        {notification.avatar}
                                                    </ThemedText>
                                                </View>
                                                <View style={styles.notificationText}>
                                                    <ThemedText style={[styles.notificationTitle, { color: colors.lightDarkText }]}>
                                                        {notification.title}
                                                    </ThemedText>
                                                    {notification.subtitle && (
                                                        <ThemedText style={[styles.notificationSubtitle, { color: colors.lightNonInteractiveText }]}>
                                                            {notification.subtitle}
                                                        </ThemedText>
                                                    )}
                                                    {notification.points && (
                                                        <ThemedText style={[styles.notificationPoints, { color: colors.lightNonInteractiveText }]}>
                                                            Mottok {notification.points} poeng
                                                        </ThemedText>
                                                    )}
                                                    <ThemedText style={[styles.notificationTime, { color: colors.lightNonInteractiveText }]}>
                                                        {getRelativeTime(notification.timestamp)}
                                                    </ThemedText>
                                                </View>
                                            </View>
                                        </View>
                                    ))}
                                </>
                            )}

                            {/* Show message if no read notifications */}
                            {notifications.filter(n => n.read).length === 0 && (
                                <View style={styles.emptyState}>
                                    <Text style={{ fontSize: 48, textAlign: 'center', marginBottom: 16 }}>💬</Text>
                                    <ThemedText style={[styles.emptyStateText, { color: colors.lightDarkText }]}>Du er ajour</ThemedText>
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
                        Uleste
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
                        Tidligere varsler
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
        padding: 16,
        marginBottom: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
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
    unreadIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#F59E0B',
        marginTop: 4,
    },
    notificationMessage: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 8,
    },
    readNotificationMessage: {
        opacity: 0.8,
    },
    notificationTime: {
        fontSize: 12,
        fontWeight: '500',
    },
    sectionHeader: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        backgroundColor: 'transparent',
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
