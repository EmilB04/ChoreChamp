import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Modal,
  FlatList,
} from "react-native";
import commonStyles from "../commonStyles";

export default function History() {
  const [household, setHousehold] = useState("Remmen");
  const [showHouseholdDropdown, setShowHouseholdDropdown] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const { colors } = useTheme();

  // Available households
  const households = ["Remmen", "Hjemme", "Kollektiv", "Familie"];

  // Available filter options
  const filterOptions = [
    "Fullført",
    "Ikke fullført", 
    "Denne måneden",
    "Forrige måned",
    "Høy aktivitet",
    "Lav aktivitet"
  ];

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
        {/* Household Dropdown */}
        <View style={styles.dropdownContainer}>
          <TouchableOpacity 
            style={[styles.dropdown, {backgroundColor: colors.tint}]}
            onPress={() => setShowHouseholdDropdown(!showHouseholdDropdown)}
          >
            <Text style={[styles.dropdownText, {color: colors.darkText}]}>
              Husholdning: {household}{" "}
              <Ionicons 
                name={showHouseholdDropdown ? "chevron-up" : "chevron-down"} 
                size={16} 
                color={colors.darkText} 
              />
            </Text>
          </TouchableOpacity>
          
          {/* Household Dropdown Menu */}
          {showHouseholdDropdown && (
            <View style={[styles.dropdownMenu, {backgroundColor: colors.contextBackground}]}>
              {households.map((householdOption, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dropdownItem,
                    household === householdOption && {backgroundColor: colors.tint}
                  ]}
                  onPress={() => {
                    setHousehold(householdOption);
                    setShowHouseholdDropdown(false);
                  }}
                >
                  <Text style={[
                    styles.dropdownItemText,
                    {color: household === householdOption ? colors.darkText : colors.text}
                  ]}>
                    {householdOption}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Search Button/Field */}
        {!showSearch ? (
          <TouchableOpacity 
            style={[styles.iconButton, {backgroundColor: colors.contextBackground}]}
            onPress={() => setShowSearch(true)}
          >
            <Ionicons name="search" size={20} color={colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.searchContainer}>
            <TextInput
              style={[styles.searchInput, {backgroundColor: colors.contextBackground, color: colors.text}]}
              placeholder="Søk i historikk..."
              placeholderTextColor={colors.lightNonInteractiveText}
              value={searchText}
              onChangeText={setSearchText}
              autoFocus
            />
            <TouchableOpacity 
              style={styles.searchCloseButton}
              onPress={() => {
                setShowSearch(false);
                setSearchText("");
              }}
            >
              <Ionicons name="close" size={16} color={colors.text} />
            </TouchableOpacity>
          </View>
        )}

        {/* Filter Options Button */}
        <TouchableOpacity 
          style={[
            styles.iconButton, 
            {backgroundColor: selectedFilters.length > 0 ? colors.tint : colors.contextBackground}
          ]}
          onPress={() => setShowFiltersModal(true)}
        >
          <Ionicons 
            name="options-outline" 
            size={20} 
            color={selectedFilters.length > 0 ? colors.darkText : colors.text} 
          />
          {selectedFilters.length > 0 && (
            <View style={[styles.filterBadge, {backgroundColor: colors.statusFailedText}]}>
              <Text style={[styles.filterBadgeText, {color: colors.background}]}>
                {selectedFilters.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Filters Modal */}
      <Modal
        visible={showFiltersModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFiltersModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          onPress={() => setShowFiltersModal(false)}
        >
          <View style={[styles.filterModal, {backgroundColor: colors.contextBackground}]}>
            <View style={styles.filterHeader}>
              <Text style={[styles.filterTitle, {color: colors.text}]}>Filtrer historikk</Text>
              <TouchableOpacity onPress={() => setShowFiltersModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={filterOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    selectedFilters.includes(item) && {backgroundColor: colors.tint}
                  ]}
                  onPress={() => {
                    if (selectedFilters.includes(item)) {
                      setSelectedFilters(selectedFilters.filter(filter => filter !== item));
                    } else {
                      setSelectedFilters([...selectedFilters, item]);
                    }
                  }}
                >
                  <Text style={[
                    styles.filterOptionText,
                    {color: selectedFilters.includes(item) ? colors.darkText : colors.text}
                  ]}>
                    {item}
                  </Text>
                  {selectedFilters.includes(item) && (
                    <Ionicons name="checkmark" size={20} color={colors.darkText} />
                  )}
                </TouchableOpacity>
              )}
            />
            
            <View style={styles.filterActions}>
              <TouchableOpacity
                style={[styles.clearFiltersButton, {backgroundColor: colors.statusFailedBackground}]}
                onPress={() => setSelectedFilters([])}
              >
                <Text style={[styles.clearFiltersText, {color: colors.statusFailedText}]}>
                  Fjern alle
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.applyFiltersButton, {backgroundColor: colors.tint}]}
                onPress={() => setShowFiltersModal(false)}
              >
                <Text style={[styles.applyFiltersText, {color: colors.darkText}]}>
                  Bruk filtre
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

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
    zIndex: 1000,
  },
  dropdownContainer: {
    flex: 1,
    position: "relative",
    marginRight: 8,
  },
  dropdown: {
    height: 45,
    borderRadius: 6,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  dropdownText: {
    fontWeight: "500",
    textAlign: "center",
  },
  dropdownMenu: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(224, 232, 242, 0.60)",
    zIndex: 1001,
    maxHeight: 200,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(224, 232, 242, 0.30)",
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: "500",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 45,
    borderRadius: 6,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 14,
    borderRadius: 6,
    paddingLeft: 6,
    boxSizing: "border-box",
  },
  searchCloseButton: {
    borderRadius: 6,
    padding: 4,
    marginLeft: 4,
  },
  iconButton: {
    minWidth: 45,
    height: 45,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 2,
    position: "relative",
  },
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  filterModal: {
    width: "90%",
    maxHeight: "70%",
    borderRadius: 16,
    padding: 20,
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(224, 232, 242, 0.30)",
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  filterOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  filterOptionText: {
    fontSize: 16,
    fontWeight: "500",
  },
  filterActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(224, 232, 242, 0.30)",
  },
  clearFiltersButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 8,
  },
  clearFiltersText: {
    fontSize: 16,
    fontWeight: "600",
  },
  applyFiltersButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginLeft: 8,
  },
  applyFiltersText: {
    fontSize: 16,
    fontWeight: "600",
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
