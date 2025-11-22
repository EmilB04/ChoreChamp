import { useTheme } from "@/contexts/ThemeContext";
import { useUser } from "@/contexts/UserContext";
import { getHouseholdsForUser, getUserHouseholds, Household } from "@/services/householdService";
import { getWeeklySummariesForHousehold, WeeklySummary } from "@/services/taskService";
import WeeklySummaryModal from "@/components/modals/WeeklySummaryModal";
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
  const [selectedHouseholdId, setSelectedHouseholdId] = useState<string>("");
  const [households, setHouseholds] = useState<Household[]>([]);
  const [weeklySummaries, setWeeklySummaries] = useState<WeeklySummary[]>([]);
  const [loadingHouseholds, setLoadingHouseholds] = useState(true);
  const [loadingSummaries, setLoadingSummaries] = useState(false);
  const [showHouseholdDropdown, setShowHouseholdDropdown] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState<WeeklySummary | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const { colors } = useTheme();

  // Shared household fetching logic
  const fetchHouseholds = async () => {
    if (!userData?.id) {
      console.log('No user ID available');
      return [];
    }

    try {
      console.log('Fetching households for user ID:', userData.id);
      
      let userHouseholds = await getHouseholdsForUser(userData.id);
      
      if (userHouseholds.length === 0 && userData.household && userData.household.length > 0) {
        console.log('No households found via query, trying user.household array:', userData.household);
        userHouseholds = await getUserHouseholds(userData.household);
      }
      
      console.log('Loaded households:', userHouseholds.map(h => h.familyName));
      return userHouseholds;
    } catch (error) {
      console.error('Error loading households:', error);
      return [];
    }
  };

  // Fetch user's households
  useEffect(() => {
    const loadHouseholds = async () => {
      setLoadingHouseholds(true);
      
      const userHouseholds = await fetchHouseholds();
      setHouseholds(userHouseholds);
      
      if (userHouseholds.length > 0 && !household) {
        setHousehold(userHouseholds[0].familyName);
        setSelectedHouseholdId(userHouseholds[0].id);
      }
      
      setLoadingHouseholds(false);
    };

    loadHouseholds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.id]);

  // Fetch weekly summaries when household changes
  useEffect(() => {
    const fetchWeeklySummaries = async () => {
      if (!selectedHouseholdId) {
        setWeeklySummaries([]);
        return;
      }

      setLoadingSummaries(true);
      try {
        const summaries = await getWeeklySummariesForHousehold(selectedHouseholdId);
        setWeeklySummaries(summaries);
        console.log('Loaded weekly summaries:', summaries.length);
      } catch (error) {
        console.error('Error loading weekly summaries:', error);
      } finally {
        setLoadingSummaries(false);
      }
    };

    fetchWeeklySummaries();
  }, [selectedHouseholdId]);

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    
    try {
      const userHouseholds = await fetchHouseholds();
      setHouseholds(userHouseholds);
      
      if (userHouseholds.length > 0 && !household) {
        setHousehold(userHouseholds[0].familyName);
        setSelectedHouseholdId(userHouseholds[0].id);
      }

      if (selectedHouseholdId) {
        const summaries = await getWeeklySummariesForHousehold(selectedHouseholdId);
        setWeeklySummaries(summaries);
      }
    } catch (error) {
      console.error('Error refreshing:', error);
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

  // Format date for display
  const formatDate = (date: Date): string => {
    const months = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Helper function to get current month data
  const getCurrentMonth = () => {
    const now = new Date();
    return now.getMonth();
  };

  const getPreviousMonth = () => {
    const now = new Date();
    return now.getMonth() - 1;
  };

  // Filter weekly summaries based on filters and search text
  const filteredHistoryData = weeklySummaries.filter(summary => {
    // Apply search text filter if search is active
    if (searchText.trim() !== "") {
      const searchLower = searchText.toLowerCase().trim();
      const status = summary.allCompleted ? "fullført" : "ikke fullført";
      const matchesSearch = 
        summary.weekNumber.toString().includes(searchLower) ||
        status.includes(searchLower) ||
        formatDate(summary.startDate).toLowerCase().includes(searchLower) ||
        formatDate(summary.endDate).toLowerCase().includes(searchLower) ||
        summary.totalTasks.toString().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // If no filters selected, show all
    if (selectedFilters.length === 0) return true;

    // Apply selected filters
    return selectedFilters.every(filter => {
      switch (filter) {
        case "Fullført":
          return summary.allCompleted;
        case "Ikke fullført":
          return !summary.allCompleted;
        case "Denne måneden":
          return summary.startDate.getMonth() === getCurrentMonth();
        case "Forrige måned":
          return summary.startDate.getMonth() === getPreviousMonth();
        case "Høy aktivitet":
          return summary.totalTasks >= 8;
        case "Lav aktivitet":
          return summary.totalTasks < 8;
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
              {households.map((householdOption) => (
                <TouchableOpacity
                  key={householdOption.id}
                  style={[
                    styles.dropdownItem,
                    household === householdOption.familyName && { backgroundColor: colors.tint }
                  ]}
                  onPress={() => {
                    setHousehold(householdOption.familyName);
                    setSelectedHouseholdId(householdOption.id);
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
      {loadingSummaries ? (
        <View style={styles.centerMessage}>
          <Text style={[styles.messageText, { color: colors.text }]}>
            Laster historikk...
          </Text>
        </View>
      ) : filteredHistoryData.length === 0 ? (
        <View style={styles.centerMessage}>
          <Text style={[styles.messageText, { color: colors.text }]}>
            Ingen historikk funnet.
          </Text>
        </View>
      ) : (
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
          {filteredHistoryData.map((summary) => (
            <TouchableOpacity
              key={`${summary.year}-${summary.weekNumber}`}
              style={[styles.card, { backgroundColor: colors.contextBackground }]}
              onPress={() => {
                setSelectedSummary(summary);
                setShowSummaryModal(true);
              }}
            >
              <View style={[styles.weekBadge, { backgroundColor: colors.tint }]}>
                <Text style={[styles.weekText, { color: colors.darkText }]}>
                  Uke{"\n"}
                  {summary.weekNumber}
                </Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  Oppsummering - Uke {summary.weekNumber}
                </Text>
                <View style={styles.statusContainer}>
                  <Text style={[styles.cardSubtitle, { color: colors.text }]}>
                    Alle oppgaver ble:{" "}
                  </Text>
                  <View style={[styles.statusText, { backgroundColor: summary.allCompleted ? colors.statusSuccessBackground : colors.statusFailedBackground }]}>
                    <Text style={[styles.statusTextInner, { color: summary.allCompleted ? colors.statusSuccessText : colors.statusFailedText }]}>
                      {summary.allCompleted ? "Fullført" : "Ikke fullført"}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.cardSubtitle, { color: colors.text }]}>
                  Antall oppgaver fullført: {summary.completedTasks} / {summary.totalTasks}
                </Text>
                <Text style={[styles.dates, { color: colors.lightNonInteractiveText }]}>
                  {formatDate(summary.startDate)} - {formatDate(summary.endDate)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

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

      {/* Weekly Summary Modal */}
      <WeeklySummaryModal
        visible={showSummaryModal}
        onClose={() => {
          setShowSummaryModal(false);
          setSelectedSummary(null);
        }}
        summary={selectedSummary}
      />
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
