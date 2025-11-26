/*
    Notification Detail Component for ChoreChamp Application
    This component displays detailed information about a specific notification,
    including its title, message, timestamp, and related task details if available.
    Users can mark notifications as read or unread, and navigate back to the previous screen.
*/

import { useTheme } from '@/contexts/ThemeContext';
import { db } from '@/lib/firebase';
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import Header from '../profile/Header';

interface NotificationType {
    id: string;
    title: string;
    subtitle?: string | null;
    message: string;
    timestamp: any;
    read: boolean;
    type: "task_completed" | "task_assigned";
    avatar: string;
    points?: number | null;
        taskId?: string; // Link to the related task
        endTime?: any; // Optional end time for the task (Frist)
}

interface NotificationProps {
    notification: NotificationType;
    onBack: () => void;
    onToggleReadStatus: (notificationId: string, readStatus: boolean) => void;
    rightElement?: React.ReactNode;
}

export default function Notification({ notification, onBack, onToggleReadStatus, rightElement }: NotificationProps) {
    const { colors } = useTheme();
    const { t } = useTranslation('app');

    const [task, setTask] = useState<any>(null);
    const [readStatus, setReadStatus] = useState<boolean | null>(notification.read);
    const [readStatusLoading, setReadStatusLoading] = useState(false);

    // Fetch task as before
    useEffect(() => {
        const fetchTask = async () => {
            if (notification.taskId) {
                try {
                    const taskRef = doc(db, 'tasks', notification.taskId!);
                    const taskSnap = await getDoc(taskRef);
                    if (taskSnap.exists()) {
                        setTask(taskSnap.data());
                    }
                } catch (e) {
                    console.error('Error fetching task for notification:', e);
                }
            }
        };
        fetchTask();
    }, [notification.taskId]);

    // Fetch latest read status from Firestore
    useEffect(() => {
        const fetchReadStatus = async () => {
            setReadStatusLoading(true);
            try {
                const notifRef = doc(db, 'notifications', notification.id);
                const notifSnap = await getDoc(notifRef);
                if (notifSnap.exists()) {
                    const data = notifSnap.data();
                    setReadStatus(data.read);
                } else {
                    setReadStatus(notification.read);
                }
            } catch (e) {
                console.error('Error fetching read status for notification:', e);
                setReadStatus(notification.read);
            } finally {
                setReadStatusLoading(false);
            }
        };
        fetchReadStatus();
    }, [notification.id , notification.read]);

    const formatTimestamp = (timestamp: any): string => {
        const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${day}.${month}.${year}, ${hours}:${minutes}`;
    };

    const handleToggleReadStatus = () => {
        onToggleReadStatus(notification.id, !notification.read);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}> 
            <Header 
                title={t('notifications.detailTitle')}
                onBack={onBack}
                rightElement={rightElement}
            />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Notification Details Section */}
                <View style={styles.section}>
                    <View style={[styles.infoCard, { backgroundColor: colors.contextBackground }]}> 
                        <View style={styles.avatarContainer}>
                            <Text style={[styles.avatarText, { color: colors.text }]}>{notification.avatar}</Text>
                        </View>
                        <View style={styles.messageContainer}>
                            <Text style={[styles.messageTitle, { color: colors.text }]}>{notification.title}</Text>
                            <Text style={[styles.messageText, { color: colors.text }]}> 
                                {notification.subtitle ? `${notification.subtitle}, ` : ''}{notification.message ? notification.message.toLowerCase() : ''}
                            </Text>
                        </View>
                        {/* Deadline row - use i18n for the label */}
                        <View style={styles.infoRow}> 
                            <Text style={[styles.infoLabel, { color: colors.lightDarkText }]}>{t('notifications.timeLabel')}</Text>
                            <Text style={[styles.infoValue, { color: colors.text }]}> 
                                {task?.timeEnd
                                    ? formatTimestamp(task.timeEnd?.toDate ? task.timeEnd.toDate() : task.timeEnd)
                                    : formatTimestamp(notification.timestamp)}
                            </Text>
                        </View>
                        {typeof notification.points === 'number' && !isNaN(notification.points) && (
                            <View style={styles.infoRow}> 
                                <Text style={[styles.infoLabel, { color: colors.lightDarkText }]}>{t('notifications.pointsLabel')}</Text>
                                <Text style={[styles.infoValue, { color: colors.text }]}>{notification.points} {t('points.short')}</Text>
                            </View>
                        )}
                        <View style={styles.infoRow}> 
                            <Text style={[styles.infoLabel, { color: colors.lightDarkText }]}>{t('notifications.statusLabel')}</Text>
                            <Text style={[styles.infoValue, { color: colors.text }]}> 
                                {readStatusLoading
                                    ? t('loading')
                                    : readStatus
                                        ? t('notifications.readLabel')
                                        : t('notifications.unreadLabel')}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Actions Section */}
                {!notification.read ? (
                    <View style={styles.section}> 
                        <TouchableOpacity 
                            style={[styles.actionButton, { backgroundColor: colors.tint }]}
                            onPress={handleToggleReadStatus}
                        >
                            <Ionicons name="checkmark-circle-outline" size={20} color={colors.darkText} />
                            <Text style={[styles.actionButtonText, { color: colors.darkText }]}>{t('notifications.markAsRead')}</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.section}> 
                        <TouchableOpacity 
                            style={[styles.actionButton, { backgroundColor: colors.contextBackground, borderWidth: 2, borderColor: colors.tint }]}
                            onPress={handleToggleReadStatus}
                        >
                            <Ionicons name="mail-unread-outline" size={20} color={colors.tint} />
                            <Text style={[styles.actionButtonText, { color: colors.tint }]}>{t('notifications.markAsUnread')}</Text>
                        </TouchableOpacity>
                    </View>
                )}
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
    infoCard: {
        borderRadius: 12,
        padding: 16,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarText: {
        fontSize: 40,
    },
    messageContainer: {
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    },
    messageTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 8,
        textAlign: 'center',
    },
    messageText: {
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center',
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
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
