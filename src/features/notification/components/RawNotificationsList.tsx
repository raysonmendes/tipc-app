import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Alert, StyleSheet, View } from "react-native";
import { Card, IconButton, Text, useTheme } from "react-native-paper";
import { RawNotificationsListProps } from "../notification.types";

export function RawNotificationsList({
  notifications,
  onCopy,
}: RawNotificationsListProps) {
  const theme = useTheme();
  if (notifications.length === 0)
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={styles.empty}>Nenhuma notificação bruta armazenada.</Text>
      </View>
    );

  return (
    <View style={styles.list}>
      {notifications.map((notification) => (
        <Card key={notification.id} mode="elevated" style={styles.card}>
          <Card.Title
            title={`Notificação #${notification.id}`}
            subtitle={notification.createAt}
            left={(props) => (
              <MaterialCommunityIcons
                {...props}
                name="bell-outline"
                color={theme.colors.primary}
                size={16}
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
            <View>
              <Text numberOfLines={4} style={styles.payload}>
                id: {notification.id}
              </Text>
            </View>
            <View>
              <Text numberOfLines={4} style={styles.payload}>
                time: {notification.time}
              </Text>
            </View>
            <View>
              <Text numberOfLines={4} style={styles.payload}>
                app: {notification.app}
              </Text>
            </View>
            <View>
              <Text numberOfLines={4} style={styles.payload}>
                title: {notification.title}
              </Text>
            </View>
            <View>
              <Text numberOfLines={4} style={styles.payload}>
                titleBig: {notification.titleBig}
              </Text>
            </View>
            <View>
              <Text numberOfLines={4} style={styles.payload}>
                text: {notification.text}
              </Text>
            </View>
            <View>
              <Text numberOfLines={4} style={styles.payload}>
                subText: {notification.subText}
              </Text>
            </View>
            <View>
              <Text numberOfLines={4} style={styles.payload}>
                summaryText: {notification.summaryText}
              </Text>
            </View>
            <View>
              <Text numberOfLines={4} style={styles.payload}>
                bigText: {notification.bigText}
              </Text>
            </View>
            <View>
              <Text numberOfLines={4} style={styles.payload}>
                audioContentsURI: {notification.audioContentsURI}
              </Text>
            </View>
            <View>
              <Text numberOfLines={4} style={styles.payload}>
                imageBackgroundURI: {notification.imageBackgroundURI}
              </Text>
            </View>
            <View>
              <Text numberOfLines={4} style={styles.payload}>
                extraInfoText: {notification.extraInfoText}
              </Text>
            </View>
            <View>
              <Text numberOfLines={4} style={styles.payload}>
                icon: {notification.icon}
              </Text>
            </View>
            <View>
              <Text numberOfLines={4} style={styles.payload}>
                image: {notification.image}
              </Text>
            </View>
            <View>
              <Text numberOfLines={4} style={styles.payload}>
                iconLarge: {notification.iconLarge}
              </Text>
            </View>
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
