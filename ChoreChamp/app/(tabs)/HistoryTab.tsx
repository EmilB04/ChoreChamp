import FullScreenLoader from "@/components/FullScreenLoader";
import WeeklySummaryModal from "@/components/modals/WeeklySummaryModal";
import { useTheme } from "@/contexts/ThemeContext";
import { useUser } from "@/contexts/UserContext";
import { getHouseholdsForUser, getUserHouseholds, Household } from "@/services/householdService";
import { getWeeklySummariesForHousehold, WeeklySummary } from "@/services/taskService";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('app');

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

  // Available filter options (use internal ids, render labels via i18n)
  const filterOptions = [
    { id: 'completed', labelKey: 'history.filters.options.completed' },
    { id: 'not_completed', labelKey: 'history.filters.options.notCompleted' },
    { id: 'this_month', labelKey: 'history.filters.options.thisMonth' },
    { id: 'prev_month', labelKey: 'history.filters.options.prevMonth' },
    { id: 'high_activity', labelKey: 'history.filters.options.highActivity' },
    { id: 'low_activity', labelKey: 'history.filters.options.lowActivity' },
  ];

  // Define mutually exclusive filter groups (by id)
  const mutuallyExclusiveGroups = [
    ['completed', 'not_completed'],
    ['this_month', 'prev_month'],
    ['high_activity', 'low_activity'],
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
      const status = (summary.allCompleted ? t('history.status.completed') : t('history.status.notCompleted')).toLowerCase();
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

    // Apply selected filters (filter ids are used)
    return selectedFilters.every(filter => {
      switch (filter) {
        case "completed":
          return summary.allCompleted;
        case "not_completed":
          return !summary.allCompleted;
        case "this_month":
          return summary.startDate.getMonth() === getCurrentMonth();
        case "prev_month":
          return summary.startDate.getMonth() === getPreviousMonth();
        case "high_activity":
          return summary.totalTasks >= 8;
        case "low_activity":
          return summary.totalTasks < 8;
        default:
          return true;
      }
    });
  });

  return (
    <View
      style={[
        commonStyles.container,
        {
          flex: 1,
          backgroundColor: colors.background,
          paddingBottom: 0, // account for nav bar
        },
      ]}
    >
      {/* Header */}
      <Text style={[commonStyles.headerTitle, { color: colors.text }]}>
        {t('history.title')}
      </Text>

      {loadingHouseholds ? (
        <FullScreenLoader text={t('history.loadingHouseholds')} />
      ) : households.length === 0 ? (
        <View style={styles.centerMessage}>
          <Text style={[styles.messageText, { color: colors.text }]}>
            {t('history.noHouseholds')}
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
              {t('history.householdLabel')}: {household}{" "}
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
            placeholder={t('history.searchPlaceholder')}
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
              <Text style={[styles.filterTitle, { color: colors.text }]}>{t('history.filters.title')}</Text>
              <TouchableOpacity onPress={() => setShowFiltersModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={filterOptions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    selectedFilters.includes(item.id) && { backgroundColor: colors.tint }
                  ]}
                  onPress={() => handleFilterSelection(item.id)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    { color: selectedFilters.includes(item.id) ? colors.darkText : colors.text }
                  ]}>
                    {t(item.labelKey)}
                  </Text>
                  {selectedFilters.includes(item.id) && (
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
                  {t('history.filters.clearAll')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.applyFiltersButton, { backgroundColor: colors.tint }]}
                onPress={() => setShowFiltersModal(false)}
              >
                <Text style={[styles.applyFiltersText, { color: colors.darkText }]}>
                  {t('history.filters.apply')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* History list */}
      {loadingSummaries ? (
        <FullScreenLoader text={t('history.loadingSummaries')} />
      ) : filteredHistoryData.length === 0 ? (
        <View style={styles.centerMessage}>
          <Text style={[styles.messageText, { color: colors.text }]}>
            {t('history.noHistoryFound')}
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
                  {t('history.weekShort')}{"\n"}
                  {summary.weekNumber}
                </Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  {t('history.summaryTitle', { week: summary.weekNumber })}
                </Text>
                <View style={styles.statusContainer}>
                  <Text style={[styles.cardSubtitle, { color: colors.text }]}> 
                    {t('history.allTasksWere')} {" "}
                  </Text>
                  <View style={[styles.statusText, { backgroundColor: summary.allCompleted ? colors.statusSuccessBackground : colors.statusFailedBackground }]}>
                    <Text style={[styles.statusTextInner, { color: summary.allCompleted ? colors.statusSuccessText : colors.statusFailedText }]}>
                      {summary.allCompleted ? t('history.status.completed') : t('history.status.notCompleted')}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.cardSubtitle, { color: colors.text }]}> 
                  {t('history.completedCount', { completed: summary.completedTasks, total: summary.totalTasks })}
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
