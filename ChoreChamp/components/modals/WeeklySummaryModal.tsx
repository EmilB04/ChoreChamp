import { useTheme } from "@/contexts/ThemeContext";
import { WeeklySummary } from "@/services/taskService";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface WeeklySummaryModalProps {
  visible: boolean;
  onClose: () => void;
  summary: WeeklySummary | null;
}

export default function WeeklySummaryModal({
  visible,
  onClose,
  summary,
}: WeeklySummaryModalProps) {
  const { colors } = useTheme();

  if (!summary) return null;

  const formatDate = (date: Date): string => {
    const months = [
      "jan",
      "feb",
      "mar",
      "apr",
      "mai",
      "jun",
      "jul",
      "aug",
      "sep",
      "okt",
      "nov",
      "des",
    ];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.contextBackground },
          ]}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Uke {summary.weekNumber} - Oppsummering
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Date Range */}
            <View style={styles.dateRangeContainer}>
              <Text style={[styles.dateRange, { color: colors.lightNonInteractiveText }]}>
                {formatDate(summary.startDate)} - {formatDate(summary.endDate)}
              </Text>
            </View>

            {/* Statistics Cards */}
            <View style={styles.statsContainer}>
              {/* Tasks Completed Card */}
              <View
                style={[
                  styles.statCard,
                  { backgroundColor: colors.background },
                ]}
              >
                <Text style={[styles.statLabel, { color: colors.lightNonInteractiveText }]}>
                  Oppgaver fullført
                </Text>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {summary.completedTasks} / {summary.totalTasks}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: summary.allCompleted
                        ? colors.statusSuccessBackground
                        : colors.statusFailedBackground,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      {
                        color: summary.allCompleted
                          ? colors.statusSuccessText
                          : colors.statusFailedText,
                      },
                    ]}
                  >
                    {summary.allCompleted ? "Alle fullført" : "Ikke fullført"}
                  </Text>
                </View>
              </View>

              {/* Top Contributor Card */}
              {summary.topContributor && summary.topContributor.name && (
                <View
                  style={[
                    styles.statCard,
                    { backgroundColor: colors.background },
                  ]}
                >
                  <Text style={[styles.statLabel, { color: colors.lightNonInteractiveText }]}>
                    Mest poeng
                  </Text>
                  <Text style={[styles.contributorName, { color: colors.text }]}>
                    {summary.topContributor.name}
                  </Text>
                  <Text style={[styles.contributorPoints, { color: colors.tint }]}>
                    {summary.topContributor.points} poeng
                  </Text>
                </View>
              )}
            </View>

            {/* Task List */}
            <View style={styles.taskListContainer}>
              <Text style={[styles.taskListTitle, { color: colors.text }]}>
                Alle oppgaver denne uken
              </Text>

              {summary.tasks.map((task) => (
                <View
                  key={task.id}
                  style={[
                    styles.taskItem,
                    { backgroundColor: colors.background },
                  ]}
                >
                  <View style={styles.taskHeader}>
                    <Text style={[styles.taskTitle, { color: colors.text }]}>
                      {task.title}
                    </Text>
                    <View
                      style={[
                        styles.taskStatusBadge,
                        {
                          backgroundColor: task.done
                            ? colors.statusSuccessBackground
                            : colors.statusFailedBackground,
                        },
                      ]}
                    >
                      <Ionicons
                        name={task.done ? "checkmark-circle" : "close-circle"}
                        size={20}
                        color={
                          task.done
                            ? colors.statusSuccessText
                            : colors.statusFailedText
                        }
                      />
                    </View>
                  </View>

                  {task.description && (
                    <Text
                      style={[
                        styles.taskDescription,
                        { color: colors.lightNonInteractiveText },
                      ]}
                    >
                      {task.description}
                    </Text>
                  )}

                  <View style={styles.taskInfo}>
                    <View style={styles.infoRow}>
                      <Ionicons name="calendar-outline" size={14} color={colors.lightNonInteractiveText} />
                      <Text style={[styles.infoText, { color: colors.lightNonInteractiveText }]}>
                        {formatDate(task.timeStart)} - {formatDate(task.timeEnd)}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Ionicons name="person-outline" size={14} color={colors.lightNonInteractiveText} />
                      <Text style={[styles.infoText, { color: colors.lightNonInteractiveText }]}>
                        Tildelt til: {task.assignedToName || 'Ukjent'}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Ionicons name="create-outline" size={14} color={colors.lightNonInteractiveText} />
                      <Text style={[styles.infoText, { color: colors.lightNonInteractiveText }]}>
                        Opprettet av: {task.createdByName || 'Ukjent'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.taskFooter}>
                    <Text
                      style={[
                        styles.taskPoints,
                        { color: colors.tint },
                      ]}
                    >
                      {task.points} poeng
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "flex-end",
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(224, 232, 242, 0.30)",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  dateRangeContainer: {
    paddingVertical: 16,
    alignItems: "center",
  },
  dateRange: {
    fontSize: 15,
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(224, 232, 242, 0.60)",
  },
  statLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  contributorName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
  },
  contributorPoints: {
    fontSize: 16,
    fontWeight: "700",
  },
  taskListContainer: {
    marginTop: 8,
  },
  taskListTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  taskItem: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(224, 232, 242, 0.60)",
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },
  taskStatusBadge: {
    borderRadius: 12,
    padding: 4,
  },
  taskDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  taskInfo: {
    marginTop: 6,
    marginBottom: 8,
    gap: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoText: {
    fontSize: 12,
  },
  taskFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  taskPoints: {
    fontSize: 14,
    fontWeight: "600",
  },
  taskDate: {
    fontSize: 13,
  },
});
