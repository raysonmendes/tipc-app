import { WorkSessionDto } from "./session.dto";
import { SessionStatus, WorkSession } from "./session.type";

export const SessionMapper = {
  toDto(session: WorkSession): WorkSessionDto {
    return {
      id: session.id,
      odo_start: session.odoStart,
      start_time: session.startTime,
      odo_end: session.odoEnd,
      end_time: session.endTime,
      total_km: session.totalKm,
      total_cost: session.totalCost,
      status: session.status,
      //audit data
      creat_at: session.createAt,
      update_at: session.updateAt,
      create_by: session.createBy,
      update_by: session.updateBy,
    };
  },

  toDomain(dto: WorkSessionDto): WorkSession {
    return {
      id: dto.id,
      startTime: dto.start_time,
      endTime: dto.end_time,
      odoStart: dto.odo_start,
      odoEnd: dto.odo_end,
      totalKm: dto.total_km,
      totalCost: dto.total_cost,
      status: dto.status as SessionStatus,
      //audit data
      createAt: dto.creat_at,
      updateAt: dto.update_at,
      createBy: dto.create_by,
      updateBy: dto.update_by,
    };
  },
};
