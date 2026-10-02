import { ScrollView, StyleSheet } from "react-native";

import { useWorkSession } from "../src/features/sessions/hooks/useWorkSession";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { WorkSessionsList } from "@/features/sessions/components/WorkSessionsList";

export default function HistoryRoute() {
  const { sessions, refresh } = useWorkSession();
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <WorkSessionsList
        sessions={sessions.filter((session) => session.status !== "ACTIVE")}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 56,
    backgroundColor: "#F7F9F8",
  },
});
