import React, { useRef, useState } from "react";
import { StyleSheet, View, Modal, TouchableOpacity } from "react-native";
import { CameraView } from "expo-camera";
import {
  Text,
  IconButton,
  useTheme,
  ActivityIndicator,
} from "react-native-paper";

interface OdometerCameraModalProps {
  visible: boolean;
  onClose: () => void;
  onPictureTaken: (uri: string) => void;
}

export function OdometerCameraModal({
  visible,
  onClose,
  onPictureTaken,
}: OdometerCameraModalProps) {
  const theme = useTheme();
  const cameraRef = useRef<CameraView>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTakePicture = async () => {
    if (!cameraRef.current || isProcessing) return;

    try {
      setIsProcessing(true);
      // Captura a foto através da ref da CameraView
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      });

      if (photo?.uri) {
        onPictureTaken(photo.uri);
      }
    } catch (error) {
      console.error("Erro ao tirar foto do odômetro:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <CameraView style={StyleSheet.absoluteFill} ref={cameraRef}>
          {/* Overlay com Máscara e Moldura Guia */}
          <View style={styles.overlayContainer}>
            <Text style={styles.instructionText}>
              Enquadre o odômetro do painel na caixa abaixo
            </Text>

            {/* Retângulo Guia do Odômetro */}
            <View
              style={[styles.targetBox, { borderColor: theme.colors.primary }]}
            />

            {/* Ações / Botão de Disparo */}
            <View style={styles.controlsRow}>
              <IconButton
                icon="close"
                iconColor="#FFF"
                size={30}
                onPress={onClose}
                disabled={isProcessing}
              />
              <TouchableOpacity
                style={styles.captureButton}
                onPress={handleTakePicture}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator
                    color={theme.colors.primary}
                    size="small"
                  />
                ) : (
                  <View
                    style={[
                      styles.innerCaptureCircle,
                      { backgroundColor: theme.colors.primary },
                    ]}
                  />
                )}
              </TouchableOpacity>
              <View style={{ width: 48 }} />
              {/* Espaçador para centralizar o botão */}
            </View>
          </View>
        </CameraView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  overlayContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  instructionText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 20,
  },
  targetBox: {
    width: "85%",
    height: 120,
    borderWidth: 3,
    borderRadius: 12,
    borderStyle: "dashed",
    backgroundColor: "transparent",
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },
  innerCaptureCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
});
