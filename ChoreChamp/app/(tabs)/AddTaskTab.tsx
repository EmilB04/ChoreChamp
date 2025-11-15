import Calendar from "@/components/ui/Calendar";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import commonStyles from "../commonStyles";
import { useTranslation } from "react-i18next";

// Restored full AddTaskTab UI with i18n lookups
export default function AddTask() {
    const { colors } = useTheme();
    const { t } = useTranslation('onboarding');

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const dayAfterTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2);

    const [selectedDate, setSelectedDate] = useState<Date>(today);
    const [showCalendar, setShowCalendar] = useState(false);

    const [startTime, setStartTime] = useState(() => {
        const h = now.getHours().toString().padStart(2, '0');
        const m = now.getMinutes().toString().padStart(2, '0');
        return `${h}:${m}`;
    });
    const [endTime, setEndTime] = useState(() => {
        const future = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        const h = future.getHours().toString().padStart(2, '0');
        const m = future.getMinutes().toString().padStart(2, '0');
        return `${h}:${m}`;
    });

    const [selectedTimePreset, setSelectedTimePreset] = useState<string | null>(null);
    const [selectedPerson, setSelectedPerson] = useState<string | null>(null);

    const people = [
        { id: '1', name: 'Emil B.' },
        { id: '2', name: 'Ida K.' },
        { id: '3', name: 'Andreas O.' },
        { id: '4', name: 'Sebastian W.' },
        { id: '5', name: 'Lina S.' },
        { id: '6', name: 'Marius T.' },
    ];

    function getDayName(date: Date) {
        const days = [
            t('days.full.sun'),
            t('days.full.mon'),
            t('days.full.tue'),
            t('days.full.wed'),
            t('days.full.thu'),
            t('days.full.fri'),
            t('days.full.sat'),
        ];
        return days[date.getDay()];
    }

    const dateOptions = [
        { date: today, label: today.getDate().toString(), dayName: getDayName(today) },
        { date: tomorrow, label: tomorrow.getDate().toString(), dayName: getDayName(tomorrow) },
        { date: dayAfterTomorrow, label: dayAfterTomorrow.getDate().toString(), dayName: getDayName(dayAfterTomorrow) },
    ];

    const isPresetDate = dateOptions.some(o => o.date.getTime() === selectedDate.getTime());

    const openCalendar = () => setShowCalendar(true);
    const handleDateSelect = (d: Date) => { setSelectedDate(d); setShowCalendar(false); };

    return (
        <>
            <ScrollView style={[commonStyles.container, { backgroundColor: colors.background }]}> 
                <View style={{ paddingBottom: 8 }}>
                    <Text style={[commonStyles.headerTitle, { color: colors.text }]}>{t('addTask.title')}</Text>
                </View>

                {/* Date tiles */}
                <View style={styles.dateSection}>
                    <Text style={[commonStyles.sectionTitle, { color: colors.text }]}>{t('addTask.selectDate')}</Text>
                    <View style={[styles.dateOptionsContainer, { backgroundColor: colors.contextBackground }]}> 
                        {dateOptions.map((opt, i) => (
                            <TouchableOpacity key={i} style={[styles.dateOption, selectedDate.getTime() === opt.date.getTime() ? { backgroundColor: colors.tint } : { backgroundColor: colors.nonInteractiveBackground }]} onPress={() => setSelectedDate(opt.date)}>
                                <Text style={[styles.dateNumber, { color: selectedDate.getTime() === opt.date.getTime() ? colors.darkText : colors.text }]}>{opt.label}</Text>
                                <Text style={[styles.dayName, { color: selectedDate.getTime() === opt.date.getTime() ? colors.darkText : colors.lightDarkText }]}>{opt.dayName}</Text>
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity style={[styles.dateOption, isPresetDate ? { backgroundColor: colors.nonInteractiveBackground } : { backgroundColor: colors.tint }]} onPress={openCalendar}>
                            {isPresetDate ? (
                                <>
                                    <Text style={[styles.anyDateText, { color: colors.lightDarkText }]}>{t('addTask.otherDate.first')}</Text>
                                    <Text style={[styles.anyDateSubText, { color: colors.lightDarkText }]}>{t('addTask.otherDate.second')}</Text>
                                </>
                            ) : (
                                <>
                                    <Text style={[styles.dateNumber, { color: colors.darkText }]}>{selectedDate.getDate()}</Text>
                                    <Text style={[styles.dayName, { color: colors.darkText }]}>{getDayName(selectedDate)}</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Time range */}
                <View style={styles.timeSection}>
                    <Text style={[commonStyles.sectionTitle, { color: colors.text }]}>{t('addTask.selectTime')}</Text>
                    <View style={[styles.timeRangeContainer, { backgroundColor: colors.contextBackground }]}> 
                        <View style={styles.timeRangeHeader}>
                            <Text style={[styles.timeRangeLabel, { color: colors.lightDarkText }]}>{t('addTask.time.from')}</Text>
                            <Text style={[styles.timeRangeLabel, { color: colors.lightDarkText }]}>{t('addTask.time.to')}</Text>
                        </View>
                        <View style={styles.timeRangeValues}>
                            <TouchableOpacity style={styles.timeInput} onPress={() => console.log('open start picker')}>
                                <Text style={[styles.timeText, { color: colors.text }]}>{startTime}</Text>
                            </TouchableOpacity>
                            <View style={styles.timeArrow}><Text style={[styles.arrowText, { color: colors.text }]}>›</Text></View>
                            <TouchableOpacity style={styles.timeInput} onPress={() => console.log('open end picker')}>
                                <Text style={[styles.timeText, { color: colors.text }]}>{endTime}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.timePresetsContainer}>
                        <TouchableOpacity style={[styles.timePresetButton, { backgroundColor: selectedTimePreset === 'forvarsel' ? colors.statusFailedText : colors.interactiveBackground }]} onPress={() => setSelectedTimePreset('forvarsel')}>
                            <Ionicons name="notifications-outline" size={20} color={colors.darkText} />
                            <Text style={[styles.presetText, { color: colors.darkText }]}>{t('addTask.preset.forvarsel')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.timePresetButton, { backgroundColor: selectedTimePreset === 'gjenta' ? colors.statusFailedText : colors.interactiveBackground }]} onPress={() => setSelectedTimePreset('gjenta')}>
                            <Ionicons name="repeat-outline" size={20} color={colors.darkText} />
                            <Text style={[styles.presetText, { color: colors.darkText }]}>{t('addTask.preset.repeat')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Person assignment */}
                <View style={styles.personSection}>
                    <Text style={[commonStyles.sectionTitle, { color: colors.text }]}>{t('addTask.assign')}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.personScrollView, { backgroundColor: colors.contextBackground }]} contentContainerStyle={styles.personContainer}>
                        {people.map(p => (
                            <TouchableOpacity key={p.id} style={[styles.personItem, { backgroundColor: selectedPerson === p.id ? colors.tint : colors.nonInteractiveBackground }]} onPress={() => setSelectedPerson(p.id)}>
                                <View style={[styles.personAvatar, selectedPerson === p.id && styles.personAvatarSelected, { backgroundColor: selectedPerson === p.id ? colors.tint : colors.nonInteractiveBackground }]}>
                                    <Text style={[styles.personInitial, { color: selectedPerson === p.id ? colors.darkText : colors.text }]}>{p.name.charAt(0)}</Text>
                                </View>
                                <Text style={[styles.personName, { color: colors.text }]}>{p.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Save */}
                <View>
                    <TouchableOpacity style={[commonStyles.saveButton, { backgroundColor: colors.tint, marginTop: 30, marginBottom: 40 }]} onPress={() => console.log('save task', { date: selectedDate, startTime, endTime, assignedTo: selectedPerson })}>
                        <Text style={[commonStyles.saveButtonText, { color: colors.darkText }]}>{t('addTask.save')}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <Calendar visible={showCalendar} selectedDate={selectedDate} onDateSelect={handleDateSelect} onClose={() => setShowCalendar(false)} minDate={new Date()} />
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
    presetText: {
        fontSize: 14,
        fontWeight: '600',
    },

    // Person Assignment Styles
    personSection: {
        marginTop: 25,
    },
    personScrollView: {
        borderRadius: 12,
        marginTop: 15,
    },
    personContainer: {
        padding: 16,
        flexDirection: 'row',
        gap: 16,
    },
    personItem: {
        alignItems: 'center',
        width: 80,
    },
    personAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    personAvatarSelected: {
        borderWidth: 3,
        borderColor: '#fff',
    },
    personInitial: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    personName: {
        fontSize: 12,
        textAlign: 'center',
    },
});
