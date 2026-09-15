import { useCallback, useEffect, useState } from "react";
import * as Clipboard from "expo-clipboard";
import { useSQLiteContext } from "expo-sqlite";

import type { RawNotification } from "../database";

export function useRawNotifications() {
  const database = useSQLiteContext();
  const [notifications, setNotifications] = useState<RawNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const rows = await database.getAllAsync<RawNotification>(
      "SELECT id, full_payload_json, created_at FROM raw_notifications ORDER BY id DESC",
    );
    setNotifications(rows);
    setIsLoading(false);
  }, [database]);

  useEffect(() => {
    refresh().catch(() => setIsLoading(false));
  }, [refresh]);

  const copyNotification = useCallback(
    async (notification: RawNotification) => {
      await Clipboard.setStringAsync(notification.full_payload_json);
    },
    [],
  );

  const copyAll = useCallback(async () => {
    await Clipboard.setStringAsync(JSON.stringify(notifications, null, 2));
  }, [notifications]);

  return {
    notifications,
    count: notifications.length,
    isLoading,
    copyNotification,
    copyAll,
    refresh,
  };
}
