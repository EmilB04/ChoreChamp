import Calendar from "@/components/ui/Calendar";
import { useTheme } from "@/contexts/ThemeContext";
import React, { useEffect, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import commonStyles from "../commonStyles";


// TODO: Make own function of time related things eg. currentHour and currentMinute

export default function AddTask() {
    const { colors } = useTheme();
    
    // Initialize selectedDate normalized to midnight
    const [selectedDate, setSelectedDate] = useState<Date>(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    });
    const [showCalendar, setShowCalendar] = useState(false);
    
    function calculateTimes() {
        const currentHour = new Date().getHours();
        const currentMinute = new Date().getMinutes();
        const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
        const futureHour = (currentHour + 2) % 24; // Wrap around after 23
        const futureTime = `${futureHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
        return { currentTime, futureTime };
    };

    useEffect(() => {
        const { currentTime, futureTime } = calculateTimes();
        setStartTime(currentTime);
        setEndTime(futureTime);
    }, []);

    const [startTime, setStartTime] = useState(calculateTimes().currentTime);
    const [endTime, setEndTime] = useState(calculateTimes().futureTime);
    const [selectedTimePreset, setSelectedTimePreset] = useState<string | null>(null);


    // Get current date and calculate next two days (normalized to midnight)
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const dayAfterTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2);

    const dateOptions = [
        {
            date: today,
            label: today.getDate().toString(),
            dayName: getDayName(today),
        },
        {
            date: tomorrow,
            label: tomorrow.getDate().toString(),
            dayName: getDayName(tomorrow),
        },
        {
            date: dayAfterTomorrow,
            label: dayAfterTomorrow.getDate().toString(),
            dayName: getDayName(dayAfterTomorrow),
        },
    ];

    function getDayName(date: Date): string {
        const days = ["Søndag", "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag"];
        return days[date.getDay()];
    }

    // Check if selected date is one of the preset dates
    const isPresetDate = dateOptions.some(option => option.date.getTime() === selectedDate.getTime());
    
    // Check if "Annen dato" button should be active
    const isCustomDateActive = !isPresetDate;

    const openCalendar = () => {
        setShowCalendar(true);
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
    };

    return (
        <>
        <ScrollView
            style={[commonStyles.container, { backgroundColor: colors.background }]}
        >
            <View>
                <Text style={[commonStyles.headerTitle, { color: colors.text }]}>
                    Opprett nytt {"\n"}gjøremål
                </Text>
            </View>

            {/* Date Selection */}
            <View style={styles.dateSection}>
                <Text style={[commonStyles.sectionTitle, { color: colors.text }]}>
                    Velg dato
                </Text>
                <View style={[styles.dateOptionsContainer, { backgroundColor: colors.contextBackground }]}>
                    {dateOptions.map((option, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.dateOption,
                                { backgroundColor: colors.nonInteractiveBackground },
                                selectedDate.getTime() === option.date.getTime() && { backgroundColor: colors.tint }
                            ]}
                            onPress={() => setSelectedDate(option.date)}
                        >
                            <Text style={[
                                styles.dateNumber,
                                { color: colors.text },
                                selectedDate.getTime() === option.date.getTime() && { color: colors.darkText }
                            ]}>
                                {option.label}
                            </Text>
                            <Text style={[
                                styles.dayName,
                                { color: colors.lightDarkText },
                                selectedDate.getTime() === option.date.getTime() && { color: colors.darkText }
                            ]}>
                                {option.dayName}
                            </Text>
                        </TouchableOpacity>
                    ))}

                    <TouchableOpacity
                        style={[
                            styles.dateOption,
                            { backgroundColor: isCustomDateActive ? colors.tint : colors.nonInteractiveBackground }
                        ]}
                        onPress={openCalendar}
                    >
                        {isCustomDateActive ? (
                            <>
                                <Text style={[
                                    styles.dateNumber,
                                    { color: colors.darkText }
                                ]}>
                                    {selectedDate.getDate()}
                                </Text>
                                <Text style={[
                                    styles.dayName,
                                    { color: colors.darkText }
                                ]}>
                                    {getDayName(selectedDate)}
                                </Text>
                            </>
                        ) : (
                            <>
                                <Text style={[styles.anyDateText, { color: colors.lightDarkText }]}>Annen</Text>
                                <Text style={[styles.anyDateSubText, { color: colors.lightDarkText }]}>dato</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            {/* Time Selection */}
            <View style={styles.timeSection}>
                <Text style={[commonStyles.sectionTitle, { color: colors.text }]}>
                    Velg tid
                </Text>
                
                {/* Time Range Display */}
                <View style={[styles.timeRangeContainer, { backgroundColor: colors.contextBackground }]}>
                    <View style={styles.timeRangeHeader}>
                        <Text style={[styles.timeRangeLabel, { color: colors.lightDarkText }]}>Fra</Text>
                        <Text style={[styles.timeRangeLabel, { color: colors.lightDarkText }]}>Til</Text>
                    </View>
                    
                    <View style={styles.timeRangeValues}>
                        <TouchableOpacity 
                            style={styles.timeInput}
                            onPress={() => {
                                // TODO: Open time picker for start time
                                console.log("Open start time picker");
                            }}
                        >
                            <Text style={[styles.timeText, { color: colors.text }]}>{startTime}</Text>
                        </TouchableOpacity>
                        
                        <View style={styles.timeArrow}>
                            <Text style={[styles.arrowText, { color: colors.text }]}>›</Text>
                        </View>
                        
                        <TouchableOpacity 
                            style={styles.timeInput}
                            onPress={() => {
                                // TODO: Open time picker for end time
                                console.log("Open end time picker");
                            }}
                        >
                            <Text style={[styles.timeText, { color: colors.text }]}>{endTime}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                
                {/* Time Preset Buttons */}
                <View style={styles.timePresetsContainer}>
                    <TouchableOpacity
                        style={[
                            styles.timePresetButton,
                            { backgroundColor: selectedTimePreset === 'forvarsel' ? colors.tint : colors.interactiveBackground }
                        ]}
                        onPress={() => {
                            setSelectedTimePreset('forvarsel');
                            // You can set specific times here if needed
                        }}
                    >
                        <Text style={[styles.presetIcon, { color: colors.darkText }]}>💡</Text>
                        <Text style={[styles.presetText, { color: colors.darkText }]}>Forvarsel</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={[
                            styles.timePresetButton,
                            { backgroundColor: selectedTimePreset === 'gjenta' ? colors.tint : colors.interactiveBackground }
                        ]}
                        onPress={() => {
                            setSelectedTimePreset('gjenta');
                        }}
                    >
                        <Text style={[styles.presetIcon, { color: colors.darkText }]}>🔄</Text>
                        <Text style={[styles.presetText, { color: colors.darkText }]}>Gjenta</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={[
                            styles.timePresetButton,
                            { backgroundColor: selectedTimePreset === 'sted' ? colors.tint : colors.interactiveBackground }
                        ]}
                        onPress={() => {
                            setSelectedTimePreset('sted');
                        }}
                    >
                        <Text style={[styles.presetIcon, { color: colors.darkText }]}>📍</Text>
                        <Text style={[styles.presetText, { color: colors.darkText }]}>Sted</Text>
                    </TouchableOpacity>
                </View>
            </View>

        </ScrollView>
        
        {/* Cross-platform Calendar */}
        <Calendar
            visible={showCalendar}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            onClose={() => setShowCalendar(false)}
            minDate={new Date()}
        />
        </>
    );
}

const styles = StyleSheet.create({
    dateSection: {
        marginTop: 20,
    },
    dateOptionsContainer: {
        padding: 10,
        borderRadius: 15,
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
        alignItems: "center",
        justifyContent: "center",
        minHeight: 80,
    },
    dateNumber: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 4,
    },
    dayName: {
        fontSize: 14,
        fontWeight: "500",
    },
    anyDateText: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 2,
    },
    anyDateSubText: {
        fontSize: 14,
        fontWeight: "500",
    },
    
    // Time Selection Styles
    timeSection: {
        marginTop: 25,
    },
    timeRangeContainer: {
        borderRadius: 12,
        padding: 16,
        marginTop: 15,
    },
    timeRangeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        paddingHorizontal: 20,
    },
    timeRangeLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    timeRangeValues: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    timeInput: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
    },
    timeText: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    timeArrow: {
        paddingHorizontal: 20,
    },
    arrowText: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    timePresetsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        gap: 12,
    },
    timePresetButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 25,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    presetIcon: {
        fontSize: 16,
    },
    presetText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
