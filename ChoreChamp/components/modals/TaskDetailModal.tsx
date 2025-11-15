import { useTheme } from "@/contexts/ThemeContext";
import type { Task } from "@/types/task";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// TODO: Implement validation for action buttons based on user ID and task assignedToId

interface ActionButton {
  label: string;
  onPress: () => void;
  iconName?: keyof typeof import("@expo/vector-icons").Ionicons.glyphMap; // Asked AI how to make Ionicon flexible for different icons without having to hardcode.
  variant?: "success" | "danger" | "primary" | "secondary";
}

interface TaskDetailModalProps {
  visible: boolean;
  task: Task | null;
  onClose: () => void;
  actionButtons?: ActionButton[];
}

export default function TaskDetailModal({
  visible,
  task,
  onClose,
  actionButtons,
}: TaskDetailModalProps) {
  const { colors } = useTheme();

  if (!task) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      accessibilityViewIsModal={true}
    >
      <View 
        style={styles.modalOverlay}
        importantForAccessibility="no-hide-descendants"
      >
        <View
          style={[styles.modalContent, { backgroundColor: colors.background }]}
          importantForAccessibility="yes"
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Oppgavedetaljer
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Task Title */}
            <View
              style={[
                styles.section,
                { borderBottomColor: colors.lightNonInteractiveText },
              ]}
            >
              <Text style={[styles.taskTitle, { color: colors.text }]}>
                {task.title}
              </Text>
              {task.finished ? (
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: colors.statusSuccessBackground },
                  ]}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={colors.statusSuccessText}
                  />
                  <Text
                    style={[
                      styles.semiboldText,
                      styles.statusText,
                      { color: colors.statusSuccessText },
                    ]}
                  >
                    Fullført
                  </Text>
                </View>
              ) : (
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: colors.statusFailedBackground },
                  ]}
                >
                  <Ionicons
                    name="time-outline"
                    size={16}
                    color={colors.statusFailedText}
                  />
                  <Text
                    style={[
                      styles.semiboldText,
                      styles.statusText,
                      { color: colors.statusFailedText },
                    ]}
                  >
                    Ikke fullført
                  </Text>
                </View>
              )}
            </View>

            {/* Task Details */}
            <View
              style={[
                styles.section,
                { borderBottomColor: colors.lightNonInteractiveText },
              ]}
            >
              {/* Start Time */}
              <View style={styles.detailRow}>
                <View style={styles.iconContainer}>
                  <Ionicons name="play-outline" size={24} color={colors.tint} />
                </View>
                <View style={styles.detailContent}>
                  <Text
                    style={[
                      styles.labelBase,
                      styles.detailLabel,
                      { color: colors.lightDarkText },
                    ]}
                  >
                    Starttid
                  </Text>
                  <Text
                    style={[
                      styles.semiboldText,
                      styles.detailValue,
                      { color: colors.text },
                    ]}
                  >
                    {task.timeStart 
                      ? `${task.timeStart.getHours().toString().padStart(2, '0')}:${task.timeStart.getMinutes().toString().padStart(2, '0')}`
                      : task.time}
                  </Text>
                </View>
              </View>

              {/* End Time */}
              <View style={styles.detailRow}>
                <View style={styles.iconContainer}>
                  <Ionicons name="stop-outline" size={24} color={colors.tint} />
                </View>
                <View style={styles.detailContent}>
                  <Text
                    style={[
                      styles.labelBase,
                      styles.detailLabel,
                      { color: colors.lightDarkText },
                    ]}
                  >
                    Sluttid
                  </Text>
                  <Text
                    style={[
                      styles.semiboldText,
                      styles.detailValue,
                      { color: colors.text },
                    ]}
                  >
                    {task.timeEnd 
                      ? `${task.timeEnd.getHours().toString().padStart(2, '0')}:${task.timeEnd.getMinutes().toString().padStart(2, '0')}`
                      : '-'}
                  </Text>
                </View>
              </View>

              {/* Duration */}
              <View style={styles.detailRow}>
                <View style={styles.iconContainer}>
                  <Ionicons
                    name="hourglass-outline"
                    size={24}
                    color={colors.tint}
                  />
                </View>
                <View style={styles.detailContent}>
                  <Text
                    style={[
                      styles.labelBase,
                      styles.detailLabel,
                      { color: colors.lightDarkText },
                    ]}
                  >
                    Varighet
                  </Text>
                  <Text
                    style={[
                      styles.semiboldText,
                      styles.detailValue,
                      { color: colors.text },
                    ]}
                  >
                    {task.duration >= 60 
                      ? `${Math.floor(task.duration / 60)} t ${task.duration % 60} min`
                      : `${task.duration} min`}
                  </Text>
                </View>
              </View>

              {/* Assigned from */}
              <View style={styles.detailRow}>
                <View style={styles.iconContainer}>
                  <Image source={task.assignedFromAvatar} style={styles.avatar} />
                </View>
                <View style={styles.detailContent}>
                  <Text
                    style={[
                      styles.labelBase,
                      styles.detailLabel,
                      { color: colors.lightDarkText },
                    ]}
                  >
                    Tildelt av
                  </Text>
                  <Text
                    style={[
                      styles.semiboldText,
                      styles.detailValue,
                      { color: colors.text },
                    ]}
                  >
                    {task.assignedFrom}
                  </Text>
                </View>
              </View>

              {/* Assigned To */}
              <View style={styles.detailRow}>
                <View style={styles.iconContainer}>
                  <Image source={task.avatar} style={styles.avatar} />
                </View>
                <View style={styles.detailContent}>
                  <Text
                    style={[
                      styles.labelBase,
                      styles.detailLabel,
                      { color: colors.lightDarkText },
                    ]}
                  >
                    Tildelt til
                  </Text>
                  <Text
                    style={[
                      styles.semiboldText,
                      styles.detailValue,
                      { color: colors.text },
                    ]}
                  >
                    {task.assignedTo}
                  </Text>
                </View>
              </View>
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text
                style={[
                  styles.labelBase,
                  styles.sectionTitle,
                  { color: colors.lightDarkText },
                ]}
              >
                Beskrivelse
              </Text>
              <Text style={[styles.description, { color: colors.text }]}>
                {task.description || "Ingen beskrivelse."}
              </Text>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          {actionButtons && actionButtons.length > 0 && (
            <View style={styles.actionButtons}>
              {actionButtons.map((button, index) => {
                const backgroundColor =
                  button.variant === "danger"
                    ? colors.statusFailedBackground
                    : button.variant === "primary"
                    ? colors.tint
                    : button.variant === "secondary"
                    ? colors.contextBackground
                    : colors.statusSuccessBackground;

                const textColor =
                  button.variant === "danger"
                    ? colors.statusFailedText
                    : button.variant === "primary"
                    ? colors.background
                    : button.variant === "secondary"
                    ? colors.text
                    : colors.statusSuccessText;

                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.actionButton, { backgroundColor }]}
                    onPress={button.onPress}
                  >
                    {button.iconName && (
                      <Ionicons
                        name={button.iconName}
                        size={20}
                        color={textColor}
                      />
                    )}
                    <Text
                      style={[
                        styles.semiboldText,
                        styles.actionButtonText,
                        { color: textColor },
                      ]}
                    >
                      {button.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Modal Container
  modalOverlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    maxHeight: "90%",
    // Shadow for separation
    boxShadow: '0 -4px 8px 0 rgba(255, 190, 0, 0.25)',
    elevation: 10,
  },

  // Header Styles
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  closeButton: {
    padding: 4,
  },

  // Section & Layout
  section: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(224, 232, 242, 0.30)",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },

  // Typography - Titles
  taskTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
  },

  // Typography - Labels
  // Base style for all uppercase labels (TID, VARIGHET, etc.)
  labelBase: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailLabel: {
    fontWeight: "500",
    marginBottom: 2,
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: 8,
  },

  // Typography - Values
  semiboldText: {
    fontWeight: "600",
  },
  detailValue: {
    fontSize: 16,
  },
  statusText: {
    fontSize: 14,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },

  // Badges & Icons
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },

  // Action Buttons
  actionButtons: {
    marginTop: 20,
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
  },
});
