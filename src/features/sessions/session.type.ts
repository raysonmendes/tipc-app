import { Audite } from "@/types/audite";

export type SessionStatus = "ACTIVE" | "FINISHED";

export interface WorkSession extends Audite {
  id: number;
  startTime: string;
  endTime: string | null;
  odoStart: number;
  odoEnd: number | null;
  totalKm: number | null;
  totalCost: number | null;
  status: SessionStatus;
}

export interface WorkSessionRecord extends WorkSession {
  startTime: string;
  endTime: string | null;
}
