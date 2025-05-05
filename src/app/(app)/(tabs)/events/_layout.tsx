/**
 * This layout is used to wrap the events tab so that it can have proper stack navigation.
 */
import { Stack } from "expo-router";

export default function EventsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
};