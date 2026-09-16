import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import RNNotificationListener from "react-native-notification-listener";
import { Button, Card, Chip, Text, useTheme } from "react-native-paper";

interface DebugLogRow {
  id: number;
  tag: string;
  message: string;
  created_at: string;
}

interface RawNotifRow {
  id: number;
  full_payload_json: string;
  created_at: string;
}

export default function DebugRoute() {
  const theme = useTheme();
  const database = useSQLiteContext();
  const [logs, setLogs] = useState<DebugLogRow[]>([]);
  const [notifications, setNotifications] = useState<RawNotifRow[]>([]);
  const [permissionStatus, setPermissionStatus] =
    useState<string>("verificando...");
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [debugRows, notifRows, status] = await Promise.all([
        database.getAllAsync<DebugLogRow>(
          "SELECT * FROM debug_logs ORDER BY id DESC LIMIT 50;",
        ),
        database.getAllAsync<RawNotifRow>(
          "SELECT * FROM raw_notifications ORDER BY id DESC LIMIT 20;",
        ),
        RNNotificationListener.getPermissionStatus(),
      ]);
      setLogs(debugRows);
      setNotifications(notifRows);
      setPermissionStatus(String(status));
    } catch (error) {
      Alert.alert("Erro ao carregar debug", String(error));
    } finally {
      setIsLoading(false);
    }
  }, [database]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const handleClearLogs = async () => {
    try {
      await database.runAsync("DELETE FROM debug_logs;");
      await database.runAsync("DELETE FROM raw_notifications;");
      await refresh();
    } catch (error) {
      Alert.alert("Erro ao limpar logs", String(error));
    }
  };

  const handleOpenSettings = () => {
    try {
      RNNotificationListener.requestPermission();
    } catch (error) {
      Alert.alert("Erro ao abrir configurações", String(error));
    }
  };

  const extractPackage = (payloadJson: string): string => {
    try {
      const parsed = JSON.parse(payloadJson);
      return parsed?.app ?? "desconhecido";
    } catch {
      return "não-json";
    }
  };

  const isAuthorized = permissionStatus === "authorized";

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        Debug
      </Text>

      <Card mode="elevated" style={styles.card}>
        <Card.Title title="Status da permissão de notificação" />
        <Card.Content>
          <Chip
            icon={isAuthorized ? "check-circle" : "alert-circle"}
            style={[
              styles.statusChip,
              { backgroundColor: isAuthorized ? "#B8F2D9" : "#FDE3E3" },
            ]}
          >
            {permissionStatus}
          </Chip>
          {!isAuthorized && (
            <Text style={styles.warningText}>
              A permissão não está "authorized". Verifique manualmente em
              Configurações → Apps → Acesso a notificações, ou toque no botão
              abaixo para abrir a tela de concessão.
            </Text>
          )}
        </Card.Content>
        <Card.Actions>
          <Button onPress={handleOpenSettings}>Abrir tela de permissão</Button>
        </Card.Actions>
      </Card>

      <Card mode="elevated" style={styles.card}>
        <Card.Title title="Pacotes vistos nas notificações brutas" />
        <Card.Content>
          {notifications.length === 0 ? (
            <Text style={styles.empty}>Nenhuma notificação bruta ainda.</Text>
          ) : (
            <View style={styles.chipRow}>
              {[
                ...new Set(
                  notifications.map((n) => extractPackage(n.full_payload_json)),
                ),
              ].map((pkg) => (
                <Chip key={pkg} style={styles.chip} icon="package-variant">
                  {pkg}
                </Chip>
              ))}
            </View>
          )}
        </Card.Content>
      </Card>

      <Card mode="elevated" style={styles.card}>
        <Card.Title
          title="Debug logs (headless + foreground)"
          subtitle={`${logs.length} registros`}
        />
        <Card.Actions>
          <Button onPress={refresh} disabled={isLoading}>
            Atualizar
          </Button>
          <Button onPress={handleClearLogs} textColor={theme.colors.error}>
            Limpar tudo
          </Button>
        </Card.Actions>
        <Card.Content style={styles.logList}>
          {logs.length === 0 ? (
            <Text style={styles.empty}>Nenhum log ainda.</Text>
          ) : (
            logs.map((log) => (
              <View key={log.id} style={styles.logRow}>
                <Text variant="labelSmall" style={styles.logTag}>
                  [{log.tag}] {log.created_at}
                </Text>
                <Text variant="bodyMedium">{log.message}</Text>
              </View>
            ))
          )}
        </Card.Content>
      </Card>

      <Card mode="elevated" style={styles.card}>
        <Card.Title
          title="Últimas notificações brutas"
          subtitle={`${notifications.length} registros`}
        />
        <Card.Content style={styles.logList}>
          {notifications.map((n) => (
            <View key={n.id} style={styles.logRow}>
              <Text variant="labelSmall" style={styles.logTag}>
                #{n.id} · {n.created_at} · pacote:{" "}
                {extractPackage(n.full_payload_json)}
              </Text>
              <Text numberOfLines={3} style={styles.payload}>
                {n.full_payload_json}
              </Text>
            </View>
          ))}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 56,
    gap: 14,
    backgroundColor: "#F7F9F8",
  },
  title: { fontWeight: "700" },
  card: { borderRadius: 12 },
  logList: { gap: 10 },
  logRow: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#DDD",
    paddingBottom: 8,
  },
  logTag: { color: "#5f6b73", marginBottom: 2 },
  payload: {
    backgroundColor: "#f1f3f4",
    borderRadius: 6,
    fontFamily: "monospace",
    padding: 8,
  },
  empty: { color: "#5f6b73", textAlign: "center", paddingVertical: 12 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {},
  statusChip: { alignSelf: "flex-start" },
  warningText: { color: "#B45309", marginTop: 8 },
});
