import Ionicons from "@expo/vector-icons/build/Ionicons";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useTheme } from '@/contexts/ThemeContext';

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

    return (
        <ScrollView>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.tint }]}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.darkText} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.darkText }]}>
                    {notification.title}
                </Text>
                <View>
                    {rightElement}
                </View>
            </View>

            {/* Content */}
            <View style={styles.content}>
                <View>
                    {notification.avatar}
                </View>
                <Text>{notification.subtitle}, {notification.message.toLocaleLowerCase()}</Text>
                <Text style={styles.timestampText}>{formatTimestamp(notification.timestamp)}</Text>
            </View>
            <View>
                
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 60,
        marginBottom: 20,
        paddingHorizontal: 15,
        paddingBottom: 10,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        alignItems: 'center',
    },
    timestampText: {
        fontSize: 12,
        color: '#666',
        marginTop: 8,
    }
});
