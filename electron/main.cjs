const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const log = require('electron-log');

let Database;
try { Database = require('better-sqlite3'); } catch (error) { log.error('SQLite module unavailable', error); }
let db;
let jsonStatePath;
const emptyState = () => ({ clinic: null, user: null, patients: [], appointments: [], visits: [], treatments: [], prescriptions: [], invoices: [], payments: [], expenses: [], staff: [], documents: [], referrals: [], audit: [], settings: { language: 'en', currency: 'BDT', sidebarCollapsed: false, density: 'comfortable', accent: 'teal', dashboardRange: 'today', patientIdPrefix: 'DTV', invoicePrefix: 'INV', receiptPrefix: 'RCT', nextPatientNumber: 1, nextInvoiceNumber: 1, nextReceiptNumber: 1, backupPath: '', autoBackup: false, sessionTimeout: 30 } });

function openDatabase() {
  const dir = app.getPath('userData');
  fs.mkdirSync(dir, { recursive: true });
  jsonStatePath = path.join(dir, 'dentiva-data.json');
  if (!Database) return null;
  db = new Database(path.join(dir, 'dentiva.sqlite'));
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS app_state (id INTEGER PRIMARY KEY CHECK (id = 1), payload TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS clinics (id INTEGER PRIMARY KEY, name TEXT NOT NULL, dentist_name TEXT, phone TEXT, email TEXT, address TEXT, country TEXT, logo_path TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT NOT NULL UNIQUE, display_name TEXT NOT NULL, role TEXT NOT NULL, password_hash TEXT NOT NULL, password_salt TEXT NOT NULL, created_at TEXT NOT NULL, last_login_at TEXT);
    CREATE TABLE IF NOT EXISTS patients (id INTEGER PRIMARY KEY, patient_code TEXT NOT NULL UNIQUE, full_name TEXT NOT NULL, preferred_name TEXT, date_of_birth TEXT, gender TEXT, phone TEXT, email TEXT, medical_alerts TEXT, archived INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS appointments (id INTEGER PRIMARY KEY, patient_id INTEGER REFERENCES patients(id) ON DELETE RESTRICT, starts_at TEXT NOT NULL, duration INTEGER NOT NULL DEFAULT 30, type TEXT, status TEXT NOT NULL, notes TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS visits (id INTEGER PRIMARY KEY, patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE RESTRICT, visited_at TEXT NOT NULL, chief_complaint TEXT, diagnosis TEXT, findings TEXT, treatment_plan TEXT, follow_up_date TEXT, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS treatments (id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE, category TEXT, price REAL NOT NULL DEFAULT 0, duration INTEGER NOT NULL DEFAULT 30, active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS prescriptions (id INTEGER PRIMARY KEY, patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE RESTRICT, prescribed_at TEXT NOT NULL, items_json TEXT NOT NULL, notes TEXT, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS invoices (id INTEGER PRIMARY KEY, invoice_number TEXT NOT NULL UNIQUE, patient_id INTEGER REFERENCES patients(id) ON DELETE RESTRICT, issued_at TEXT NOT NULL, subtotal REAL NOT NULL DEFAULT 0, discount REAL NOT NULL DEFAULT 0, tax REAL NOT NULL DEFAULT 0, total REAL NOT NULL DEFAULT 0, status TEXT NOT NULL, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS payments (id INTEGER PRIMARY KEY, invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE RESTRICT, amount REAL NOT NULL CHECK(amount > 0), paid_at TEXT NOT NULL, method TEXT NOT NULL, reference TEXT, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS expenses (id INTEGER PRIMARY KEY, spent_at TEXT NOT NULL, category TEXT NOT NULL, amount REAL NOT NULL CHECK(amount >= 0), method TEXT, description TEXT, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS staff (id INTEGER PRIMARY KEY, staff_code TEXT NOT NULL UNIQUE, name TEXT NOT NULL, role TEXT NOT NULL, phone TEXT, email TEXT, status TEXT NOT NULL DEFAULT 'Active', created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS documents (id INTEGER PRIMARY KEY, patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE RESTRICT, file_name TEXT NOT NULL, storage_path TEXT NOT NULL, mime_type TEXT, size_bytes INTEGER, category TEXT, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS referrals (id INTEGER PRIMARY KEY, patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE RESTRICT, referral_date TEXT NOT NULL, provider TEXT, specialty TEXT, reason TEXT, return_date TEXT, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS audit_log (id INTEGER PRIMARY KEY, actor TEXT NOT NULL, action TEXT NOT NULL, entity TEXT NOT NULL, entity_id TEXT, details TEXT, created_at TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(full_name COLLATE NOCASE);
    CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
    CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(starts_at);
    CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
    CREATE INDEX IF NOT EXISTS idx_visits_patient_date ON visits(patient_id, visited_at);
    CREATE INDEX IF NOT EXISTS idx_invoices_patient_date ON invoices(patient_id, issued_at);
    CREATE INDEX IF NOT EXISTS idx_audit_date ON audit_log(created_at);
  `);
}
function readState() {
  if (!db) {
    try { return { ...emptyState(), ...(jsonStatePath && fs.existsSync(jsonStatePath) ? JSON.parse(fs.readFileSync(jsonStatePath, 'utf8')) : {}) }; } catch (error) { log.error('Could not read local workspace', error); return emptyState(); }
  }
  const row = db.prepare('SELECT payload FROM app_state WHERE id = 1').get();
  if (!row) return emptyState();
  try { return { ...emptyState(), ...JSON.parse(row.payload) }; } catch { return emptyState(); }
}
function writeState(state) {
  if (!db) {
    const tmp = `${jsonStatePath}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(state, null, 2), { encoding: 'utf8', mode: 0o600 });
    fs.renameSync(tmp, jsonStatePath);
    return;
  }
  const now = new Date().toISOString();
  const payload = JSON.stringify(state);
  const tx = db.transaction(() => {
    db.prepare(`INSERT INTO app_state (id,payload,updated_at) VALUES (1,?,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at`).run(payload, now);
    if (state.clinic) db.prepare(`INSERT INTO clinics (id,name,dentist_name,phone,email,address,country,logo_path,created_at,updated_at) VALUES (1,@name,@dentistName,@phone,@email,@address,@country,@logoPath,@createdAt,@updatedAt) ON CONFLICT(id) DO UPDATE SET name=excluded.name,dentist_name=excluded.dentist_name,phone=excluded.phone,email=excluded.email,address=excluded.address,country=excluded.country,logo_path=excluded.logo_path,updated_at=excluded.updated_at`).run({ ...state.clinic, createdAt: state.clinic.createdAt || now, updatedAt: now });
    db.prepare('DELETE FROM patients').run();
    const insertPatient = db.prepare(`INSERT INTO patients (id,patient_code,full_name,preferred_name,date_of_birth,gender,phone,email,medical_alerts,archived,created_at,updated_at) VALUES (@id,@patientCode,@fullName,@preferredName,@dateOfBirth,@gender,@phone,@email,@medicalAlerts,@archived,@createdAt,@updatedAt)`);
    for (const p of state.patients || []) insertPatient.run({ id: p.id, patientCode: p.patientCode, fullName: p.fullName, preferredName: p.preferredName || '', dateOfBirth: p.dateOfBirth || '', gender: p.gender || '', phone: p.phone || '', email: p.email || '', medicalAlerts: p.medicalAlerts || '', archived: p.archived ? 1 : 0, createdAt: p.createdAt || now, updatedAt: now });
    db.prepare('DELETE FROM appointments').run();
    const insertAppt = db.prepare(`INSERT INTO appointments (id,patient_id,starts_at,duration,type,status,notes,created_at,updated_at) VALUES (@id,@patientId,@startsAt,@duration,@type,@status,@notes,@createdAt,@updatedAt)`);
    for (const a of state.appointments || []) insertAppt.run({ id: a.id, patientId: a.patientId || null, startsAt: a.startsAt, duration: a.duration || 30, type: a.type || '', status: a.status || 'Scheduled', notes: a.notes || '', createdAt: a.createdAt || now, updatedAt: now });
    db.prepare('DELETE FROM audit_log').run();
    const insertAudit = db.prepare(`INSERT INTO audit_log (id,actor,action,entity,entity_id,details,created_at) VALUES (@id,@actor,@action,@entity,@entityId,@details,@createdAt)`);
    for (const item of state.audit || []) insertAudit.run({ id: item.id, actor: item.actor || 'Administrator', action: item.action, entity: item.entity, entityId: String(item.entityId || ''), details: item.details || '', createdAt: item.createdAt || now });
  });
  tx();
}
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) { return { salt, hash: crypto.scryptSync(password, salt, 64).toString('hex') }; }

function createWindow() {
  const win = new BrowserWindow({
    width: 1440, height: 920, minWidth: 1100, minHeight: 720,
    backgroundColor: '#f4f8f8',
    title: 'Dentiva',
    icon: path.join(__dirname, '..', 'assets', 'dentiva.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: false }
  });
  win.removeMenu();
  win.loadFile(path.join(__dirname, '..', 'src', 'index.html'));
  if (process.env.DENTIVA_DEVTOOLS === '1') win.webContents.openDevTools({ mode: 'detach' });
}

app.whenReady().then(() => {
  openDatabase();
  ipcMain.handle('state:load', () => readState());
  ipcMain.handle('state:save', (_event, state) => { writeState(state); return { ok: true }; });
  ipcMain.handle('security:hash', (_event, password) => hashPassword(password));
  ipcMain.handle('system:info', () => ({ version: app.getVersion(), platform: process.platform, userData: app.getPath('userData'), freeSpace: null }));
  ipcMain.handle('dialog:saveBackup', async (_event, payload) => {
    const result = await dialog.showSaveDialog({ title: 'Export Dentiva backup', defaultPath: `Dentiva-backup-${new Date().toISOString().slice(0,10)}.dentiva.json`, filters: [{ name: 'Dentiva backup', extensions: ['json'] }] });
    if (result.canceled || !result.filePath) return { canceled: true };
    fs.writeFileSync(result.filePath, JSON.stringify(payload, null, 2), { encoding: 'utf8', mode: 0o600 });
    return { canceled: false, filePath: result.filePath };
  });
  ipcMain.handle('dialog:openBackup', async () => {
    const result = await dialog.showOpenDialog({ title: 'Restore Dentiva backup', properties: ['openFile'], filters: [{ name: 'Dentiva backup', extensions: ['json'] }] });
    if (result.canceled || !result.filePaths[0]) return { canceled: true };
    const raw = fs.readFileSync(result.filePaths[0], 'utf8');
    return { canceled: false, filePath: result.filePaths[0], payload: JSON.parse(raw) };
  });
  ipcMain.handle('file:open', async (_event, target) => { if (typeof target !== 'string') return false; return shell.openPath(target); });
  ipcMain.handle('print:window', async (event, options = {}) => new Promise(resolve => { const wc = event.sender; wc.print({ silent: false, printBackground: true, deviceName: options.deviceName || '', copies: options.copies || 1 }, success => resolve({ success })); }));
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
process.on('uncaughtException', error => log.error(error));
process.on('unhandledRejection', error => log.error(error));
