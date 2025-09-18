import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? "light"].tabIconDefault,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? "light"].tabBarBackground,
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="DashboardTab"
        options={{
          title: "Hjem",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={28} name={focused ? "house.fill" : "house"} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="HistoryTab"
        options={{
          title: "Historikk",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={28} name={focused ? "clock.fill" : "clock"} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="AddTaskTab"
        options={{
          title: "",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={28} name={focused ? "plus.circle.fill" : "plus.circle"} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="NotificationTab"
        options={{
          title: "Varsel",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={28} name={focused ? "bell.fill" : "bell"} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ProfileTab"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={28} name={focused ? "person.fill" : "person"} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
