import { useCallback, useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";

import type { WorkSession } from "../database";
import {
  calculateOperationalCost,
  calculateTotalKm,
} from "../utils/costCalculator";

export interface WorkSessionRecord extends WorkSession {
  start_time: string;
  end_time: string | null;
}

export function useWorkSession() {
  const database = useSQLiteContext();
  const [activeSession, setActiveSession] = useState<WorkSessionRecord | null>(
    null,
  );
  const [sessions, setSessions] = useState<WorkSessionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [active, allSessions] = await Promise.all([
      database.getFirstAsync<WorkSessionRecord>(
        "SELECT id, start_time, end_time, odo_start, odo_end, total_km, total_cost, status FROM work_sessions WHERE status = 'ACTIVE' ORDER BY id DESC LIMIT 1",
      ),
      database.getAllAsync<WorkSessionRecord>(
        "SELECT id, start_time, end_time, odo_start, odo_end, total_km, total_cost, status FROM work_sessions ORDER BY id DESC",
      ),
    ]);
    setActiveSession(active);
    setSessions(allSessions);
    setIsLoading(false);
  }, [database]);

  useEffect(() => {
    refresh().catch(() => setIsLoading(false));
  }, [refresh]);

  const startSession = useCallback(
    async (odoStart: number) => {
      await database.runAsync(
        "INSERT INTO work_sessions (odo_start, status) VALUES (?, 'ACTIVE')",
        odoStart,
      );
      await refresh();
    },
    [database, refresh],
  );

  const endSession = useCallback(
    async (odoEnd: number) => {
      if (!activeSession) return;
      const totalKm = calculateTotalKm(activeSession.odo_start, odoEnd);
      await database.runAsync(
        "UPDATE work_sessions SET end_time = CURRENT_TIMESTAMP, odo_end = ?, total_km = ?, total_cost = ?, status = 'COMPLETED' WHERE id = ?",
        odoEnd,
        totalKm,
        calculateOperationalCost(totalKm),
        activeSession.id,
      );
      await refresh();
    },
    [activeSession, database, refresh],
  );

  return {
    activeSession,
    sessions,
    isLoading,
    startSession,
    endSession,
    refresh,
  };
}
