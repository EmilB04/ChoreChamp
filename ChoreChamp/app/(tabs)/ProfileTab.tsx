import React from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Profile() {
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profil & {"\n"}Innstillinger</Text>
                <Image
                    source={{ uri: "https://i.pravatar.cc/150?" }}
                    style={styles.avatar}
                />
                <Text style={styles.name}>Emil Berglund</Text>
                <TouchableOpacity>
                    <Text style={styles.editProfile}>Rediger profil</Text>
                </TouchableOpacity>
            </View>

            {/* Settings */}
            <ScrollView style={styles.menu}>
                <MenuItem icon="person-circle" title="Min konto" />
                <MenuItem icon="people" title="Mine husstander" />
                <MenuItem icon="cog" title="App innstillinger" />
                <MenuItem icon="log-out" title="Logg ut" />
                <Text style={styles.more}>Mer</Text>
                <MenuItem icon="help-circle" title="Hjelp og støtte" />
                <MenuItem icon="information-circle" title="Om appen" />
            </ScrollView>
        </View>
    );
}

function MenuItem({
    icon,
    title,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
}) {
    return (
        <TouchableOpacity style={styles.menuItem}>
            <Ionicons
                name={icon}
                size={22}
                color="#fbbf24"
                style={{ marginRight: 10 }}
            />
            <Text style={styles.menuText}>{title}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#111" },
    header: {
        backgroundColor: "#fbbf24",
        paddingBottom: 30,
        paddingInline: 30,
        alignItems: "center",
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTitle: {
        alignSelf: "flex-start",
        marginTop: 80,
        fontSize: 24,
        fontWeight: "bold",
        color: "#000",
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginTop: 15,
        borderWidth: 2,
        borderColor: "#000",
    },
    name: { fontSize: 22, fontWeight: "600", color: "#000", marginTop: 10 },
    editProfile: { fontSize: 14, color: "#444", marginTop: 5 },
    menu: { marginTop: 20, paddingHorizontal: 20 },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 15,
        borderBottomColor: "#333",
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    menuText: { color: "#fff", fontSize: 16 },
    more: {
        color: "#888",
        fontSize: 14,
        marginTop: 30,
        marginBottom: 10,
        marginLeft: 5,
    },
});
