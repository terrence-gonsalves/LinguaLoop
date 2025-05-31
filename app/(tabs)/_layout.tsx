import { Tabs } from 'expo-router';
import React from 'react';

import { MaterialIconsIcon } from '@/components/navigation/TabBarIcons';
import { Colors } from '@/constants/Colors';

export default function TabLayout() {
    return (
        <Tabs screenOptions={{ 
            headerShown: false, 
            tabBarShowLabel: false,
            tabBarActiveTintColor: Colors.light.tabIconSelected,
            tabBarInactiveTintColor: Colors.light.tabIconDefault }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color, focused }) => (
                        <MaterialIconsIcon name={focused ? 'dashboard' : 'dashboard'} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}