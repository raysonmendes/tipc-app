import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { Card, Chip, Divider, Text, useTheme } from "react-native-paper";

import type { WorkSessionRecord } from "../../hooks/useWorkSession";
import { formatCurrency } from "../../utils/costCalculator";

interface WorkSessionsListProps {
  sessions: WorkSessionRecord[];
}

function formatDate(value: string): string {
  const date = new Date(`${value.replace(" ", "T")}Z`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" });
}

export function WorkSessionsList({ sessions }: WorkSessionsListProps) {
  const theme = useTheme();
  if (sessions.length === 0)
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={styles.empty}>Nenhum turno encerrado ainda.</Text>
      </View>
    );
  return (
    <View style={styles.list}>
      {sessions.map((session) => (
        <Card key={session.id} mode="elevated" style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <View style={styles.dateRow}>
                <MaterialCommunityIcons
                  name="calendar-month-outline"
                  size={21}
                  color={theme.colors.primary}
                />
                <Text variant="titleMedium" style={styles.date}>
                  {formatDate(session.start_time)}
                </Text>
              </View>
              <Chip
                compact
                icon="check-circle-outline"
                textStyle={styles.chipText}
                style={styles.closedChip}
              >
                CLOSED
              </Chip>
            </View>
            <Divider style={styles.divider} />
            <View style={styles.metrics}>
              <Metric
                label="Odômetro inicial"
                value={`${session.odo_start.toFixed(1)} km`}
              />
              <Metric
                label="Odômetro final"
                value={
                  session.odo_end === null
                    ? "--"
                    : `${session.odo_end.toFixed(1)} km`
                }
              />
              <Metric
                label="Total km"
                value={
                  session.total_km === null
                    ? "--"
                    : `${session.total_km.toFixed(1)} km`
                }
              />
              <Metric
                label="Custo total"
                value={formatCurrency(session.total_cost)}
                highlight
              />
            </View>
          </Card.Content>
        </Card>
      ))}
    </View>
  );
}

function Metric({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.metric}>
      <Text variant="labelMedium" style={styles.metricLabel}>
        {label}
      </Text>
      <Text
        variant="bodyLarge"
        style={highlight ? styles.highlight : styles.metricValue}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12 },
  card: { borderRadius: 12 },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateRow: { alignItems: "center", flex: 1, flexDirection: "row", gap: 8 },
  date: { flexShrink: 1 },
  chipText: { fontSize: 11, fontWeight: "700" },
  closedChip: { backgroundColor: "#e4e7e8" },
  divider: { marginVertical: 16 },
  metrics: { flexDirection: "row", flexWrap: "wrap", rowGap: 16 },
  metric: { width: "50%" },
  metricLabel: { color: "#5f6b73", marginBottom: 3 },
  metricValue: { fontWeight: "600" },
  highlight: { color: "#D97706", fontWeight: "700" },
  empty: { color: "#5f6b73", paddingVertical: 24, textAlign: "center" },
});
