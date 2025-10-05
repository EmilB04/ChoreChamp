import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import commonStyles from "../commonStyles";

export default function History() {
  const [household, setHousehold] = useState("Remmen");
  const { colors } = useTheme();

  const historyData = [
    {
      week: "40",
      title: "Oppsummering - Uke 40",
      status: "Fullført",
      count: 9,
      startDate: "29 sep 2025",
      endDate: "05 okt 2025",
      statusColor: "green",
    },
    {
      week: "39",
      title: "Oppsummering - Uke 39",
      status: "Ikke fullført",
      count: 5,
      startDate: "22 sep 2025",
      endDate: "28 sep 2025",
      statusColor: "red",
    },
    {
      week: "38",
      title: "Oppsummering - Uke 38",
      status: "Fullført",
      count: 7,
      startDate: "15 sep 2025",
      endDate: "21 sep 2025",
      statusColor: "green",
    },
  ];

  return (
    <View
      style={[commonStyles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <Text style={[commonStyles.headerTitle, { color: colors.text }]}>
        Historikk
      </Text>

      {/* Filter bar */}
      <View style={styles.filterRow}>
        <TouchableOpacity style={[styles.dropdown, {backgroundColor: colors.tint}]}>
          <Text style={[styles.dropdownText, {color: colors.darkText}]}>
            Husholdning: {household}{" "}
            <Ionicons name="chevron-down" size={16} color={colors.darkText} />
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="search" size={20} color={colors.darkText} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="options-outline" size={20} color={colors.darkText} />
        </TouchableOpacity>
      </View>

      {/* History list */}
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {historyData.map((item, index) => (
          <View
            key={index}
            style={[styles.card, { backgroundColor: colors.contextBackground }]}
          >
            <View style={[styles.weekBadge, { backgroundColor: colors.tint }]}>
              <Text style={[styles.weekText, { color: colors.darkText }]}>
                Uke{"\n"}
                {item.week}
              </Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                {item.title}
              </Text>
              <Text style={[styles.cardSubtitle, { color: colors.text }]}>
                Alle oppgaver ble:{" "}
                <Text style={[styles.statusText, { color: item.statusColor === "green" ? colors.statusSuccessText : colors.statusFailedText, backgroundColor: item.statusColor === "green" ? colors.statusSuccessBackground : colors.statusFailedBackground }]}>
                  {item.status}
                </Text>
              </Text>
              <Text style={[styles.cardSubtitle, { color: colors.text }]}>
                Antall oppgaver: {item.count}
              </Text>
              <Text style={[styles.dates, { color: colors.lightNonInteractiveText }]}>
                {item.startDate} - {item.endDate}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: "row",
    marginBottom: 15,
    marginTop: 5,
    alignItems: "center",
  },
  dropdown: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  dropdownText: {
    fontWeight: "500"
  },
  iconButton: {
    backgroundColor: "#fff",
    width: 40,
    height: 40,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
  },
  card: {
    flexDirection: "row",
    borderRadius: 15,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: "#000",
    borderColor: "rgba(224, 232, 242, 0.60)",
  },

  weekBadge: {
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 55,
  },
  weekText: {
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600"
  },
  cardSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  dates: {
    fontSize: 12,
    color: "#888",
    marginTop: 4
  },
  statusText: {
    paddingHorizontal: 12,
    paddingVertical: 1,
    borderRadius: 4,
    overflow: "hidden",
    fontWeight: "600"
  }
});
