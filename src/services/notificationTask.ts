import { openDatabaseSync, type SQLiteDatabase } from "expo-sqlite";
import { DATABASE_NAME, initializeDatabase } from "../database";
import { ToastAndroid } from "react-native";

// O pacote oficial da 99 Motorista no Android
const TARGET_PACKAGE = "com.app99.driver";

function debugToast(message: string) {
  ToastAndroid.show(`[Headless] ${message}`, ToastAndroid.LONG);
}

function debugLog(
  db: SQLiteDatabase,
  tag: string,
  message: string,
  rawNotification: string,
) {
  try {
    db.runSync(
      "INSERT INTO debug_logs (tag, message, raw_notification) VALUES (?, ?, ?);",
      [tag, message, rawNotification],
    );
  } catch (e) {
    // se nem isso funcionar, não tem muito o que fazer aqui
  }
}

export async function headlessNotificationListener({
  notification,
}: {
  notification: string;
}) {
  debugToast("task chamada");
  let db: SQLiteDatabase | undefined;

  try {
    if (!notification) return;
    debugToast("notification vazio, abortando");
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
    const packageContent = JSON.stringify(parsedData);

    //dando log aqui
    debugToast(`pacote detectado: ${packageName ?? "desconhecido"}`);

    // if (packageName && packageName !== TARGET_PACKAGE) {
    //   //dando log aqui
    //   debugToast("descartado (pacote diferente da 99)");
    //   return; // Descarta notificações de outros apps (como WhatsApp, e-mails, etc.)
    // }

    // 3. Abre a conexão síncrona com o banco SQLite do Expo para persistir em background
    db = openDatabaseSync(DATABASE_NAME);

    //dando log aqui
    debugLog(
      db,
      "headless",
      `recebida notificação do pacote ${packageName ?? "?"}`,
      packageContent ?? "?",
    );

    // Garante que o schema exista, mesmo se essa for a primeira vez que o
    // app "acorda" (ex.: app morto recebendo notificação em background).
    // initializeDatabase é idempotente (usa CREATE TABLE IF NOT EXISTS).
    await initializeDatabase(db);

    const rawPayload =
      typeof notification === "string"
        ? notification
        : JSON.stringify(notification);

    const now = new Date().toISOString();

    const payloadHash = String(rawPayload) + rawPayload.length;

    // 4. Salva o payload bruto (ou os dados extraídos) na tabela raw_notifications
    db.runSync(
      "INSERT INTO OR IGNORE raw_notifications (payload_hash, full_payload_json, created_at) VALUES (?, ?);",
      [payloadHash, rawPayload, now],
    );

    //dando log aqui
    debugToast("INSERT concluído com sucesso");
    debugLog(db, "headless", "INSERT em raw_notifications OK", "?");
  } catch (error: any) {
    //dando log aqui
    debugToast(`ERRO: ${error?.message ?? String(error)}`);
    if (db)
      debugLog(db, "headless-error", String(error?.message ?? error), "?");

    console.error(
      "Erro crítico ao processar notificação em background:",
      error,
    );
  } finally {
    // Evita acumular conexões nativas abertas a cada notificação recebida
    db?.closeSync();
  }
}
