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
          
          {/* Household Dropdown - Active */}
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

      </View>

      {/* Search Field - Active */}
      {showSearch && (
        <View style={[styles.searchBar, {backgroundColor: colors.contextBackground}]}>
          <TextInput
            style={[styles.searchInput, {color: colors.text}]}
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

      {/* Filters - Active */}
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
            
            {/* Filters - Active buttons  */}
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
              <View style={styles.statusContainer}>
                <Text style={[styles.cardSubtitle, { color: colors.text }]}>
                  Alle oppgaver ble:{" "}
                </Text>
                <View style={[styles.statusText, { backgroundColor: item.statusColor === "green" ? colors.statusSuccessBackground : colors.statusFailedBackground }]}>
                  <Text style={[styles.statusTextInner, { color: item.statusColor === "green" ? colors.statusSuccessText : colors.statusFailedText }]}>
                    {item.status}
                  </Text>
                </View>
              </View>
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

      {/* Floating Action Buttons */}
      <View style={styles.floatingButtons}>
        <TouchableOpacity 
          style={[
            styles.floatingButton,
            {backgroundColor: colors.tint}
          ]}
          onPress={() => setShowSearch(!showSearch)}
        >
          <Ionicons 
            name={showSearch ? "close" : "search"} 
            size={24} 
            color={colors.darkText} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.floatingButton,
            {backgroundColor: selectedFilters.length > 0 ? colors.statusSuccessBackground : colors.tint}
          ]}
          onPress={() => setShowFiltersModal(true)}
        >
          <Ionicons 
            name="options-outline" 
            size={24} 
            color={selectedFilters.length > 0 ? colors.statusSuccessText : colors.darkText} 
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
    </View>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: "row",
    marginBottom: 15,
    marginTop: 10,
    alignItems: "center",
    zIndex: 1000,
  },
  dropdownContainer: {
    flex: 1,
    position: "relative",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  floatingButtons: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 16,
  },
  floatingButton: {
    width: 45,
    height: 45,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    position: "relative",
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
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  statusText: {
    paddingHorizontal: 10,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 0,
  },
  statusTextInner: {
    fontSize: 14,
    fontWeight: "600",
  }
});
