import React, { useState } from "react";
import { StyleSheet, Alert } from "react-native";
import { TextInput, Button, Card, useTheme } from "react-native-paper";

import { OdometerCameraModal } from "./OdometerCameraModal";
import { useCameraOdometer } from "../../hooks/useCameraOdometer";

interface WorkSessionFormProps {
  activeSession: any;
  onStart: (odoStart: number) => Promise<void>;
  onEnd: (odoEnd: number) => Promise<void>;
}

export function WorkSessionForm({
  activeSession,
  onStart,
  onEnd,
}: WorkSessionFormProps) {
  const theme = useTheme();

  // Estados dos valores digitados/lidos
  const [odoStartValue, setOdoStartValue] = useState("");
  const [odoEndValue, setOdoEndValue] = useState("");

  // Controle da Câmera
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<"start" | "end">("start");

  const { validateCameraPermission, processOdometerImage } =
    useCameraOdometer();

  // 1. Abrir câmera definindo o alvo (Início ou Fim)
  const handleOpenCamera = async (target: "start" | "end") => {
    const hasPermission = await validateCameraPermission();
    if (hasPermission) {
      setCameraTarget(target);
      setIsCameraVisible(true);
    }
  };

  // 2. Handler unificado para preencher o odômetro lido no campo correto
  const handlePhotoCaptured = async (imageUri: string) => {
    setIsCameraVisible(false);
    setIsProcessingOcr(true);

    try {
      const detectedOdometer = await processOdometerImage(imageUri);

      if (detectedOdometer !== null) {
        if (cameraTarget === "start") {
          setOdoStartValue(detectedOdometer.toString());
        } else {
          setOdoEndValue(detectedOdometer.toString());
        }

        Alert.alert(
          "Odômetro Lido!",
          `Valor detectado: ${detectedOdometer} km. Confirme o valor antes de prosseguir.`,
        );
      } else {
        Alert.alert(
          "Leitura não identificada",
          "Não identificamos um número limpo no painel. Digite o valor manualmente.",
        );
      }
    } catch (error) {
      console.error("Erro no OCR da imagem:", error);
      Alert.alert("Erro", "Falha ao processar a imagem.");
    } finally {
      setIsProcessingOcr(false);
    }
  };

  // 3. Submeter Início do Turno
  const handleSubmitStart = async () => {
    const numericOdo = parseInt(odoStartValue, 10);
    if (isNaN(numericOdo) || numericOdo <= 0) {
      Alert.alert("Valor inválido", "Informe um odômetro inicial válido.");
      return;
    }

    try {
      await onStart(numericOdo);
      setOdoStartValue("");
    } catch (error) {
      console.error("Erro ao iniciar turno:", error);
    }
  };

  // 4. Submeter Fim do Turno
  const handleSubmitEnd = async () => {
    const numericOdo = parseInt(odoEndValue, 10);
    const initialOdo = activeSession?.odoStart ?? activeSession?.odo_start ?? 0;

    if (isNaN(numericOdo) || numericOdo < initialOdo) {
      Alert.alert(
        "Valor inválido",
        `O odômetro final (${numericOdo} km) deve ser maior ou igual ao inicial (${initialOdo} km).`,
      );
      return;
    }

    try {
      await onEnd(numericOdo);
      setOdoEndValue("");
    } catch (error) {
      console.error("Erro ao finalizar turno:", error);
    }
  };

  // Renderização 1: Turno em Andamento (Formulário de Encerramento)
  if (activeSession) {
    const initialOdo = activeSession?.odoStart ?? activeSession?.odo_start ?? 0;

    return (
      <>
        <Card style={styles.card}>
          <Card.Title
            title="Turno em andamento"
            subtitle={`Iniciado em: ${initialOdo} km`}
          />
          <Card.Content style={styles.content}>
            <TextInput
              label="Odômetro Final (km)"
              value={odoEndValue}
              onChangeText={setOdoEndValue}
              keyboardType="numeric"
              mode="outlined"
              disabled={isProcessingOcr}
              right={
                <TextInput.Icon
                  icon={
                    isProcessingOcr && cameraTarget === "end"
                      ? "loading"
                      : "camera"
                  }
                  onPress={() => handleOpenCamera("end")}
                  disabled={isProcessingOcr}
                />
              }
            />

            <Button
              mode="contained"
              buttonColor={theme.colors.error}
              onPress={handleSubmitEnd}
              disabled={!odoEndValue || isProcessingOcr}
              style={styles.button}
            >
              Finalizar Turno
            </Button>
          </Card.Content>
        </Card>

        <OdometerCameraModal
          visible={isCameraVisible}
          onClose={() => setIsCameraVisible(false)}
          onPictureTaken={handlePhotoCaptured}
        />
      </>
    );
  }

  // Renderização 2: Sem Turno Ativo (Formulário de Abertura)
  return (
    <>
      <Card style={styles.card}>
        <Card.Title
          title="Iniciar novo turno"
          subtitle="Informe o odômetro inicial da moto"
        />
        <Card.Content style={styles.content}>
          <TextInput
            label="Odômetro Inicial (km)"
            value={odoStartValue}
            onChangeText={setOdoStartValue}
            keyboardType="numeric"
            mode="outlined"
            disabled={isProcessingOcr}
            right={
              <TextInput.Icon
                icon={
                  isProcessingOcr && cameraTarget === "start"
                    ? "loading"
                    : "camera"
                }
                onPress={() => handleOpenCamera("start")}
                disabled={isProcessingOcr}
              />
            }
          />

          <Button
            mode="contained"
            onPress={handleSubmitStart}
            style={styles.button}
            disabled={!odoStartValue || isProcessingOcr}
          >
            Iniciar Turno
          </Button>
        </Card.Content>
      </Card>

      <OdometerCameraModal
        visible={isCameraVisible}
        onClose={() => setIsCameraVisible(false)}
        onPictureTaken={handlePhotoCaptured}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12 },
  content: { gap: 16 },
  button: { marginTop: 8 },
});
