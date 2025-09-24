import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
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
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

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
  ];

  return (
    <View style={commonStyles.container}>
      {/* Header */}
      <Text style={[commonStyles.headerTitle, { color: colors.text }]}>Historikk</Text>

      {/* Filter bar */}
      <View style={styles.filterRow}>
        <TouchableOpacity style={styles.dropdown}>
          <Text style={styles.dropdownText}>Husholdning: {household} ▼</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="search" size={20} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="grid" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {/* History list */}
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {historyData.map((item, index) => (
          <View key={index} style={[styles.card, { backgroundColor: colors.background }]}>
            <View style={styles.weekBadge}>
              <Text style={styles.weekText}>Uke{"\n"}{item.week}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={styles.cardSubtitle}>
                Alle oppgaver ble:{" "}
                <Text style={{ color: item.statusColor }}>
                  {item.status}
                </Text>
              </Text>
              <Text style={styles.cardSubtitle}>Antall oppgaver: {item.count}</Text>
              <Text style={styles.dates}>
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
  header: { fontSize: 24, fontWeight: "bold", color: "#fff", marginBottom: 20, marginTop: 80 },
  filterRow: { flexDirection: "row", marginBottom: 15, marginTop: 5, alignItems: "center" },
  dropdown: {
    backgroundColor: "#fbbf24",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  dropdownText: { color: "#000", fontWeight: "500" },
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
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  weekBadge: {
    backgroundColor: "#fbbf24",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 55,
  },
  weekText: { fontWeight: "bold", fontSize: 14, color: "#000", textAlign: "center" },
  cardTitle: { fontSize: 16, fontWeight: "600" },
  cardSubtitle: { fontSize: 14, color: "#ccc", marginTop: 2 },
  dates: { fontSize: 12, color: "#888", marginTop: 4 },
});