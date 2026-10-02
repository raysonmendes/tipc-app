import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { Card, Chip, Divider, Text, useTheme } from "react-native-paper";
import { useWorkSession } from "../hooks/useWorkSession";
import { formatCurrency } from "@/shared/utils/costCalculator";
import { numberFormatter } from "@/shared/utils/numberFormatter";
import { WorkSessionRecord } from "../session.type";
import { inputMasks } from "@/shared/utils/inputMasks";

interface WorkSessionsListProps {
  sessions: WorkSessionRecord[];
}

function formatDate(value: string): { date: string; time: string } {
  console.log("formatDate called with value:", value);
  const dateValue = new Date(`${value.replace(" ", "T")}Z`);
  const formatedDate = {
    date: dateValue.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    time: dateValue.toLocaleString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  };
  return formatedDate;
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
              <View
                style={[
                  styles.dateRow,
                  {
                    justifyContent: "flex-end",
                    width: "100%",
                    gap: 2,
                  },
                ]}
              >
                <View
                  style={[
                    styles.dateRow,
                    {
                      justifyContent: "flex-start",
                      width: "100%",
                      margin: 8,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="calendar-month-outline"
                    size={20}
                    color={theme.colors.primary}
                  />
                  <Text
                    variant="titleMedium"
                    style={[styles.date, { fontSize: 16 }]}
                  >
                    {formatDate(session.startTime).date}
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="check-circle-outline"
                  size={14}
                  color={theme.colors.primary}
                />
                <Text variant="titleMedium" style={styles.chipText}>
                  CLOSED
                </Text>
              </View>
              <View style={styles.dateRow}>
                <View style={styles.dateRow}>
                  <View style={[styles.dateRow]}>
                    <MaterialCommunityIcons
                      name="timer-play-outline"
                      size={16}
                      color={theme.colors.secondary}
                    />
                    <Text
                      variant="titleMedium"
                      style={[styles.date, { fontSize: 12 }]}
                    >
                      {formatDate(session.startTime).time}
                    </Text>
                  </View>
                  <View style={[styles.dateRow]}>
                    <MaterialCommunityIcons
                      name="timer-stop-outline"
                      size={16}
                      color={theme.colors.tertiary}
                    />
                    <Text
                      variant="titleMedium"
                      style={[styles.date, { fontSize: 12 }]}
                    >
                      {formatDate(session.endTime ?? "").time}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            <Divider style={styles.divider} />
            <View style={styles.metrics}>
              <Metric
                label="Odômetro inicial"
                value={`${numberFormatter.maskText(session.odoStart)} km`}
              />
              <Metric
                label="Odômetro final"
                value={
                  session.odoEnd === null
                    ? "--"
                    : `${numberFormatter.maskText(session.odoEnd)} km`
                }
              />
              <Metric
                label="Total km"
                value={
                  session.totalKm === null
                    ? "--"
                    : `${numberFormatter.maskText(session.totalKm)} km`
                }
              />
              <Metric
                label="Custo total"
                value={formatCurrency(session.totalCost)}
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
    flexDirection: "column",
    justifyContent: "space-between",
  },
  dateRow: { alignItems: "center", flex: 1, flexDirection: "row", gap: 8 },
  dateCol: {
    alignItems: "flex-start",
    flex: 1,
    flexDirection: "column",
    gap: 8,
  },
  date: { flexShrink: 1 },
  chipText: { fontSize: 12, fontWeight: "700" },
  closedChip: { backgroundColor: "#e4e7e8" },
  divider: { marginVertical: 16 },
  metrics: { flexDirection: "row", flexWrap: "wrap", rowGap: 16 },
  metric: { width: "50%" },
  metricLabel: { color: "#5f6b73", marginBottom: 3 },
  metricValue: { fontWeight: "600" },
  highlight: { color: "#D97706", fontWeight: "700" },
  empty: { color: "#5f6b73", paddingVertical: 24, textAlign: "center" },
});
