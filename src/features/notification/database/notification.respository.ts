import { openDatabaseSync, type SQLiteDatabase } from "expo-sqlite";
import { NotificationDTO } from "../notification.dto";
import { Notification } from "../notification.types";
import { NotificationMapper } from "../notification.mapper";
import { DATABASE_NAME, getDatabase } from "@/database";

export const NotificationRepository = {
  /**
   * Busca todas as notificações brutas do banco de dados
   * e já as retorna convertidas para o modelo de domínio do App.
   */
  async findAll(): Promise<Notification[]> {
    const database = await getDatabase();

    const rows = await database.getAllAsync<NotificationDTO>(
      "SELECT * FROM raw_notifications ORDER BY id DESC",
    );

    return rows.map((row) => NotificationMapper.toDomain(row));
  },

  /**
   * Insere uma nova notificação no banco de dados.
   */
  async insert(notification: Notification): Promise<void> {
    const database = await getDatabase();

    const dto = NotificationMapper.toDto(notification);
    try {
      await database.runAsync(
        `INSERT INTO raw_notifications (
        time, app, title, title_big, text, sub_text, summary_text,
        big_text, audio_contents_uri, image_background_uri, extra_info_text,
        icon, image, icon_large, created_at, updated_at, created_by, updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          dto.time,
          dto.app,
          dto.title,
          dto.title_big,
          dto.text,
          dto.sub_text,
          dto.summary_text,
          dto.big_text,
          dto.audio_contents_uri,
          dto.image_background_uri,
          dto.extra_info_text,
          dto.icon,
          dto.image,
          dto.icon_large,
          dto.creat_at,
          dto.update_at,
          dto.create_by,
          dto.update_by,
        ],
      );
    } catch (error) {
      console.error("Erro ao inserir notificação no banco de dados:", error);
      throw error;
    } finally {
      // Evita acumular conexões nativas abertas a cada notificação recebida
    }
  },

  async insertDebugLog(
    tag: string,
    message: string,
    rawNotification?: string,
  ): Promise<void> {
    const database = await getDatabase();

    try {
      await database.runAsync(
        `INSERT INTO debug_logs (tag, message, raw_notification) VALUES (?, ?, ?)`,
        [tag, message, rawNotification ?? null],
      );
    } catch (error) {
      console.error(
        "Erro ao inserir log de depuração no banco de dados:",
        error,
      );
      throw error;
    } finally {
    }
  },
};
