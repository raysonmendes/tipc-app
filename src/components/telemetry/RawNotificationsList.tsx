import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Alert, StyleSheet, View } from "react-native";
import { Card, IconButton, Text, useTheme } from "react-native-paper";

import type { RawNotification } from "../../database";

interface RawNotificationsListProps {
  notifications: RawNotification[];
  onCopy: (notification: RawNotification) => Promise<void>;
}

export function RawNotificationsList({
  notifications,
  onCopy,
}: RawNotificationsListProps) {
  const theme = useTheme();
  if (notifications.length === 0)
    return (
      <Text style={styles.empty}>Nenhuma notificação bruta armazenada.</Text>
    );
  return (
    <View style={styles.list}>
      {notifications.map((notification) => (
        <Card key={notification.id} mode="elevated" style={styles.card}>
          <Card.Title
            title={`Notificação #${notification.id}`}
            subtitle={notification.created_at}
            left={(props) => (
              <MaterialCommunityIcons
                {...props}
                name="bell-outline"
                color={theme.colors.primary}
              />
            )}
            right={(props) => (
              <IconButton
                {...props}
                icon="content-copy"
                accessibilityLabel={`Copiar notificação ${notification.id}`}
                onPress={() =>
                  onCopy(notification).catch(() =>
                    Alert.alert("Erro", "Não foi possível copiar o JSON."),
                  )
                }
              />
            )}
          />
          <Card.Content>
            <Text numberOfLines={4} style={styles.payload}>
              {notification.full_payload_json}
            </Text>
          </Card.Content>
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12 },
  card: { borderRadius: 12 },
  payload: {
    backgroundColor: "#f1f3f4",
    borderRadius: 6,
    fontFamily: "monospace",
    padding: 12,
  },
  empty: { color: "#5f6b73", paddingVertical: 24, textAlign: "center" },
});
