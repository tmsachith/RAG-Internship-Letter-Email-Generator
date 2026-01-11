import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import ChatHistoryScreen from './ChatHistoryScreen';
import ApplicationHistoryScreen from './ApplicationHistoryScreen';
import { COLORS } from '../utils/constants';

const Tab = createMaterialTopTabNavigator();

export default function HistoryScreen() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarIndicatorStyle: { backgroundColor: COLORS.primary },
        tabBarStyle: { backgroundColor: COLORS.background },
        tabBarLabelStyle: { fontWeight: '600', fontSize: 14 },
      }}
    >
      <Tab.Screen name="ChatHistory" component={ChatHistoryScreen} options={{ title: 'Chat History' }} />
      <Tab.Screen name="ApplicationHistory" component={ApplicationHistoryScreen} options={{ title: 'Applications' }} />
    </Tab.Navigator>
  );
}
