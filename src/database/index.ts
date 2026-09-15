import * as SQLite from "expo-sqlite";
import type { SQLiteDatabase } from "expo-sqlite";

export const DATABASE_NAME = "telemetria_raw.db";

export function openDatabaseAsync(): Promise<SQLiteDatabase> {
  return SQLite.openDatabaseAsync(DATABASE_NAME);
}

export async function initializeDatabase(
  database: SQLiteDatabase,
): Promise<void> {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS raw_notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_payload_json TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS work_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      end_time TIMESTAMP,
      odo_start REAL NOT NULL,
      odo_end REAL,
      total_km REAL,
      total_cost REAL,
      status TEXT DEFAULT 'ACTIVE'
    );
  `);
}

export interface WorkSession {
  id: number;
  odo_start: number;
  odo_end: number | null;
  total_km: number | null;
  total_cost: number | null;
  status: string;
}

export interface RawNotification {
  id: number;
  full_payload_json: string;
  created_at: string;
}
