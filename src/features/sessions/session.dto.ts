import { AuditeDto } from "@/types/audite";

export interface WorkSessionDto extends AuditeDto {
  id: number;
  odo_start: number;
  start_time: string;
  odo_end: number | null;
  end_time: string | null;
  total_km: number | null;
  total_cost: number | null;
  status: string;
}

export interface WorkSessionRecordDto extends WorkSessionDto {
  start_time: string;
  end_time: string | null;
}
