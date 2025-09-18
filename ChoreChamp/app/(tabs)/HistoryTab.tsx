import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function History() {
  const [household, setHousehold] = useState("Remmen");

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
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>Historikk</Text>

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
          <View key={index} style={styles.card}>
            <View style={styles.weekBadge}>
              <Text style={styles.weekText}>Uke{"\n"}{item.week}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.cardTitle}>{item.title}</Text>
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
  container: { flex: 1, backgroundColor: "#111", padding: 20, paddingInline: 30 },
  header: { fontSize: 24, fontWeight: "bold", color: "#fff", marginBottom: 20, marginTop: 80 },
  filterRow: { flexDirection: "row", marginBottom: 15, alignItems: "center" },
  dropdown: {
    backgroundColor: "#fbbf24",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  dropdownText: { color: "#000", fontWeight: "500" },
  iconButton: {
    backgroundColor: "#fff",
    width: 35,
    height: 35,
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
    borderWidth: 1,
    borderColor: "#333",
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
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#fff" },
  cardSubtitle: { fontSize: 14, color: "#ccc", marginTop: 2 },
  dates: { fontSize: 12, color: "#888", marginTop: 4 },
});