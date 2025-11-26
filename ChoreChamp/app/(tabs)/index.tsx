import FullScreenLoader from "@/components/FullScreenLoader";
import { useTheme } from "@/contexts/ThemeContext";
import { useUser } from "@/contexts/UserContext";
import {
  generateAvatarSvg,
  isDicebearAvatar,
  parseDicebearUri,
} from "@/lib/avatarUtils";
import { getWeeklyLeaderboard, getAggregatedLeaderboard } from "@/services/leaderboardService";
import { getTasksForUser, markTaskAsComplete, markTaskAsIncomplete, rejectTask, resetVerification, verifyTask } from "@/services/taskService";
import type { Task } from "@/types/task";
import { getCurrentWeek, getPreviousWeek, getWeeksInCurrentMonth, getWeeksInCurrentYear } from "@/utils/weekUtils";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SvgXml } from "react-native-svg";
import UserLoadingState from "../../components/UserLoadingState";
import WelcomeGreeting from "../../components/index/WelcomeGreeting";
import SvgFigures from "../../components/index/svg/SvgFigures";
import TaskDetailModal from "../../components/modals/TaskDetailModal";
import commonStyles from "../commonStyles";

export default function Dashboard() {
  const { colors } = useTheme();
  const { userData } = useUser();
  const { weekNumber, year } = getCurrentWeek();

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
    imageUri: string;
    avatar: any;
    position: number;
    isCurrentUser: boolean;
  }[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

  // State for pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);

  // State for leaderboard filter
  type LeaderboardFilter = 'thisWeek' | 'lastWeek' | 'thisMonth' | 'thisYear';
  const [leaderboardFilter, setLeaderboardFilter] = useState<LeaderboardFilter>('thisWeek');
  const [showFilterModal, setShowFilterModal] = useState(false);

  const { t } = useTranslation('app');

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

        // Get leaderboard based on selected filter
        let leaderboard;
        if (leaderboardFilter === 'thisWeek') {
          leaderboard = await getWeeklyLeaderboard(householdId);
        } else if (leaderboardFilter === 'lastWeek') {
          const prevWeek = getPreviousWeek();
          leaderboard = await getWeeklyLeaderboard(householdId, prevWeek.weekKey);
        } else if (leaderboardFilter === 'thisMonth') {
          const weeks = getWeeksInCurrentMonth();
          leaderboard = await getAggregatedLeaderboard(householdId, weeks);
        } else if (leaderboardFilter === 'thisYear') {
          const weeks = getWeeksInCurrentYear();
          leaderboard = await getAggregatedLeaderboard(householdId, weeks);
        }

        // Transform to match UI format
        const transformedLeaderboard = leaderboard?.map((entry, index) => ({
          id: entry.userId,
          firstName: entry.firstName,
          lastName: entry.lastName,
          fullName: `${entry.firstName} ${entry.lastName}`.trim(),
          points: entry.points,
          imageUri: entry.imageUri || '',
          avatar: entry.imageUri ? { uri: entry.imageUri } : require("@/assets/images/icon.png"),
          position: index + 1,
          isCurrentUser: entry.userId === userData.id,
        })) || [];

        setLeaderboardData(transformedLeaderboard);
      } catch (error) {
        console.error('❌ Error loading leaderboard:', error);
        setLeaderboardData([]);
      } finally {
        setLoadingLeaderboard(false);
      }
    };

    fetchLeaderboard();
  }, [userData?.id, userData?.household, leaderboardFilter]);

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
            assignedFrom: task.createdByName || t('profile.notSpecified'),
            assignedFromAvatar: task.createdByAvatar ? { uri: task.createdByAvatar } : require("@/assets/images/icon.png"),
            duration: Math.round((timeEnd.getTime() - timeStart.getTime()) / 60000), // Duration in minutes
            finished: task.done,
            timeStart, // Keep the full Date object
            timeEnd, // Keep the full Date object
            firebaseId: task.id, // Store Firebase document ID
            imgEvidence: task.imgEvidence, // Include image evidence
            verificationStatus: task.verificationStatus || 'not_reviewed', // Include verification status
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
    if (!userData?.id) {
      console.error('❌ No user ID available');
      return;
    }

    try {
      // Request camera permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          t('alerts.permissionRequiredTitle'),
          t('alerts.permissionRequiredMessage'),
          [{ text: t('alerts.ok') }]
        );
        return;
      }

      // Launch camera to take photo
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (result.canceled) {
        return; // User cancelled, don't complete the task
      }

      const imageUri = result.assets[0].uri;
      console.log('📸 Image captured:', imageUri);

      // Convert image to base64 to store in Firestore
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      // Convert blob to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const base64data = reader.result as string;
          resolve(base64data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      
      const base64Image = await base64Promise;
      console.log('🔄 Image converted to base64, size:', base64Image.length);

      // Mark task as complete with image evidence (base64 data URI) and user tracking
      const success = await markTaskAsComplete(firebaseTaskId, userData.id, base64Image);
      
      if (success) {
        // Update the local state to reflect the change
        setAllTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === taskId ? { ...task, finished: true, imgEvidence: base64Image } : task
          )
        );
        console.log('✅ Task marked as complete with evidence');
        Alert.alert(t('alerts.successTitle'), t('alerts.successComplete'));
      }
    } catch (error: any) {
      console.error('❌ Error completing task:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error code:', error.code);
      Alert.alert(t('alerts.errorTitle'), t('alerts.couldNotComplete', { msg: error.message || 'Ukjent feil' }));
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
            task.id === taskId ? { ...task, finished: false, verificationStatus: 'not_reviewed' } : task
          )
        );
        console.log('↩️ Task marked as incomplete locally');
      }
    } catch (error) {
      console.error('❌ Error undoing task:', error);
    }
  };

  // Handle verifying a task (admin action)
  const handleVerifyTask = async (taskId: number, firebaseTaskId: string) => {
    try {
      const success = await verifyTask(firebaseTaskId);
      if (success) {
        setAllTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === taskId ? { ...task, verificationStatus: 'verified' } : task
          )
        );
        console.log('✅ Task verified by admin');
        Alert.alert(t('alerts.verifiedTitle'), t('alerts.verifiedMessage'));
        setIsModalVisible(false);
      }
    } catch (error) {
      console.error('❌ Error verifying task:', error);
      Alert.alert(t('alerts.errorTitle'), t('alerts.couldNotComplete', { msg: '' }));
    }
  };

  // Handle rejecting a task (admin action)
  const handleRejectTask = async (taskId: number, firebaseTaskId: string) => {
    try {
      const success = await rejectTask(firebaseTaskId);
      if (success) {
        setAllTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === taskId ? { ...task, verificationStatus: 'rejected' } : task
          )
        );
        console.log('❌ Task rejected by admin');
        Alert.alert(t('alerts.rejectedTitle'), t('alerts.rejectedMessage'));
        setIsModalVisible(false);
      }
    } catch (error) {
      console.error('❌ Error rejecting task:', error);
      Alert.alert(t('alerts.errorTitle'), t('alerts.couldNotComplete', { msg: '' }));
    }
  };

  // Handle resetting verification status (undo admin action)
  const handleResetVerification = async (taskId: number, firebaseTaskId: string) => {
    try {
      const success = await resetVerification(firebaseTaskId);
      if (success) {
        setAllTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === taskId ? { ...task, verificationStatus: 'not_reviewed', finished: true } : task
          )
        );
        console.log('🔄 Verification status reset');
        Alert.alert(t('alerts.resetTitle'), t('alerts.resetMessage'));
        setIsModalVisible(false);
      }
    } catch (error) {
      console.error('❌ Error resetting verification:', error);
      Alert.alert(t('alerts.errorTitle'), t('alerts.couldNotComplete', { msg: '' }));
    }
  };

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    
    try {
      // Fetch both leaderboard and tasks in parallel
      const promises = [];

      // Fetch leaderboard
      if (userData?.id && userData?.household && userData.household.length > 0) {
        const leaderboardPromise = (async () => {
          let householdId = '';
          const firstHousehold = userData.household![0];
          
          if (typeof firstHousehold === 'string') {
            householdId = firstHousehold.split('/').pop() || '';
          } else if (firstHousehold && typeof firstHousehold === 'object' && 'id' in firstHousehold) {
            householdId = (firstHousehold as any).id;
          }

          if (householdId) {
            // Get weekly leaderboard (already sorted by points)
            const leaderboard = await getWeeklyLeaderboard(householdId);
            
            // Transform to match UI format
            const transformedLeaderboard = leaderboard.map((entry, index) => ({
              id: entry.userId,
              firstName: entry.firstName,
              lastName: entry.lastName,
              fullName: `${entry.firstName} ${entry.lastName}`.trim(),
              points: entry.points,
              imageUri: entry.imageUri || '',
              avatar: entry.imageUri ? { uri: entry.imageUri } : require("@/assets/images/icon.png"),
              position: index + 1,
              isCurrentUser: entry.userId === userData.id,
            }));
            setLeaderboardData(transformedLeaderboard);
          }
        })();
        promises.push(leaderboardPromise);
      }

      // Fetch tasks
      if (userData?.id) {
        const tasksPromise = (async () => {
          const tasks = await getTasksForUser(userData.id);
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
              assignedTo: userData.username,
              avatar: userData.imageUri ? { uri: userData.imageUri } : require("@/assets/images/icon.png"),
              assignedFrom: task.createdByName || t('profile.notSpecified'),
              assignedFromAvatar: task.createdByAvatar ? { uri: task.createdByAvatar } : require("@/assets/images/icon.png"),
              duration: Math.round((timeEnd.getTime() - timeStart.getTime()) / 60000),
              finished: task.done,
              timeStart,
              timeEnd,
              firebaseId: task.id,
            };
          });
          setAllTasks(transformedTasks);
        })();
        promises.push(tasksPromise);
      }

      await Promise.all(promises);
    } catch (error) {
      console.error('❌ Error refreshing data:', error);
    } finally {
      setRefreshing(false);
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

  // Full-screen loading overlay if tasks or leaderboard are loading
  if (loadingTasks || loadingLeaderboard) {
    return <FullScreenLoader text={t('dashboard.loadingTasks')} />;
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
  const weekDays = [t('weekdays.mon'), t('weekdays.tue'), t('weekdays.wed'), t('weekdays.thu'), t('weekdays.fri'), t('weekdays.sat'), t('weekdays.sun')];
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
    const bufferHours = 4; // Show 4 hours before and after tasks

    // Extract hours from tasks (both start and end times)
    const taskHours: number[] = [];
    tasksForSelectedDate.forEach((task) => {
      if (task.timeStart && task.timeEnd) {
        taskHours.push(task.timeStart.getHours());
        taskHours.push(task.timeEnd.getHours());
      }
    });

    let minHour: number;
    let maxHour: number;

    if (taskHours.length > 0) {
      // If there are tasks, show buffer hours around them
      const earliestTask = Math.min(...taskHours);
      const latestTask = Math.max(...taskHours);
      
      minHour = Math.max(0, earliestTask - bufferHours); // Don't go below 0
      maxHour = Math.min(23, latestTask + bufferHours); // Don't go above 23
    } else {
      // If no tasks, show default range (current time ± 4 hours)
      const currentHour = new Date().getHours();
      minHour = Math.max(0, currentHour - bufferHours);
      maxHour = Math.min(23, currentHour + bufferHours);
    }

    // Generate time slots for the range
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
    <View style={[styles.outsideSafeArea, { backgroundColor: colors.background }]}>
      {/* Scrollable Content with Refresh Control */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.tint}
            colors={[colors.tint]}
          />
        }
      >
        {/* SVG Decorations at top of scrollable content */}
        <View pointerEvents="none">
          <SvgFigures.BackgroundShape tintColor={colors.tint} />
          <SvgFigures.CircularShape tintColor={colors.tint} />
          <SvgFigures.SmallDot tintColor={colors.tint} />
        </View>

        <View style={commonStyles.container}>
        {/* HEADER */}
        <View style={[styles.header, commonStyles.headerTitle]}>
          <WelcomeGreeting username={userData.username} />
          <View style={styles.profileSection}>
            <View style={styles.profileContainer}>
            {!userData.imageUri ? (
                <View style={[styles.profileImage, {justifyContent: 'center', paddingLeft: 2, paddingTop: 5}]}>
                    <Ionicons name="person" size={40} color={colors.darkText} />
                </View>
                ) : isDicebearAvatar(userData.imageUri) ? (
                <View style={[styles.profileImage, { borderRadius: 18, overflow: "hidden" }]}>
                    <SvgXml
                    xml={generateAvatarSvg(parseDicebearUri(userData.imageUri)!)}
                    width="100%"
                    height="100%"
                    />
                </View>
                ) : (
                <Image source={{ uri: userData.imageUri }} style={styles.profileImage} />
                )}
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
            {t('dashboard.title')}
          </Text>

          {loadingTasks ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: colors.text }]}>
                {t('dashboard.loadingTasks')}
              </Text>
            </View>
          ) : tasksForSelectedDate.length === 0 ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: colors.lightDarkText }]}>
                {t('dashboard.noTasks')}
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
          <View style={styles.leaderboardHeader}>
            <View>
              <Text style={[commonStyles.sectionTitle, { color: colors.text }]}>
              {t('leaderboard.title')}
            </Text>
              <Text style={[styles.weekIndicator, { color: colors.lightText }]}>
                {leaderboardFilter === 'thisWeek' && `${t('leaderboard.thisWeekLabel')} ${weekNumber}, ${year}`}
                {leaderboardFilter === 'lastWeek' && t('leaderboard.lastWeekLabel')}
                {leaderboardFilter === 'thisMonth' && t('leaderboard.thisMonthLabel')}
                {leaderboardFilter === 'thisYear' && `${t('leaderboard.thisYearLabel', { year })}`}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setShowFilterModal(true)}
            >
              <Ionicons name="funnel-outline" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {loadingLeaderboard ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: colors.text }]}> 
                {t('leaderboard.loading')}
              </Text>
            </View>
          ) : leaderboardData.length === 0 ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: colors.text }]}> 
                {t('leaderboard.noMembers')}
              </Text>
            </View>
          ) : leaderboardData.length < 3 ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: colors.text }]}> 
                {t('leaderboard.needMore')}
              </Text>
            </View>
          ) : (
            <>
              {/* Top 3 Podium */}
              <View style={styles.podiumContainer}>
            {/* Second Place */}
                <View style={styles.podiumPosition}>
                  <View style={[styles.podiumAvatar, styles.secondPlaceAvatar]}>
                    {leaderboardData[1].imageUri ? (
                      <Image
                        source={{ uri: leaderboardData[1].imageUri }}
                        style={styles.avatarImage}
                      />
                    ) : (
                      <View style={[styles.avatarImage, { backgroundColor: colors.tint, alignItems: 'center', justifyContent: 'center' }]}> 
                        <Text style={{ color: colors.darkText, fontWeight: '700', fontSize: 20 }}>
                          {`${leaderboardData[1].firstName?.charAt(0) || ''}${leaderboardData[1].lastName?.charAt(0) || ''}`}
                        </Text>
                      </View>
                    )}
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
                      {leaderboardData[1].points} {t('points.short')}
                    </Text>
                  </View>
                </View>

            {/* First Place */}
                <View style={styles.firstPlacePosition}>
                  <View style={[styles.podiumAvatar, styles.firstPlaceAvatar]}>
                    {leaderboardData[0].imageUri ? (
                      <Image
                        source={{ uri: leaderboardData[0].imageUri }}
                        style={styles.avatarImage}
                      />
                    ) : (
                      <View style={[styles.avatarImage, { backgroundColor: colors.tint, alignItems: 'center', justifyContent: 'center' }]}> 
                        <Text style={{ color: colors.darkText, fontWeight: '700', fontSize: 20 }}>
                          {`${leaderboardData[0].firstName?.charAt(0) || ''}${leaderboardData[0].lastName?.charAt(0) || ''}`}
                        </Text>
                      </View>
                    )}
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
                      {leaderboardData[0].points} {t('points.short')}
                    </Text>
                  </View>
                </View>

            {/* Third Place */}
                <View style={styles.podiumPosition}>
                  <View style={[styles.podiumAvatar, styles.thirdPlaceAvatar]}>
                    {leaderboardData[2].imageUri ? (
                      <Image
                        source={{ uri: leaderboardData[2].imageUri }}
                        style={styles.avatarImage}
                      />
                    ) : (
                      <View style={[styles.avatarImage, { backgroundColor: colors.tint, alignItems: 'center', justifyContent: 'center' }]}> 
                        <Text style={{ color: colors.darkText, fontWeight: '700', fontSize: 20 }}>
                          {`${leaderboardData[2].firstName?.charAt(0) || ''}${leaderboardData[2].lastName?.charAt(0) || ''}`}
                        </Text>
                      </View>
                    )}
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
                      {leaderboardData[2].points} {t('points.short')}
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
                  {user.imageUri ? (
                    <Image
                      source={{ uri: user.imageUri }}
                      style={styles.leaderboardAvatar}
                    />
                  ) : (
                    <View style={[styles.leaderboardAvatar, { backgroundColor: colors.tint, alignItems: 'center', justifyContent: 'center' }]}> 
                      <Text style={{ color: colors.darkText, fontWeight: '700', fontSize: 16 }}>
                        {`${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`}
                      </Text>
                    </View>
                  )}
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
                  {user.points} {t('points.short')}
                </Text>
              </View>
            ))}
          </View>
            </>
          )}
        </View>
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
                  // Undo button for finished tasks (only show if not verified/rejected)
                  ...(selectedTask.verificationStatus === 'not_reviewed' 
                    ? [
                        {
                          label: t('actions.undo'),
                          iconName: "arrow-undo-outline" as keyof typeof import("@expo/vector-icons").Ionicons.glyphMap,
                          variant: "danger" as const,
                          onPress: async () => {
                            if (selectedTask.firebaseId) {
                              await handleUndoTask(selectedTask.id, selectedTask.firebaseId);
                              setIsModalVisible(false);
                            }
                          },
                        },
                      ]
                    : []
                  ),
                  // Admin-only buttons
                  ...((userData?.role?.admin === true)
                    ? [
                        // Admin verification buttons (only show for tasks not yet verified)
                        ...(selectedTask.verificationStatus === 'not_reviewed'
                          ? [
                              {
                                label: t('actions.verify'),
                                iconName: "checkmark-done-outline" as keyof typeof import("@expo/vector-icons").Ionicons.glyphMap,
                                variant: "success" as const,
                                onPress: async () => {
                                  if (selectedTask.firebaseId) {
                                    await handleVerifyTask(selectedTask.id, selectedTask.firebaseId);
                                    setIsModalVisible(false);
                                  }
                                },
                              },
                              {
                                label: t('actions.reject'),
                                iconName: "close-circle-outline" as keyof typeof import("@expo/vector-icons").Ionicons.glyphMap,
                                variant: "danger" as const,
                                onPress: async () => {
                                  if (selectedTask.firebaseId) {
                                    await handleRejectTask(selectedTask.id, selectedTask.firebaseId);
                                    setIsModalVisible(false);
                                  }
                                },
                              },
                            ]
                          : []
                        ),
                        // Undo verification button (only show for verified tasks)
                        ...(selectedTask.verificationStatus === 'verified'
                          ? [
                              {
                                label: t('actions.undoVerify'),
                                iconName: "arrow-undo-outline" as keyof typeof import("@expo/vector-icons").Ionicons.glyphMap,
                                variant: "secondary" as const,
                                onPress: async () => {
                                  if (selectedTask.firebaseId) {
                                    await handleResetVerification(selectedTask.id, selectedTask.firebaseId);
                                    setIsModalVisible(false);
                                  }
                                },
                              },
                            ]
                          : []
                        ),
                        // Undo rejection button (only show for rejected tasks)
                        ...(selectedTask.verificationStatus === 'rejected'
                          ? [
                              {
                                label: t('actions.undoReject'),
                                iconName: "arrow-undo-outline" as keyof typeof import("@expo/vector-icons").Ionicons.glyphMap,
                                variant: "secondary" as const,
                                onPress: async () => {
                                  if (selectedTask.firebaseId) {
                                    await handleResetVerification(selectedTask.id, selectedTask.firebaseId);
                                    setIsModalVisible(false);
                                  }
                                },
                              },
                            ]
                          : []
                        ),
                      ]
                    : []
                  ),
                ]
              : [
                  {
                    label: t('actions.complete'),
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

      {/* Leaderboard Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilterModal(false)}
        >
          <View style={[styles.filterModalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.filterModalTitle, { color: colors.text }]}>
              {t('leaderboard.filterTitle')}
            </Text>
            
            <TouchableOpacity
              style={[
                styles.filterOption,
                leaderboardFilter === 'thisWeek' && { backgroundColor: colors.tint + '20' }
              ]}
              onPress={() => {
                setLeaderboardFilter('thisWeek');
                setShowFilterModal(false);
              }}
            >
              <Ionicons 
                name={leaderboardFilter === 'thisWeek' ? 'radio-button-on' : 'radio-button-off'} 
                size={24} 
                color={leaderboardFilter === 'thisWeek' ? colors.tint : colors.lightText} 
              />
              <Text style={[styles.filterOptionText, { color: colors.text }]}>
                {t('leaderboard.thisWeekLabel')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterOption,
                leaderboardFilter === 'lastWeek' && { backgroundColor: colors.tint + '20' }
              ]}
              onPress={() => {
                setLeaderboardFilter('lastWeek');
                setShowFilterModal(false);
              }}
            >
              <Ionicons 
                name={leaderboardFilter === 'lastWeek' ? 'radio-button-on' : 'radio-button-off'} 
                size={24} 
                color={leaderboardFilter === 'lastWeek' ? colors.tint : colors.lightText} 
              />
              <Text style={[styles.filterOptionText, { color: colors.text }]}>
                {t('leaderboard.lastWeekLabel')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterOption,
                leaderboardFilter === 'thisMonth' && { backgroundColor: colors.tint + '20' }
              ]}
              onPress={() => {
                setLeaderboardFilter('thisMonth');
                setShowFilterModal(false);
              }}
            >
              <Ionicons 
                name={leaderboardFilter === 'thisMonth' ? 'radio-button-on' : 'radio-button-off'} 
                size={24} 
                color={leaderboardFilter === 'thisMonth' ? colors.tint : colors.lightText} 
              />
              <Text style={[styles.filterOptionText, { color: colors.text }]}>
                {t('leaderboard.thisMonthLabel')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterOption,
                leaderboardFilter === 'thisYear' && { backgroundColor: colors.tint + '20' }
              ]}
              onPress={() => {
                setLeaderboardFilter('thisYear');
                setShowFilterModal(false);
              }}
            >
              <Ionicons 
                name={leaderboardFilter === 'thisYear' ? 'radio-button-on' : 'radio-button-off'} 
                size={24} 
                color={leaderboardFilter === 'thisYear' ? colors.tint : colors.lightText} 
              />
              <Text style={[styles.filterOptionText, { color: colors.text }]}>
                {t('leaderboard.thisYearLabel')}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  outsideSafeArea: {
    flex: 1,
    margin: 0,
    padding: 0,
  },
  fixedSvgLayer: {
    position: 'relative',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    zIndex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 2,
    position: "relative",
    marginTop: 8,
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
  leaderboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  weekIndicator: {
    fontSize: 14,
    fontWeight: '500',
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
  filterButton: {
    padding: 8,
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  filterModalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  filterModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  filterOptionText: {
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  },
});
