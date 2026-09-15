import { useEffect } from "react";
import { DeviceEventEmitter } from "react-native";
import RNNotificationListener from "react-native-notification-listener";
import { useSQLiteContext } from "expo-sqlite";

// Pacote da 99 Motorista (caso queira filtrar)
const TARGET_PACKAGE = "com.taxis99.driver";

export function useNotificationInterceptor() {
  const database = useSQLiteContext();

  useEffect(() => {
    let isMounted = true;

    const checkAndInitListener = async () => {
      try {
        const permissionStatus =
          await RNNotificationListener.getPermissionStatus();
        if (permissionStatus !== "authorized") {
          RNNotificationListener.requestPermission();
        }
      } catch (error) {
        console.error("Erro ao verificar permissão de notificação:", error);
      }
    };

    checkAndInitListener();

    // Escuta o evento nativo em primeiro plano
    const subscription = DeviceEventEmitter.addListener(
      "react-native-notification-listener-received",
      async (event: any) => {
        if (!isMounted || !event) return;

        try {
          const notificationString = event.notification || event;

          let parsedData: any;
          try {
            parsedData =
              typeof notificationString === "string"
                ? JSON.parse(notificationString)
                : notificationString;
          } catch (e) {
            parsedData = { raw: notificationString };
          }

          // Se quiser filtrar apenas pela 99 em primeiro plano, descomente abaixo:
          // if (parsedData?.app && parsedData.app !== TARGET_PACKAGE) return;

          const rawPayload =
            typeof notificationString === "string"
              ? notificationString
              : JSON.stringify(notificationString);

          const now = new Date().toISOString();

          await database.runAsync(
            "INSERT INTO raw_notifications (full_payload_json, created_at) VALUES (?, ?);",
            [rawPayload, now],
          );
        } catch (dbError) {
          console.error(
            "Erro ao inserir notificação no SQLite em foreground:",
            dbError,
          );
        }
      },
    );

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, [database]);
}
