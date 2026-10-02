import { useCallback, useEffect, useState } from "react";
import * as Clipboard from "expo-clipboard";
import { useSQLiteContext } from "expo-sqlite";
import { Notification } from "../notification.types";
import { NotificationRepository } from "../database/notification.respository";
import { getDatabase } from "@/database";

export function useRawNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Busca os dados delegando a query SQL para o Repository
  const refresh = useCallback(async () => {
    try {
      const data = await NotificationRepository.findAll();
      setNotifications(data);
    } catch (error) {
      console.error("Erro ao buscar notificações no banco:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 2. Efeito colateral para carregar na montagem do componente
  useEffect(() => {
    refresh();
  }, [refresh]);

  // 3. Ações de utilidade da tela
  const copyNotification = useCallback(async (notification: Notification) => {
    await Clipboard.setStringAsync(JSON.stringify(notification, null, 2));
  }, []);

  const copyAll = useCallback(async () => {
    await Clipboard.setStringAsync(JSON.stringify(notifications, null, 2));
  }, [notifications]);

  return {
    notifications,
    count: notifications.length,
    isLoading,
    copyNotification,
    copyAll,
    refresh,
  };
}
