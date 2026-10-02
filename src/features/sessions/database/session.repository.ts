import { getDatabase } from "@/database";
import { WorkSessionRecordDto } from "../session.dto";
import { SessionMapper } from "../session.mapper";
import { WorkSession } from "../session.type";
import {
  calculateOperationalCost,
  calculateTotalKm,
} from "@/shared/utils/costCalculator";

export const SessionRepository = {
  async getActiveSession(): Promise<WorkSession | null> {
    const database = await getDatabase();
    const activeSessionRecord =
      await database.getFirstAsync<WorkSessionRecordDto>(
        "SELECT id, start_time, end_time, odo_start, odo_end, total_km, total_cost, status FROM work_sessions WHERE status = 'ACTIVE' ORDER BY id DESC LIMIT 1",
      );

    if (!activeSessionRecord) {
      return null;
    }

    return SessionMapper.toDomain(activeSessionRecord);
  },

  async getAllSessions(): Promise<WorkSession[]> {
    const database = await getDatabase();
    const allSessionsRecords = await database.getAllAsync<WorkSessionRecordDto>(
      "SELECT id, start_time, end_time, odo_start, odo_end, total_km, total_cost, status FROM work_sessions ORDER BY id DESC",
    );

    return allSessionsRecords.map(SessionMapper.toDomain);
  },

  async startSession(odoStart: number): Promise<void> {
    const database = await getDatabase();
    await database.runAsync(
      "INSERT INTO work_sessions (odo_start, status) VALUES (?, 'ACTIVE')",
      odoStart,
    );
  },

  async endSession(
    sessionId: number,
    odoStart: number,
    odoEnd: number,
  ): Promise<void> {
    const database = await getDatabase();
    const totalKm = calculateTotalKm(odoStart, odoEnd);
    const totalCost = calculateOperationalCost(totalKm);

    await database.runAsync(
      "UPDATE work_sessions SET end_time = CURRENT_TIMESTAMP, odo_end = ?, total_km = ?, total_cost = ?, status = 'COMPLETED' WHERE id = ?",
      odoEnd,
      totalKm,
      totalCost,
      sessionId,
    );
  },
};
