import { useCameraPermissions } from "expo-camera";
import TextRecognition from "@react-native-ml-kit/text-recognition";
import { Alert } from "react-native";

export function useCameraOdometer() {
  const [permission, requestPermission] = useCameraPermissions();

  const validateCameraPermission = async (): Promise<boolean> => {
    if (permission?.granted) return true;

    const result = await requestPermission();
    if (!result.granted) {
      Alert.alert(
        "Permissão necessária",
        "O TIPC precisa de acesso à câmera para fotografar o painel da moto.",
      );
      return false;
    }
    return true;
  };

  const processOdometerImage = async (
    imageUri: string,
  ): Promise<number | null> => {
    try {
      // Executa o OCR nativo na imagem capturada
      const result = await TextRecognition.recognize(imageUri);

      // Procura por sequências numéricas no texto extraído
      const fullText = result.text.replace(/\s+/g, ""); // Remove espaços acidentais
      const matches = fullText.match(/\d+/g);

      if (matches && matches.length > 0) {
        // Pega a maior sequência de dígitos encontrada (geralmente o odômetro principal)
        const largestNumber = matches.reduce((prev, curr) =>
          curr.length > prev.length ? curr : prev,
        );
        return parseInt(largestNumber, 10);
      }

      return null;
    } catch (error) {
      console.error("Erro ao ler imagem com OCR:", error);
      return null;
    }
  };

  return {
    validateCameraPermission,
    processOdometerImage,
  };
}
