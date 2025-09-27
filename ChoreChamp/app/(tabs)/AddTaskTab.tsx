import { useTheme } from "@/contexts/ThemeContext";
import React, { useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import commonStyles from "../commonStyles";

export default function AddTask() {
    const { colors } = useTheme();
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    // Get current date and calculate next two days
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(today.getDate() + 2);

    const dateOptions = [
        {
            date: today,
            label: today.getDate().toString(),
            dayName: getDayName(today),
            isToday: false,
        },
        {
            date: tomorrow,
            label: tomorrow.getDate().toString(),
            dayName: getDayName(tomorrow),
            isToday: false,
        },
        {
            date: dayAfterTomorrow,
            label: dayAfterTomorrow.getDate().toString(),
            dayName: getDayName(dayAfterTomorrow),
            isToday: false,
        },
    ];

    function getDayName(date: Date): string {
        const days = ["Søndag", "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag"];
        return days[date.getDay()];
    }

    function formatDate(date: Date): string {
        return date.toISOString().split('T')[0];
    }

    return (
        <ScrollView
            style={[commonStyles.container, { backgroundColor: colors.background }]}
        >
            <View>
                <Text style={[commonStyles.headerTitle, { color: colors.text }]}>
                    Opprett nytt {"\n"}gjøremål
                </Text>
            </View>

            <View style={styles.dateSection}>
                <Text style={[commonStyles.sectionTitle, { color: colors.text }]}>
                    Velg dato
                </Text>

                <View style={styles.dateOptionsContainer}>
                    {dateOptions.map((option, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.dateOption,
                                option.isToday && styles.dateOptionSelected,
                                formatDate(selectedDate) === formatDate(option.date) && styles.dateOptionSelected
                            ]}
                            onPress={() => setSelectedDate(option.date)}
                        >
                            <Text style={[
                                styles.dateNumber,
                                (option.isToday || formatDate(selectedDate) === formatDate(option.date)) && styles.dateNumberSelected
                            ]}>
                                {option.label}
                            </Text>
                            <Text style={[
                                styles.dayName,
                                (option.isToday || formatDate(selectedDate) === formatDate(option.date)) && styles.dayNameSelected
                            ]}>
                                {option.dayName}
                            </Text>
                        </TouchableOpacity>
                    ))}

                    <TouchableOpacity
                        style={[
                            styles.dateOption,
                            styles.anyDateOption
                        ]}
                        onPress={() => {
                            // TODO: Open date picker modal
                            console.log("Open date picker");
                        }}
                    >
                        <Text style={styles.anyDateText}>Annen</Text>
                        <Text style={styles.anyDateSubText}>dato</Text>
                    </TouchableOpacity>
                </View>
            </View>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    dateSection: {
        marginTop: 20,
    },
    dateOptionsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 15,
        paddingHorizontal: 5,
    },
    dateOption: {
        flex: 1,
        marginHorizontal: 5,
        paddingVertical: 20,
        paddingHorizontal: 10,
        borderRadius: 12,
        backgroundColor: "#E5E5EA",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 80,
    },
    dateOptionSelected: {
        backgroundColor: "#F59E0B", // Amber/yellow color like in the image
    },
    dateNumber: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#000",
        marginBottom: 4,
    },
    dateNumberSelected: {
        color: "#FFF",
    },
    dayName: {
        fontSize: 14,
        color: "#666",
        fontWeight: "500",
    },
    dayNameSelected: {
        color: "#FFF",
    },
    anyDateOption: {
        backgroundColor: "#E5E5EA",
    },
    anyDateText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#666",
        marginBottom: 2,
    },
    anyDateSubText: {
        fontSize: 14,
        color: "#666",
        fontWeight: "500",
    },
});
