import { Alert, ToastAndroid } from "react-native";
import { Notification } from "../notification.types";

import { NotificationRepository } from "../database/notification.respository";
import { NotificationMapper } from "../notification.mapper";

const TARGET_PACKAGE = "com.app99.driver";

function debugToast(message: string) {
  ToastAndroid.show(`[Headless] ${message}`, ToastAndroid.LONG);
}

export async function headlessNotificationListener({
  notification,
}: {
  notification: string;
}) {
  debugToast("task chamada");

  debugToast(`payload recebido: ${JSON.stringify(notification)}`);

  try {
    if (!notification) return;
    debugToast("notification vazio, abortando");
    // 1. O payload vem como uma string JSON conforme documentado pelo autor
    let parsedData: Notification | undefined;
    try {
      parsedData =
        typeof notification === "string"
          ? JSON.parse(notification)
          : notification;
    } catch (e) {
      // parsedData = { raw: notification };
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

    //dando log aqui
    NotificationRepository.insertDebugLog(
      "headless",
      `recebida notificação do pacote ${packageName ?? "?"}`,
      packageContent ?? "?",
    );

    // Garante que o schema exista, mesmo se essa for a primeira vez que o
    // app "acorda" (ex.: app morto recebendo notificação em background).
    // initializeDatabase é idempotente (usa CREATE TABLE IF NOT EXISTS).
    // await initializeDatabase(db);

    const rawPayload =
      typeof notification === "string"
        ? JSON.parse(notification)
        : notification;

    const payloadDomain = NotificationMapper.toDomain({
      ...rawPayload,
      creat_at: new Date().toISOString(),
      update_at: new Date().toISOString(),
    });

    // 4. Salva o payload bruto (ou os dados extraídos) na tabela raw_notifications
    NotificationRepository.insert(payloadDomain);

    //dando log aqui
    debugToast("INSERT concluído com sucesso");
    NotificationRepository.insertDebugLog(
      "headless",
      "INSERT em raw_notifications OK",
      "?",
    );
  } catch (error: any) {
    //dando log aqui
    debugToast(`ERRO: ${error?.message ?? String(error)}`);
    NotificationRepository.insertDebugLog(
      "headless-error",
      String(error?.message ?? error),
      "?",
    );

    console.error(
      "Erro crítico ao processar notificação em background:",
      error,
    );
  }
}
