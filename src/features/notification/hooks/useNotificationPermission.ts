import { useState, useEffect, useCallback } from "react";
import { AppState, AppStateStatus } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RNNotificationListener from "react-native-notification-listener";

const FIRST_LAUNCH_KEY = "@tipc_first_launch_done";

export function useNotificationPermission() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [showPermissionModal, setShowPermissionModal] =
    useState<boolean>(false);

  // Checa o status nativo no Android
  const checkPermission = useCallback(async (): Promise<boolean> => {
    try {
      const status = await RNNotificationListener.getPermissionStatus();
      const isGranted = status === "authorized";
      setHasPermission(isGranted);
      return isGranted;
    } catch (error) {
      console.error("Erro ao verificar permissão de notificação:", error);
      setHasPermission(false);
      return false;
    }
  }, []);

  // Monitora a abertura do app E o retorno das configurações do Android
  useEffect(() => {
    const initCheck = async () => {
      const isGranted = await checkPermission();
      if (!isGranted) {
        const hasPromptedBefore = await AsyncStorage.getItem(FIRST_LAUNCH_KEY);
        if (!hasPromptedBefore) {
          setShowPermissionModal(true);
          await AsyncStorage.setItem(FIRST_LAUNCH_KEY, "true");
        }
      }
    };

    initCheck();

    // Re-checa a permissão sempre que o usuário voltar da tela de configurações do sistema
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (nextAppState === "active") {
          checkPermission();
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, [checkPermission]);

  // Ação ao clicar no botão de aceitar do modal
  const requestSystemPermission = async () => {
    setShowPermissionModal(false);
    try {
      // Abre a tela nativa do Android para o usuário conceder a permissão
      RNNotificationListener.requestPermission();
    } catch (error) {
      console.error("Erro ao solicitar permissão:", error);
    }
  };

  // Validação ao clicar em "Iniciar Turno"
  const validateBeforeStartShift = async (): Promise<boolean> => {
    const isGranted = await checkPermission();
    if (!isGranted) {
      // Exibe o modal para o usuário entender o motivo antes de ir para as configurações
      setShowPermissionModal(true);
      return false;
    }
    return true;
  };

  return {
    hasPermission,
    showPermissionModal,
    setShowPermissionModal,
    requestSystemPermission,
    validateBeforeStartShift,
    checkPermission,
  };
}
