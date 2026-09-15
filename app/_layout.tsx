import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import { MD3LightTheme, PaperProvider } from "react-native-paper";

import { DATABASE_NAME, initializeDatabase } from "../src/database";
import { useNotificationInterceptor } from "../src/hooks/useNotificationInterceptor"; // Importhook

import { AppRegistry } from "react-native";
import { RNAndroidNotificationListenerHeadlessJsName } from "react-native-notification-listener";
import { headlessNotificationListener } from "../src/services/notificationTask";

// ✅ Registra a task corretamente com o nome exportado pela biblioteca
AppRegistry.registerHeadlessTask(
  RNAndroidNotificationListenerHeadlessJsName,
  () => headlessNotificationListener,
);

const theme = {
  ...MD3LightTheme,
  version: 3 as const,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#1E3A8A",
    secondary: "#059669",
    tertiary: "#D97706",
    background: "#F7F9F8",
    surface: "#FFFFFF",
    surfaceVariant: "#E4E8E7",
    secondaryContainer: "#B8F2D9",
    tertiaryContainer: "#FDE7B2",
  },
};

// Componente interno para ativar o listener dentro do contexto do SQLite
function AppContent() {
  // Ativa o leitor global de notificações
  useNotificationInterceptor();

  return (
    <>
      <StatusBar style="dark" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.colors.primary,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Turno Atual",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="clock-outline"
                color={color}
                size={size}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: "Histórico",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="history"
                color={color}
                size={size}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="logs"
          options={{
            title: "Logs 99",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="bell-outline"
                color={color}
                size={size}
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
}

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <SQLiteProvider databaseName={DATABASE_NAME} onInit={initializeDatabase}>
        <AppContent />
      </SQLiteProvider>
    </PaperProvider>
  );
}
