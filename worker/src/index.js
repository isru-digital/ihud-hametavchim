// מרכז הרעיונות · איחוד המתווכים — API
// Cloudflare Worker + D1

const SALT = 'ihud-salt-7f3k';
const EXPORT_USERS = ['ITZIK']; // only these users may export
const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8MB
const CHUNK_B64 = 600 * 1024; // base64 chars per D1 row

const ALLOWED_ORIGINS = [
  'https://isru-digital.github.io',
  'http://localhost:8641',
  'http://127.0.0.1:8641',
];

function corsHeaders(req) {
  const origin = req.headers.get('Origin') || '';
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

function json(req, data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders(req), ...extra },
  });
}
function err(req, message, status = 400) { return json(req, { error: message }, status); }

async function sha256hex(s) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

const FINALS = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' };
function norm(s) {
  return (s || '')
    .normalize('NFKD')
    .replace(/[֑-ׇ]/g, '')
    .replace(/[ךםןףץ]/g, m => FINALS[m])
    .toLowerCase();
}

function nowISO() { return new Date().toISOString(); }

function fmtJerusalem(iso, withTime = true) {
  try {
    const d = new Date(iso);
    const opts = withTime
      ? { timeZone: 'Asia/Jerusalem', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }
      : { timeZone: 'Asia/Jerusalem', day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Intl.DateTimeFormat('he-IL', opts).format(d);
  } catch { return iso; }
}

const MARK_HE = { idea: 'רעיון', decision: 'החלטה', task: 'משימה', question: 'שאלה' };

async function getUser(req, env, url) {
  let token = '';
  const auth = req.headers.get('Authorization') || '';
  if (auth.startsWith('Bearer ')) token = auth.slice(7);
  if (!token) token = url.searchParams.get('t') || '';
  if (!token) return null;
  const row = await env.DB.prepare(
    'SELECT u.id, u.name, u.color FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ?'
  ).bind(token).first();
  if (row) {
    await env.DB.prepare('UPDATE users SET last_seen = ? WHERE id = ?').bind(nowISO(), row.id).run();
  }
  return row || null;
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(req) });

    const path = url.pathname.replace(/\/+$/, '');
    try {
      if (path === '/api/login' && req.method === 'POST') return await login(req, env);

      const me = await getUser(req, env, url);
      if (!me) return err(req, 'unauthorized', 401);

      if (path === '/api/logout' && req.method === 'POST') return await logout(req, env);
      if (path === '/api/bootstrap' && req.method === 'GET') return await bootstrap(req, env, me);
      if (path === '/api/messages' && req.method === 'GET') return await listMessages(req, env, me, url);
      if (path === '/api/messages' && req.method === 'POST') return await postMessage(req, env, me);
      if (/^\/api\/messages\/\d+$/.test(path) && req.method === 'PATCH') return await patchMessage(req, env, me, +path.split('/').pop());
      if (/^\/api\/messages\/\d+$/.test(path) && req.method === 'DELETE') return await deleteMessage(req, env, me, +path.split('/').pop());
      if (path === '/api/reactions' && req.method === 'POST') return await toggleReaction(req, env, me);
      if (path === '/api/read' && req.method === 'POST') return await markRead(req, env, me);
      if (path === '/api/topics' && req.method === 'POST') return await createTopic(req, env, me);
      if (/^\/api\/topics\/\d+$/.test(path) && req.method === 'PATCH') return await patchTopic(req, env, me, +path.split('/').pop());
      if (path === '/api/board' && req.method === 'GET') return await board(req, env);
      if (path === '/api/search' && req.method === 'GET') return await search(req, env, url);
      if (path === '/api/export' && req.method === 'GET') return await exportAll(req, env, url, me);
      if (path === '/api/files' && req.method === 'POST') return await uploadFile(req, env, me);
      if (path === '/api/files' && req.method === 'GET') return await listFiles(req, env);
      if (/^\/api\/files\/\d+$/.test(path) && req.method === 'GET') return await getFile(req, env, +path.split('/').pop());

      return err(req, 'not found', 404);
    } catch (e) {
      return err(req, 'server error: ' + (e && e.message ? e.message : String(e)), 500);
    }
  },
};

async function login(req, env) {
  const { user_id, password } = await req.json();
  if (!user_id || !password) return err(req, 'חסר שם משתמש או סיסמה');
  const hash = await sha256hex(`${SALT}:${user_id}:${password}`);
  const user = await env.DB.prepare('SELECT id, name, color FROM users WHERE id = ? AND pass_hash = ?')
    .bind(user_id, hash).first();
  if (!user) return err(req, 'הסיסמה שגויה', 401);
  const token = crypto.randomUUID() + '-' + crypto.randomUUID();
  await env.DB.prepare('INSERT INTO sessions (token, user_id, created_at) VALUES (?,?,?)')
    .bind(token, user.id, nowISO()).run();
  await env.DB.prepare('UPDATE users SET last_seen = ? WHERE id = ?').bind(nowISO(), user.id).run();
  return json(req, { token, user });
}

async function logout(req, env) {
  const auth = req.headers.get('Authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (token) await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
  return json(req, { ok: true });
}

async function bootstrap(req, env, me) {
  const users = (await env.DB.prepare('SELECT id, name, color, last_seen FROM users').all()).results;
  const topics = (await env.DB.prepare(`
    SELECT t.*,
      (SELECT COUNT(*) FROM messages m
        WHERE m.topic_id = t.id AND m.deleted = 0 AND m.user_id != ?1
          AND m.id > COALESCE((SELECT last_read_id FROM reads WHERE user_id = ?1 AND topic_id = t.id), 0)
      ) AS unread
    FROM topics t ORDER BY t.position, t.id
  `).bind(me.id).all()).results;

  const stats = await env.DB.prepare(`
    SELECT
      (SELECT COUNT(*) FROM messages WHERE mark='task' AND task_done=0 AND deleted=0) AS open_tasks,
      (SELECT COUNT(*) FROM messages WHERE mark='decision' AND deleted=0) AS decisions,
      (SELECT COUNT(*) FROM messages WHERE mark='idea' AND task_done=0 AND deleted=0) AS ideas,
      (SELECT COUNT(*) FROM files) AS files
  `).first();

  const taskByUser = (await env.DB.prepare(`
    SELECT COALESCE(task_assignee,'') AS assignee, COUNT(*) AS n
    FROM messages WHERE mark='task' AND task_done=0 AND deleted=0 GROUP BY task_assignee
  `).all()).results;

  const recent = (await env.DB.prepare(`
    SELECT m.id, m.topic_id, m.user_id, m.body, m.created_at, m.mark, t.name AS topic_name, t.color AS topic_color
    FROM messages m JOIN topics t ON t.id = m.topic_id
    WHERE m.deleted = 0 ORDER BY m.id DESC LIMIT 8
  `).all()).results;

  const recentFiles = (await env.DB.prepare(`
    SELECT f.id, f.name, f.mime, f.size, f.user_id, f.created_at, f.topic_id
    FROM files f ORDER BY f.id DESC LIMIT 6
  `).all()).results;

  return json(req, { me, users, topics, stats, taskByUser, recent, recentFiles });
}

async function enrich(env, rows) {
  if (!rows.length) return rows;
  const ids = rows.map(r => r.id);
  const ph = ids.map(() => '?').join(',');

  const reactions = (await env.DB.prepare(
    `SELECT message_id, user_id, emoji FROM reactions WHERE message_id IN (${ph})`
  ).bind(...ids).all()).results;

  const files = (await env.DB.prepare(
    `SELECT id, message_id, name, mime, size FROM files WHERE message_id IN (${ph})`
  ).bind(...ids).all()).results;

  const threads = (await env.DB.prepare(
    `SELECT thread_root_id AS root, COUNT(*) AS n, GROUP_CONCAT(DISTINCT user_id) AS users
     FROM messages WHERE deleted = 0 AND thread_root_id IN (${ph}) GROUP BY thread_root_id`
  ).bind(...ids).all()).results;

  const replyIds = [...new Set(rows.map(r => r.reply_to_id).filter(Boolean))];
  let replies = [];
  if (replyIds.length) {
    replies = (await env.DB.prepare(
      `SELECT id, user_id, body FROM messages WHERE id IN (${replyIds.map(() => '?').join(',')})`
    ).bind(...replyIds).all()).results;
  }

  for (const r of rows) {
    r.reactions = reactions.filter(x => x.message_id === r.id).map(({ user_id, emoji }) => ({ user_id, emoji }));
    r.files = files.filter(x => x.message_id === r.id).map(({ id, name, mime, size }) => ({ id, name, mime, size }));
    const th = threads.find(x => x.root === r.id);
    r.thread_count = th ? th.n : 0;
    r.thread_users = th ? th.users.split(',') : [];
    if (r.reply_to_id) {
      const rp = replies.find(x => x.id === r.reply_to_id);
      r.reply_preview = rp ? { user_id: rp.user_id, body: rp.body.slice(0, 120) } : null;
    }
    delete r.body_norm;
  }
  return rows;
}

async function listMessages(req, env, me, url) {
  const topicId = +url.searchParams.get('topic_id') || 0;
  const threadRoot = +url.searchParams.get('thread_root') || 0;
  const after = +url.searchParams.get('after') || 0;
  let rows;
  if (threadRoot) {
    rows = (await env.DB.prepare(
      `SELECT * FROM messages WHERE thread_root_id = ? AND deleted = 0 AND id > ? ORDER BY id ASC LIMIT 300`
    ).bind(threadRoot, after).all()).results;
  } else {
    if (!topicId) return err(req, 'missing topic_id');
    rows = (await env.DB.prepare(
      `SELECT * FROM (
         SELECT * FROM messages
         WHERE topic_id = ? AND thread_root_id IS NULL AND deleted = 0 AND id > ?
         ORDER BY id DESC LIMIT 200
       ) ORDER BY id ASC`
    ).bind(topicId, after).all()).results;
  }
  await enrich(env, rows);
  const pinned = threadRoot ? [] : await enrich(env, (await env.DB.prepare(
    `SELECT * FROM messages WHERE topic_id = ? AND pinned = 1 AND deleted = 0 ORDER BY id DESC LIMIT 3`
  ).bind(topicId).all()).results);
  return json(req, { messages: rows, pinned });
}

async function postMessage(req, env, me) {
  const b = await req.json();
  let topicId = +b.topic_id || 0;
  let mark = b.mark || null;

  if (!topicId) { // רעיון מהיר בלי נושא
    const t = await env.DB.prepare(`SELECT id FROM topics WHERE name = 'רעיונות' LIMIT 1`).first();
    if (!t) return err(req, 'לא נמצא נושא רעיונות');
    topicId = t.id;
    if (!mark) mark = 'idea';
  }
  const body = (b.body || '').trim();
  if (!body && !b.has_file) return err(req, 'הודעה ריקה');

  const res = await env.DB.prepare(`
    INSERT INTO messages (topic_id, user_id, body, body_norm, created_at, reply_to_id, thread_root_id, mark, task_assignee, task_due)
    VALUES (?,?,?,?,?,?,?,?,?,?)
  `).bind(
    topicId, me.id, body, norm(body), nowISO(),
    b.reply_to_id || null, b.thread_root_id || null,
    mark, b.task_assignee || null, b.task_due || null
  ).run();

  const id = res.meta.last_row_id;
  const row = await env.DB.prepare('SELECT * FROM messages WHERE id = ?').bind(id).first();
  await enrich(env, [row]);
  // הכותב קרא את מה שכתב
  await env.DB.prepare(`
    INSERT INTO reads (user_id, topic_id, last_read_id) VALUES (?,?,?)
    ON CONFLICT(user_id, topic_id) DO UPDATE SET last_read_id = MAX(last_read_id, excluded.last_read_id)
  `).bind(me.id, topicId, id).run();
  return json(req, { message: row });
}

async function patchMessage(req, env, me, id) {
  const b = await req.json();
  const msg = await env.DB.prepare('SELECT * FROM messages WHERE id = ?').bind(id).first();
  if (!msg) return err(req, 'הודעה לא נמצאה', 404);

  const sets = [];
  const vals = [];
  if (b.body !== undefined) {
    if (msg.user_id !== me.id) return err(req, 'אפשר לערוך רק הודעות שלך', 403);
    sets.push('body = ?', 'body_norm = ?', 'edited_at = ?');
    vals.push(b.body.trim(), norm(b.body), nowISO());
  }
  if (b.mark !== undefined) { sets.push('mark = ?'); vals.push(b.mark || null); }
  if (b.pinned !== undefined) { sets.push('pinned = ?'); vals.push(b.pinned ? 1 : 0); }
  if (b.task_assignee !== undefined) { sets.push('task_assignee = ?'); vals.push(b.task_assignee || null); }
  if (b.task_due !== undefined) { sets.push('task_due = ?'); vals.push(b.task_due || null); }
  if (b.task_done !== undefined) { sets.push('task_done = ?'); vals.push(b.task_done ? 1 : 0); }
  if (!sets.length) return err(req, 'אין מה לעדכן');

  vals.push(id);
  await env.DB.prepare(`UPDATE messages SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
  const row = await env.DB.prepare('SELECT * FROM messages WHERE id = ?').bind(id).first();
  await enrich(env, [row]);
  return json(req, { message: row });
}

async function deleteMessage(req, env, me, id) {
  const msg = await env.DB.prepare('SELECT user_id FROM messages WHERE id = ?').bind(id).first();
  if (!msg) return err(req, 'הודעה לא נמצאה', 404);
  if (msg.user_id !== me.id) return err(req, 'אפשר להסיר רק הודעות שלך', 403);
  await env.DB.prepare('UPDATE messages SET deleted = 1 WHERE id = ?').bind(id).run();
  return json(req, { ok: true });
}

async function toggleReaction(req, env, me) {
  const { message_id, emoji } = await req.json();
  if (!message_id || !emoji) return err(req, 'missing fields');
  const existing = await env.DB.prepare(
    'SELECT 1 AS x FROM reactions WHERE message_id = ? AND user_id = ? AND emoji = ?'
  ).bind(message_id, me.id, emoji).first();
  if (existing) {
    await env.DB.prepare('DELETE FROM reactions WHERE message_id = ? AND user_id = ? AND emoji = ?')
      .bind(message_id, me.id, emoji).run();
  } else {
    await env.DB.prepare('INSERT INTO reactions (message_id, user_id, emoji) VALUES (?,?,?)')
      .bind(message_id, me.id, emoji).run();
  }
  const reactions = (await env.DB.prepare(
    'SELECT user_id, emoji FROM reactions WHERE message_id = ?'
  ).bind(message_id).all()).results;
  return json(req, { message_id, reactions });
}

async function markRead(req, env, me) {
  const { topic_id, last_id } = await req.json();
  if (!topic_id) return err(req, 'missing topic_id');
  await env.DB.prepare(`
    INSERT INTO reads (user_id, topic_id, last_read_id) VALUES (?,?,?)
    ON CONFLICT(user_id, topic_id) DO UPDATE SET last_read_id = MAX(last_read_id, excluded.last_read_id)
  `).bind(me.id, topic_id, last_id || 0).run();
  return json(req, { ok: true });
}

async function createTopic(req, env, me) {
  const { name, color } = await req.json();
  if (!name || !name.trim()) return err(req, 'חסר שם נושא');
  const pos = await env.DB.prepare('SELECT COALESCE(MAX(position),0)+1 AS p FROM topics').first();
  const res = await env.DB.prepare(
    'INSERT INTO topics (name, color, created_by, created_at, position) VALUES (?,?,?,?,?)'
  ).bind(name.trim(), color || '#C9A24B', me.id, nowISO(), pos.p).run();
  const topic = await env.DB.prepare('SELECT * FROM topics WHERE id = ?').bind(res.meta.last_row_id).first();
  return json(req, { topic });
}

async function patchTopic(req, env, me, id) {
  const b = await req.json();
  const sets = [];
  const vals = [];
  if (b.name !== undefined) { sets.push('name = ?'); vals.push(b.name.trim()); }
  if (b.color !== undefined) { sets.push('color = ?'); vals.push(b.color); }
  if (b.archived !== undefined) { sets.push('archived = ?'); vals.push(b.archived ? 1 : 0); }
  if (!sets.length) return err(req, 'אין מה לעדכן');
  vals.push(id);
  await env.DB.prepare(`UPDATE topics SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
  const topic = await env.DB.prepare('SELECT * FROM topics WHERE id = ?').bind(id).first();
  return json(req, { topic });
}

async function board(req, env) {
  const openTasks = (await env.DB.prepare(`
    SELECT m.*, t.name AS topic_name, t.color AS topic_color FROM messages m
    JOIN topics t ON t.id = m.topic_id
    WHERE m.mark = 'task' AND m.task_done = 0 AND m.deleted = 0 ORDER BY COALESCE(m.task_due, '9999'), m.id
  `).all()).results;
  const doneTasks = (await env.DB.prepare(`
    SELECT m.*, t.name AS topic_name, t.color AS topic_color FROM messages m
    JOIN topics t ON t.id = m.topic_id
    WHERE m.mark = 'task' AND m.task_done = 1 AND m.deleted = 0 ORDER BY m.id DESC LIMIT 25
  `).all()).results;
  const decisions = (await env.DB.prepare(`
    SELECT m.*, t.name AS topic_name, t.color AS topic_color FROM messages m
    JOIN topics t ON t.id = m.topic_id
    WHERE m.mark = 'decision' AND m.deleted = 0 ORDER BY m.id DESC
  `).all()).results;
  const ideas = (await env.DB.prepare(`
    SELECT m.*, t.name AS topic_name, t.color AS topic_color FROM messages m
    JOIN topics t ON t.id = m.topic_id
    WHERE m.mark = 'idea' AND m.task_done = 0 AND m.deleted = 0 ORDER BY m.id DESC
  `).all()).results;
  const questions = (await env.DB.prepare(`
    SELECT m.*, t.name AS topic_name, t.color AS topic_color FROM messages m
    JOIN topics t ON t.id = m.topic_id
    WHERE m.mark = 'question' AND m.task_done = 0 AND m.deleted = 0 ORDER BY m.id DESC
  `).all()).results;
  for (const arr of [openTasks, doneTasks, decisions, ideas, questions]) arr.forEach(r => delete r.body_norm);
  return json(req, { openTasks, doneTasks, decisions, ideas, questions });
}

async function search(req, env, url) {
  const q = norm(url.searchParams.get('q') || '');
  const topicId = +url.searchParams.get('topic_id') || 0;
  const userId = url.searchParams.get('user_id') || '';
  const mark = url.searchParams.get('mark') || '';
  const from = url.searchParams.get('from') || '';
  const to = url.searchParams.get('to') || '';
  const hasFile = url.searchParams.get('has_file') === '1';
  const openTasks = url.searchParams.get('open_tasks') === '1';

  const where = ['m.deleted = 0'];
  const vals = [];
  if (q) { where.push('m.body_norm LIKE ?'); vals.push('%' + q + '%'); }
  if (topicId) { where.push('m.topic_id = ?'); vals.push(topicId); }
  if (userId) { where.push('m.user_id = ?'); vals.push(userId); }
  if (mark) { where.push('m.mark = ?'); vals.push(mark); }
  if (from) { where.push('m.created_at >= ?'); vals.push(from); }
  if (to) { where.push('m.created_at <= ?'); vals.push(to + 'T23:59:59Z'); }
  if (hasFile) where.push('EXISTS (SELECT 1 FROM files f WHERE f.message_id = m.id)');
  if (openTasks) where.push("m.mark = 'task' AND m.task_done = 0");

  const rows = (await env.DB.prepare(`
    SELECT m.id, m.topic_id, m.user_id, m.body, m.created_at, m.mark, m.thread_root_id,
           t.name AS topic_name, t.color AS topic_color
    FROM messages m JOIN topics t ON t.id = m.topic_id
    WHERE ${where.join(' AND ')}
    ORDER BY m.id DESC LIMIT 120
  `).bind(...vals).all()).results;
  return json(req, { results: rows });
}

async function uploadFile(req, env, me) {
  const b = await req.json();
  const { name, mime, data, topic_id, message_id } = b;
  if (!name || !data) return err(req, 'חסר קובץ');
  const size = Math.floor(data.length * 3 / 4);
  if (size > MAX_FILE_BYTES) return err(req, 'הקובץ גדול מדי (עד 8MB)');

  const res = await env.DB.prepare(
    'INSERT INTO files (topic_id, message_id, user_id, name, mime, size, chunks, created_at) VALUES (?,?,?,?,?,?,?,?)'
  ).bind(topic_id || null, message_id || null, me.id, name, mime || 'application/octet-stream',
    size, Math.ceil(data.length / CHUNK_B64), nowISO()).run();
  const fileId = res.meta.last_row_id;

  const stmts = [];
  for (let i = 0, idx = 0; i < data.length; i += CHUNK_B64, idx++) {
    stmts.push(env.DB.prepare('INSERT INTO file_chunks (file_id, idx, data) VALUES (?,?,?)')
      .bind(fileId, idx, data.slice(i, i + CHUNK_B64)));
  }
  await env.DB.batch(stmts);

  const file = await env.DB.prepare('SELECT id, name, mime, size, user_id, topic_id, message_id, created_at FROM files WHERE id = ?').bind(fileId).first();
  return json(req, { file });
}

async function listFiles(req, env) {
  const rows = (await env.DB.prepare(`
    SELECT f.id, f.name, f.mime, f.size, f.user_id, f.topic_id, f.message_id, f.created_at, t.name AS topic_name
    FROM files f LEFT JOIN topics t ON t.id = f.topic_id
    ORDER BY f.id DESC LIMIT 300
  `).all()).results;
  return json(req, { files: rows });
}

async function getFile(req, env, id) {
  const meta = await env.DB.prepare('SELECT * FROM files WHERE id = ?').bind(id).first();
  if (!meta) return err(req, 'קובץ לא נמצא', 404);
  const chunks = (await env.DB.prepare('SELECT data FROM file_chunks WHERE file_id = ? ORDER BY idx').bind(id).all()).results;
  const b64 = chunks.map(c => c.data).join('');
  const bin = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  return new Response(bin, {
    headers: {
      'Content-Type': meta.mime,
      'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(meta.name)}`,
      'Cache-Control': 'private, max-age=3600',
      ...corsHeaders(req),
    },
  });
}

// ---------- ייצוא ----------
async function exportAll(req, env, url, me) {
  if (!me || !EXPORT_USERS.includes(me.id)) return err(req, 'אין הרשאה לייצוא', 403);
  const format = url.searchParams.get('format') || 'md';
  const topicIds = (url.searchParams.get('topics') || '').split(',').map(Number).filter(Boolean);
  const from = url.searchParams.get('from') || '';
  const to = url.searchParams.get('to') || '';

  const where = ['m.deleted = 0'];
  const vals = [];
  if (topicIds.length) { where.push(`m.topic_id IN (${topicIds.map(() => '?').join(',')})`); vals.push(...topicIds); }
  if (from) { where.push('m.created_at >= ?'); vals.push(from); }
  if (to) { where.push('m.created_at <= ?'); vals.push(to + 'T23:59:59Z'); }

  const topics = (await env.DB.prepare('SELECT * FROM topics ORDER BY position, id').all()).results
    .filter(t => !topicIds.length || topicIds.includes(t.id));
  const users = (await env.DB.prepare('SELECT id, name FROM users').all()).results;
  const uname = id => (users.find(u => u.id === id) || {}).name || id;

  const msgs = (await env.DB.prepare(`
    SELECT m.* FROM messages m WHERE ${where.join(' AND ')} ORDER BY m.topic_id, m.id
  `).bind(...vals).all()).results;

  const fileRows = (await env.DB.prepare('SELECT id, message_id, name FROM files WHERE message_id IS NOT NULL').all()).results;
  const filesByMsg = {};
  for (const f of fileRows) (filesByMsg[f.message_id] = filesByMsg[f.message_id] || []).push(f.name);

  if (format === 'json') {
    const out = {
      exported_at: nowISO(),
      system: 'מרכז הרעיונות · איחוד המתווכים',
      users,
      topics: topics.map(t => ({
        id: t.id, name: t.name, archived: !!t.archived,
        messages: msgs.filter(m => m.topic_id === t.id && !m.thread_root_id).map(m => msgToJson(m, msgs, filesByMsg, uname)),
      })),
    };
    return new Response(JSON.stringify(out, null, 2), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent('ihud-export.json')}`,
        ...corsHeaders(req),
      },
    });
  }

  // Markdown
  const L = [];
  L.push('# מרכז הרעיונות · איחוד המתווכים');
  L.push('');
  L.push(`הופק: ${fmtJerusalem(nowISO())}${from || to ? ` · טווח: ${from || 'ההתחלה'} עד ${to || 'היום'}` : ''}`);
  L.push('');
  L.push('---');
  L.push('');
  L.push('## סיכום מצב');
  L.push('');

  const decisions = msgs.filter(m => m.mark === 'decision');
  const openTasks = msgs.filter(m => m.mark === 'task' && !m.task_done);
  const ideas = msgs.filter(m => m.mark === 'idea' && !m.task_done);
  const questions = msgs.filter(m => m.mark === 'question' && !m.task_done);
  const tname = id => (topics.find(t => t.id === id) || {}).name || '';

  L.push(`### החלטות שהתקבלו (${decisions.length})`);
  decisions.forEach(m => L.push(`- [${tname(m.topic_id)}] ${uname(m.user_id)}, ${fmtJerusalem(m.created_at, false)}: ${m.body}`));
  if (!decisions.length) L.push('- אין עדיין.');
  L.push('');
  L.push(`### משימות פתוחות (${openTasks.length})`);
  openTasks.forEach(m => L.push(`- [${tname(m.topic_id)}] ${m.body}${m.task_assignee ? ` (אחראי: ${uname(m.task_assignee)}` + (m.task_due ? `, יעד: ${m.task_due}` : '') + ')' : ''}`));
  if (!openTasks.length) L.push('- אין כרגע.');
  L.push('');
  L.push(`### רעיונות שטרם נבדקו (${ideas.length})`);
  ideas.forEach(m => L.push(`- [${tname(m.topic_id)}] ${uname(m.user_id)}: ${m.body}`));
  if (!ideas.length) L.push('- אין כרגע.');
  L.push('');
  if (questions.length) {
    L.push(`### שאלות פתוחות (${questions.length})`);
    questions.forEach(m => L.push(`- [${tname(m.topic_id)}] ${uname(m.user_id)}: ${m.body}`));
    L.push('');
  }
  L.push('---');
  L.push('');

  for (const t of topics) {
    const tm = msgs.filter(m => m.topic_id === t.id && !m.thread_root_id);
    if (!tm.length) continue;
    L.push(`## נושא: ${t.name}${t.archived ? ' (בארכיון)' : ''}`);
    L.push('');
    for (const m of tm) {
      L.push(msgToMd(m, msgs, filesByMsg, uname, ''));
      const thread = msgs.filter(x => x.thread_root_id === m.id);
      if (thread.length) {
        L.push(`  - שרשור (${thread.length} תגובות):`);
        for (const tmsg of thread) L.push(msgToMd(tmsg, msgs, filesByMsg, uname, '    '));
      }
      L.push('');
    }
    L.push('---');
    L.push('');
  }
  L.push('_הקובץ הופק אוטומטית ממרכז הרעיונות של איחוד המתווכים. נבנה על ידי ISRU-E איציק עוזיאל._');

  return new Response(L.join('\n'), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent('ihud-export.md')}`,
      ...corsHeaders(req),
    },
  });
}

function msgToMd(m, all, filesByMsg, uname, indent) {
  const marks = [];
  if (m.mark) marks.push(MARK_HE[m.mark] || m.mark);
  if (m.mark === 'task') marks.push(m.task_done ? 'בוצעה' : 'פתוחה');
  if (m.task_assignee) marks.push(`אחראי: ${uname(m.task_assignee)}`);
  if (m.task_due) marks.push(`יעד: ${m.task_due}`);
  const tag = marks.length ? ` [${marks.join(' · ')}]` : '';
  const files = (filesByMsg[m.id] || []).map(n => ` [קובץ מצורף: ${n}]`).join('');
  const reply = m.reply_to_id ? (() => {
    const r = all.find(x => x.id === m.reply_to_id);
    return r ? ` (בתגובה ל${uname(r.user_id)}: "${r.body.slice(0, 60)}")` : '';
  })() : '';
  return `${indent}- **${uname(m.user_id)}** (${fmtJerusalem(m.created_at)})${tag}${reply}: ${m.body}${files}${m.edited_at ? ' _(נערך)_' : ''}`;
}

function msgToJson(m, all, filesByMsg, uname) {
  return {
    id: m.id,
    author: uname(m.user_id),
    at: m.created_at,
    body: m.body,
    mark: m.mark || null,
    task: m.mark === 'task' ? { done: !!m.task_done, assignee: m.task_assignee ? uname(m.task_assignee) : null, due: m.task_due } : undefined,
    edited: !!m.edited_at,
    pinned: !!m.pinned,
    files: filesByMsg[m.id] || undefined,
    thread: all.filter(x => x.thread_root_id === m.id).map(x => msgToJson(x, all, filesByMsg, uname)),
  };
}
