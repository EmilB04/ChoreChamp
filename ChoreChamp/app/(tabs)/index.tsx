import { useTheme } from "@/contexts/ThemeContext";
import { useUser } from "@/contexts/UserContext";
import type { Task } from "@/types/task";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import WelcomeGreeting from "../../components/index/WelcomeGreeting";
import SvgFigures from "../../components/index/svg/SvgFigures";
import TaskDetailModal from "../../components/modals/TaskDetailModal";
import commonStyles from "../commonStyles";
import i18n from "../i18n/i18n";
import { useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";


// TODO:
// 1. Fetch user data dynamically
// 2. Integrate main content and leaderboard sections
// 3. Add interactivity to calendar (e.g., navigate to daily view on tap)

export default function Dashboard() {
  const { colors } = useTheme();
  const { userData } = useUser();
  const params = useLocalSearchParams();
  const { t } = useTranslation("onboarding");

  // State for current time that updates live
  const [currentTime, setCurrentTime] = useState(new Date());

  // State for task detail modal
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    // Apply language from ?lang query param (same pattern as onboarding screens)
    const lang = params?.lang as string | undefined;
    if (lang) {
      i18n.changeLanguage(lang);
      AsyncStorage.setItem("appLanguage", lang).catch(() => {
        /* ignore */
      });
    }

    const updateTime = () => {
      setCurrentTime(new Date());
    };
    updateTime(); // Update immediately on mount
    const interval = setInterval(updateTime, 10000); // Update every 10 seconds
    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [params?.lang]);

  // TODO: Replace with database fetch
  const todayTasks: Task[] = [
    {
      id: 1,
      title: "Gå med søpla",
      time: "10:00",
      assignedTo: "Ida",
      avatar: require("@/assets/images/icon.png"),
      duration: 60,
      finished: true,
    },
    {
      id: 2,
      title: "Støvsuge huset",
      time: "12:00",
      assignedTo: "Andreas",
      description:
        "Husk godt under sofaen, hybelkaniner på størrelse med hodet ditt.",
      avatar: require("@/assets/images/icon.png"),
      duration: 60,
      finished: false,
    },
    {
      id: 3,
      title: "Lage middag",
      time: "16:00",
      assignedTo: "Emil Berglund",
      description: "Prøv den nye oppskriften med kebabkjøtt og maiskaker.",
      avatar: require("@/assets/images/icon.png"),
      duration: 90,
      finished: false,
    },
    {
      id: 4,
      title: "Vanne planter",
      time: "21:00",
      assignedTo: "Emil",
      avatar: require("@/assets/images/icon.png"),
      duration: 30,
      finished: false,
    },
  ];

  // TODO: Replace with database fetch
  const rawLeaderboardData = [
    { id: 1, name: "Ola Nordmann", points: 43, avatar: require("@/assets/images/icon.png") },
    { id: 2, name: "Andreas B. Olaussen", points: 40, avatar: require("@/assets/images/icon.png") },
    { id: 3, name: "Sebastian W. Thomsen", points: 38, avatar: require("@/assets/images/icon.png") },
    { id: 4, name: "Ida K. Tollaksen", points: 36, avatar: require("@/assets/images/icon.png") },
    { id: 5, name: "Khalid O.", points: 35, avatar: require("@/assets/images/icon.png") },
    { id: 6, name: "Emil Berglund", points: 34, avatar: require("@/assets/images/icon.png")},
    { id: 7, name: "Bruker", points: 33, avatar: require("@/assets/images/icon.png") },
    { id: 8, name: "Bruker", points: 32, avatar: require("@/assets/images/icon.png") },
    { id: 9, name: "Bruker", points: 31, avatar: require("@/assets/images/icon.png") },
    { id: 10, name: "Bruker", points: 30, avatar: require("@/assets/images/icon.png") },
  ];

  // Sort by points (descending) and calculate positions
  const leaderboardData = rawLeaderboardData
    .sort((a, b) => b.points - a.points)
    .map((userData_item, index) => ({
      ...userData_item,
      position: index + 1,
      isCurrentUser: userData_item.name === userData.name, // Check if this user is the logged-in user
    }));

  // ------------------------------------------------------------------ //
  /*                    Variables to be handled by Expo                 */
  // ------------------------------------------------------------------ //

  // Frequently used date variables
  const today = currentTime;
  const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const currentDate = today.getDate(); // Day of month
  const currentHour = today.getHours(); // Hour of day
  const currentMinutes = today.getMinutes(); // Minute of hour

  // Calculate Monday of current week
  const mondayDate = new Date(today);
  const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1; // Handle Sunday
  mondayDate.setDate(today.getDate() - daysFromMonday);

  // Generate week days (localized)
  const weekDays = [
    t("weekdays.mon"),
    t("weekdays.tue"),
    t("weekdays.wed"),
    t("weekdays.thu"),
    t("weekdays.fri"),
    t("weekdays.sat"),
    t("weekdays.sun"),
  ];
  const weekDates = [];

  // Populate week dates array
  for (let i = 0; i < 7; i++) {
    const date = new Date(mondayDate);
    date.setDate(mondayDate.getDate() + i);
    weekDates.push({
      day: weekDays[i],
      date: date.getDate(),
      isToday:
        date.getDate() === currentDate && date.getMonth() === today.getMonth(),
    });
  }

  // Generate dynamic time slots based on tasks and default range
  function generateTimeSlots() {
    const defaultStart = 8; // Default start hour (08:00)
    const defaultEnd = 20; // Default end hour (20:00)

    // Extract hours from tasks
    const taskHours = todayTasks.map((task) => {
      const [hour] = task.time.split(":");
      return parseInt(hour, 10);
    });

    // Determine the range including task hours
    const minHour = Math.min(defaultStart, ...taskHours);
    const maxHour = Math.max(defaultEnd, ...taskHours);

    // Generate time slots for the extended range
    const slots = [];
    for (let hour = minHour; hour <= maxHour; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
    }

    return slots;
  }
  // Calculate position for now line dynamically based on actual time slots
  function calculateNowLinePosition() {
    if (timeSlots.length === 0) return { shouldShow: false, position: -1 };

    // Get the first and last hour from time slots
    const firstHour = parseInt(timeSlots[0].split(":")[0], 10);
    const lastHour = parseInt(
      timeSlots[timeSlots.length - 1].split(":")[0],
      10
    );

    // Check if current hour is within the displayed range
    const shouldShow = currentHour >= firstHour && currentHour <= lastHour;

    // Calculate position relative to the first time slot
    const position = shouldShow
      ? currentHour - firstHour + currentMinutes / 60
      : -1;

    return { shouldShow, position };
  }

  // Generate time slots once
  const timeSlots = generateTimeSlots();
  // Get current time for "now line"
  const currentTimeString = `${currentHour
    .toString()
    .padStart(2, "0")}:${currentMinutes.toString().padStart(2, "0")}`;
  // Determine if and where to show the "now line"
  const { shouldShow: shouldShowNowLine, position: nowLinePosition } =
    calculateNowLinePosition();

  return (
    <ScrollView
      style={[styles.outsideSafeArea, { backgroundColor: colors.background }]}
    >
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
          <WelcomeGreeting userName={userData.name} />
          <View style={styles.profileSection}>
            <View style={styles.profileContainer}>
              <Image
                source={{ uri: userData.imageUri }}
                style={styles.profileImage}
              />
            </View>
          </View>
        </View>

        {/* HEADER CALENDAR */}
        <View style={styles.calendarWrapper}>
          <View style={styles.calendarWeek}>
            {weekDates.map((dayData, index) => (
              <View
                key={index}
                style={[
                  styles.calendarDay,
                  dayData.isToday && styles.calendarDayActive,
                ]}
              >
                <Text
                  style={[
                    styles.calendarDayNumber,
                    {
                      color: dayData.isToday
                        ? colors.activeText
                        : colors.lightDarkText,
                    },
                  ]}
                >
                  {dayData.date}
                </Text>
                <Text
                  style={[
                    styles.calendarDayLabel,
                    {
                      color: dayData.isToday ? colors.activeText : colors.text,
                    },
                  ]}
                >
                  {dayData.day}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* MAIN CONTENT */}
        <View style={styles.mainWrapper}>
          <Text
            style={[
              commonStyles.sectionTitle,
              { color: colors.text, marginBottom: 16 },
            ]}
          >
            {t("dashboard.todayTasks")}
          </Text>

          {/* Hourly Calendar */}
          <View style={styles.calendarContainer}>
            {timeSlots.map((timeSlot, index) => {
              // Find task for this time slot
              const taskForSlot = todayTasks.find(
                (task) => task.time === timeSlot
              );

              // Check if we should show the now line after this time slot
              const showNowLineAfter =
                shouldShowNowLine &&
                index < timeSlots.length - 1 &&
                nowLinePosition > index &&
                nowLinePosition < index + 1;

              return (
                <View key={index}>
                  <View style={styles.timeSlotRow}>
                    {/* Time Label */}
                    <View style={styles.timeColumn}>
                      <Text
                        style={[
                          styles.timeLabel,
                          { color: colors.lightDarkText },
                        ]}
                      >
                        {timeSlot}
                      </Text>
                    </View>

                    {/* Task Column */}
                    <View style={styles.taskColumn}>
                      {taskForSlot && (
                        <TouchableOpacity
                          style={[
                            styles.taskCard,
                            {
                              backgroundColor: taskForSlot.finished
                                ? colors.nonInteractiveBackground
                                : colors.interactiveBackground,
                            },
                          ]}
                          onPress={() => {
                            setSelectedTask(taskForSlot);
                            setIsModalVisible(true);
                          }}
                          activeOpacity={0.7}
                        >
                          <View style={styles.taskContent}>
                            <Text
                              style={[
                                styles.taskTitle,
                                {
                                  color: taskForSlot.finished
                                    ? colors.lightNonInteractiveText
                                    : colors.darkText,
                                  textDecorationLine: taskForSlot.finished
                                    ? "line-through"
                                    : "none",
                                },
                              ]}
                            >
                              {taskForSlot.title}
                            </Text>
                            <Text
                              style={[
                                styles.taskSubtitle,
                                {
                                  color: taskForSlot.finished
                                    ? colors.lightNonInteractiveText
                                    : colors.lightText,
                                },
                              ]}
                            >
                              {taskForSlot.assignedTo}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.taskAvatar,
                              taskForSlot.finished && styles.taskAvatarFinished,
                            ]}
                          >
                            <Image
                              source={taskForSlot.avatar}
                              style={[
                                styles.avatarImage,
                                taskForSlot.finished &&
                                  styles.avatarImageFinished,
                              ]}
                            />
                          </View>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  {/* Now Line */}
                  {showNowLineAfter && (
                    <View style={styles.nowLineContainer}>
                      <View style={styles.nowTimeColumn}>
                        <Text
                          style={[
                            styles.nowTimeLabel,
                            { color: colors.activeText },
                          ]}
                        >
                          {currentTimeString}
                        </Text>
                      </View>
                      <View style={styles.nowLineWrapper}>
                        <View
                          style={[
                            styles.nowLine,
                            { backgroundColor: colors.activeText },
                          ]}
                        />
                        <View
                          style={[
                            styles.nowDot,
                            { backgroundColor: colors.activeText },
                          ]}
                        />
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
          <Text style={[commonStyles.sectionTitle, { color: colors.text }]}>{
            t("dashboard.leaderboard")
          }</Text>

          {/* Top 3 Podium */}
          <View style={styles.podiumContainer}>
            {/* Second Place */}
            <View style={styles.podiumPosition}>
              <View style={[styles.podiumAvatar, styles.secondPlaceAvatar]}>
                <Image
                  source={leaderboardData[1].avatar}
                  style={styles.avatarImage}
                />
                <View style={[styles.positionBadge, styles.secondPlaceBadge]}>
                  <Text style={styles.positionText}>2</Text>
                </View>
              </View>
              <Text style={[styles.podiumName, { color: colors.text }]}>
                {leaderboardData[1].name}
              </Text>
              <View style={styles.pointsContainer}>
                <Text style={styles.pointsIcon}>🏆</Text>
                <Text style={[styles.podiumPoints, { color: colors.text }]}>
                  {leaderboardData[1].points} {t("dashboard.pointsShort")}
                </Text>
              </View>
            </View>

            {/* First Place */}
            <View style={styles.firstPlacePosition}>
              <View style={[styles.podiumAvatar, styles.firstPlaceAvatar]}>
                <Image
                  source={leaderboardData[0].avatar}
                  style={styles.avatarImage}
                />
                <View style={[styles.positionBadge, styles.firstPlaceBadge]}>
                  <Text style={styles.positionText}>1</Text>
                </View>
                <View style={styles.crownContainer}>
                  <Text style={styles.crown}>👑</Text>
                </View>
              </View>
              <Text style={[styles.podiumName, { color: colors.text }]}>
                {leaderboardData[0].name}
              </Text>
              <View style={styles.pointsContainer}>
                <Text style={styles.pointsIcon}>🏆</Text>
                <Text style={[styles.podiumPoints, { color: colors.text }]}>
                  {leaderboardData[0].points} {t("dashboard.pointsShort")}
                </Text>
              </View>
            </View>

            {/* Third Place */}
            <View style={styles.podiumPosition}>
              <View style={[styles.podiumAvatar, styles.thirdPlaceAvatar]}>
                <Image
                  source={leaderboardData[2].avatar}
                  style={styles.avatarImage}
                />
                <View style={[styles.positionBadge, styles.thirdPlaceBadge]}>
                  <Text style={styles.positionText}>3</Text>
                </View>
              </View>
              <Text style={[styles.podiumName, { color: colors.text }]}>
                {leaderboardData[2].name}
              </Text>
              <View style={styles.pointsContainer}>
                <Text style={styles.pointsIcon}>🏆</Text>
                <Text style={[styles.podiumPoints, { color: colors.text }]}>
                  {leaderboardData[2].points} {t("dashboard.pointsShort")}
                </Text>
              </View>
            </View>
          </View>

          {/* Positions 4-10 */}
          <View style={styles.leaderboardList}>
            {leaderboardData.slice(3).map((user) => (
              <View
                key={user.id}
                style={[
                  styles.leaderboardItem,
                  user.isCurrentUser && styles.currentUserItem,
                  {
                    backgroundColor: user.isCurrentUser
                      ? colors.tint
                      : colors.contextBackground,
                  },
                ]}
              >
                <View style={styles.leaderboardLeft}>
                  <Text
                    style={[
                      styles.leaderboardPosition,
                      {
                        color: user.isCurrentUser ? colors.black : colors.text,
                      },
                    ]}
                  >
                    {user.position}
                  </Text>
                  <Image
                    source={user.avatar}
                    style={styles.leaderboardAvatar}
                  />
                  <Text
                    style={[
                      styles.leaderboardName,
                      {
                        color: user.isCurrentUser ? colors.black : colors.text,
                      },
                    ]}
                  >
                    {user.name}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.leaderboardPoints,
                    { color: user.isCurrentUser ? colors.black : colors.text },
                  ]}
                >
                  {user.points} {t("dashboard.pointsShort")}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Task Detail Modal */}
      <TaskDetailModal
        visible={isModalVisible}
        task={selectedTask}
        onClose={() => setIsModalVisible(false)}
        actionButtons={
          selectedTask &&
          !selectedTask.finished &&
          selectedTask.assignedTo === userData.name
            ? [
                {
                  label: t("taskDetails.action.markComplete"),
                  iconName: "checkmark-circle-outline",
                  variant: "success",
                  onPress: () => {
                    // TODO: Implement mark as complete functionality
                    console.log("Mark task as complete:", selectedTask?.id);
                    setIsModalVisible(false);
                  },
                },
              ]
            : undefined
        }
      />
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
    width: "100%",
  },
  calendarWeek: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: "100%",
  },
  calendarDay: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 35,
  },
  calendarDayNumber: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  calendarDayLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  calendarDayActive: {
    backgroundColor: "#464545",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 16,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
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
    flexDirection: "row",
    minHeight: 50,
    alignItems: "flex-start",
    paddingVertical: 4,
  },
  timeColumn: {
    width: 60,
    paddingTop: 4,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  taskColumn: {
    flex: 1,
    paddingLeft: 16,
  },
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    fontWeight: "600",
    marginBottom: 2,
  },
  taskSubtitle: {
    fontSize: 14,
  },
  taskAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: "hidden",
    marginLeft: 12,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
  },
  taskAvatarFinished: {
    opacity: 0.5,
  },
  avatarImageFinished: {
    opacity: 0.6,
  },
  searchSlot: {
    flexDirection: "row",
    alignItems: "center",
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
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
    zIndex: 10,
  },
  nowTimeColumn: {
    width: 60,
    alignItems: "flex-start",
  },
  nowTimeLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  nowLineWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
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

  // Leaderboard Styles
  podiumContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 10,
    minHeight: 160,
  },
  podiumPosition: {
    alignItems: "center",
    flex: 1,
  },
  firstPlacePosition: {
    alignItems: "center",
    flex: 1,
    marginTop: -30,
  },
  podiumAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    marginBottom: 8,
  },
  firstPlaceAvatar: {
    borderColor: "#FFD700",
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  secondPlaceAvatar: {
    borderColor: "#FFD700",
  },
  thirdPlaceAvatar: {
    borderColor: "#FFD700",
  },
  positionBadge: {
    // Placement number badge
    position: "absolute",
    bottom: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  firstPlaceBadge: {
    backgroundColor: "#FFD700",
  },
  secondPlaceBadge: {
    backgroundColor: "#FFD700",
  },
  thirdPlaceBadge: {
    backgroundColor: "#FFD700",
  },
  positionText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#000",
  },
  crownContainer: {
    position: "absolute",
    top: -15,
  },
  crown: {
    fontSize: 20,
  },
  podiumName: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  pointsIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  podiumPoints: {
    fontSize: 13,
    fontWeight: "500",
  },
  leaderboardList: {
    gap: 8,
  },
  leaderboardItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  currentUserItem: {
    backgroundColor: "#FF6B9D",
  },
  leaderboardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  leaderboardPosition: {
    fontSize: 16,
    fontWeight: "bold",
    width: 24,
    textAlign: "center",
    marginRight: 12,
  },
  leaderboardAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  leaderboardName: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  leaderboardPoints: {
    fontSize: 16,
    fontWeight: "500",
  },
});
