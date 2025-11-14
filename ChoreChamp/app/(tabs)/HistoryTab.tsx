import { useTheme } from "@/contexts/ThemeContext";
import { useUser } from "@/contexts/UserContext";
import { getHouseholdsForUser, getUserHouseholds, Household } from "@/services/householdService";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    FlatList,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import commonStyles from "../commonStyles";

export default function History() {
  const { userData } = useUser();
  const [household, setHousehold] = useState<string>("");
  const [households, setHouseholds] = useState<Household[]>([]);
  const [loadingHouseholds, setLoadingHouseholds] = useState(true);
  const [showHouseholdDropdown, setShowHouseholdDropdown] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useTheme();

  // Fetch user's households
  useEffect(() => {
    const fetchHouseholds = async () => {
      if (!userData?.id) {
        console.log('⚠️ No user ID available');
        setLoadingHouseholds(false);
        return;
      }

      setLoadingHouseholds(true);
      try {
        console.log('🏠 Fetching households for user ID:', userData.id);
        
        // First, try to fetch households by querying familyMembers
        let userHouseholds = await getHouseholdsForUser(userData.id);
        
        // If no households found via query and user has household array, fetch those
        if (userHouseholds.length === 0 && userData.household && userData.household.length > 0) {
          console.log('🏠 No households found via query, trying user.household array:', userData.household);
          userHouseholds = await getUserHouseholds(userData.household);
        }
        
        setHouseholds(userHouseholds);
        
        // Set first household as default if available
        if (userHouseholds.length > 0 && !household) {
          setHousehold(userHouseholds[0].familyName);
        }
        
        console.log('✅ Loaded households:', userHouseholds.map(h => h.familyName));
      } catch (error) {
        console.error('❌ Error loading households:', error);
      } finally {
        setLoadingHouseholds(false);
      }
    };

    fetchHouseholds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.id]);

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    
    try {
      if (!userData?.id) {
        setRefreshing(false);
        return;
      }

      let userHouseholds = await getHouseholdsForUser(userData.id);
      
      if (userHouseholds.length === 0 && userData.household && userData.household.length > 0) {
        userHouseholds = await getUserHouseholds(userData.household);
      }
      
      setHouseholds(userHouseholds);
      
      if (userHouseholds.length > 0 && !household) {
        setHousehold(userHouseholds[0].familyName);
      }
    } catch (error) {
      console.error('❌ Error refreshing households:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Available filter options
  const filterOptions = [
    "Fullført",
    "Ikke fullført",
    "Denne måneden",
    "Forrige måned",
    "Høy aktivitet",
    "Lav aktivitet"
  ];

  // Define mutually exclusive filter groups
  const mutuallyExclusiveGroups = [
    ["Fullført", "Ikke fullført"],
    ["Denne måneden", "Forrige måned"],
    ["Høy aktivitet", "Lav aktivitet"]
  ];

  // Helper function to handle filter selection with mutual exclusion
  const handleFilterSelection = (selectedItem: string) => {
    let newFilters = [...selectedFilters];

    if (selectedFilters.includes(selectedItem)) {
      // Remove the filter if it's already selected
      newFilters = selectedFilters.filter(filter => filter !== selectedItem);
    } else {
      // Find if the selected item belongs to any mutually exclusive group
      const exclusiveGroup = mutuallyExclusiveGroups.find(group =>
        group.includes(selectedItem)
      );

      if (exclusiveGroup) {
        // Remove any other filters from the same exclusive group
        newFilters = selectedFilters.filter(filter =>
          !exclusiveGroup.includes(filter)
        );
      }

      // Add the new filter
      newFilters = [...newFilters, selectedItem];
    }

    setSelectedFilters(newFilters);
  };

  const historyData = [
    {
      week: "40",
      title: "Oppsummering - Uke 40",
      status: "Fullført",
      count: 9,
      finishedCount: 9,
      startDate: "29 sep 2025",
      endDate: "05 okt 2025",
      statusColor: "green",
      houseHold: "Remmen",
    },
    {
      week: "39",
      title: "Oppsummering - Uke 39",
      status: "Ikke fullført",
      count: 5,
      finishedCount: 3,
      startDate: "22 sep 2025",
      endDate: "28 sep 2025",
      statusColor: "red",
      houseHold: "Hjemme",
    },
    {
      week: "38",
      title: "Oppsummering - Uke 38",
      status: "Fullført",
      count: 7,
      finishedCount: 7,
      startDate: "15 sep 2025",
      endDate: "21 sep 2025",
      statusColor: "green",
      houseHold: "Hjemme",
    },
    {
      week: "37",
      title: "Oppsummering - Uke 37",
      status: "Fullført",
      count: 12,
      finishedCount: 12,
      startDate: "08 sep 2025",
      endDate: "14 sep 2025",
      statusColor: "green",
      houseHold: "Kollektiv",
    },
    {
      week: "36",
      title: "Oppsummering - Uke 36",
      status: "Ikke fullført",
      count: 4,
      finishedCount: 2,
      startDate: "01 sep 2025",
      endDate: "07 sep 2025",
      statusColor: "red",
      houseHold: "Familie",
    },
    {
      week: "35",
      title: "Oppsummering - Uke 35",
      status: "Fullført",
      count: 8,
      finishedCount: 8,
      startDate: "25 aug 2025",
      endDate: "31 aug 2025",
      statusColor: "green",
      houseHold: "Remmen",
    },
    {
      week: "41",
      title: "Oppsummering - Uke 41",
      status: "Fullført",
      count: 11,
      finishedCount: 11,
      startDate: "06 okt 2025",
      endDate: "12 okt 2025",
      statusColor: "green",
      houseHold: "Hjemme",
    },
    {
      week: "34",
      title: "Oppsummering - Uke 34",
      status: "Ikke fullført",
      count: 3,
      finishedCount: 1,
      startDate: "18 aug 2025",
      endDate: "24 aug 2025",
      statusColor: "red",
      houseHold: "Kollektiv",
    },
  ];

  // Helper function to get current month data
  const getCurrentMonth = () => {
    const now = new Date();
    return now.getMonth();
  };

  const getPreviousMonth = () => {
    const now = new Date();
    return now.getMonth() - 1;
  };

  const getItemMonth = (item: any) => {
    // Parse the start date to get the month
    const dateParts = item.startDate.split(' ');
    const monthNames = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];
    return monthNames.indexOf(dateParts[1].toLowerCase());
  };

  // Filter history data based on selected household, filters, and search text
  const filteredHistoryData = historyData.filter(item => {
    // First filter by household
    if (item.houseHold !== household) return false;

    // Apply search text filter if search is active
    if (searchText.trim() !== "") {
      const searchLower = searchText.toLowerCase().trim();
      const matchesSearch = 
        item.title.toLowerCase().includes(searchLower) ||
        item.status.toLowerCase().includes(searchLower) ||
        item.week.toLowerCase().includes(searchLower) ||
        item.startDate.toLowerCase().includes(searchLower) ||
        item.endDate.toLowerCase().includes(searchLower) ||
        item.count.toString().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // If no filters selected, show all (for this household and search)
    if (selectedFilters.length === 0) return true;

    // Apply selected filters
    return selectedFilters.every(filter => {
      switch (filter) {
        case "Fullført":
          return item.status === "Fullført";
        case "Ikke fullført":
          return item.status === "Ikke fullført";
        case "Denne måneden":
          return getItemMonth(item) === getCurrentMonth();
        case "Forrige måned":
          return getItemMonth(item) === getPreviousMonth();
        case "Høy aktivitet":
          return item.count >= 8; // Consider 8+ tasks as high activity
        case "Lav aktivitet":
          return item.count < 8; // Consider less than 8 tasks as low activity
        default:
          return true;
      }
    });
  });

  return (
    <View
      style={[commonStyles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <Text style={[commonStyles.headerTitle, { color: colors.text }]}>
        Historikk
      </Text>

      {loadingHouseholds ? (
        <View style={styles.centerMessage}>
          <Text style={[styles.messageText, { color: colors.text }]}>
            Laster husstander...
          </Text>
        </View>
      ) : households.length === 0 ? (
        <View style={styles.centerMessage}>
          <Text style={[styles.messageText, { color: colors.text }]}>
            Du er ikke medlem av noen husstander ennå.
          </Text>
        </View>
      ) : (
        <>
          {/* Filter bar */}
          <View style={styles.filterRow}>
        {/* Household Dropdown */}
        <View style={styles.dropdownContainer}>
          <TouchableOpacity
            style={[styles.dropdown, { backgroundColor: colors.tint }]}
            onPress={() => setShowHouseholdDropdown(!showHouseholdDropdown)}
          >
            <Text style={[styles.dropdownText, { color: colors.darkText }]}>
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
            <View style={[styles.dropdownMenu, { backgroundColor: colors.contextBackground }]}>
              {households.map((householdOption, index) => (
                <TouchableOpacity
                  key={householdOption.id}
                  style={[
                    styles.dropdownItem,
                    household === householdOption.familyName && { backgroundColor: colors.tint }
                  ]}
                  onPress={() => {
                    setHousehold(householdOption.familyName);
                    setShowHouseholdDropdown(false);
                  }}
                >
                  <Text style={[
                    styles.dropdownItemText,
                    { color: household === householdOption.familyName ? colors.darkText : colors.text }
                  ]}>
                    {householdOption.familyName}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Search Field - Active */}
      {showSearch && (
        <View style={[styles.searchBar, { backgroundColor: colors.contextBackground }]}>
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
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
          <View style={[styles.filterModal, { backgroundColor: colors.contextBackground }]}>
            <View style={styles.filterHeader}>
              <Text style={[styles.filterTitle, { color: colors.text }]}>Filtrer historikk</Text>
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
                    selectedFilters.includes(item) && { backgroundColor: colors.tint }
                  ]}
                  onPress={() => handleFilterSelection(item)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    { color: selectedFilters.includes(item) ? colors.darkText : colors.text }
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
                style={[styles.clearFiltersButton, { backgroundColor: colors.statusFailedBackground }]}
                onPress={() => setSelectedFilters([])}
              >
                <Text style={[styles.clearFiltersText, { color: colors.statusFailedText }]}>
                  Fjern alle
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.applyFiltersButton, { backgroundColor: colors.tint }]}
                onPress={() => setShowFiltersModal(false)}
              >
                <Text style={[styles.applyFiltersText, { color: colors.darkText }]}>
                  Bruk filtre
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* History list */}
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.tint}
            colors={[colors.tint]}
          />
        }
      >
        {filteredHistoryData.map((item, index) => (
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
            { backgroundColor: colors.tint }
          ]}
          onPress={() => {
            if (showSearch) {
              setSearchText("");
            }
            setShowSearch(!showSearch);
          }}
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
            { backgroundColor: selectedFilters.length > 0 ? colors.statusSuccessBackground : colors.tint }
          ]}
          onPress={() => setShowFiltersModal(true)}
        >
          <Ionicons
            name="options-outline"
            size={24}
            color={selectedFilters.length > 0 ? colors.statusSuccessText : colors.darkText}
          />
          {selectedFilters.length > 0 && (
            <View style={[styles.filterBadge, { backgroundColor: colors.statusFailedText }]}>
              <Text style={[styles.filterBadgeText, { color: colors.background }]}>
                {selectedFilters.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centerMessage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  messageText: {
    fontSize: 16,
    textAlign: "center",
  },
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
    boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.25)',
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
