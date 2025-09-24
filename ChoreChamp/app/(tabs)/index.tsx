import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Image } from "expo-image";
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import commonStyles from "../commonStyles";

// TODO: 
// 1. Fetch user data dynamically
// 2. Integrate main content and leaderboard sections
// 3. Add interactivity to calendar (e.g., navigate to daily view on tap)


export default function Dashboard() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const insets = useSafeAreaInsets();
  const user = "Emil"; // Replace with dynamic user data as needed

  // State for current time that updates every minute
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date());
    };
    updateTime();
    // Set interval to update every minute
    const interval = setInterval(updateTime, 60000);
    // Cleanup interval on component unmount
    return () => clearInterval(interval);
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
    }
  ];

  // Generate hourly time slots from 08:00 to 22:00
  const timeSlots = [];
  for (let hour = 8; hour <= 22; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
  }

  // Get current time for "now line"
  const currentHour = currentTime.getHours();
  const currentMinutes = currentTime.getMinutes();
  const currentTimeString = `${currentHour.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`;
  
  // Calculate position for now line (between time slots)
  const shouldShowNowLine = currentHour >= 8 && currentHour <= 22;
  const nowLinePosition = shouldShowNowLine ? currentHour - 8 + (currentMinutes / 60) : -1;

  // Get current date and week days
  const today = currentTime;
  const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const currentDate = today.getDate();
  
  // Calculate Monday of current week
  const mondayDate = new Date(today);
  const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1; // Handle Sunday
  mondayDate.setDate(today.getDate() - daysFromMonday);

  // Generate week days
  const weekDays = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];
  const weekDates = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(mondayDate);
    date.setDate(mondayDate.getDate() + i);
    weekDates.push({
      day: weekDays[i],
      date: date.getDate(),
      isToday: date.getDate() === currentDate && date.getMonth() === today.getMonth()
    });
  }

  const svgFigures = [
    () => {
      return (
        <View style={svgStyles.backgroundShapePosition}>
          <Svg
            style={svgStyles.svgBackground}
            viewBox="0 20 347 146"
          >
            <Path
              d="M-9.15527e-05 0.5H290.5C290.5 0.5 306.722 0.753072 310 1.5C331.059 6.29817 336.662 15.3068 342 26.5C347.338 37.6932 346 71.5 346 71.5V145.5C273.284 73.4047 209.924 51.8583 124.73 69.9165C42.9585 87.2493 37.1901 59.6197 -9.15527e-05 0.5Z"
              fill={colors.tint}
            />
          </Svg>
        </View>
      );
    },
    () => {
      return (
        <View style={svgStyles.circularShapePosition}>
          <Svg
            style={svgStyles.circularSvg}
            viewBox="0 0 27 27"
          >
            <Path
              d="M20.4541 4.19128C24.9121 8.71509 28.7193 19.9138 24.1954 24.3718C19.6716 28.8298 8.52993 24.8589 4.07193 20.3351C-0.386075 15.8113 -0.332723 8.53012 4.19109 4.07211C8.71491 -0.385888 15.9961 -0.332537 20.4541 4.19128Z"
              fill={colors.tint}
            />
          </Svg>
        </View>
      );
    },
    () => {
      return (
        <View style={svgStyles.smallDotPosition}>
          <Svg
            style={svgStyles.smallDotSvg}
            viewBox="0 0 4 5"
          >
            <Path
              d="M4 2.28223C4 1.17766 3 -0.717773 2 0.282227C1 1.28223 0 1.17766 0 2.28223C0 3.3868 0.89543 4.28223 2 4.28223C3.10457 4.28223 4 3.3868 4 2.28223Z"
              fill={colors.tint}
            />
          </Svg>
        </View>
      );
    },
  ];

  return (
    <View style={[{ backgroundColor: colors.background, flex: 1 }]}>
      {/* HEADER SVG - Outside Safe Area */}
      {svgFigures[0]()}
      {svgFigures[1]()}
      {svgFigures[2]()}
      <ScrollView
        style={[commonStyles.container, { zIndex: 2 }]}
        contentContainerStyle={{ paddingBottom: 24 }} // Extra padding at the bottom for better scroll experience
        showsVerticalScrollIndicator={false}
      >
        {/* CONTENT */}
        <View style={[styles.headerWrapper, { paddingTop: insets.top }]}>
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={[commonStyles.headerTitle, { color: colors.text, marginTop: 0 }]}>God dag,{"\n"}{user}!</Text>
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
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerWrapper: {
    position: "relative",
    zIndex: 1,
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


const svgStyles = StyleSheet.create({
  backgroundShapePosition: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    height: 200,
  },
  svgBackground: {
    width: "100%",
    height: 200,
  },
  circularShapePosition: {
    position: "absolute",
    top: 90,
    right: 95,
    zIndex: 1,
  },
  circularSvg: {
    width: 27,
    height: 27,
    zIndex: 1,
  },
  smallDotPosition: {
    position: "absolute",
    top: 120,
    right: 90,
    zIndex: 1,
  },
  smallDotSvg: {
    width: 4,
    height: 5,
  },
});
