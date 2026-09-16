import { ScrollView, StyleSheet } from "react-native";

import { WorkSessionsList } from "../src/components/telemetry/WorkSessionsList";
import { useWorkSession } from "../src/hooks/useWorkSession";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

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
