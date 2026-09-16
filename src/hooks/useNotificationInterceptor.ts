import { useEffect } from "react";
import { Alert, DeviceEventEmitter } from "react-native";
import RNNotificationListener from "react-native-notification-listener";
import { useSQLiteContext } from "expo-sqlite";

// Pacote da 99 Motorista (caso queira filtrar)
const TARGET_PACKAGE = "com.app99.driver";

export function useNotificationInterceptor() {
  const database = useSQLiteContext();

  useEffect(() => {
    let isMounted = true;

    const checkAndInitListener = async () => {
      try {
        const permissionStatus =
          await RNNotificationListener.getPermissionStatus();
        //dando um log aqui
        Alert.alert(
          "Debug",
          `Permissão ao montar listener: ${permissionStatus}`,
        );
        if (permissionStatus !== "authorized") {
          RNNotificationListener.requestPermission();
        }
      } catch (error) {
        console.error("Erro ao verificar permissão de notificação:", error);
        //dando um log aqui
        Alert.alert("Debug - Erro", `Falha ao checar permissão: ${error}`);
      }
    };

    checkAndInitListener();

    // Escuta o evento nativo em primeiro plano
    const subscription = DeviceEventEmitter.addListener(
      "react-native-notification-listener-received",
      async (event: any) => {
        //dando um log aqui
        Alert.alert("Debug", "Evento recebido em FOREGROUND!");
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

          const payloadHash = String(rawPayload) + rawPayload.length;

          await database.runAsync(
            "INSERT OR IGNORE INTO raw_notifications (payload_hash, full_payload_json, created_at) VALUES (?, ?);",
            [payloadHash, rawPayload, now],
          );
          //dando um log aqui
          Alert.alert("Debug", "INSERT no SQLite concluído com sucesso!");
        } catch (dbError) {
          //dando um log aqui
          Alert.alert("Debug - Erro SQLite", String(dbError));
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
