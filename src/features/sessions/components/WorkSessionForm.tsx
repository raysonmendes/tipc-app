import { OdometerCameraModal } from "@/components/telemetry/OdometerCameraModal";
import { useCameraOdometer } from "@/hooks/useCameraOdometer";
import { inputMasks } from "@/shared/utils/inputMasks";
import { numberFormatter } from "@/shared/utils/numberFormatter";
import React, { useState } from "react";
import { StyleSheet, Alert, ToastAndroid } from "react-native";
import { TextInput, Button, Card, useTheme } from "react-native-paper";

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
  const [odoStartValueToInput, setOdoStartValueToInput] = useState("");
  const [odoEndValueToInput, setOdoEndValueToInput] = useState("");
  const [odoStartValueToDatabase, setOdoStartValueToDatabase] = useState<
    number | undefined
  >(undefined);
  const [odoEndValueToDatabase, setOdoEndValueToDatabase] = useState<
    number | undefined
  >(undefined);

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
        const detectedOdometerStr = numberFormatter.maskText(detectedOdometer);
        if (cameraTarget === "start") {
          setOdoStartValueToInput(detectedOdometerStr);
        } else {
          setOdoEndValueToInput(detectedOdometerStr);
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

  const handleChangeText = (text: string, target: "start" | "end") => {
    const masked = inputMasks.odometer(text);
    const numeric = numberFormatter.parseToNumber(text);
    if (target === "start") {
      setOdoStartValueToInput(masked);
      setOdoStartValueToDatabase(numeric);
    } else {
      setOdoEndValueToInput(masked);
      setOdoEndValueToDatabase(numeric);
    }
  };

  // 3. Submeter Início do Turno
  const handleSubmitStart = async () => {
    console.log(
      `Valor incial cru: ${odoStartValueToInput} e valor inicial formatado para número: ${odoStartValueToDatabase}`,
    );
    if (!odoStartValueToDatabase || odoStartValueToDatabase <= 0) {
      Alert.alert("Valor inválido", "Informe um odômetro inicial válido.");
      return;
    }

    try {
      await onStart(odoStartValueToDatabase);
      // setOdoStartValueToInput("");
      // setOdoStartValueToDatabase(undefined);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Falha ao iniciar o turno: ", `Error: ${error.message}`);
      }
      console.error("Erro ao iniciar turno:", error);
    }
  };

  // 4. Submeter Fim do Turno
  const handleSubmitEnd = async () => {
    if (
      !odoEndValueToDatabase ||
      !odoStartValueToDatabase ||
      odoEndValueToDatabase < odoStartValueToDatabase
    ) {
      Alert.alert(
        "Valor inválido",
        `O odômetro final (${odoStartValueToInput} km) deve ser maior ou igual ao inicial (${odoStartValueToInput} km).`,
      );
      return;
    }

    try {
      await onEnd(odoEndValueToDatabase);
      setOdoStartValueToInput("");
      setOdoStartValueToDatabase(undefined);
      setOdoEndValueToInput("");
      setOdoEndValueToDatabase(undefined);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Falha ao finalizar o turno: ", `Error: ${error.message}`);
      }
      console.error("Erro ao finalizar turno:", error);
    }
  };

  // Renderização 1: Turno em Andamento (Formulário de Encerramento)
  if (activeSession) {
    const initialOdo = activeSession?.odoStart ?? activeSession?.odo_start ?? 0;
    const initialOdoMasked = numberFormatter.maskText(initialOdo);

    return (
      <>
        <Card style={styles.card}>
          <Card.Title
            title="Turno em andamento"
            subtitle={`Iniciado em: ${initialOdoMasked} km`}
          />
          <Card.Content style={styles.content}>
            <TextInput
              label="Odômetro Final (km)"
              value={odoEndValueToInput}
              onChangeText={(v) => handleChangeText(v, "end")}
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
              disabled={!odoEndValueToInput || isProcessingOcr}
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
            value={odoStartValueToInput}
            onChangeText={(v) => handleChangeText(v, "start")}
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
            disabled={!odoStartValueToInput || isProcessingOcr}
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
