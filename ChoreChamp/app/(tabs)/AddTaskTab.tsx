import Calendar from "@/components/ui/Calendar";
import { useTheme } from "@/contexts/ThemeContext";
import { useUser } from "@/contexts/UserContext";
import { getHouseholdMembers } from "@/services/householdService";
import { createTask } from "@/services/taskService";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import commonStyles from "../commonStyles";


// TODO: Make own function of time related things eg. currentHour and currentMinute

export default function AddTask() {
    const { colors } = useTheme();
    const { userData } = useUser();

    // Initialize selectedDate normalized to midnight
    const [selectedDate, setSelectedDate] = useState<Date>(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    });
    const [showCalendar, setShowCalendar] = useState(false);

    // Household members state
    const [householdMembers, setHouseholdMembers] = useState<{
        id: string;
        firstName: string;
        lastName: string;
        username: string;
        imageUri: string;
        points: number;
    }[]>([]);
    const [loadingMembers, setLoadingMembers] = useState(true);

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
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
    const [points, setPoints] = useState('10');
    const [isSaving, setIsSaving] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Time picker state
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [timePickerMode, setTimePickerMode] = useState<'start' | 'end'>('start');
    const [tempDate, setTempDate] = useState(new Date());

    // Fetch household members
    useEffect(() => {
        const fetchHouseholdMembers = async () => {
            if (!userData?.id || !userData?.household || userData.household.length === 0) {
                setLoadingMembers(false);
                return;
            }

            setLoadingMembers(true);
            try {
                // Get the first household ID
                let householdId = '';
                const firstHousehold = userData.household[0];
                
                if (typeof firstHousehold === 'string') {
                    householdId = firstHousehold.split('/').pop() || '';
                } else if (firstHousehold && typeof firstHousehold === 'object' && 'id' in firstHousehold) {
                    householdId = (firstHousehold as any).id;
                }

                if (!householdId) {
                    setLoadingMembers(false);
                    return;
                }

                const members = await getHouseholdMembers(householdId);
                setHouseholdMembers(members);
            } catch (error) {
                console.error('❌ Error loading household members:', error);
                setHouseholdMembers([]);
            } finally {
                setLoadingMembers(false);
            }
        };

        fetchHouseholdMembers();
    }, [userData?.id, userData?.household]);

    // Handle pull-to-refresh
    const onRefresh = async () => {
        setRefreshing(true);
        
        try {
            if (userData?.id && userData?.household && userData.household.length > 0) {
                let householdId = '';
                const firstHousehold = userData.household[0];
                
                if (typeof firstHousehold === 'string') {
                    householdId = firstHousehold.split('/').pop() || '';
                } else if (firstHousehold && typeof firstHousehold === 'object' && 'id' in firstHousehold) {
                    householdId = (firstHousehold as any).id;
                }

                if (householdId) {
                    const members = await getHouseholdMembers(householdId);
                    setHouseholdMembers(members);
                }
            }
        } catch (error) {
            console.error('❌ Error refreshing household members:', error);
        } finally {
            setRefreshing(false);
        }
    };

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

    const openTimePicker = (mode: 'start' | 'end') => {
        const timeString = mode === 'start' ? startTime : endTime;
        const [hours, minutes] = timeString.split(':').map(Number);
        const date = new Date();
        date.setHours(hours);
        date.setMinutes(minutes);
        setTempDate(date);
        setTimePickerMode(mode);
        setShowTimePicker(true);
    };

    const onTimeChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowTimePicker(false);
        }
        
        if (selectedDate) {
            const hours = selectedDate.getHours().toString().padStart(2, '0');
            const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
            const timeString = `${hours}:${minutes}`;
            
            if (timePickerMode === 'start') {
                setStartTime(timeString);
            } else {
                setEndTime(timeString);
            }
            
            if (Platform.OS === 'ios') {
                setTempDate(selectedDate);
            }
        }
    };

    const confirmIOSTime = () => {
        setShowTimePicker(false);
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: colors.background }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}

        >
            <ScrollView
                style={[commonStyles.container, { backgroundColor: colors.background }]}
                keyboardShouldPersistTaps="handled"
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.tint}
                        colors={[colors.tint]}
                    />
                }
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
                                onPress={() => openTimePicker('start')}
                            >
                                <Text style={[styles.timeText, { color: colors.text }]}>{startTime}</Text>
                            </TouchableOpacity>

                            <View style={styles.timeArrow}>
                                <Text style={[styles.arrowText, { color: colors.text }]}>›</Text>
                            </View>

                            <TouchableOpacity
                                style={styles.timeInput}
                                onPress={() => openTimePicker('end')}
                            >
                                <Text style={[styles.timeText, { color: colors.text }]}>{endTime}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Title Field */}
                    <View style={styles.titleContainer}>
                        <Text style={[styles.titleLabel, { color: colors.lightDarkText }]}>
                            Tittel
                        </Text>
                        <TextInput
                            style={[styles.titleInput, { 
                                backgroundColor: colors.darkNonInteractiveText,
                                color: colors.text,
                                borderColor: colors.nonInteractiveBackground
                            }]}
                            placeholder="Legg til en tittel..."
                            placeholderTextColor={colors.lightDarkText}
                            value={title}
                            onChangeText={setTitle}
                        />
                    </View>

                    {/* Description Field */}
                    <View style={styles.descriptionContainer}>
                        <Text style={[styles.descriptionLabel, { color: colors.lightDarkText }]}>
                            Beskrivelse (valgfritt)
                        </Text>
                        <TextInput
                            style={[styles.descriptionInput, { 
                                backgroundColor: colors.darkNonInteractiveText,
                                color: colors.text,
                                borderColor: colors.nonInteractiveBackground
                            }]}
                            placeholder="Legg til en beskrivelse..."
                            placeholderTextColor={colors.lightDarkText}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Points Field */}
                    <View style={styles.pointsContainer}>
                        <Text style={[styles.pointsLabel, { color: colors.lightDarkText }]}>
                            Poeng
                        </Text>
                        <TextInput
                            style={[styles.pointsInput, { 
                                backgroundColor: colors.darkNonInteractiveText,
                                color: colors.text,
                                borderColor: colors.nonInteractiveBackground
                            }]}
                            placeholder="10"
                            placeholderTextColor={colors.lightDarkText}
                            value={points}
                            onChangeText={(text) => {
                                // Only allow numbers
                                const numericValue = text.replace(/[^0-9]/g, '');
                                setPoints(numericValue);
                            }}
                            keyboardType="numeric"
                            maxLength={3}
                        />
                    </View>
                </View>

                {/* Person Assignment Section */}
                <View style={styles.personSection}>
                    <Text style={[commonStyles.sectionTitle, { color: colors.text }]}>
                        Tilordne
                    </Text>
                    {loadingMembers ? (
                        <View style={[styles.personScrollView, { backgroundColor: colors.contextBackground }]}>
                            <Text style={[styles.loadingText, { color: colors.text }]}>
                                Laster medlemmer...
                            </Text>
                        </View>
                    ) : householdMembers.length === 0 ? (
                        <View style={[styles.personScrollView, { backgroundColor: colors.contextBackground }]}>
                            <Text style={[styles.loadingText, { color: colors.text }]}>
                                Ingen medlemmer i husstanden
                            </Text>
                        </View>
                    ) : (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={[styles.personScrollView, { backgroundColor: colors.contextBackground }]}
                            contentContainerStyle={styles.personContainer}
                        >
                            {householdMembers.map((member) => (
                                <TouchableOpacity
                                    key={member.id}
                                    style={styles.personItem}
                                    onPress={() => setSelectedPerson(member.id)}
                                >
                                    <View style={[
                                        styles.personAvatar,
                                        { backgroundColor: selectedPerson === member.id ? colors.tint : colors.nonInteractiveBackground },
                                        selectedPerson === member.id && styles.personAvatarSelected
                                    ]}>
                                        {member.imageUri ? (
                                            <Image
                                                source={{ uri: member.imageUri }}
                                                style={styles.personAvatarImage
                                                }
                                            />
                                        ) : (
                                            <Text style={[
                                                styles.personInitial,
                                                { color: selectedPerson === member.id ? colors.darkText : colors.text }
                                            ]}>
                                                {member.firstName.charAt(0)}
                                            </Text>
                                        )}
                                    </View>
                                    <Text style={[
                                        styles.personName,
                                        { color: colors.text },
                                        selectedPerson === member.id && { fontWeight: '600' }
                                    ]}>
                                        {member.firstName}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </View>


                {/* Info message when user is not in a household */}
                {(!userData?.household || userData.household.length === 0) && (
                    <View style={[styles.noHouseholdContainer, { backgroundColor: colors.contextBackground }]}>
                        <Text style={[styles.noHouseholdTitle, { color: colors.text }]}>
                            Du er ikke medlem av en husstand
                        </Text>
                        <Text style={[styles.noHouseholdMessage, { color: colors.lightDarkText }]}>
                            Du må være medlem av en husstand for å opprette oppgaver. Gå til profilsiden for å opprette eller bli med i en husstand.
                        </Text>
                    </View>
                )}

                {/* Save button */}
                <View>
                    <TouchableOpacity
                        style={[
                            commonStyles.saveButton,
                            { 
                                backgroundColor: (title.trim() && !isSaving && userData?.household && userData.household.length > 0) ? colors.tint : colors.nonInteractiveBackground, 
                                marginTop: 30, 
                                marginBottom: 40 
                            }
                        ]}
                        onPress={async () => {
                            if (!title.trim() || isSaving) return;
                            
                            // Check if user is in a household
                            if (!userData?.household || userData.household.length === 0) {
                                Alert.alert(
                                    'Ikke medlem av husstand', 
                                    'Du må være medlem av en husstand for å opprette oppgaver. Gå til profilsiden for å opprette eller bli med i en husstand.'
                                );
                                return;
                            }
                            
                            // Validate required fields
                            if (!selectedPerson) {
                                Alert.alert('Feil', 'Vennligst velg hvem som skal utføre oppgaven');
                                return;
                            }

                            if (!userData?.id) {
                                Alert.alert('Feil', 'Kunne ikke identifisere brukeren');
                                return;
                            }

                            // Get household ID
                            let householdId = '';
                            if (userData.household && userData.household.length > 0) {
                                const firstHousehold = userData.household[0];
                                if (typeof firstHousehold === 'string') {
                                    householdId = firstHousehold.split('/').pop() || '';
                                } else if (firstHousehold && typeof firstHousehold === 'object' && 'id' in firstHousehold) {
                                    householdId = (firstHousehold as any).id;
                                }
                            }

                            if (!householdId) {
                                Alert.alert('Feil', 'Kunne ikke finne husstand-ID');
                                return;
                            }

                            setIsSaving(true);

                            try {
                                // Combine date with time strings to create full Date objects
                                const [startHours, startMinutes] = startTime.split(':').map(Number);
                                const [endHours, endMinutes] = endTime.split(':').map(Number);
                                
                                const timeStartDate = new Date(selectedDate);
                                timeStartDate.setHours(startHours, startMinutes, 0, 0);
                                
                                const timeEndDate = new Date(selectedDate);
                                timeEndDate.setHours(endHours, endMinutes, 0, 0);

                                // If end time is before start time, assume it's the next day
                                if (timeEndDate < timeStartDate) {
                                    timeEndDate.setDate(timeEndDate.getDate() + 1);
                                }

                                const taskId = await createTask({
                                    title: title.trim(),
                                    description: description.trim(),
                                    timeStart: timeStartDate,
                                    timeEnd: timeEndDate,
                                    assignedTo: selectedPerson,
                                    createdBy: userData.id,
                                    createdByName: userData.username,
                                    createdByAvatar: userData.imageUri || '',
                                    householdId: householdId,
                                    points: parseInt(points) || 10, // Use input value or default to 10
                                });

                                if (taskId) {
                                    Alert.alert(
                                        'Suksess!',
                                        'Oppgaven ble opprettet',
                                        [
                                            {
                                                text: 'OK',
                                                onPress: () => {
                                                    // Reset form
                                                    setTitle('');
                                                    setDescription('');
                                                    setPoints('10');
                                                    setSelectedPerson(null);
                                                    const { currentTime, futureTime } = calculateTimes();
                                                    setStartTime(currentTime);
                                                    setEndTime(futureTime);
                                                    const now = new Date();
                                                    setSelectedDate(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
                                                }
                                            }
                                        ]
                                    );
                                } else {
                                    Alert.alert('Feil', 'Kunne ikke opprette oppgaven. Prøv igjen.');
                                }
                            } catch (error) {
                                console.error('Error creating task:', error);
                                Alert.alert('Feil', 'En feil oppstod ved oppretting av oppgaven');
                            } finally {
                                setIsSaving(false);
                            }
                        }}
                        disabled={!title.trim() || isSaving || !userData?.household || userData.household.length === 0}
                    >
                        <Text style={[
                            commonStyles.saveButtonText, 
                            { color: (title.trim() && !isSaving && userData?.household && userData.household.length > 0) ? colors.darkText : colors.lightDarkText }
                        ]}>
                            {isSaving ? 'Lagrer...' : 'Lagre'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Native Time Picker */}
            {showTimePicker && (
                <>
                    {Platform.OS === 'ios' && (
                        <View style={styles.iosPickerOverlay}>
                            <TouchableOpacity 
                                style={styles.iosPickerBackdrop}
                                activeOpacity={1}
                                onPress={() => setShowTimePicker(false)}
                            />
                            <View style={styles.iosPickerContainer}>
                                <View style={[styles.iosPickerHeader, { backgroundColor: colors.contextBackground }]}>
                                    <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                                        <Text style={[styles.iosPickerButton, { color: colors.text }]}>Avbryt</Text>
                                    </TouchableOpacity>
                                    <Text style={[styles.iosPickerTitle, { color: colors.text }]}>
                                        Velg {timePickerMode === 'start' ? 'starttid' : 'sluttid'}
                                    </Text>
                                    <TouchableOpacity onPress={confirmIOSTime}>
                                        <Text style={[styles.iosPickerButton, { color: colors.tint }]}>Ferdig</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={[styles.iosPickerContent, { backgroundColor: colors.contextBackground }]}>
                                    <DateTimePicker
                                        value={tempDate}
                                        mode="time"
                                        display="spinner"
                                        onChange={onTimeChange}
                                        textColor={colors.text}
                                    />
                                </View>
                            </View>
                        </View>
                    )}
                    {Platform.OS === 'android' && (
                        <DateTimePicker
                            value={tempDate}
                            mode="time"
                            display="default"
                            onChange={onTimeChange}
                            is24Hour={true}
                        />
                    )}
                </>
            )}

            {/* Cross-platform Calendar */}
            <Calendar
                visible={showCalendar}
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                onClose={() => setShowCalendar(false)}
                minDate={new Date()}
            />
        </KeyboardAvoidingView>
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

    // Title Field Styles
    titleContainer: {
        marginTop: 20,
    },
    titleLabel: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    titleInput: {
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        borderWidth: 1,
    },

    // Description Field Styles
    descriptionContainer: {
        marginTop: 20,
    },
    descriptionLabel: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    descriptionInput: {
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        minHeight: 100,
        borderWidth: 1,
    },

    // Points Field Styles
    pointsContainer: {
        marginTop: 20,
    },
    pointsLabel: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    pointsInput: {
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        borderWidth: 1,
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
    personAvatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 30,
    },
    personInitial: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    personName: {
        fontSize: 12,
        textAlign: 'center',
    },
    loadingText: {
        fontSize: 14,
        textAlign: 'center',
        padding: 20,
    },

    // No Household Message Styles
    noHouseholdContainer: {
        borderRadius: 12,
        padding: 20,
        marginTop: 20,
        marginBottom: 10,
    },
    noHouseholdTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        textAlign: 'center',
    },
    noHouseholdMessage: {
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
    },

    // iOS Time Picker Styles
    iosPickerOverlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        justifyContent: 'flex-end',
        alignItems: 'center',
        zIndex: 1000,
    },
    iosPickerBackdrop: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    iosPickerContainer: {
        width: '100%',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
    },
    iosPickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    iosPickerContent: {
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iosPickerTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    iosPickerButton: {
        fontSize: 16,
        fontWeight: '600',
    },
});
