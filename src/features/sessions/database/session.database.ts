export const SESSION_SCHEMA = `
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
`;
