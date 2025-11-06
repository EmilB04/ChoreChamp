import Ionicons from "@expo/vector-icons/build/Ionicons";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useTheme } from '@/contexts/ThemeContext';
import Header from '../profile/Header';

interface Notification {
    id: number;
    title: string;
    subtitle: string | null;
    message: string;
    timestamp: string;
    read: boolean
    type: "task_created" | "task_completed" | "task_assigned";
    avatar: string;
    points: number | null;
}

interface NotificationProps {
    notification: Notification;
    onBack: () => void;
    rightElement?: React.ReactNode;
}

export default function Notification({ notification, onBack, rightElement }: NotificationProps) {
    const { colors } = useTheme();

    const formatTimestamp = (timestamp: string): string => {
        const date = new Date(timestamp);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${day}.${month}.${year}, ${hours}:${minutes}`;
    };

    const handleMarkAsRead = () => {
        // Implement mark as read logic
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Header 
                title={notification.title} 
                onBack={onBack}
                rightElement={rightElement}
            />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Notification Details Section */}
                <View style={styles.section}>
                    <View style={[styles.infoCard, { backgroundColor: colors.contextBackground }]}>
                        <View style={styles.avatarContainer}>
                            {notification.avatar}
                        </View>
                        
                        <View style={styles.messageContainer}>
                            <Text style={[styles.messageText, { color: colors.text }]}>
                                {notification.subtitle && `${notification.subtitle}, `}
                                {notification.message.toLowerCase()}
                            </Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, { color: colors.lightDarkText }]}>
                                Tidspunkt
                            </Text>
                            <Text style={[styles.infoValue, { color: colors.text }]}>
                                {formatTimestamp(notification.timestamp)}
                            </Text>
                        </View>

                        {notification.points !== null && (
                            <View style={styles.infoRow}>
                                <Text style={[styles.infoLabel, { color: colors.lightDarkText }]}>
                                    Poeng
                                </Text>
                                <Text style={[styles.infoValue, { color: colors.text }]}>
                                    {notification.points}
                                </Text>
                            </View>
                        )}

                        <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, { color: colors.lightDarkText }]}>
                                Status
                            </Text>
                            <Text style={[styles.infoValue, { color: colors.text }]}>
                                {notification.read ? "Lest ✅" : "Ulest ❌"}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Actions Section */}
                {!notification.read && (
                    <View style={styles.section}>
                        <TouchableOpacity 
                            style={[styles.actionButton, { backgroundColor: colors.tint }]}
                            onPress={handleMarkAsRead}
                        >
                            <Ionicons name="checkmark-circle-outline" size={20} color={colors.darkText} />
                            <Text style={[styles.actionButtonText, { color: colors.darkText }]}>
                                Marker som lest
                            </Text>
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
    messageContainer: {
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.1)',
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
