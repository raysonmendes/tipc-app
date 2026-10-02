export const NOTIFICATION_SCHEMA = `
  CREATE TABLE IF NOT EXISTS raw_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
  time TEXT,
  app TEXT,
  title TEXT,
  title_big TEXT,
  text TEXT,
  sub_text TEXT,
  summary_text TEXT,
  big_text TEXT,
  audio_contents_uri TEXT,
  image_background_uri TEXT,
  extra_info_text TEXT,
  icon TEXT,
  image TEXT,
  icon_large TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT,
  updated_by TEXT
  );

  CREATE TABLE IF NOT EXISTS debug_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tag TEXT NOT NULL,
    message TEXT NOT NULL,
    raw_notification TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;
