import { useCallback, useEffect, useState } from "react";
import { WorkSession } from "../session.type";
import { ToastAndroid } from "react-native";
import { SessionRepository } from "../database/session.repository";

export function useWorkSession() {
  const [activeSession, setActiveSession] = useState<WorkSession | null>(null);
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // debug
  function debugToast(message: string) {
    ToastAndroid.show(`[Work Session] ${message}`, ToastAndroid.LONG);
  }

  const refresh = useCallback(async () => {
    try {
      const [active, allSessions] = await Promise.all([
        SessionRepository.getActiveSession(),
        SessionRepository.getAllSessions(),
      ]);

      setActiveSession(active);
      setSessions(allSessions);
    } catch (error) {
      console.error("Erro ao atualizar sessões de trabalho:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (isMounted) {
        await refresh();
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [refresh]);

  const startSession = useCallback(
    async (odoStart: number) => {
      try {
        await SessionRepository.startSession(odoStart);
        await refresh();
      } catch (error) {
        console.error("Erro ao iniciar sessão:", error);
      }
    },
    [refresh],
  );

  const endSession = useCallback(
    async (odoEnd: number) => {
      debugToast(
        `função endSession chamada odo inicial: ${activeSession?.odoStart}, odo final: ${odoEnd}`,
      );
      console.log(
        `função endSession chamada odo inicial: ${activeSession?.odoStart}, odo final: ${odoEnd}`,
      );
      if (!activeSession) return;

      try {
        await SessionRepository.endSession(
          activeSession.id,
          activeSession.odoStart,
          odoEnd,
        );
        await refresh();
      } catch (error) {
        console.error("Erro ao encerrar sessão:", error);
      }
    },
    [activeSession, refresh],
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
