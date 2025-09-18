import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function Notifications() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? "light"];

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Varsler</Text>
                <Text style={[styles.subtitle, { color: colors.icon }]}>
                    Du har ingen nye varsler akkurat nå.
                </Text>
            </View>

            <View style={styles.content}>
                <View style={styles.emptyState}>
                    <IconSymbol size={64} name="bell.slash" color={colors.icon} />
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>
                        Ingen varsler
                    </Text>
                    <Text style={[styles.emptyDescription, { color: colors.icon }]}>
                        Du har ingen nye varsler akkurat nå.
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 20,
        marginHorizontal: 30,
        marginBottom: 30,
    },
    title: {
        fontSize: 32,
        textAlign: "left",
        fontWeight: "bold",
        marginTop: 20,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        opacity: 0.7,
    },
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
    },
    emptyState: {
        alignItems: "center",
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: "600",
        marginTop: 20,
        marginBottom: 12,
    },
    emptyDescription: {
        fontSize: 16,
        textAlign: "center",
        lineHeight: 24,
    },
});
