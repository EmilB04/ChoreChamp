import Ionicons from "@expo/vector-icons/build/Ionicons";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";

interface Notification {
    id: number;
    title: string;
    subtitle: string | null;
    message: string;
    timestamp: string;
    read: boolean
    type: "task_created" | "task_completed";
    avatar: string;
    points: number | null;
}

export default function Notification({ notification }: { notification: Notification }) {
    const onClose = () => {

    }

    return (
        <ScrollView>
            {/* Header */}
            <View>
                <Text>{notification.title}</Text>
                <TouchableOpacity onPress={onClose}>
                    <Ionicons name="close" size={28} />
                </TouchableOpacity>
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

});
