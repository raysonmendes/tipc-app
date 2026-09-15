import { openDatabaseSync } from "expo-sqlite";
import { DATABASE_NAME } from "../database";

// O pacote oficial da 99 Motorista no Android
const TARGET_PACKAGE = "com.taxis99.driver";

export async function headlessNotificationListener({
  notification,
}: {
  notification: string;
}) {
  try {
    if (!notification) return;

    // 1. O payload vem como uma string JSON conforme documentado pelo autor
    let parsedData: any;
    try {
      parsedData =
        typeof notification === "string"
          ? JSON.parse(notification)
          : notification;
    } catch (e) {
      parsedData = { raw: notification };
    }

    // 2. FILTRAGEM: Opcional, mas recomendado para evitar lixo no banco.
    // Se quiser salvar TUDO para inspecionar nos logs, remova temporariamente este if.
    const packageName = parsedData?.app;
    if (packageName && packageName !== TARGET_PACKAGE) {
      return; // Descarta notificações de outros apps (como WhatsApp, e-mails, etc.)
    }

    // 3. Abre a conexão síncrona com o banco SQLite do Expo para persistir em background
    const db = openDatabaseSync(DATABASE_NAME);
    const now = new Date().toISOString();

    // 4. Salva o payload bruto (ou os dados extraídos) na tabela raw_notifications
    db.runSync(
      "INSERT INTO raw_notifications (full_payload_json, created_at) VALUES (?, ?);",
      [
        typeof notification === "string"
          ? notification
          : JSON.stringify(notification),
        now,
      ],
    );
  } catch (error) {
    console.error(
      "Erro crítico ao processar notificação em background:",
      error,
    );
  }
}
