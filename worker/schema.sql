CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  pass_hash TEXT NOT NULL,
  last_seen TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS topics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#C9A24B',
  archived INTEGER NOT NULL DEFAULT 0,
  created_by TEXT,
  created_at TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  topic_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  body_norm TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  edited_at TEXT,
  reply_to_id INTEGER,
  thread_root_id INTEGER,
  pinned INTEGER NOT NULL DEFAULT 0,
  mark TEXT,
  task_assignee TEXT,
  task_due TEXT,
  task_done INTEGER NOT NULL DEFAULT 0,
  deleted INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_msg_topic ON messages(topic_id, id);
CREATE INDEX IF NOT EXISTS idx_msg_thread ON messages(thread_root_id);
CREATE INDEX IF NOT EXISTS idx_msg_mark ON messages(mark);

CREATE TABLE IF NOT EXISTS reactions (
  message_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  emoji TEXT NOT NULL,
  PRIMARY KEY (message_id, user_id, emoji)
);

CREATE TABLE IF NOT EXISTS files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  topic_id INTEGER,
  message_id INTEGER,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  mime TEXT NOT NULL,
  size INTEGER NOT NULL,
  chunks INTEGER NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS file_chunks (
  file_id INTEGER NOT NULL,
  idx INTEGER NOT NULL,
  data TEXT NOT NULL,
  PRIMARY KEY (file_id, idx)
);

CREATE TABLE IF NOT EXISTS reads (
  user_id TEXT NOT NULL,
  topic_id INTEGER NOT NULL,
  last_read_id INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, topic_id)
);

-- הסיסמאות לא נשמרות בריפו. אחרי יצירת המסד, מגדירים אותן כך (ראו README):
-- node -e "const c=require('crypto');console.log(c.createHash('sha256').update('<SALT>:<USER_ID>:<PASSWORD>').digest('hex'))"
-- npx wrangler d1 execute ihud-db --remote --command "UPDATE users SET pass_hash='<HASH>' WHERE id='<USER_ID>'"
INSERT OR IGNORE INTO users (id, name, color, pass_hash) VALUES
  ('ITZIK', 'איציק', '#A8853B', 'SET_ME'),
  ('ARIEL', 'אריאל', '#44639F', 'SET_ME'),
  ('OFEK',  'אופק',  '#3E7D68', 'SET_ME');

INSERT INTO topics (name, color, created_by, created_at, position)
SELECT * FROM (VALUES
  ('רעיונות', '#E5C879', 'ITZIK', '2026-11-01T12:00:00Z', 1),
  ('עלויות ותמחור', '#7E9BD4', 'ITZIK', '2026-11-01T12:00:00Z', 2),
  ('פידבקים ממתווכים', '#7DB9A1', 'ITZIK', '2026-11-01T12:00:00Z', 3),
  ('משפטי ורגולציה', '#B98FC9', 'ITZIK', '2026-11-01T12:00:00Z', 4),
  ('גיוס מתווכים', '#D9A183', 'ITZIK', '2026-11-01T12:00:00Z', 5),
  ('שיווק', '#D492A2', 'ITZIK', '2026-11-01T12:00:00Z', 6),
  ('פיתוח המערכת', '#8FB8D4', 'ITZIK', '2026-11-01T12:00:00Z', 7)
) WHERE NOT EXISTS (SELECT 1 FROM topics);
