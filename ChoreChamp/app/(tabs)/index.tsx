import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import { Image } from "expo-image";
import { useTheme } from "@/contexts/ThemeContext";
import commonStyles from "../commonStyles";
import WelcomeGreeting from '../../components/index/WelcomeGreeting';
import SvgFigures from '../../components/svg/SvgFigures';

// TODO: 
// 1. Fetch user data dynamically
// 2. Integrate main content and leaderboard sections
// 3. Add interactivity to calendar (e.g., navigate to daily view on tap)


export default function Dashboard() {
  const { colors } = useTheme();
  const user = "Emil";                                              // Replace with dynamic user data as needed

  // State for current time that updates live
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date());
    };
    updateTime();                                                   // Update immediately on mount
    const interval = setInterval(updateTime, 10000);                // Update every 10 seconds
    return () => clearInterval(interval);                           // Cleanup interval on component unmount
  }, []);




  // Sample tasks data - replace with database fetch
  const todayTasks = [
    {
      id: 1,
      title: "Gå med søpla",
      time: "10:00",
      assignedTo: "Ida",
      avatar: require("@/assets/images/icon.png"),
      duration: 60,
      finished: true
    },
    {
      id: 2,
      title: "Støvsuge huset",
      time: "12:00",
      assignedTo: "Andreas",
      avatar: require("@/assets/images/icon.png"),
      duration: 60,
      finished: false
    },
    {
      id: 3,
      title: "Lage middag",
      time: "16:00",
      assignedTo: "Emil",
      avatar: require("@/assets/images/icon.png"),
      duration: 90,
      finished: false
    },
    {
      id: 4,
      title: "Vanne planter",
      time: "21:00",
      assignedTo: "Emil",
      avatar: require("@/assets/images/icon.png"),
      duration: 30,
      finished: false
    },
  ];

  // ------------------------------------------------------------------ //
  /*                    Variables to be handled by Expo                 */
  // ------------------------------------------------------------------ //

  // Frequently used date variables
  const today = currentTime;
  const currentDay = today.getDay();                               // 0 = Sunday, 1 = Monday, etc.
  const currentDate = today.getDate();                             // Day of month
  const currentHour = today.getHours();                            // Hour of day
  const currentMinutes = today.getMinutes();                       // Minute of hour

  // Calculate Monday of current week
  const mondayDate = new Date(today);
  const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1;    // Handle Sunday
  mondayDate.setDate(today.getDate() - daysFromMonday);

  // Generate week days
  const weekDays = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];
  const weekDates = [];

  // Populate week dates array
  for (let i = 0; i < 7; i++) {
    const date = new Date(mondayDate);
    date.setDate(mondayDate.getDate() + i);
    weekDates.push({
      day: weekDays[i],
      date: date.getDate(),
      isToday: date.getDate() === currentDate && date.getMonth() === today.getMonth()
    });
  }

  // Generate dynamic time slots based on tasks and default range
  function generateTimeSlots() {
    const defaultStart = 8;  // Default start hour (08:00)
    const defaultEnd = 20;   // Default end hour (20:00)

    // Extract hours from tasks
    const taskHours = todayTasks.map(task => {
      const [hour] = task.time.split(':');
      return parseInt(hour, 10);
    });

    // Determine the range including task hours
    const minHour = Math.min(defaultStart, ...taskHours);
    const maxHour = Math.max(defaultEnd, ...taskHours);

    // Generate time slots for the extended range
    const slots = [];
    for (let hour = minHour; hour <= maxHour; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }

    return slots;
  }
  // Calculate position for now line dynamically based on actual time slots
  function calculateNowLinePosition() {
    if (timeSlots.length === 0) return { shouldShow: false, position: -1 };

    // Get the first and last hour from time slots
    const firstHour = parseInt(timeSlots[0].split(':')[0], 10);
    const lastHour = parseInt(timeSlots[timeSlots.length - 1].split(':')[0], 10);

    // Check if current hour is within the displayed range
    const shouldShow = currentHour >= firstHour && currentHour <= lastHour;

    // Calculate position relative to the first time slot
    const position = shouldShow ? currentHour - firstHour + (currentMinutes / 60) : -1;

    return { shouldShow, position };
  }

  // Generate time slots once
  const timeSlots = generateTimeSlots();
  // Get current time for "now line"
  const currentTimeString = `${currentHour.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`;
  // Determine if and where to show the "now line"
  const { shouldShow: shouldShowNowLine, position: nowLinePosition } = calculateNowLinePosition();


  return (
    <ScrollView style={[styles.outsideSafeArea, { backgroundColor: colors.background }]}>
      {/* HEADER SVG - Outside Safe Area */}
      <SvgFigures.BackgroundShape tintColor={colors.tint} />
      <SvgFigures.CircularShape tintColor={colors.tint} />
      <SvgFigures.SmallDot tintColor={colors.tint} />
      <ScrollView
        style={[commonStyles.container, { zIndex: 2, paddingTop: 0 }]}
        contentContainerStyle={{ paddingBottom: 24 }} // Extra padding at the bottom for better scroll experience
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={[styles.header, commonStyles.headerTitle]}>
          <WelcomeGreeting userName={user} />
          <View style={styles.profileSection}>
            <View style={styles.profileContainer}>
              <Image
                source={require("@/assets/images/icon.png")}
                style={styles.profileImage}
              />
            </View>
          </View>
        </View>

        {/* HEADER CALENDAR */}
        <View style={styles.calendarWrapper}>
          <View style={styles.calendarWeek}>
            {weekDates.map((dayData, index) => (
              <View key={index} style={[styles.calendarDay, dayData.isToday && styles.calendarDayActive]}>
                <Text style={[
                  styles.calendarDayNumber, { color: dayData.isToday ? colors.activeText : colors.lightDarkText }
                ]}>
                  {dayData.date}
                </Text>
                <Text style={[
                  styles.calendarDayLabel, { color: dayData.isToday ? colors.activeText : colors.text }
                ]}>
                  {dayData.day}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* MAIN CONTENT */}
        <View style={styles.mainWrapper}>
          <Text style={[commonStyles.sectionTitle, { color: colors.text, marginBottom: 16 }]}>
            Dagens oppgaver:
          </Text>

          {/* Hourly Calendar */}
          <View style={styles.calendarContainer}>
            {timeSlots.map((timeSlot, index) => {
              // Find task for this time slot
              const taskForSlot = todayTasks.find(task => task.time === timeSlot);

              // Check if we should show the now line after this time slot
              const showNowLineAfter = shouldShowNowLine &&
                index < timeSlots.length - 1 &&
                nowLinePosition > index &&
                nowLinePosition < index + 1;

              return (
                <View key={index}>
                  <View style={styles.timeSlotRow}>
                    {/* Time Label */}
                    <View style={styles.timeColumn}>
                      <Text style={[styles.timeLabel, { color: colors.lightDarkText }]}>
                        {timeSlot}
                      </Text>
                    </View>

                    {/* Task Column */}
                    <View style={styles.taskColumn}>
                      {taskForSlot ? (
                        <TouchableOpacity style={[
                          styles.taskCard,
                          { backgroundColor: taskForSlot.finished ? colors.nonInteractiveBackground : colors.interactiveBackground }
                        ]}>
                          <View style={styles.taskContent}>
                            <Text style={[
                              styles.taskTitle,
                              {
                                color: taskForSlot.finished ? colors.lightNonInteractiveText : colors.darkText,
                                textDecorationLine: taskForSlot.finished ? 'line-through' : 'none'
                              }
                            ]}>
                              {taskForSlot.title}
                            </Text>
                            <Text style={[
                              styles.taskSubtitle,
                              { color: taskForSlot.finished ? colors.lightNonInteractiveText : colors.lightText }
                            ]}>
                              {taskForSlot.assignedTo}
                            </Text>
                          </View>
                          <View style={[
                            styles.taskAvatar,
                            taskForSlot.finished && styles.taskAvatarFinished
                          ]}>
                            <Image
                              source={taskForSlot.avatar}
                              style={[
                                styles.avatarImage,
                                taskForSlot.finished && styles.avatarImageFinished
                              ]}
                            />
                          </View>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  </View>

                  {/* Now Line */}
                  {showNowLineAfter && (
                    <View style={styles.nowLineContainer}>
                      <View style={styles.nowTimeColumn}>
                        <Text style={[styles.nowTimeLabel, { color: colors.activeText }]}>
                          {currentTimeString}
                        </Text>
                      </View>
                      <View style={styles.nowLineWrapper}>
                        <View style={[styles.nowLine, { backgroundColor: colors.activeText }]} />
                        <View style={[styles.nowDot, { backgroundColor: colors.activeText }]} />
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Leaderboard */}
        <View style={styles.leaderboardWrapper}>
          <Text style={[commonStyles.sectionTitle, { color: colors.text }]}>
            Ledertavle:
          </Text>
          {/* Placeholder for leaderboard content */}
        </View>
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  outsideSafeArea: {
    flex: 1,
    margin: 0,
    padding: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 1,
    position: "relative",
  },
  profileSection: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  profileContainer: {
    width: 58,
    height: 58,
    borderRadius: 20,
    padding: 2,
    backgroundColor: "#FFBE00",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 18,
  },
  calendarWrapper: {
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: "rgba(59, 59, 59, 0.20)",
    borderRadius: 25,
    padding: 16,
    height: 75,
    width: '100%'
  },
  calendarWeek: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%',
  },
  calendarDay: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 35,
  },
  calendarDayNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  calendarDayLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  calendarDayActive: {
    backgroundColor: '#464545',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    // Cancel the padding's impact on layout so surrounding items don't shift
    marginHorizontal: -8,
    marginVertical: -8,
  },

  mainWrapper: {
    marginTop: 16,
  },

  leaderboardWrapper: {
    marginTop: 32,
  },

  // Hourly Calendar Styles
  calendarContainer: {
    flex: 1,
  },
  timeSlotRow: {
    flexDirection: 'row',
    minHeight: 50,
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  timeColumn: {
    width: 60,
    paddingTop: 4,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  taskColumn: {
    flex: 1,
    paddingLeft: 16,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  taskSubtitle: {
    fontSize: 14,
  },
  taskAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    marginLeft: 12,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  taskAvatarFinished: {
    opacity: 0.5,
  },
  avatarImageFinished: {
    opacity: 0.6,
  },
  searchSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  searchText: {
    fontSize: 14,
    marginLeft: 8,
  },

  // Now Line Styles
  nowLineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    zIndex: 10,
  },
  nowTimeColumn: {
    width: 60,
    alignItems: 'flex-start',
  },
  nowTimeLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  nowLineWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
  },
  nowLine: {
    height: 2,
    flex: 1,
    borderRadius: 1,
  },
  nowDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: -4,
  },

});

