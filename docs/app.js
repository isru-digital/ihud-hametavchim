/* מרכז הרעיונות · איחוד המתווכים */
'use strict';

const API = 'https://ihud-api.beapromanager.workers.dev';
const LS_TOKEN = 'ihud_token';
const LS_USER = 'ihud_user';
const TZ = 'Asia/Jerusalem';
const EMOJIS = ['👍', '❤️', '🔥', '😂', '👏', '🙏'];
const TOPIC_COLORS = ['#E5C879', '#7E9BD4', '#7DB9A1', '#B98FC9', '#D9A183', '#D492A2', '#8FB8D4', '#C9A24B'];
const MARKS = {
  idea: { he: 'רעיון', cls: 'idea' },
  decision: { he: 'החלטה', cls: 'decision' },
  task: { he: 'משימה', cls: 'task' },
  question: { he: 'שאלה', cls: 'question' },
};

/* ---------- אייקונים ---------- */
const I = {
  idea: '<svg class="icon" viewBox="0 0 24 24"><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5.76.76 1.23 1.52 1.41 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>',
  decision: '<svg class="icon" viewBox="0 0 24 24"><path d="M21.8 10.5a10 10 0 1 1-5.93-7.64"/><path d="m9 11 3 3L22 4"/></svg>',
  task: '<svg class="icon" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4"/><path d="M16 3v4"/><path d="m9 14 2 2 4-4"/></svg>',
  question: '<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>',
  pin: '<svg class="icon" viewBox="0 0 24 24"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1z"/></svg>',
  reply: '<svg class="icon" viewBox="0 0 24 24"><path d="M9 17l-5-5 5-5"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>',
  thread: '<svg class="icon" viewBox="0 0 24 24"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>',
  more: '<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>',
  edit: '<svg class="icon" viewBox="0 0 24 24"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>',
  trash: '<svg class="icon" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  smile: '<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01"/><path d="M15 9h.01"/></svg>',
  clip: '<svg class="icon" viewBox="0 0 24 24"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>',
  send: '<svg class="icon" viewBox="0 0 24 24"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>',
  file: '<svg class="icon" viewBox="0 0 24 24"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 13h6"/><path d="M10 17h6"/></svg>',
  image: '<svg class="icon" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/></svg>',
  upload: '<svg class="icon" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/></svg>',
  download: '<svg class="icon" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/></svg>',
  sparkles: '<svg class="icon" viewBox="0 0 24 24"><path d="M9.94 15.5a2 2 0 0 0-1.44-1.44l-6.13-1.58a.5.5 0 0 1 0-.96L8.5 9.94a2 2 0 0 0 1.44-1.44l1.58-6.14a.5.5 0 0 1 .96 0l1.58 6.14a2 2 0 0 0 1.44 1.44l6.13 1.58a.5.5 0 0 1 0 .96l-6.13 1.58a2 2 0 0 0-1.44 1.44l-1.58 6.14a.5.5 0 0 1-.96 0z"/></svg>',
  chat: '<svg class="icon" viewBox="0 0 24 24"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>',
  folder: '<svg class="icon" viewBox="0 0 24 24"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>',
  archive: '<svg class="icon" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="5" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/></svg>',
  back: '<svg class="icon sm" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>',
  check: '<svg class="icon" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>',
  zap: '<svg class="icon" viewBox="0 0 24 24"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>',
  board: '<svg class="icon" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>',
  undo: '<svg class="icon" viewBox="0 0 24 24"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>',
};
function markIcon(m) { return I[m] || ''; }

/* ---------- מצב ---------- */
const S = {
  token: localStorage.getItem(LS_TOKEN) || '',
  me: JSON.parse(localStorage.getItem(LS_USER) || 'null'),
  users: [],
  topics: [],
  stats: null,
  taskByUser: [],
  recent: [],
  recentFiles: [],
  route: { view: 'dash' },
  messages: [],
  pinnedMsgs: [],
  topicId: 0,
  thread: { rootId: 0, messages: [] },
  replyTo: null,
  editing: null,
  pollTimer: null,
  bootTimer: null,
  searchTimer: null,
  searchFilters: {},
};

/* ---------- עזרים ---------- */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function linkify(s) {
  return esc(s).replace(/(https?:\/\/[^\s<]+)/g, u => `<a href="${u}" target="_blank" rel="noopener">${u}</a>`);
}
function userOf(id) { return S.users.find(u => u.id === id) || { id, name: id, color: '#888' }; }
function topicOf(id) { return S.topics.find(t => t.id === id) || { id, name: '', color: '#888' }; }
function initial(id) { return id ? id[0] : '?'; }
function fmtTime(iso) { return new Intl.DateTimeFormat('he-IL', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(iso)); }
function fmtDate(iso) { return new Intl.DateTimeFormat('he-IL', { timeZone: TZ, day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(iso)); }
function fmtDayLabel(iso) {
  const d = new Date(iso);
  const today = dayKey(new Date().toISOString());
  const k = dayKey(iso);
  if (k === today) return 'היום';
  const yest = new Date(Date.now() - 864e5).toISOString();
  if (k === dayKey(yest)) return 'אתמול';
  return new Intl.DateTimeFormat('he-IL', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long' }).format(d);
}
function dayKey(iso) { return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso)); }
function fmtRel(iso) {
  if (!iso) return 'לא נכנס עדיין';
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 2) return 'מחובר עכשיו';
  if (mins < 60) return `לפני ${mins} דקות`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `לפני ${h} שעות`;
  return fmtDate(iso);
}
function fmtSize(b) {
  if (b > 1048576) return (b / 1048576).toFixed(1) + ' MB';
  if (b > 1024) return Math.round(b / 1024) + ' KB';
  return b + ' B';
}
function toast(msg, isErr) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.toggle('error', !!isErr);
  t.hidden = false;
  clearTimeout(t._tm);
  t._tm = setTimeout(() => { t.hidden = true; }, 3200);
}
function fileUrl(id) { return `${API}/api/files/${id}?t=${encodeURIComponent(S.token)}`; }

async function api(path, opts = {}) {
  const headers = { ...(opts.headers || {}) };
  if (S.token) headers['Authorization'] = 'Bearer ' + S.token;
  if (opts.body && typeof opts.body !== 'string') {
    opts.body = JSON.stringify(opts.body);
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(API + path, { ...opts, headers });
  if (res.status === 401) { doLogout(false); throw new Error('unauthorized'); }
  const ct = res.headers.get('Content-Type') || '';
  const data = ct.includes('json') ? await res.json() : await res.blob();
  if (!res.ok) throw new Error(data.error || 'שגיאה בשרת');
  return data;
}

/* ---------- כניסה ---------- */
const LOGIN_USERS = [
  { id: 'ITZIK', name: 'איציק', color: '#A8853B' },
  { id: 'ARIEL', name: 'אריאל', color: '#44639F' },
  { id: 'OFEK', name: 'אופק', color: '#3E7D68' },
];
let loginPick = 'ITZIK';

function renderLogin() {
  $('#login-users').innerHTML = LOGIN_USERS.map(u => `
    <button class="user-pick ${u.id === loginPick ? 'selected' : ''}" data-id="${u.id}">
      <span class="avatar" style="background:${u.color}">${initial(u.id)}</span>
      ${u.name}
    </button>`).join('');
  $$('#login-users .user-pick').forEach(b => b.onclick = () => { loginPick = b.dataset.id; renderLogin(); $('#login-pass').focus(); });
}

async function doLogin() {
  const pass = $('#login-pass').value;
  const errEl = $('#login-error');
  errEl.hidden = true;
  if (!pass) { errEl.textContent = 'צריך להזין סיסמה'; errEl.hidden = false; return; }
  const btn = $('#login-btn');
  btn.disabled = true;
  try {
    const { token, user } = await api('/api/login', { method: 'POST', body: { user_id: loginPick, password: pass } });
    S.token = token; S.me = user;
    localStorage.setItem(LS_TOKEN, token);
    localStorage.setItem(LS_USER, JSON.stringify(user));
    enterApp();
  } catch (e) {
    errEl.textContent = e.message === 'unauthorized' ? 'הסיסמה שגויה' : e.message;
    errEl.hidden = false;
  } finally { btn.disabled = false; }
}

function doLogout(callServer = true) {
  if (callServer) api('/api/logout', { method: 'POST' }).catch(() => {});
  localStorage.removeItem(LS_TOKEN);
  localStorage.removeItem(LS_USER);
  S.token = ''; S.me = null;
  clearInterval(S.pollTimer); clearInterval(S.bootTimer);
  $('#app').hidden = true; $('#fab').hidden = true; $('#footer').hidden = false;
  $('#login-screen').hidden = false;
  renderLogin();
}

/* ---------- אתחול ---------- */
async function enterApp() {
  $('#login-screen').hidden = true;
  $('#app').hidden = false;
  $('#fab').hidden = false;
  $('#footer').hidden = false;
  $('#me-avatar').textContent = initial(S.me.id);
  $('#me-avatar').style.background = S.me.color;
  await refreshBootstrap();
  clearInterval(S.bootTimer);
  S.bootTimer = setInterval(() => { if (!document.hidden) refreshBootstrap(); }, 15000);
  onRoute();
}

async function refreshBootstrap() {
  try {
    const d = await api('/api/bootstrap');
    S.me = d.me; S.users = d.users; S.topics = d.topics;
    S.stats = d.stats; S.taskByUser = d.taskByUser; S.recent = d.recent; S.recentFiles = d.recentFiles;
    renderSidebar();
    if (S.route.view === 'dash') renderDashboard();
  } catch (e) { /* שקט ברענון רקע */ }
}

/* ---------- סרגל צד ---------- */
function renderSidebar() {
  const active = S.topics.filter(t => !t.archived);
  $('#topics-list').innerHTML = active.map(t => `
    <a class="nav-item topic-item ${S.route.view === 'topic' && S.topicId === t.id ? 'active' : ''}" href="#/topic/${t.id}">
      <span class="dot" style="background:${t.color}"></span>
      <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(t.name)}</span>
      ${t.unread ? `<span class="count">${t.unread}</span>` : ''}
      <button class="topic-edit" data-id="${t.id}" title="עריכת נושא">${I.edit.replace('class="icon"', 'class="icon sm"')}</button>
    </a>`).join('');
  $$('#topics-list .topic-edit').forEach(b => b.onclick = e => { e.preventDefault(); e.stopPropagation(); openTopicModal(+b.dataset.id); });

  $$('.nav-item[data-route]').forEach(a => a.classList.toggle('active', a.dataset.route === S.route.view));

  const others = S.users.filter(u => u.id !== S.me.id);
  $('#presence').innerHTML =
    S.users.map(u => `<div class="mini" style="background:${u.color}" title="${esc(u.name)}">${initial(u.id)}</div>`).join('') +
    `<span>${others.map(u => `${esc(u.name)}: ${fmtRel(u.last_seen)}`).join('<br>')}</span>`;
}

function closeDrawer() { $('#sidebar').classList.remove('open'); $('#backdrop').classList.remove('show'); }

/* ---------- ראוטר ---------- */
function onRoute() {
  closeDrawer(); closeThread(); closeMenu();
  stopPolling();
  const h = location.hash || '#/';
  let m;
  if ((m = h.match(/^#\/topic\/(\d+)/))) {
    S.route = { view: 'topic' }; S.topicId = +m[1];
    renderTopicView();
  } else if (h.startsWith('#/board')) {
    S.route = { view: 'board' }; renderBoard();
  } else if (h.startsWith('#/files')) {
    S.route = { view: 'files' }; renderFiles();
  } else if (h.startsWith('#/archive')) {
    S.route = { view: 'archive' }; renderArchive();
  } else {
    S.route = { view: 'dash' }; renderDashboard();
  }
  renderSidebar();
}
window.addEventListener('hashchange', onRoute);

function setTitle(main, sub) {
  $('#page-title').innerHTML = `<b>${esc(main)}</b>${sub ? `<span>${esc(sub)}</span>` : ''}`;
}

/* ---------- דשבורד ---------- */
function greeting() {
  const h = +new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: 'numeric', hour12: false }).format(new Date());
  if (h < 5) return 'לילה טוב';
  if (h < 12) return 'בוקר טוב';
  if (h < 18) return 'צהריים טובים';
  return 'ערב טוב';
}

function renderDashboard() {
  if (S.route.view !== 'dash') return;
  setTitle('דשבורד');
  const st = S.stats || { open_tasks: 0, decisions: 0, ideas: 0, files: 0 };
  const taskNote = S.taskByUser.filter(x => x.assignee).map(x => `${userOf(x.assignee).name}: ${x.n}`).join(' · ') || 'אין שיוכים';
  const dateStr = new Intl.DateTimeFormat('he-IL', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());

  $('#view').innerHTML = `
  <div class="content">
    <div>
      <h1 class="display">${greeting()}, ${esc(S.me.name)}</h1>
      <div class="subtitle">${dateStr}</div>
    </div>

    <div class="stats">
      <div class="stat" data-go="#/board"><b>${st.open_tasks}</b><span>משימות פתוחות</span><span class="note">${esc(taskNote)}</span></div>
      <div class="stat" data-go="#/board"><b>${st.decisions}</b><span>החלטות שהתקבלו</span></div>
      <div class="stat" data-go="#/board"><b>${st.ideas}</b><span>רעיונות שטרם נבדקו</span></div>
      <div class="stat featured" data-go="#/files"><b>${st.files}</b><span>קבצים בספרייה</span></div>
    </div>

    <div class="grid-2">
      <div class="card">
        <h2>${I.chat}פעילות אחרונה</h2>
        <div class="feed">
          ${S.recent.length ? S.recent.map(r => `
            <div class="feed-item" data-go="#/topic/${r.topic_id}" data-msg="${r.id}">
              <div class="avatar" style="background:${userOf(r.user_id).color}">${initial(r.user_id)}</div>
              <div class="txt">
                <div class="who">${esc(userOf(r.user_id).name)}<small>${fmtDayLabel(r.created_at)} · ${fmtTime(r.created_at)}</small></div>
                <p>${esc(r.body || '(קובץ מצורף)')}</p>
                <div class="where"><span class="dot" style="background:${r.topic_color}"></span>${esc(r.topic_name)}</div>
              </div>
              <span class="enter">כניסה לשיחה ${I.back}</span>
            </div>`).join('') : `<div class="empty-state">${I.chat}עוד אין הודעות. פתחו נושא והתחילו לדבר.</div>`}
        </div>
      </div>

      <div class="card">
        <h2>${I.folder}ספריית קבצים<button class="more" data-go="#/files">לכל הקבצים ${I.back}</button></h2>
        <div class="drop" id="dash-drop">
          <div class="ic">${I.upload}</div>
          <div><b>העלאת מסמך או תמונה</b><span>לחיצה או גרירה לכאן. עד 8MB לקובץ</span></div>
        </div>
        <div class="files-grid">
          ${S.recentFiles.length ? S.recentFiles.map(fileCard).join('') : `<div class="empty-state" style="grid-column:1/-1">אין עדיין קבצים</div>`}
        </div>
      </div>
    </div>

    <div class="ai-export">
      <div class="txt">
        <h2>${I.sparkles}ייצוא לעוזר AI</h2>
        <p>לחיצה אחת יוצרת קובץ מסודר עם כל השיחות, ההחלטות, המשימות והרעיונות, מוכן להעלאה לקלוד, לגרוק או לכל בוט אחר. אפשר לייצא הכול, או לבחור טווח תאריכים ונושאים.</p>
      </div>
      <div class="ai-btns">
        <button class="btn gold" id="btn-export-md">${I.download.replace('class="icon"', 'class="icon sm"')}קובץ מוכן ל-AI</button>
        <button class="btn ghost" id="btn-export-opts">אפשרויות ייצוא</button>
      </div>
    </div>
  </div>`;

  $$('#view [data-go]').forEach(el => el.addEventListener('click', () => {
    location.hash = el.dataset.go;
    if (el.dataset.msg) sessionStorage.setItem('scrollToMsg', el.dataset.msg);
  }));
  $('#btn-export-md').onclick = () => runExport({ format: 'md' });
  $('#btn-export-opts').onclick = openExportModal;
  const drop = $('#dash-drop');
  drop.onclick = () => pickLibraryFile();
  wireDrop(drop, f => uploadLibraryFile(f));
}

function fileCard(f) {
  const isImg = (f.mime || '').startsWith('image/');
  return `
  <div class="file" data-fid="${f.id}" onclick="window.open('${fileUrl(f.id)}','_blank')">
    ${isImg ? `<img class="thumb" loading="lazy" src="${fileUrl(f.id)}" alt="">` : `<div class="fic">${I.file}</div>`}
    <b title="${esc(f.name)}">${esc(f.name)}</b>
    <span>${esc(userOf(f.user_id).name)} · ${fmtDate(f.created_at)}${f.topic_name ? ' · ' + esc(f.topic_name) : ''}</span>
  </div>`;
}

/* ---------- נושא ושיחה ---------- */
async function renderTopicView() {
  const t = topicOf(S.topicId);
  setTitle(t.name || 'שיחה', '');
  $('#view').innerHTML = `
  <div class="topic-view">
    <div id="pinned-wrap"></div>
    <div class="chat" id="chat"><div class="empty-state">טוען שיחה...</div></div>
    <div class="composer">
      <div id="reply-wrap"></div>
      <div class="composer-box">
        <button class="icon-btn" id="btn-attach" aria-label="צירוף קובץ">${I.clip}</button>
        <textarea id="msg-input" rows="1" placeholder="כתוב הודעה בנושא ${esc(t.name)}"></textarea>
        <button class="send" id="btn-send" aria-label="שליחה">${I.send}</button>
      </div>
    </div>
  </div>`;

  const input = $('#msg-input');
  input.addEventListener('input', () => { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 120) + 'px'; });
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    if (e.key === 'Escape') cancelComposerState();
  });
  $('#btn-send').onclick = sendMessage;
  $('#btn-attach').onclick = () => $('#file-input').click();

  S.messages = []; S.pinnedMsgs = []; S.replyTo = null; S.editing = null;
  await loadMessages(true);
  startPolling();
}

async function loadMessages(initial) {
  if (S.loadingMsgs) return;
  S.loadingMsgs = true;
  try {
    const after = initial ? 0 : (S.messages.length ? S.messages[S.messages.length - 1].id : 0);
    const d = await api(`/api/messages?topic_id=${S.topicId}&after=${after}`);
    if (initial) { S.messages = d.messages; S.pinnedMsgs = d.pinned; renderChat(true); }
    else if (d.messages.length) {
      const fresh = d.messages.filter(m => !S.messages.some(x => x.id === m.id));
      if (fresh.length) {
        S.messages.push(...fresh);
        S.pinnedMsgs = d.pinned;
        renderChat(false);
      }
    }
    if (d.messages.length) {
      const lastId = S.messages[S.messages.length - 1].id;
      api('/api/read', { method: 'POST', body: { topic_id: S.topicId, last_id: lastId } }).catch(() => {});
      const t = S.topics.find(x => x.id === S.topicId);
      if (t) { t.unread = 0; renderSidebar(); }
    }
  } catch (e) { if (initial && $('#chat')) $('#chat').innerHTML = `<div class="empty-state">לא הצלחנו לטעון את השיחה. ${esc(e.message)}</div>`; }
  finally { S.loadingMsgs = false; }
}

function renderChat(fullRender) {
  const chat = $('#chat');
  if (!chat) return;
  const nearBottom = chat.scrollHeight - chat.scrollTop - chat.clientHeight < 180;

  $('#pinned-wrap').innerHTML = S.pinnedMsgs.map(p => `
    <div class="pinned" data-mid="${p.id}">
      ${I.pin}<div style="min-width:0"><b>נעוץ:</b> <span>${esc(p.body)}</span></div>
    </div>`).join('');
  $$('#pinned-wrap .pinned').forEach(el => el.onclick = () => scrollToMsg(+el.dataset.mid));

  if (!S.messages.length) {
    chat.innerHTML = `<div class="empty-state">${I.chat}אין עדיין הודעות בנושא הזה.<br>ההודעה הראשונה שלך תפתח את השיחה.</div>`;
    return;
  }

  let html = '';
  let lastDay = '';
  for (const m of S.messages) {
    const k = dayKey(m.created_at);
    if (k !== lastDay) { html += `<div class="day">${fmtDayLabel(m.created_at)}</div>`; lastDay = k; }
    html += msgHtml(m);
  }
  chat.innerHTML = html;
  wireMessages(chat);

  if (fullRender || nearBottom) chat.scrollTop = chat.scrollHeight;

  const want = sessionStorage.getItem('scrollToMsg');
  if (want) { sessionStorage.removeItem('scrollToMsg'); scrollToMsg(+want); }
}

function msgHtml(m, inThread) {
  const u = userOf(m.user_id);
  const mine = m.user_id === S.me.id;
  const reactCount = {};
  (m.reactions || []).forEach(r => { reactCount[r.emoji] = (reactCount[r.emoji] || 0) + 1; });
  const reactsHtml = Object.keys(reactCount).length
    ? `<div class="reactions">${Object.entries(reactCount).map(([e, n]) => `${e}${n > 1 ? ' ' + n : ''}`).join(' ')}</div>` : '';

  const filesHtml = (m.files || []).map(f => (f.mime || '').startsWith('image/')
    ? `<img class="msg-img" loading="lazy" src="${fileUrl(f.id)}" alt="${esc(f.name)}" onclick="window.open('${fileUrl(f.id)}','_blank')">`
    : `<span class="msg-file" onclick="window.open('${fileUrl(f.id)}','_blank')">${I.file.replace('class="icon"', 'class="icon sm"')}${esc(f.name)} <small style="color:var(--ink-faint)">${fmtSize(f.size)}</small></span>`
  ).join('');

  const tagsHtml = [];
  if (m.mark) {
    const mk = MARKS[m.mark];
    if (m.mark === 'task') {
      tagsHtml.push(`<button class="chip task clickable ${m.task_done ? 'done' : ''}" data-act="task-toggle" data-mid="${m.id}">${markIcon('task')}משימה ${m.task_done ? 'בוצעה' : 'פתוחה'}</button>`);
      if (m.task_assignee || m.task_due) tagsHtml.push(`<button class="chip neutral clickable" data-act="task-edit" data-mid="${m.id}">${m.task_assignee ? 'אחראי: ' + esc(userOf(m.task_assignee).name) : 'ללא אחראי'}${m.task_due ? ' · יעד ' + esc(fmtDate(m.task_due + 'T12:00:00Z')) : ''}</button>`);
      else tagsHtml.push(`<button class="chip neutral clickable" data-act="task-edit" data-mid="${m.id}">שיוך ויעד</button>`);
    } else if (m.mark === 'idea') {
      tagsHtml.push(`<span class="chip idea">${markIcon('idea')}רעיון${m.task_done ? ' · נבדק' : ''}</span>`);
    } else {
      tagsHtml.push(`<span class="chip ${mk.cls}">${markIcon(m.mark)}${mk.he}</span>`);
    }
  }
  if (m.pinned) tagsHtml.push(`<span class="chip neutral">${I.pin.replace('class="icon"', 'class="icon sm"')}נעוץ</span>`);

  const threadHtml = (!inThread && m.thread_count)
    ? `<button class="thread-link" data-act="thread" data-mid="${m.id}">${I.thread}שרשור · ${m.thread_count} תגובות</button>` : '';

  const quoteHtml = m.reply_preview
    ? `<div class="quote"><b>${esc(userOf(m.reply_preview.user_id).name)}</b>${esc(m.reply_preview.body)}</div>` : '';

  return `
  <div class="msg ${mine ? 'mine' : ''}" id="msg-${m.id}" data-mid="${m.id}">
    <div class="avatar" style="background:${u.color}">${initial(u.id)}</div>
    <div class="bubble">
      <div class="msg-actions">
        <button data-act="react" data-mid="${m.id}" title="תגובת אימוג'י">${I.smile}</button>
        <button data-act="reply" data-mid="${m.id}" title="תגובה">${I.reply}</button>
        ${!inThread ? `<button data-act="thread" data-mid="${m.id}" title="שרשור">${I.thread}</button>` : ''}
        <button data-act="more" data-mid="${m.id}" title="עוד">${I.more}</button>
      </div>
      <div class="meta">
        <span class="name" style="color:${u.color}">${esc(u.name)}</span>
        <span class="time">${fmtTime(m.created_at)}</span>
        ${m.edited_at ? '<span class="edited">נערך</span>' : ''}
      </div>
      ${quoteHtml}
      ${m.body ? `<p>${linkify(m.body)}</p>` : ''}
      ${filesHtml}
      ${tagsHtml.length ? `<div class="tags">${tagsHtml.join('')}</div>` : ''}
      ${threadHtml}
      ${reactsHtml}
    </div>
  </div>`;
}

function wireMessages(root) {
  root.querySelectorAll('[data-act]').forEach(b => {
    b.onclick = e => {
      e.stopPropagation();
      const mid = +b.dataset.mid;
      const act = b.dataset.act;
      if (act === 'react') openReactMenu(b, mid);
      else if (act === 'reply') startReply(mid);
      else if (act === 'thread') openThread(mid);
      else if (act === 'more') openMoreMenu(b, mid);
      else if (act === 'task-toggle') toggleTask(mid);
      else if (act === 'task-edit') openTaskModal(mid);
    };
  });
}

function findMsg(id) {
  return S.messages.find(m => m.id === id) || S.thread.messages.find(m => m.id === id) || (S.thread.root && S.thread.root.id === id ? S.thread.root : null);
}

function scrollToMsg(id) {
  const el = $(`#msg-${id}`);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('flash');
    setTimeout(() => el.classList.remove('flash'), 1800);
  } else toast('ההודעה ישנה, מוצגות 200 ההודעות האחרונות');
}

/* תפריטים צפים */
let menuEl = null;
function closeMenu() { if (menuEl) { menuEl.remove(); menuEl = null; } }
document.addEventListener('click', closeMenu);
function openMenu(anchor, html) {
  closeMenu();
  menuEl = document.createElement('div');
  menuEl.className = 'popmenu';
  menuEl.innerHTML = html;
  document.body.appendChild(menuEl);
  const r = anchor.getBoundingClientRect();
  const mw = menuEl.offsetWidth, mh = menuEl.offsetHeight;
  let x = Math.min(Math.max(8, r.left - mw + r.width), window.innerWidth - mw - 8);
  let y = r.bottom + 6;
  if (y + mh > window.innerHeight - 8) y = r.top - mh - 6;
  menuEl.style.left = x + 'px';
  menuEl.style.top = Math.max(8, y) + 'px';
  menuEl.addEventListener('click', e => e.stopPropagation());
  return menuEl;
}

function openReactMenu(anchor, mid) {
  const el = openMenu(anchor, `<div class="emoji-row">${EMOJIS.map(e => `<button data-e="${e}">${e}</button>`).join('')}</div>`);
  el.querySelectorAll('[data-e]').forEach(b => b.onclick = async () => {
    closeMenu();
    try {
      const d = await api('/api/reactions', { method: 'POST', body: { message_id: mid, emoji: b.dataset.e } });
      const m = findMsg(mid);
      if (m) { m.reactions = d.reactions; rerenderOne(mid); }
    } catch (e) { toast(e.message, true); }
  });
}

function openMoreMenu(anchor, mid) {
  const m = findMsg(mid);
  if (!m) return;
  const mine = m.user_id === S.me.id;
  const items = [];
  items.push(`<button data-k="mark-idea">${markIcon('idea')}סמן כרעיון</button>`);
  items.push(`<button data-k="mark-decision">${markIcon('decision')}סמן כהחלטה</button>`);
  items.push(`<button data-k="mark-task">${markIcon('task')}סמן כמשימה</button>`);
  items.push(`<button data-k="mark-question">${markIcon('question')}סמן כשאלה</button>`);
  if (m.mark) items.push(`<button data-k="mark-none">${I.undo}הסרת סימון</button>`);
  if (m.mark === 'idea') items.push(`<button data-k="idea-done">${I.check}${m.task_done ? 'החזרה ללא נבדק' : 'סמן שהרעיון נבדק'}</button>`);
  items.push('<div class="sep"></div>');
  items.push(`<button data-k="pin">${I.pin}${m.pinned ? 'ביטול נעיצה' : 'נעיצה לראש הנושא'}</button>`);
  if (mine) {
    items.push(`<button data-k="edit">${I.edit}עריכת ההודעה</button>`);
    items.push(`<button data-k="del" style="color:var(--danger)">${I.trash}העברה לארכיון</button>`);
  }
  const el = openMenu(anchor, items.join(''));
  el.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { closeMenu(); menuAction(b.dataset.k, mid); });
}

async function menuAction(k, mid) {
  const m = findMsg(mid);
  if (!m) return;
  try {
    if (k.startsWith('mark-')) {
      const mark = k.slice(5) === 'none' ? null : k.slice(5);
      if (mark === 'task') { await patchMsg(mid, { mark: 'task' }); openTaskModal(mid); return; }
      await patchMsg(mid, { mark });
    } else if (k === 'idea-done') await patchMsg(mid, { task_done: m.task_done ? 0 : 1 });
    else if (k === 'pin') await patchMsg(mid, { pinned: m.pinned ? 0 : 1 }, true);
    else if (k === 'edit') startEdit(mid);
    else if (k === 'del') {
      if (!confirm('להעביר את ההודעה לארכיון? היא תוסתר מהשיחה אבל לא תימחק מהמסד.')) return;
      await api(`/api/messages/${mid}`, { method: 'DELETE' });
      S.messages = S.messages.filter(x => x.id !== mid);
      S.thread.messages = S.thread.messages.filter(x => x.id !== mid);
      renderChat(false);
      if (!$('#thread-panel').hidden) renderThreadMsgs();
    }
  } catch (e) { toast(e.message, true); }
}

async function patchMsg(mid, body, refreshPinned) {
  const d = await api(`/api/messages/${mid}`, { method: 'PATCH', body });
  const idx = S.messages.findIndex(x => x.id === mid);
  if (idx >= 0) S.messages[idx] = { ...S.messages[idx], ...d.message };
  const tIdx = S.thread.messages.findIndex(x => x.id === mid);
  if (tIdx >= 0) S.thread.messages[tIdx] = { ...S.thread.messages[tIdx], ...d.message };
  if (refreshPinned) await loadPinnedOnly();
  rerenderOne(mid);
  return d.message;
}

async function loadPinnedOnly() {
  const d = await api(`/api/messages?topic_id=${S.topicId}&after=999999999`);
  S.pinnedMsgs = d.pinned;
  if ($('#pinned-wrap')) {
    $('#pinned-wrap').innerHTML = S.pinnedMsgs.map(p => `
      <div class="pinned" data-mid="${p.id}">${I.pin}<div style="min-width:0"><b>נעוץ:</b> <span>${esc(p.body)}</span></div></div>`).join('');
    $$('#pinned-wrap .pinned').forEach(el => el.onclick = () => scrollToMsg(+el.dataset.mid));
  }
}

function rerenderOne(mid) {
  const m = findMsg(mid);
  if (!m) return;
  const el = $(`#msg-${mid}`);
  if (el) {
    const inThread = !!el.closest('.thread-msgs') || !!el.closest('.thread-root');
    const tmp = document.createElement('div');
    tmp.innerHTML = msgHtml(m, inThread);
    el.replaceWith(tmp.firstElementChild);
    const nel = $(`#msg-${mid}`);
    if (nel) wireMessages(nel.parentElement);
  }
  if (S.route.view === 'board') renderBoard();
}

async function toggleTask(mid) {
  const m = findMsg(mid);
  if (!m) return;
  try { await patchMsg(mid, { task_done: m.task_done ? 0 : 1 }); } catch (e) { toast(e.message, true); }
}

/* תגובה ועריכה */
function startReply(mid) {
  const m = findMsg(mid);
  if (!m) return;
  S.replyTo = m; S.editing = null;
  renderReplyBar();
  $('#msg-input').focus();
}
function startEdit(mid) {
  const m = findMsg(mid);
  if (!m || m.user_id !== S.me.id) return;
  S.editing = m; S.replyTo = null;
  const input = $('#msg-input');
  input.value = m.body;
  input.dispatchEvent(new Event('input'));
  renderReplyBar();
  input.focus();
}
function renderReplyBar() {
  const w = $('#reply-wrap');
  if (!w) return;
  if (S.replyTo) {
    w.innerHTML = `<div class="reply-bar">${I.reply.replace('class="icon"', 'class="icon sm"')}<span>בתגובה ל<b>${esc(userOf(S.replyTo.user_id).name)}</b>: ${esc(S.replyTo.body.slice(0, 70))}</span>
      <button class="icon-btn" id="cancel-state">✕</button></div>`;
  } else if (S.editing) {
    w.innerHTML = `<div class="reply-bar">${I.edit.replace('class="icon"', 'class="icon sm"')}<span>עריכת הודעה</span>
      <button class="icon-btn" id="cancel-state">✕</button></div>`;
  } else w.innerHTML = '';
  const c = $('#cancel-state');
  if (c) c.onclick = cancelComposerState;
}
function cancelComposerState() {
  S.replyTo = null;
  if (S.editing) { $('#msg-input').value = ''; }
  S.editing = null;
  renderReplyBar();
}

async function sendMessage() {
  const input = $('#msg-input');
  const body = input.value.trim();
  if (!body) return;
  const btn = $('#btn-send');
  btn.disabled = true;
  try {
    if (S.editing) {
      await patchMsg(S.editing.id, { body });
      S.editing = null;
    } else {
      const d = await api('/api/messages', {
        method: 'POST',
        body: { topic_id: S.topicId, body, reply_to_id: S.replyTo ? S.replyTo.id : null },
      });
      if (!S.messages.some(x => x.id === d.message.id)) S.messages.push(d.message);
      S.replyTo = null;
      renderChat(false);
      $('#chat').scrollTop = $('#chat').scrollHeight;
    }
    input.value = ''; input.style.height = 'auto';
    renderReplyBar();
  } catch (e) { toast(e.message, true); }
  finally { btn.disabled = false; input.focus(); }
}

/* קבצים בשיחה */
async function onChatFile(file) {
  if (!file) return;
  try {
    toast('מעלה את ' + file.name + '...');
    const { data, mime } = await prepareFile(file);
    const caption = $('#msg-input') ? $('#msg-input').value.trim() : '';
    const d = await api('/api/messages', {
      method: 'POST',
      body: { topic_id: S.topicId, body: caption, has_file: true, reply_to_id: S.replyTo ? S.replyTo.id : null },
    });
    const fr = await api('/api/files', {
      method: 'POST',
      body: { name: file.name, mime, data, topic_id: S.topicId, message_id: d.message.id },
    });
    d.message.files = [{ id: fr.file.id, name: fr.file.name, mime: fr.file.mime, size: fr.file.size }];
    S.messages.push(d.message);
    S.replyTo = null; renderReplyBar();
    if ($('#msg-input')) { $('#msg-input').value = ''; }
    renderChat(false);
    $('#chat').scrollTop = $('#chat').scrollHeight;
    toast('הקובץ עלה');
  } catch (e) { toast(e.message, true); }
}

function prepareFile(file) {
  return new Promise((resolve, reject) => {
    const isImg = file.type.startsWith('image/') && file.type !== 'image/gif';
    if (isImg) {
      const img = new Image();
      img.onload = () => {
        const MAX = 1600;
        let { width: w, height: h } = img;
        if (w > MAX || h > MAX) { const r = Math.min(MAX / w, MAX / h); w = Math.round(w * r); h = Math.round(h * r); }
        const cv = document.createElement('canvas');
        cv.width = w; cv.height = h;
        cv.getContext('2d').drawImage(img, 0, 0, w, h);
        const dataUrl = cv.toDataURL('image/jpeg', 0.82);
        resolve({ data: dataUrl.split(',')[1], mime: 'image/jpeg' });
      };
      img.onerror = () => reject(new Error('לא הצלחנו לקרוא את התמונה'));
      img.src = URL.createObjectURL(file);
    } else {
      if (file.size > 8 * 1024 * 1024) return reject(new Error('הקובץ גדול מ-8MB'));
      const fr = new FileReader();
      fr.onload = () => resolve({ data: fr.result.split(',')[1], mime: file.type || 'application/octet-stream' });
      fr.onerror = () => reject(new Error('שגיאה בקריאת הקובץ'));
      fr.readAsDataURL(file);
    }
  });
}

function wireDrop(el, cb) {
  el.addEventListener('dragover', e => { e.preventDefault(); el.classList.add('dragover'); });
  el.addEventListener('dragleave', () => el.classList.remove('dragover'));
  el.addEventListener('drop', e => {
    e.preventDefault(); el.classList.remove('dragover');
    const f = e.dataTransfer.files[0];
    if (f) cb(f);
  });
}

/* ---------- שרשור ---------- */
async function openThread(rootId) {
  const panel = $('#thread-panel');
  panel.hidden = false;
  S.thread = { rootId, root: findMsg(rootId), messages: [] };
  $('#thread-root').innerHTML = S.thread.root ? msgHtml(S.thread.root, true) : '';
  $('#thread-msgs').innerHTML = '<div class="empty-state">טוען...</div>';
  try {
    const d = await api(`/api/messages?thread_root=${rootId}`);
    S.thread.messages = d.messages;
    renderThreadMsgs();
  } catch (e) { $('#thread-msgs').innerHTML = `<div class="empty-state">${esc(e.message)}</div>`; }
  $('#thread-input').focus();
}
function renderThreadMsgs() {
  const w = $('#thread-msgs');
  w.innerHTML = S.thread.messages.length
    ? S.thread.messages.map(m => msgHtml(m, true)).join('')
    : '<div class="empty-state">אין עדיין תגובות בשרשור.</div>';
  wireMessages(w);
  const rw = $('#thread-root');
  if (S.thread.root) { rw.innerHTML = msgHtml(S.thread.root, true); wireMessages(rw); }
  w.scrollTop = w.scrollHeight;
}
function closeThread() { $('#thread-panel').hidden = true; S.thread = { rootId: 0, messages: [] }; }

async function sendThreadMsg() {
  const input = $('#thread-input');
  const body = input.value.trim();
  if (!body || !S.thread.rootId) return;
  try {
    const d = await api('/api/messages', {
      method: 'POST',
      body: { topic_id: S.topicId, body, thread_root_id: S.thread.rootId },
    });
    S.thread.messages.push(d.message);
    input.value = '';
    renderThreadMsgs();
    const root = S.messages.find(m => m.id === S.thread.rootId);
    if (root) { root.thread_count = (root.thread_count || 0) + 1; rerenderOne(root.id); }
  } catch (e) { toast(e.message, true); }
}

/* ---------- פולינג ---------- */
function startPolling() {
  stopPolling();
  S.pollTimer = setInterval(async () => {
    if (document.hidden || S.route.view !== 'topic') return;
    await loadMessages(false);
    if (!$('#thread-panel').hidden && S.thread.rootId) {
      const after = S.thread.messages.length ? S.thread.messages[S.thread.messages.length - 1].id : 0;
      try {
        const d = await api(`/api/messages?thread_root=${S.thread.rootId}&after=${after}`);
        const fresh = d.messages.filter(m => !S.thread.messages.some(x => x.id === m.id));
        if (fresh.length) { S.thread.messages.push(...fresh); renderThreadMsgs(); }
      } catch (e) {}
    }
  }, 4000);
}
function stopPolling() { clearInterval(S.pollTimer); S.pollTimer = null; }

/* ---------- לוח עבודה ---------- */
async function renderBoard() {
  setTitle('לוח עבודה', 'משימות, החלטות ורעיונות מכל הנושאים');
  $('#view').innerHTML = `<div class="content"><div class="empty-state">טוען את הלוח...</div></div>`;
  let d;
  try { d = await api('/api/board'); } catch (e) {
    $('#view').innerHTML = `<div class="content"><div class="empty-state">${esc(e.message)}</div></div>`;
    return;
  }
  if (S.route.view !== 'board') return;
  const topicOpts = S.topics.filter(t => !t.archived).map(t => `<option value="${t.id}">${esc(t.name)}</option>`).join('');
  const userOpts = S.users.map(u => `<option value="${u.id}">${esc(u.name)}</option>`).join('');

  $('#view').innerHTML = `
  <div class="content">
    <div>
      <h1 class="display">לוח עבודה</h1>
      <div class="subtitle">כל מה שסומן בשיחות, במקום אחד</div>
    </div>
    <div class="board-filters card" style="padding:12px 16px">
      <span style="font-size:12.5px;color:var(--ink-dim);font-weight:600">סינון:</span>
      <select id="bf-topic"><option value="">כל הנושאים</option>${topicOpts}</select>
      <select id="bf-user"><option value="">כולם</option>${userOpts}</select>
    </div>
    <div class="board-cols" id="board-cols"></div>
  </div>`;

  const draw = () => {
    const ft = +$('#bf-topic').value || 0;
    const fu = $('#bf-user').value || '';
    const flt = arr => arr.filter(m =>
      (!ft || m.topic_id === ft) &&
      (!fu || m.user_id === fu || m.task_assignee === fu));
    const today = dayKey(new Date().toISOString());

    const bItem = (m, actions) => `
      <div class="board-item" data-go="#/topic/${m.topic_id}" data-msg="${m.id}">
        <p>${esc(m.body)}</p>
        <div class="bmeta">
          <span class="dot" style="background:${m.topic_color}"></span>${esc(m.topic_name)}
          · ${esc(userOf(m.user_id).name)} · ${fmtDate(m.created_at)}
          ${m.task_assignee ? `· <b>אחראי: ${esc(userOf(m.task_assignee).name)}</b>` : ''}
          ${m.task_due ? `<span class="due ${m.task_due < today ? 'overdue' : ''}">יעד ${esc(fmtDate(m.task_due + 'T12:00:00Z'))}</span>` : ''}
        </div>
        ${actions ? `<div class="bactions">${actions}</div>` : ''}
      </div>`;

    const tasks = flt(d.openTasks);
    const ideas = flt(d.ideas);
    const decisions = flt(d.decisions);
    const questions = flt(d.questions);
    const done = flt(d.doneTasks);

    $('#board-cols').innerHTML = `
      <div class="board-col">
        <h3>${markIcon('task')}משימות פתוחות<span class="n">${tasks.length}</span></h3>
        ${tasks.map(m => bItem(m, `<button class="btn sm gold" data-done="${m.id}">${I.check.replace('class="icon"', 'class="icon sm"')}בוצעה</button><button class="btn sm light" data-assign="${m.id}">שיוך ויעד</button>`)).join('') || '<div class="empty-state">אין משימות פתוחות</div>'}
        ${done.length ? `<h3 style="margin-top:14px">${I.check}בוצעו לאחרונה<span class="n">${done.length}</span></h3>` + done.slice(0, 6).map(m => bItem(m, `<button class="btn sm light" data-reopen="${m.id}">החזרה לפתוחה</button>`)).join('') : ''}
      </div>
      <div class="board-col">
        <h3>${markIcon('decision')}החלטות<span class="n">${decisions.length}</span></h3>
        ${decisions.map(m => bItem(m)).join('') || '<div class="empty-state">אין עדיין החלטות</div>'}
      </div>
      <div class="board-col">
        <h3>${markIcon('idea')}רעיונות שטרם נבדקו<span class="n">${ideas.length}</span></h3>
        ${ideas.map(m => bItem(m, `<button class="btn sm light" data-checked="${m.id}">${I.check.replace('class="icon"', 'class="icon sm"')}נבדק</button>`)).join('') || '<div class="empty-state">אין רעיונות שממתינים</div>'}
        ${questions.length ? `<h3 style="margin-top:14px">${markIcon('question')}שאלות פתוחות<span class="n">${questions.length}</span></h3>` + questions.map(m => bItem(m, `<button class="btn sm light" data-checked="${m.id}">נענתה</button>`)).join('') : ''}
      </div>`;

    $$('#board-cols .board-item').forEach(el => el.addEventListener('click', () => {
      sessionStorage.setItem('scrollToMsg', el.dataset.msg);
      location.hash = el.dataset.go;
    }));
    const patchAndRedraw = async (id, body) => {
      try {
        await api(`/api/messages/${id}`, { method: 'PATCH', body });
        d = await api('/api/board');
        draw();
      } catch (e) { toast(e.message, true); }
    };
    $$('#board-cols [data-done]').forEach(b => b.onclick = e => { e.stopPropagation(); patchAndRedraw(+b.dataset.done, { task_done: 1 }); });
    $$('#board-cols [data-reopen]').forEach(b => b.onclick = e => { e.stopPropagation(); patchAndRedraw(+b.dataset.reopen, { task_done: 0 }); });
    $$('#board-cols [data-checked]').forEach(b => b.onclick = e => { e.stopPropagation(); patchAndRedraw(+b.dataset.checked, { task_done: 1 }); });
    $$('#board-cols [data-assign]').forEach(b => b.onclick = e => { e.stopPropagation(); openTaskModal(+b.dataset.assign, () => renderBoard()); });
  };
  $('#bf-topic').onchange = draw;
  $('#bf-user').onchange = draw;
  draw();
}

/* ---------- ספריית קבצים ---------- */
async function renderFiles() {
  setTitle('ספריית קבצים', 'כל המסמכים והתמונות של הצוות');
  $('#view').innerHTML = `<div class="content"><div class="empty-state">טוען קבצים...</div></div>`;
  let d;
  try { d = await api('/api/files'); } catch (e) {
    $('#view').innerHTML = `<div class="content"><div class="empty-state">${esc(e.message)}</div></div>`;
    return;
  }
  if (S.route.view !== 'files') return;
  $('#view').innerHTML = `
  <div class="content">
    <div>
      <h1 class="display">ספריית קבצים</h1>
      <div class="subtitle">${d.files.length ? d.files.length + ' קבצים' : 'אין עדיין קבצים'}</div>
    </div>
    <div class="drop" id="lib-drop">
      <div class="ic">${I.upload}</div>
      <div><b>העלאת מסמך או תמונה</b><span>לחיצה או גרירה לכאן. עד 8MB לקובץ. הקובץ זמין לשלושתכם מיד</span></div>
    </div>
    <div class="files-grid wide" id="lib-grid">
      ${d.files.map(fileCard).join('') || `<div class="empty-state" style="grid-column:1/-1">${I.folder}עוד אין קבצים בספרייה.<br>כל קובץ שתצרפו בשיחה או תעלו כאן יופיע ברשימה.</div>`}
    </div>
  </div>`;
  const drop = $('#lib-drop');
  drop.onclick = () => pickLibraryFile();
  wireDrop(drop, f => uploadLibraryFile(f));
}

function pickLibraryFile() { $('#file-input-lib').click(); }
async function uploadLibraryFile(file) {
  if (!file) return;
  try {
    toast('מעלה את ' + file.name + '...');
    const { data, mime } = await prepareFile(file);
    await api('/api/files', { method: 'POST', body: { name: file.name, mime, data } });
    toast('הקובץ עלה לספרייה');
    if (S.route.view === 'files') renderFiles();
    else refreshBootstrap().then(() => { if (S.route.view === 'dash') renderDashboard(); });
  } catch (e) { toast(e.message, true); }
}

/* ---------- ארכיון ---------- */
function renderArchive() {
  setTitle('ארכיון', 'נושאים שהועברו לארכיון');
  const arch = S.topics.filter(t => t.archived);
  $('#view').innerHTML = `
  <div class="content">
    <div><h1 class="display">ארכיון</h1>
    <div class="subtitle">שום דבר לא נמחק באמת. נושא בארכיון אפשר להחזיר בלחיצה.</div></div>
    <div class="card">
      ${arch.length ? `<div class="feed">${arch.map(t => `
        <div class="feed-item">
          <span class="dot" style="background:${t.color};margin-top:8px"></span>
          <div class="txt"><div class="who">${esc(t.name)}</div></div>
          <button class="btn sm light" data-restore="${t.id}">${I.undo.replace('class="icon"', 'class="icon sm"')}החזרה</button>
          <button class="btn sm light" data-open="${t.id}">פתיחה</button>
        </div>`).join('')}</div>`
      : `<div class="empty-state">${I.archive}הארכיון ריק.</div>`}
    </div>
  </div>`;
  $$('#view [data-restore]').forEach(b => b.onclick = async () => {
    try {
      await api(`/api/topics/${b.dataset.restore}`, { method: 'PATCH', body: { archived: 0 } });
      await refreshBootstrap();
      renderArchive();
      toast('הנושא הוחזר');
    } catch (e) { toast(e.message, true); }
  });
  $$('#view [data-open]').forEach(b => b.onclick = () => { location.hash = '#/topic/' + b.dataset.open; });
}

/* ---------- מודאלים ---------- */
function openModal(html) {
  $('#modal-card').innerHTML = html;
  $('#modal-overlay').hidden = false;
}
function closeModal() { $('#modal-overlay').hidden = true; }

function openQuickIdea() {
  const topicOpts = S.topics.filter(t => !t.archived).map(t =>
    `<option value="${t.id}" ${t.name === 'רעיונות' ? 'selected' : ''}>${esc(t.name)}</option>`).join('');
  openModal(`
  <div class="modal-body">
    <div class="modal-title">${I.zap}רעיון מהיר</div>
    <div class="modal-sub">נרשם מיד, מסומן כרעיון, ולא הולך לאיבוד</div>
    <div class="field"><textarea id="qi-body" placeholder="מה עלה לך בראש?" autofocus></textarea></div>
    <div class="field"><label>לאיזה נושא?</label><select id="qi-topic">${topicOpts}</select></div>
    <div class="modal-actions">
      <button class="btn gold" id="qi-send">${I.zap.replace('class="icon"', 'class="icon sm"')}שמירת הרעיון</button>
      <button class="btn light" id="qi-cancel">ביטול</button>
    </div>
  </div>`);
  $('#qi-body').focus();
  $('#qi-cancel').onclick = closeModal;
  $('#qi-body').addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) $('#qi-send').click(); });
  $('#qi-send').onclick = async () => {
    const body = $('#qi-body').value.trim();
    if (!body) return;
    try {
      await api('/api/messages', { method: 'POST', body: { topic_id: +$('#qi-topic').value, body, mark: 'idea' } });
      closeModal();
      toast('הרעיון נשמר');
      refreshBootstrap();
      if (S.route.view === 'topic' && S.topicId === +$('#qi-topic')?.value) loadMessages(false);
    } catch (e) { toast(e.message, true); }
  };
}

function openTopicModal(id) {
  const t = id ? S.topics.find(x => x.id === id) : null;
  const color = t ? t.color : TOPIC_COLORS[S.topics.length % TOPIC_COLORS.length];
  openModal(`
  <div class="modal-body">
    <div class="modal-title">${I.chat}${t ? 'עריכת נושא' : 'נושא חדש'}</div>
    <div class="field"><label>שם הנושא</label><input type="text" id="tp-name" value="${t ? esc(t.name) : ''}" placeholder="למשל: אסטרטגיית מחירים"></div>
    <div class="field"><label>צבע</label><div class="color-row">${TOPIC_COLORS.map(c =>
      `<button class="color-opt ${c === color ? 'selected' : ''}" data-c="${c}" style="background:${c}" aria-label="צבע"></button>`).join('')}</div></div>
    <div class="modal-actions">
      <button class="btn gold" id="tp-save">${t ? 'שמירה' : 'יצירת הנושא'}</button>
      ${t && !t.archived ? `<button class="btn danger" id="tp-arch">${I.archive.replace('class="icon"', 'class="icon sm"')}העברה לארכיון</button>` : ''}
      <button class="btn light" id="tp-cancel">ביטול</button>
    </div>
  </div>`);
  let picked = color;
  $$('#modal-card .color-opt').forEach(b => b.onclick = () => {
    picked = b.dataset.c;
    $$('#modal-card .color-opt').forEach(x => x.classList.toggle('selected', x === b));
  });
  $('#tp-cancel').onclick = closeModal;
  $('#tp-save').onclick = async () => {
    const name = $('#tp-name').value.trim();
    if (!name) return toast('צריך שם לנושא', true);
    try {
      if (t) await api(`/api/topics/${t.id}`, { method: 'PATCH', body: { name, color: picked } });
      else {
        const d = await api('/api/topics', { method: 'POST', body: { name, color: picked } });
        location.hash = '#/topic/' + d.topic.id;
      }
      closeModal();
      await refreshBootstrap();
    } catch (e) { toast(e.message, true); }
  };
  const ar = $('#tp-arch');
  if (ar) ar.onclick = async () => {
    if (!confirm('להעביר את הנושא לארכיון? הוא לא יימחק, ואפשר להחזיר אותו מעמוד הארכיון.')) return;
    try {
      await api(`/api/topics/${t.id}`, { method: 'PATCH', body: { archived: 1 } });
      closeModal();
      if (S.topicId === t.id) location.hash = '#/';
      await refreshBootstrap();
    } catch (e) { toast(e.message, true); }
  };
}

function openTaskModal(mid, onDone) {
  const m = findMsg(mid);
  const userOpts = S.users.map(u => `<option value="${u.id}" ${m && m.task_assignee === u.id ? 'selected' : ''}>${esc(u.name)}</option>`).join('');
  openModal(`
  <div class="modal-body">
    <div class="modal-title">${markIcon('task')}שיוך המשימה</div>
    ${m ? `<div class="modal-sub">"${esc(m.body.slice(0, 80))}"</div>` : ''}
    <div class="field"><label>אחראי</label><select id="tk-user"><option value="">ללא</option>${userOpts}</select></div>
    <div class="field"><label>תאריך יעד</label><input type="date" id="tk-due" value="${m && m.task_due ? m.task_due : ''}"></div>
    <div class="modal-actions">
      <button class="btn gold" id="tk-save">שמירה</button>
      <button class="btn light" id="tk-cancel">ביטול</button>
    </div>
  </div>`);
  $('#tk-cancel').onclick = closeModal;
  $('#tk-save').onclick = async () => {
    try {
      const body = { mark: 'task', task_assignee: $('#tk-user').value || null, task_due: $('#tk-due').value || null };
      if (S.route.view === 'topic') await patchMsg(mid, body);
      else await api(`/api/messages/${mid}`, { method: 'PATCH', body });
      closeModal();
      if (onDone) onDone();
    } catch (e) { toast(e.message, true); }
  };
}

function openExportModal() {
  const topicChecks = S.topics.map(t =>
    `<label class="check-row"><input type="checkbox" class="exp-topic" value="${t.id}" checked> ${esc(t.name)}${t.archived ? ' (ארכיון)' : ''}</label>`).join('');
  openModal(`
  <div class="modal-body">
    <div class="modal-title">${I.sparkles}ייצוא המערכת</div>
    <div class="modal-sub">הקובץ כולל סיכום החלטות, משימות ורעיונות בראשו, ואז את כל השיחות לפי סדר זמן</div>
    <div class="field"><label>פורמט</label>
      <select id="exp-format">
        <option value="md">Markdown, מוכן להעלאה לקלוד או לגרוק</option>
        <option value="json">JSON מובנה</option>
      </select>
    </div>
    <div class="field"><label>נושאים</label><div class="topics-check">${topicChecks}</div></div>
    <div class="field" style="display:flex;gap:10px">
      <div style="flex:1"><label>מתאריך</label><input type="date" id="exp-from"></div>
      <div style="flex:1"><label>עד תאריך</label><input type="date" id="exp-to"></div>
    </div>
    <div class="modal-actions">
      <button class="btn gold" id="exp-go">${I.download.replace('class="icon"', 'class="icon sm"')}הורדת הקובץ</button>
      <button class="btn light" id="exp-cancel">ביטול</button>
    </div>
  </div>`);
  $('#exp-cancel').onclick = closeModal;
  $('#exp-go').onclick = () => {
    const all = $$('.exp-topic');
    const sel = all.filter(c => c.checked).map(c => c.value);
    runExport({
      format: $('#exp-format').value,
      topics: sel.length === all.length ? '' : sel.join(','),
      from: $('#exp-from').value,
      to: $('#exp-to').value,
    });
    closeModal();
  };
}

async function runExport(p) {
  try {
    toast('מכין את הקובץ...');
    const qs = new URLSearchParams();
    qs.set('format', p.format || 'md');
    if (p.topics) qs.set('topics', p.topics);
    if (p.from) qs.set('from', p.from);
    if (p.to) qs.set('to', p.to);
    const blob = await api('/api/export?' + qs.toString());
    const a = document.createElement('a');
    const date = new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date());
    a.href = URL.createObjectURL(blob);
    a.download = `ihud-hametavchim-${date}.${p.format === 'json' ? 'json' : 'md'}`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast('הקובץ ירד. אפשר להעלות אותו ישירות לעוזר ה-AI');
  } catch (e) { toast(e.message, true); }
}

/* ---------- חיפוש ---------- */
function openSearch() {
  $('#search-overlay').hidden = false;
  renderSearchFilters();
  $('#search-input').focus();
}
function closeSearch() { $('#search-overlay').hidden = true; }

function renderSearchFilters() {
  const f = S.searchFilters;
  const topicOpts = S.topics.map(t => `<option value="${t.id}" ${f.topic_id == t.id ? 'selected' : ''}>${esc(t.name)}</option>`).join('');
  const userOpts = S.users.map(u => `<option value="${u.id}" ${f.user_id === u.id ? 'selected' : ''}>${esc(u.name)}</option>`).join('');
  $('#search-filters').innerHTML = `
    <select id="sf-topic"><option value="">כל הנושאים</option>${topicOpts}</select>
    <select id="sf-user"><option value="">כל השולחים</option>${userOpts}</select>
    <select id="sf-mark">
      <option value="">כל הסימונים</option>
      <option value="idea" ${f.mark === 'idea' ? 'selected' : ''}>רעיונות</option>
      <option value="decision" ${f.mark === 'decision' ? 'selected' : ''}>החלטות</option>
      <option value="task" ${f.mark === 'task' ? 'selected' : ''}>משימות</option>
      <option value="question" ${f.mark === 'question' ? 'selected' : ''}>שאלות</option>
    </select>
    <input type="date" id="sf-from" value="${f.from || ''}" title="מתאריך">
    <input type="date" id="sf-to" value="${f.to || ''}" title="עד תאריך">
    <button class="filter-toggle ${f.has_file ? 'on' : ''}" id="sf-file">עם קובץ</button>
    <button class="filter-toggle ${f.open_tasks ? 'on' : ''}" id="sf-open">משימות פתוחות</button>`;
  const upd = () => {
    S.searchFilters = {
      topic_id: $('#sf-topic').value,
      user_id: $('#sf-user').value,
      mark: $('#sf-mark').value,
      from: $('#sf-from').value,
      to: $('#sf-to').value,
      has_file: f.has_file,
      open_tasks: f.open_tasks,
    };
    doSearch();
  };
  ['sf-topic', 'sf-user', 'sf-mark', 'sf-from', 'sf-to'].forEach(id => $('#' + id).onchange = upd);
  $('#sf-file').onclick = () => { f.has_file = !f.has_file; renderSearchFilters(); doSearch(); };
  $('#sf-open').onclick = () => { f.open_tasks = !f.open_tasks; renderSearchFilters(); doSearch(); };
}

async function doSearch() {
  const q = $('#search-input').value.trim();
  const f = S.searchFilters;
  const hasAny = q || f.topic_id || f.user_id || f.mark || f.from || f.to || f.has_file || f.open_tasks;
  const w = $('#search-results');
  if (!hasAny) {
    w.innerHTML = '<div class="empty-state">הקלד מילה כדי לחפש, או סנן לפי נושא, שולח, תאריך או סימון.</div>';
    return;
  }
  const qs = new URLSearchParams();
  if (q) qs.set('q', q);
  if (f.topic_id) qs.set('topic_id', f.topic_id);
  if (f.user_id) qs.set('user_id', f.user_id);
  if (f.mark) qs.set('mark', f.mark);
  if (f.from) qs.set('from', f.from);
  if (f.to) qs.set('to', f.to);
  if (f.has_file) qs.set('has_file', '1');
  if (f.open_tasks) qs.set('open_tasks', '1');
  try {
    const d = await api('/api/search?' + qs.toString());
    if (!d.results.length) {
      w.innerHTML = '<div class="empty-state">לא נמצאו תוצאות. נסה מילה אחרת או פחות סינונים.</div>';
      return;
    }
    const hi = text => {
      let h = esc(text);
      if (q) {
        try { h = h.replace(new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi'), '<mark>$1</mark>'); } catch (e) {}
      }
      return h;
    };
    w.innerHTML = d.results.map(r => `
      <div class="result" data-topic="${r.topic_id}" data-mid="${r.thread_root_id || r.id}">
        <div class="avatar" style="background:${userOf(r.user_id).color}">${initial(r.user_id)}</div>
        <div class="txt">
          <div class="who">${esc(userOf(r.user_id).name)}<small>${fmtDate(r.created_at)} · ${fmtTime(r.created_at)}</small></div>
          <p>${hi(r.body)}</p>
          <div class="where"><span class="dot" style="background:${r.topic_color}"></span>${esc(r.topic_name)}${r.thread_root_id ? ' · בשרשור' : ''}${r.mark ? ' · ' + (MARKS[r.mark] || {}).he : ''}</div>
        </div>
      </div>`).join('');
    w.querySelectorAll('.result').forEach(el => el.onclick = () => {
      closeSearch();
      sessionStorage.setItem('scrollToMsg', el.dataset.mid);
      const target = '#/topic/' + el.dataset.topic;
      if (location.hash === target) onRoute(); else location.hash = target;
    });
  } catch (e) { w.innerHTML = `<div class="empty-state">${esc(e.message)}</div>`; }
}

/* ---------- אירועים גלובליים ---------- */
function wireGlobal() {
  renderLogin();
  $('#login-btn').onclick = doLogin;
  $('#login-pass').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });

  $('#btn-logout').onclick = () => { if (confirm('להתנתק מהמערכת?')) doLogout(); };
  $('#btn-menu').onclick = () => { $('#sidebar').classList.add('open'); $('#backdrop').classList.add('show'); };
  $('#backdrop').onclick = closeDrawer;
  $('#btn-new-topic').onclick = e => { e.preventDefault(); openTopicModal(0); };
  $('#fab').onclick = openQuickIdea;
  $('#search-box').onclick = openSearch;
  $('#btn-search-m').onclick = openSearch;
  $('#search-close').onclick = closeSearch;
  $('#search-input').addEventListener('input', () => {
    clearTimeout(S.searchTimer);
    S.searchTimer = setTimeout(doSearch, 280);
  });
  $('#thread-close').onclick = closeThread;
  $('#thread-send').onclick = sendThreadMsg;
  $('#thread-input').addEventListener('keydown', e => { if (e.key === 'Enter') sendThreadMsg(); });

  $('#modal-overlay').addEventListener('click', e => { if (e.target === $('#modal-overlay')) closeModal(); });
  $('#search-overlay').addEventListener('click', e => { if (e.target === $('#search-overlay')) closeSearch(); });

  $('#file-input').addEventListener('change', e => { onChatFile(e.target.files[0]); e.target.value = ''; });
  $('#file-input-lib').addEventListener('change', e => { uploadLibraryFile(e.target.files[0]); e.target.value = ''; });

  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); if (S.token) openSearch(); }
    if (e.key === 'Escape') {
      if (!$('#modal-overlay').hidden) closeModal();
      else if (!$('#search-overlay').hidden) closeSearch();
      else if (!$('#thread-panel').hidden) closeThread();
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && S.token && S.route.view === 'topic') loadMessages(false);
  });
}

/* ---------- התחלה ---------- */
wireGlobal();
if (S.token && S.me) {
  enterApp().catch(() => doLogout(false));
} else {
  $('#login-screen').hidden = false;
  $('#footer').hidden = false;
}
