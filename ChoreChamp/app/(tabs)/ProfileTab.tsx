import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import commonStyles from "../commonStyles";

export default function Profile() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();

    return (
        <View style={[{ backgroundColor: colors.background, flex: 1 }]}>
            {/* Header - Outside Safe Area */}
            <View style={[styles.header, { backgroundColor: colors.tint }]}>
                {/* Adjust marginTop to keep title level with rest */}
                <Text style={[styles.headerTitle, commonStyles.headerTitle]}>
                    Profil & {"\n"}Innstillinger
                </Text>
                <Image
                    source={{ uri: "https://i.pravatar.cc/150?" }}
                    style={styles.avatar}
                />
                <Text style={[styles.name, { color: colors.darkText }]}>Emil Berglund</Text>
                <View style={styles.separator} />
                <TouchableOpacity style={{ flexDirection: "row", alignItems: "flex-end", alignContent: "center", paddingVertical: 8, gap: 4 }}>
                    <Text style={styles.editProfile}>Rediger profil</Text>
                    <Ionicons name="create-outline" size={20} color={colors.darkText} />
                </TouchableOpacity>
            </View>

            {/* Settings */}
            <ScrollView style={[commonStyles.container, styles.menu, { flex: 1 }]}>
                <MenuItem
                    icon="person-circle"
                    title="Min konto"
                    description="Administrer kontoinformasjon og personlige innstillinger"
                />

                <MenuItem
                    icon="people"
                    title="Mine husstander"
                    description="Se og administrer dine tilknyttede husstander"
                />

                <MenuItem
                    icon="cog"
                    title="App innstillinger"
                    description="Tilpass appens funksjonalitet og utseende"
                />

                <MenuItem
                    icon="log-out"
                    title="Logg ut"
                    description="Logg ut av din konto"
                />

                <Text style={[styles.more, { color: colors.lightDarkText }]}>Mer</Text>

                <MenuItem
                    icon="help-circle"
                    title="Hjelp og støtte"
                    description="Få hjelp og kontakt kundestøtte"
                />

                <MenuItem
                    icon="information-circle"
                    title="Om appen"
                    description="Informasjon om appen og utviklerne"
                />
            </ScrollView>
        </View>
    );
}

function MenuItem({
    icon,
    title,
    description,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    description?: string;
}) {
    const { colors } = useTheme();

    return (
        <TouchableOpacity style={styles.menuItem}>
            <View style={styles.iconContainer}>
                <Ionicons
                    name={icon}
                    size={24}
                    color={colors.tint}
                />
            </View>
            <View style={styles.menuContent}>
                <Text style={[styles.menuText, { color: colors.text }]}>{title}</Text>
                {description && <Text style={[styles.description, { color: colors.lightDarkText }]}>{description}</Text>}
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.lightDarkText} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    header: {
        width: "100%",
        alignItems: "center",
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        paddingBottom: 20,
    },
    headerTitle: {
        alignSelf: 'flex-start',
    },
    profileSection: {
        alignItems: "center",
        paddingBottom: 15,
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 10,
    },
    profileName: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 4,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: "rgba(255, 255, 255, 0.3)",
        marginBottom: 10,
    },
    name: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1f2937",
        marginBottom: 4,
    },
    separator: {
        width: '80%',
        height: 1.5,
        backgroundColor: "black",
        opacity: 0.8,
        marginTop: 5,
        marginBottom: 0,
    },
    editProfile: {
        fontSize: 16,
        color: "#1f2937",
        fontWeight: "500",
        padding: 0,
    },
    menu: {
        flex: 1,
        paddingTop: 20,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "stretch",
        paddingVertical: 12,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        justifyContent: "space-between",
    },
    iconContainer: {
        width: 32,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    menuContent: {
        flex: 1,
        justifyContent: "center",
    },
    menuHeader: {
        flexDirection: "row",
        alignItems: "center",
    },
    menuText: {
        fontSize: 16,
        fontWeight: "500",
    },
    description: {
        fontSize: 14,
        marginTop: 4,
        wordWrap: 'break-word',
    },
    more: {
        paddingLeft: 0,
        paddingTop: 10,
    },
});
