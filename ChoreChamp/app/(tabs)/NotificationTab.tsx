import { useTheme } from "@/contexts/ThemeContext";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import commonStyles from "../commonStyles";

export default function Notifications() {
    const { colors } = useTheme();
    const [selectedTab, setSelectedTab] = useState<'unread' | 'previous'>('unread');

    return (
        <View style={[commonStyles.container, { backgroundColor: colors.background }]}>
            <View style={styles.mainContent}>
                <Text style={[commonStyles.headerTitle, { color: colors.text }]}>
                    Varsler
                </Text>
                <Text style={[styles.subtitle, { color: colors.lightDarkText }]}>
                    Du har ingen varsler akkurat nå.
                </Text>

                {/* Content based on selected tab */}
                <View style={styles.contentContainer}>
                    {selectedTab === 'unread' ? (
                        <Text style={[styles.subtitle, { color: colors.lightText }]}>
                            <View style={{ alignItems: 'center' }}>
                                <Text style={[styles.subtitle, { color: colors.lightDarkText }]}>
                                    Du er ajour
                                </Text>
                            </View>
                        </Text>
                    ) : (
                        <Text style={[styles.subtitle, { color: colors.lightDarkText }]}>
                            Ingen tidligere varsler å vise.
                        </Text>
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
    },
    bottomSwitcherContainer: {
        flexDirection: 'row',
        borderRadius: 0,
        padding: 2,
        position: 'absolute',
        bottom: 0, // Position above the tab bar
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
        justifyContent: 'center',
        alignItems: 'center',
    },
});
