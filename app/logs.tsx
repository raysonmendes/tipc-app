import { Alert, ScrollView, StyleSheet } from "react-native";

import { RawNotificationsList } from "../src/components/telemetry/RawNotificationsList";
import { useRawNotifications } from "../src/hooks/useRawNotifications";

export default function LogsRoute() {
  const { notifications, copyNotification } = useRawNotifications();
  const onCopy = async (notification: (typeof notifications)[number]) => {
    await copyNotification(notification);
    Alert.alert("JSON copiado", `Notificação #${notification.id} copiada.`);
  };
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <RawNotificationsList notifications={notifications} onCopy={onCopy} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 56,
    backgroundColor: "#F7F9F8",
  },
});
