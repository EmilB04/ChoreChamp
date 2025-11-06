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
            <View>
                <Text>{notification.message}</Text>
                <Text>{notification.timestamp}</Text>
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
});
