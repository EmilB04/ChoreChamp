import { useTheme } from '@/contexts/ThemeContext';
import React, { useState } from 'react';
import {
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface CalendarProps {
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
    visible: boolean;
    onClose: () => void;
    maxDate?: Date;
    minDate?: Date;
}

export default function Calendar({
    selectedDate,
    onDateSelect,
    visible,
    onClose,
    maxDate,
    minDate,
}: CalendarProps) {
    const { colors } = useTheme();
    const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        // Adjust so Monday = 0, Sunday = 6
        const day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1;
    };

    const isDateDisabled = (date: Date) => {
        // Normalize dates to midnight for proper comparison
        const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        
        if (maxDate) {
            const normalizedMax = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate());
            if (normalizedDate > normalizedMax) return true;
        }
        if (minDate) {
            const normalizedMin = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
            if (normalizedDate < normalizedMin) return true;
        }
        return false;
    };

    const isSameDay = (date1: Date, date2: Date) => {
        return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        );
    };

    const handlePreviousMonth = () => {
        setCurrentMonth(
            new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
        );
    };

    const handleNextMonth = () => {
        setCurrentMonth(
            new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
        );
    };

    const handleDatePress = (day: number) => {
        const newDate = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            day
        );
        if (!isDateDisabled(newDate)) {
            onDateSelect(newDate);
            onClose();
        }
    };

    const renderCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentMonth);
        const firstDay = getFirstDayOfMonth(currentMonth);
        const days = [];

        // Empty cells for days before the first day of month
        for (let i = 0; i < firstDay; i++) {
            days.push(
                <View key={`empty-${i}`} style={styles.dayCell}>
                    <View style={styles.dayButton} />
                </View>
            );
        }

        // Actual days
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth(),
                day
            );
            const isSelected = isSameDay(date, selectedDate);
            const isDisabled = isDateDisabled(date);
            const isToday = isSameDay(date, new Date());

            days.push(
                <View key={`day-${day}`} style={styles.dayCell}>
                    <TouchableOpacity
                        style={[
                            styles.dayButton,
                            isSelected && { backgroundColor: colors.tint },
                            isDisabled && styles.disabledDay,
                        ]}
                        onPress={() => handleDatePress(day)}
                        disabled={isDisabled}
                    >
                        <Text
                            style={[
                                styles.dayText,
                                { color: colors.text },
                                isSelected && { color: colors.darkText, fontWeight: 'bold' },
                                isDisabled && { color: colors.lightDarkText, opacity: 0.4 },
                                isToday && !isSelected && { color: colors.tint, fontWeight: 'bold' },
                            ]}
                        >
                            {day}
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return days;
    };

    const monthNames = [
        'Januar',
        'Februar',
        'Mars',
        'April',
        'Mai',
        'Juni',
        'Juli',
        'August',
        'September',
        'Oktober',
        'November',
        'Desember',
    ];

    const weekDays = ['Ma', 'Ti', 'On', 'To', 'Fr', 'Lø', 'Sø'];

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={(e) => e.stopPropagation()}
                >
                    <View
                        style={[
                            styles.calendarContainer,
                            { backgroundColor: colors.contextBackground },
                        ]}
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <TouchableOpacity
                                onPress={handlePreviousMonth}
                                style={styles.navButton}
                            >
                                <Text style={[styles.navButtonText, { color: colors.text }]}>
                                    ‹
                                </Text>
                            </TouchableOpacity>

                            <Text style={[styles.monthYearText, { color: colors.text }]}>
                                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                            </Text>

                            <TouchableOpacity
                                onPress={handleNextMonth}
                                style={styles.navButton}
                            >
                                <Text style={[styles.navButtonText, { color: colors.text }]}>
                                    ›
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Week days header */}
                        <View style={styles.weekDaysContainer}>
                            {weekDays.map((day) => (
                                <View key={day} style={styles.weekDayCell}>
                                    <Text
                                        style={[styles.weekDayText, { color: colors.lightDarkText }]}
                                    >
                                        {day}
                                    </Text>
                                </View>
                            ))}
                        </View>

                        {/* Calendar grid */}
                        <View style={styles.calendarGrid}>{renderCalendarDays()}</View>

                        {/* Footer buttons */}
                        <View style={styles.footer}>
                            <TouchableOpacity
                                onPress={() => {
                                    const now = new Date();
                                    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                                    onDateSelect(today);
                                    onClose();
                                }}
                                style={[
                                    styles.footerButton,
                                    { backgroundColor: colors.tint },
                                ]}
                            >
                                <Text style={[styles.footerButtonText, { color: colors.darkText }]}>
                                    I dag
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={onClose}
                                style={[
                                    styles.footerButton,
                                    { backgroundColor: colors.statusFailedText },
                                ]}
                            >
                                <Text style={[styles.footerButtonText, { color: colors.darkText }]}>
                                    Avbryt
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    calendarContainer: {
        width: Platform.OS === 'web' ? 380 : '90%',
        maxWidth: 400,
        borderRadius: 20,
        padding: 20,
        ...Platform.select({
            ios: {
                boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.3)',
            },
            android: {
                elevation: 8,
            },
            web: {
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
            },
        }),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    navButton: {
        padding: 8,
        width: 40,
        alignItems: 'center',
    },
    navButtonText: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    monthYearText: {
        fontSize: 18,
        fontWeight: '600',
    },
    weekDaysContainer: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    weekDayCell: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
    },
    weekDayText: {
        fontSize: 12,
        fontWeight: '600',
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayCell: {
        width: '14.28%', // 100% / 7 days
        aspectRatio: 1,
        padding: 2,
    },
    dayButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    dayText: {
        fontSize: 14,
    },
    disabledDay: {
        opacity: 0.3,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        gap: 12,
    },
    footerButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    footerButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
