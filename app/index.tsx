import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Text, useTheme } from "react-native-paper";

import { WorkSessionForm } from "../src/components/telemetry/WorkSessionForm";
import { useRawNotifications } from "../src/hooks/useRawNotifications";
import { useWorkSession } from "../src/hooks/useWorkSession";
import { useNotificationPermission } from "../src/hooks/useNotificationPermission";
import { NotificationPermissionModal } from "../src/components/telemetry/permissionModal/NotificationPermissionModal";

export default function CurrentShiftRoute() {
  const theme = useTheme();
  const { activeSession, isLoading, startSession, endSession } =
    useWorkSession();
  const {
    validateBeforeStartShift,
    showPermissionModal,
    setShowPermissionModal,
    requestSystemPermission,
  } = useNotificationPermission();
  const { count, copyAll } = useRawNotifications();
  const [isCopying, setIsCopying] = useState(false);

  const handleCopy = async () => {
    setIsCopying(true);
    try {
      await copyAll();
      Alert.alert("Logs copiados", `${count} notificações foram copiadas.`);
    } finally {
      setIsCopying(false);
    }
  };

  const handleStartSession = async (odoStart: number) => {
    try {
      const canProceed = await validateBeforeStartShift();
      if (!canProceed) return;
      // throw new Error("The app needs permission to intercept notifications!");

      await startSession(odoStart);
      Alert.alert("Turno iniciado", `Odômetro inicial: ${odoStart} km.`);
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível iniciar o turno.");
    }
  };

  if (isLoading)
    return (
      <View style={styles.loading}>
        <Text>Carregando telemetria...</Text>
      </View>
    );
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text
        variant="labelMedium"
        style={[styles.eyebrow, { color: theme.colors.primary }]}
      >
        TIPC / OPERAÇÃO
      </Text>
      <Text variant="headlineLarge" style={styles.title}>
        Painel de turno
      </Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        Registro local de quilometragem e telemetria bruta.
      </Text>
      <View style={styles.statusRow}>
        <MaterialCommunityIcons
          name={activeSession ? "record-circle" : "record-circle-outline"}
          size={20}
          color={activeSession ? theme.colors.secondary : theme.colors.outline}
        />
        <Text
          variant="labelLarge"
          style={{
            color: activeSession
              ? theme.colors.secondary
              : theme.colors.onSurfaceVariant,
          }}
        >
          {activeSession ? "TURNO ATIVO" : "AGUARDANDO INÍCIO"}
        </Text>
      </View>
      <WorkSessionForm
        activeSession={activeSession}
        onStart={handleStartSession}
        onEnd={endSession}
      />
      <Card mode="elevated" style={styles.card}>
        <Card.Title
          title="Telemetria bruta"
          subtitle={`${count} notificações armazenadas`}
          left={(props) => (
            <MaterialCommunityIcons
              {...props}
              name="database-outline"
              color={theme.colors.primary}
            />
          )}
        />
        <Card.Actions>
          <Button icon="content-copy" disabled={isCopying} onPress={handleCopy}>
            Copiar logs JSON
          </Button>
        </Card.Actions>
      </Card>
      <NotificationPermissionModal
        visible={showPermissionModal}
        onDismiss={() => setShowPermissionModal(false)}
        onConfirm={requestSystemPermission}
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
    gap: 14,
  },
  loading: {
    alignItems: "center",
    backgroundColor: "#F7F9F8",
    flex: 1,
    justifyContent: "center",
  },
  eyebrow: { fontWeight: "700", letterSpacing: 1.2 },
  title: { fontWeight: "700", marginTop: -8 },
  subtitle: { color: "#536169", marginTop: -8 },
  statusRow: { alignItems: "center", flexDirection: "row", gap: 8 },
  card: { borderRadius: 12 },
});
