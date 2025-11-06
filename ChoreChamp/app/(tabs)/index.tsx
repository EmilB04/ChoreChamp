import { useTheme } from "@/contexts/ThemeContext";
import { useUser } from "@/contexts/UserContext";
import { getHouseholdMembers } from "@/services/householdService";
import { getTasksForUser, markTaskAsComplete, markTaskAsIncomplete } from "@/services/taskService";
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
import UserLoadingState from "../../components/UserLoadingState";
import WelcomeGreeting from "../../components/index/WelcomeGreeting";
import SvgFigures from "../../components/index/svg/SvgFigures";
import TaskDetailModal from "../../components/modals/TaskDetailModal";
import commonStyles from "../commonStyles";

// TODO:
// 1. Fetch user data dynamically
// 2. Integrate main content and leaderboard sections
// 3. Add interactivity to calendar (e.g., navigate to daily view on tap)

export default function Dashboard() {
  const { colors } = useTheme();
  const { userData } = useUser();

  // State for current time that updates live
  const [currentTime, setCurrentTime] = useState(new Date());

  // State for selected date (for filtering tasks)
  const [selectedDate, setSelectedDate] = useState(new Date());

  // State for task detail modal
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // State for tasks from database
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  // State for leaderboard data
  const [leaderboardData, setLeaderboardData] = useState<{
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    points: number;
    avatar: any;
    position: number;
    isCurrentUser: boolean;
  }[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

  // Fetch leaderboard data from household members
  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!userData?.id || !userData?.household || userData.household.length === 0) {
        setLoadingLeaderboard(false);
        return;
      }

      setLoadingLeaderboard(true);
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
          setLoadingLeaderboard(false);
          return;
        }

        const members = await getHouseholdMembers(householdId);

        // Sort by points and add position
        const sortedMembers = members
          .sort((a, b) => b.points - a.points)
          .map((member, index) => ({
            ...member,
            fullName: `${member.firstName} ${member.lastName}`.trim(),
            avatar: member.imageUri ? { uri: member.imageUri } : require("@/assets/images/icon.png"),
            position: index + 1,
            isCurrentUser: member.id === userData.id,
          }));

        setLeaderboardData(sortedMembers);
      } catch (error) {
        console.error('❌ Error loading leaderboard:', error);
        setLeaderboardData([]);
      } finally {
        setLoadingLeaderboard(false);
      }
    };

    fetchLeaderboard();
  }, [userData?.id, userData?.household]);

  // Fetch tasks for the current user
  useEffect(() => {
    const fetchTasks = async () => {
      if (!userData?.id) {
        setLoadingTasks(false);
        return;
      }

      setLoadingTasks(true);
      try {
        const tasks = await getTasksForUser(userData.id);
        
        // Transform TaskData to Task format for the UI
        const transformedTasks: Task[] = tasks.map((task, index) => {
          const timeStart = new Date(task.timeStart);
          const timeEnd = new Date(task.timeEnd);
          const hours = timeStart.getHours().toString().padStart(2, '0');
          const minutes = timeStart.getMinutes().toString().padStart(2, '0');
          
          return {
            id: index + 1,
            title: task.title,
            description: task.description,
            time: `${hours}:${minutes}`,
            assignedTo: userData.username, // Using current user's name
            avatar: userData.imageUri ? { uri: userData.imageUri } : require("@/assets/images/icon.png"),
            duration: Math.round((timeEnd.getTime() - timeStart.getTime()) / 60000), // Duration in minutes
            finished: task.done,
            timeStart, // Keep the full Date object
            timeEnd, // Keep the full Date object
            firebaseId: task.id, // Store Firebase document ID
          };
        });

        setAllTasks(transformedTasks);
      } catch (error) {
        console.error('❌ Error loading tasks:', error);
        // Keep empty array on error
        setAllTasks([]);
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.id]);

  // Filter tasks for the selected date
  const tasksForSelectedDate = allTasks.filter((task) => {
    if (!task.timeStart) return false;
    
    const taskDate = new Date(task.timeStart);
    return (
      taskDate.getDate() === selectedDate.getDate() &&
      taskDate.getMonth() === selectedDate.getMonth() &&
      taskDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  // Handle marking task as complete
  const handleCompleteTask = async (taskId: number, firebaseTaskId: string) => {
    try {
      const success = await markTaskAsComplete(firebaseTaskId);
      if (success) {
        // Update the local state to reflect the change
        setAllTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === taskId ? { ...task, finished: true } : task
          )
        );
        console.log('✅ Task marked as complete locally');
      }
    } catch (error) {
      console.error('❌ Error completing task:', error);
    }
  };

  // Handle marking task as incomplete (undo)
  const handleUndoTask = async (taskId: number, firebaseTaskId: string) => {
    try {
      const success = await markTaskAsIncomplete(firebaseTaskId);
      if (success) {
        // Update the local state to reflect the change
        setAllTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === taskId ? { ...task, finished: false } : task
          )
        );
        console.log('↩️ Task marked as incomplete locally');
      }
    } catch (error) {
      console.error('❌ Error undoing task:', error);
    }
  };

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date());
    };
    updateTime(); // Update immediately on mount
    const interval = setInterval(updateTime, 10000); // Update every 10 seconds
    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  // Show loading state while user data is being fetched
  if (!userData) {
    return <UserLoadingState pageName="Dashboard" />;
  }

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

  // Generate week days
  const weekDays = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
  const weekDates = [];

  // Populate week dates array
  for (let i = 0; i < 7; i++) {
    const date = new Date(mondayDate);
    date.setDate(mondayDate.getDate() + i);
    weekDates.push({
      day: weekDays[i],
      date: date.getDate(),
      fullDate: date,
      isToday:
        date.getDate() === currentDate && date.getMonth() === today.getMonth(),
      isSelected:
        date.getDate() === selectedDate.getDate() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getFullYear() === selectedDate.getFullYear(),
    });
  }

  // Generate dynamic time slots based on tasks and default range
  function generateTimeSlots() {
    const defaultStart = 8; // Default start hour (08:00)
    const defaultEnd = 20; // Default end hour (20:00)

    // Extract hours from tasks (both start and end times)
    const taskHours: number[] = [];
    tasksForSelectedDate.forEach((task) => {
      if (task.timeStart && task.timeEnd) {
        taskHours.push(task.timeStart.getHours());
        taskHours.push(task.timeEnd.getHours());
      }
    });

    // Determine the range including task hours
    const minHour = taskHours.length > 0 ? Math.min(defaultStart, ...taskHours) : defaultStart;
    const maxHour = taskHours.length > 0 ? Math.max(defaultEnd, ...taskHours) : defaultEnd;

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
          <WelcomeGreeting username={userData.username} />
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
              <TouchableOpacity
                key={index}
                style={[
                  styles.calendarDay,
                  (dayData.isToday || dayData.isSelected) && styles.calendarDayActive,
                ]}
                onPress={() => setSelectedDate(dayData.fullDate)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.calendarDayNumber,
                    {
                      color: (dayData.isToday || dayData.isSelected)
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
                      color: (dayData.isToday || dayData.isSelected) ? colors.activeText : colors.text,
                    },
                  ]}
                >
                  {dayData.day}
                </Text>
              </TouchableOpacity>
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
            Dagens oppgaver:
          </Text>

          {loadingTasks ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: colors.text }]}>
                Laster oppgaver...
              </Text>
            </View>
          ) : tasksForSelectedDate.length === 0 ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: colors.lightDarkText }]}>
                Ingen oppgaver for denne dagen 🎉
              </Text>
            </View>
          ) : (
            <View style={styles.calendarContainer}>
            {timeSlots.map((timeSlot, index) => {
              // Parse the current time slot hour
              const [slotHour] = timeSlot.split(':').map(Number);
              const slotTime = new Date();
              slotTime.setHours(slotHour, 0, 0, 0);
              const nextSlotTime = new Date(slotTime);
              nextSlotTime.setHours(slotHour + 1, 0, 0, 0);

              // Find task that STARTS in this time slot
              const taskStartingInSlot = tasksForSelectedDate.find((task) => {
                if (!task.timeStart) return false;
                
                const taskStartHour = task.timeStart.getHours();
                return taskStartHour === slotHour;
              });

              // Calculate task height if there's a task starting here
              let taskHeight = 60; // Default height for one hour slot
              if (taskStartingInSlot && taskStartingInSlot.timeStart && taskStartingInSlot.timeEnd) {
                const durationMs = taskStartingInSlot.timeEnd.getTime() - taskStartingInSlot.timeStart.getTime();
                const durationHours = durationMs / (1000 * 60 * 60);
                // Each hour slot is approximately 60px (minHeight 50 + padding)
                taskHeight = Math.max(60, durationHours * 60);
              }

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
                      {taskStartingInSlot && (
                        <TouchableOpacity
                          style={[
                            styles.taskCard,
                            {
                              backgroundColor: taskStartingInSlot.finished
                                ? colors.nonInteractiveBackground
                                : colors.interactiveBackground,
                              minHeight: taskHeight,
                            },
                          ]}
                          onPress={() => {
                            setSelectedTask(taskStartingInSlot);
                            setIsModalVisible(true);
                          }}
                          activeOpacity={0.7}
                        >
                          <View style={styles.taskContent}>
                            <Text
                              style={[
                                styles.taskTitle,
                                {
                                  color: taskStartingInSlot.finished
                                    ? colors.lightNonInteractiveText
                                    : colors.darkText,
                                  textDecorationLine: taskStartingInSlot.finished
                                    ? "line-through"
                                    : "none",
                                },
                              ]}
                            >
                              {taskStartingInSlot.title}
                            </Text>
                            <Text
                              style={[
                                styles.taskSubtitle,
                                {
                                  color: taskStartingInSlot.finished
                                    ? colors.lightNonInteractiveText
                                    : colors.lightText,
                                },
                              ]}
                            >
                              {taskStartingInSlot.assignedTo}
                            </Text>
                          </View>
                          
                          <View
                            style={[
                              styles.taskAvatar,
                              taskStartingInSlot.finished && styles.taskAvatarFinished,
                            ]}
                          >
                            <Image
                              source={taskStartingInSlot.avatar}
                              style={[
                                styles.avatarImage,
                                taskStartingInSlot.finished &&
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
          )}
        </View>

        {/* Leaderboard */}
        <View style={styles.leaderboardWrapper}>
          <Text style={[commonStyles.sectionTitle, { color: colors.text }]}>
            Ledertavle:
          </Text>

          {loadingLeaderboard ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: colors.text }]}>
                Laster ledertavle...
              </Text>
            </View>
          ) : leaderboardData.length === 0 ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: colors.text }]}>
                Ingen medlemmer i husstanden
              </Text>
            </View>
          ) : leaderboardData.length < 3 ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: colors.text }]}>
                Trenger minst 3 medlemmer for ledertavle
              </Text>
            </View>
          ) : (
            <>
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
                {leaderboardData[1].fullName}
              </Text>
              <View style={styles.pointsContainer}>
                <Text style={styles.pointsIcon}>🏆</Text>
                <Text style={[styles.podiumPoints, { color: colors.text }]}>
                  {leaderboardData[1].points} pts
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
                {leaderboardData[0].fullName}
              </Text>
              <View style={styles.pointsContainer}>
                <Text style={styles.pointsIcon}>🏆</Text>
                <Text style={[styles.podiumPoints, { color: colors.text }]}>
                  {leaderboardData[0].points} pts
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
                {leaderboardData[2].fullName}
              </Text>
              <View style={styles.pointsContainer}>
                <Text style={styles.pointsIcon}>🏆</Text>
                <Text style={[styles.podiumPoints, { color: colors.text }]}>
                  {leaderboardData[2].points} pts
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
                    {user.fullName}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.leaderboardPoints,
                    { color: user.isCurrentUser ? colors.black : colors.text },
                  ]}
                >
                  {user.points} pts
                </Text>
              </View>
            ))}
          </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Task Detail Modal */}
      <TaskDetailModal
        visible={isModalVisible}
        task={selectedTask}
        onClose={() => setIsModalVisible(false)}
        actionButtons={
          selectedTask && selectedTask.firebaseId
            ? selectedTask.finished
              ? [
                  {
                    label: "Angre",
                    iconName: "arrow-undo-outline",
                    variant: "danger",
                    onPress: async () => {
                      if (selectedTask.firebaseId) {
                        await handleUndoTask(selectedTask.id, selectedTask.firebaseId);
                        setIsModalVisible(false);
                      }
                    },
                  },
                ]
              : [
                  {
                    label: "Fullfør",
                    iconName: "checkmark-circle-outline",
                    variant: "success",
                    onPress: async () => {
                      if (selectedTask.firebaseId) {
                        await handleCompleteTask(selectedTask.id, selectedTask.firebaseId);
                        setIsModalVisible(false);
                      }
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
    alignItems: "flex-start",
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '500',
  },
});
