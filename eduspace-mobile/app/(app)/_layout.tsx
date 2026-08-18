import React from 'react';
import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="ai-chat" />
      <Stack.Screen name="notice-board" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="my-classes" />
      <Stack.Screen name="attendance" />
      <Stack.Screen name="library" />
      <Stack.Screen name="timetable" />
      <Stack.Screen name="leave" />
      <Stack.Screen name="coe" />
      <Stack.Screen name="exam-form" />
      <Stack.Screen name="fees" />
      <Stack.Screen name="results" />
      <Stack.Screen name="academic-calendar" />
      <Stack.Screen name="it-admin" />
      <Stack.Screen name="manage-users" />
      <Stack.Screen name="manage-departments" />
      <Stack.Screen name="mark-attendance" />
      <Stack.Screen name="feedback" />
      <Stack.Screen name="payment-details" />
      <Stack.Screen name="exam-management" />
      <Stack.Screen name="faculty" />
      <Stack.Screen name="admin" />
    </Stack>
  );
}
