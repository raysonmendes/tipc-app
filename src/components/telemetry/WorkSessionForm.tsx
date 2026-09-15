import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Button, Card, Text, TextInput, useTheme } from "react-native-paper";

import type { WorkSession } from "../../database";
import {
  calculateOperationalCost,
  calculateTotalKm,
  formatCurrency,
  parseOdometer,
} from "../../utils/costCalculator";

interface WorkSessionFormProps {
  activeSession: WorkSession | null;
  onStart: (odoStart: number) => Promise<void>;
  onEnd: (odoEnd: number) => Promise<void>;
}

export function WorkSessionForm({
  activeSession,
  onStart,
  onEnd,
}: WorkSessionFormProps) {
  const theme = useTheme();
  const [startValue, setStartValue] = useState("");
  const [endValue, setEndValue] = useState("");
  const endOdometer = parseOdometer(endValue);
  const totalKm =
    activeSession && endOdometer !== null
      ? calculateTotalKm(activeSession.odo_start, endOdometer)
      : 0;

  const submit = async () => {
    if (!activeSession) {
      const value = parseOdometer(startValue);
      if (value === null) {
        Alert.alert(
          "Odômetro inválido",
          "Informe um valor numérico igual ou maior que zero.",
        );
        return;
      }
      await onStart(value);
      setStartValue("");
      return;
    }
    if (endOdometer === null || endOdometer < activeSession.odo_start) {
      Alert.alert(
        "Odômetro inválido",
        "O odômetro final deve ser maior ou igual ao odômetro inicial.",
      );
      return;
    }
    await onEnd(endOdometer);
    setEndValue("");
  };

  return (
    <Card mode="elevated" style={styles.card}>
      <Card.Title
        title={activeSession ? "Encerrar turno" : "Iniciar turno"}
        subtitle={
          activeSession
            ? "Informe o odômetro final"
            : "Registre o ponto de partida"
        }
      />
      <Card.Content>
        {!activeSession ? (
          <TextInput
            label="Odômetro inicial"
            value={startValue}
            onChangeText={setStartValue}
            mode="outlined"
            keyboardType="decimal-pad"
            placeholder="Ex.: 12540,8"
            left={<TextInput.Icon icon="speedometer" />}
          />
        ) : (
          <>
            <Text variant="labelMedium" style={styles.label}>
              Odômetro inicial
            </Text>
            <Text variant="titleMedium" style={styles.startValue}>
              {activeSession.odo_start.toFixed(1)} km
            </Text>
            <TextInput
              label="Odômetro final"
              value={endValue}
              onChangeText={setEndValue}
              mode="outlined"
              keyboardType="decimal-pad"
              placeholder="Ex.: 12620,3"
              left={<TextInput.Icon icon="speedometer" />}
            />
            <Card
              mode="contained"
              style={[
                styles.costCard,
                { backgroundColor: theme.colors.tertiaryContainer },
              ]}
            >
              <Card.Content style={styles.costContent}>
                <View>
                  <Text variant="labelLarge">Custo operacional</Text>
                  <Text variant="bodySmall">
                    CPK R$ 0,35 x {totalKm.toFixed(1)} km
                  </Text>
                </View>
                <Text
                  variant="titleLarge"
                  style={{ color: theme.colors.tertiary, fontWeight: "700" }}
                >
                  {formatCurrency(calculateOperationalCost(totalKm))}
                </Text>
              </Card.Content>
            </Card>
          </>
        )}
      </Card.Content>
      <Card.Actions>
        <Button
          mode="contained"
          icon={activeSession ? "stop" : "play"}
          onPress={submit}
        >
          {activeSession ? "Encerrar Turno" : "Iniciar Turno"}
        </Button>
      </Card.Actions>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12 },
  label: { color: "#5f6b73", marginBottom: 4 },
  startValue: { marginBottom: 12 },
  costCard: { marginTop: 16 },
  costContent: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
