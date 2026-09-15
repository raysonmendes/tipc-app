import { useState, useEffect } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RNNotificationListener from "react-native-notification-listener";

const FIRST_LAUNCH_KEY = "@tipc_first_launch_done";

export function useNotificationPermission() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [showPermissionModal, setShowPermissionModal] =
    useState<boolean>(false);

  // Função para checar o status nativo no Android
  const checkPermission = async (): Promise<boolean> => {
    try {
      const status = await RNNotificationListener.getPermissionStatus();
      const isGranted = status === "authorized";
      setHasPermission(isGranted);
      return isGranted;
    } catch (error) {
      console.error("Erro ao verificar permissão de notificação:", error);
      return false;
    }
  };

  // Checagem no Momento 1: Abertura do App
  useEffect(() => {
    const initCheck = async () => {
      const isGranted = await checkPermission();

      if (!isGranted) {
        const hasPromptedBefore = await AsyncStorage.getItem(FIRST_LAUNCH_KEY);
        if (!hasPromptedBefore) {
          // Primeira execução após instalação
          setShowPermissionModal(true);
          await AsyncStorage.setItem(FIRST_LAUNCH_KEY, "true");
        }
      }
    };

    initCheck();
  }, []);

  // Função disparada pelo botão Aceitar no Modal ou no Momento 2
  const requestSystemPermission = async () => {
    setShowPermissionModal(false);
    try {
      await RNNotificationListener.requestPermission();
      // Re-verifica após o retorno do usuário da tela de configurações do Android
      await checkPermission();
    } catch (error) {
      console.error("Erro ao solicitar permissão:", error);
    }
  };

  // Checagem no Momento 2: Iniciar Turno (Retorna boolean para bloquear/liberar a ação)
  const validateBeforeStartShift = async (): Promise<boolean> => {
    const isGranted = await checkPermission();
    if (isGranted) {
      return true;
    } else {
      setShowPermissionModal(true);
      return false;
    }
  };

  return {
    hasPermission,
    showPermissionModal,
    setShowPermissionModal,
    requestSystemPermission,
    validateBeforeStartShift,
  };
}
