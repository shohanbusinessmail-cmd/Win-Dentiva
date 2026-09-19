# Dentiva

**Dentiva — Advanced Premium Flagship Dental Clinic Management System**

Dentiva is a local-first Windows desktop workspace for dental practices. It brings the front desk, chair-side clinical record, billing, reporting, staff, attachments, and backup workflows into one calm, deliberately lightweight application.

- **Offline-first:** patient care, appointments, queue, clinical records, prescriptions, billing, reports, and backups do not require the internet.
- **Privacy by design:** no telemetry, no patient-data analytics, no AI service, and no paid cloud dependency.
- **Windows-ready:** Electron shell, native dialogs, local storage, printer hand-off, branded application icon, and NSIS/portable release targets.
- **Language:** English is the default; Bengali (বাংলা) is available at runtime.
- **Theme:** premium light theme only, with an intentionally restrained accent palette.

## Development

Requirements:

- Node.js 20 or newer
- npm 10 or newer

```bash
npm install
npm test
npm run lint
npm start
```

For a browser-only preview (useful on Linux or in a CI environment without Electron’s binary):

```bash
npm run preview
# open http://localhost:4173
```

The first-run wizard intentionally starts with an empty workspace. Do not put sample patients, invoices, or appointments into source control.

## Release builds

The package is configured for self-contained x64 Windows builds:

```bash
npm run dist:win
```

This produces a versioned NSIS installer and portable executable in `release/`. A directory build, useful for smoke-testing the packaged application, is available with:

```bash
npm run dist:dir
```

The Windows release uses `assets/dentiva.ico` and includes desktop and Start Menu shortcuts. On Linux, cross-compiling the NSIS target requires a working Wine installation; build on Windows or a Windows CI runner if Wine is unavailable.

## Repository map

```text
assets/                 Dentiva icon in SVG, PNG and multi-resolution ICO forms
electron/main.cjs       Desktop window, IPC, dialogs, backup and persistence boundary
electron/preload.cjs    Minimal context-isolated desktop API
src/index.html          Desktop shell and first-run surfaces
src/styles.css          Dentiva design system and responsive layouts
src/app.js              UI, workflows, localization, validation and browser fallback
src/core.cjs            Testable safety-critical calculation helpers
tests/                  Node test suite
scripts/                Preview server and release helpers
docs/                   Architecture, user, backup and QA documentation
```

## Persistence

The Electron boundary attempts to use SQLite with WAL journaling, foreign keys, constraints, indexes, and relational tables when the optional `better-sqlite3` native module is available. In constrained environments where a native module cannot be loaded, Dentiva uses an atomic, permission-restricted local JSON workspace file rather than silently losing data. The browser preview uses localStorage and is not a supported clinic deployment.

All writes pass through one state boundary. The packaged app does not expose Node APIs to the renderer; the preload bridge only exposes explicitly required operations.

## Security notes

- Administrator passwords are hashed with `scrypt` in the desktop build and salted SHA-256 in the browser preview.
- Renderer JavaScript runs with `contextIsolation` and `nodeIntegration: false`.
- Uploaded file metadata is tracked; the app does not execute uploaded files.
- Destructive actions use confirmation and are written to the audit trail.
- Backups are explicit exports; restore requires confirmation.
- Sensitive clinical details are not shown in the patient table.

## Testing

The current automated suite exercises queue transitions, invoice totals, partial payment status, identifier normalization, backup validation, filename safety, and password hashing:

```bash
npm test
```

For manual QA, follow [`docs/QA.md`](docs/QA.md). For normal clinic operation, follow [`docs/USER_GUIDE.md`](docs/USER_GUIDE.md).

## Product information

Created by **Md. Shohan Khan**  
Email: **helloiamshohan@gmail.com**  
WhatsApp: **01516591935**

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), [`docs/BACKUP_RESTORE.md`](docs/BACKUP_RESTORE.md), [`docs/RELEASE.md`](docs/RELEASE.md), and [`CHANGELOG.md`](CHANGELOG.md) for the implementation and release notes.
