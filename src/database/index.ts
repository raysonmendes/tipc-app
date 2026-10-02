// src/database/index.ts
import * as SQLite from "expo-sqlite";
import type { SQLiteDatabase } from "expo-sqlite";
import { NOTIFICATION_SCHEMA } from "@/features/notification/database/notification.database";
import { SESSION_SCHEMA } from "@/features/sessions/database/session.database";

export const DATABASE_NAME = "telemetria_raw.db";

let dbInstance: SQLiteDatabase | null = null;
let isInitializing = DATABASE_NAME as unknown as Promise<SQLiteDatabase> | null;

/**
 * Retorna a instância única do banco de dados de forma thread-safe e resiliente.
 * Impede que múltiplas chamadas simultâneas (ex: troca de tela + notificação) abram instâncias concorrentes.
 */
export async function getDatabase(): Promise<SQLiteDatabase> {
  if (dbInstance) {
    try {
      // Teste rápido para checar se a ponte nativa continua viva
      await dbInstance.getFirstAsync("SELECT 1");
      return dbInstance;
    } catch {
      dbInstance = null; // A conexão morreu, precisamos reabrir
    }
  }

  // Se já existe uma inicialização em curso, aguarda ela terminar para evitar race conditions
  if (isInitializing && isInitializing !== (DATABASE_NAME as unknown)) {
    return await isInitializing;
  }

  isInitializing = (async () => {
    try {
      const db = await SQLite.openDatabaseAsync(DATABASE_NAME);

      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        PRAGMA busy_timeout = 5000;
      `);

      await db.execAsync(NOTIFICATION_SCHEMA);
      await db.execAsync(SESSION_SCHEMA);

      dbInstance = db;
      return db;
    } finally {
      isInitializing = null;
    }
  })();

  return await isInitializing;
}

export interface DebugLog {
  id: number;
  tag: string;
  message: string;
  raw_notification: string;
  created_at: string;
}
