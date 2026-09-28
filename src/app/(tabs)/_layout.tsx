import React from 'react';
import { Link, Tabs } from 'expo-router';

import LanguageSwitcherBtn from '@/src/components/LanguageSwitcherBtn';

import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import Colors from '@/src/constants/Colors';
import { useClientOnlyValue } from '@/src/components/useClientOnlyValue';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: useClientOnlyValue(false, true),
        tabBarShowLabel: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          headerShown: false,
          tabBarIcon: ({ color }) => <MaterialIcons size={25} name="dashboard" color={color} />,
        }}
      />
      <Tabs.Screen
        name="tracking"
        options={{
          title: 'Time Tracking',
          headerShown: false,
          tabBarIcon: ({ color }) => <Ionicons size={25} name="timer" color={color} />,
        }}
      />
      <Tabs.Screen
          name="languages"
          options={{
              title: 'Languages',
              headerShown: false,
              tabBarIcon: ({ color }) => <MaterialIcons size={25} name="language" color={color} />
          }}
      />
      <Tabs.Screen
          name="analytics"
          options={{
              title: 'Analytics',
              headerShown: true,
              headerStyle: {
                backgroundColor: Colors.light.drab,
              },
              headerTitleStyle: {
                color: Colors.light.textTertiary,
              },
              headerRight: () => <LanguageSwitcherBtn />,
              tabBarIcon: ({ color }) => <Ionicons size={25} name="analytics" color={color} />
          }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerShown: false,
          tabBarIcon: ({ color }) => <MaterialIcons size={25} name="manage-accounts" color={color} />,
        }}
      />
    </Tabs>
  );
}
