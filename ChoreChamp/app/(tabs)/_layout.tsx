import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useTheme } from "@/contexts/ThemeContext";

// Floating Tab Button Component
function FloatingTabButton(props: any) {
  return (
    <HapticTab
      {...props}
      style={styles.floatingButtonContainer}
    >
      <View
        style={[
          styles.floatingButton,
          props.accessibilityState?.selected &&
            styles.floatingButtonFocused,
        ]}
      >
        <IconSymbol
          size={32}
          name="plus"
          color="white"
          weight="semibold"
        />
      </View>
    </HapticTab>
  );
}

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: colors.tabBarBackground,
          height: 90,
          paddingBottom: 20,
          paddingTop: 10,
          borderTopWidth: 0,
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Hjem",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={28}
              name={focused ? "house.fill" : "house"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="HistoryTab"
        options={{
          title: "Historikk",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={28}
              name={focused ? "clock.fill" : "clock"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="AddTaskTab"
        options={{
          title: "Add Task",
          tabBarButton: FloatingTabButton,
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={32}
              name="plus"
              color="white"
              weight="semibold"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="NotificationTab"
        options={{
          title: "Varsel",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={28}
              name={focused ? "bell.fill" : "bell"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="ProfileTab"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={28}
              name={focused ? "person.fill" : "person"}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  floatingButtonContainer: {
    top: -25,
    justifyContent: "center",
    alignItems: "center",
  },
  floatingButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFBE00",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.25)',
    elevation: 8,
  },
  floatingButtonFocused: {
    backgroundColor: "#FFBE00",
    transform: [{ scale: 1.1 }],
  },
});
