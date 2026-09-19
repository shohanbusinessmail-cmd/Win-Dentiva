# Dentiva architecture

## Product shape

Dentiva is a single-user/local-workspace desktop application. The renderer is a dependency-light HTML/CSS/JavaScript application inside a hardened Electron shell. Core workflows are local and do not call a network service.

### Boundaries

1. **Renderer** — screens, forms, validation messages, localization, responsive layout, and interaction state.
2. **Preload bridge** — the only renderer-to-main boundary. It exposes `load`, `save`, local password hashing, system information, backup dialogs, file opening, and printing.
3. **Main process** — window lifecycle, local persistence, backup file I/O, native dialogs, printer hand-off, logging, and crash-safe error capture.
4. **Storage** — SQLite when the native module is available; an atomic JSON workspace fallback is used when it is not. Browser preview intentionally uses localStorage only.

The renderer cannot access `fs`, `path`, shell commands, or the database directly.

## Data model

The SQLite schema creates these normalized tables and indexes:

- `schema_migrations`
- `app_state`
- `clinics`
- `users`
- `patients`
- `appointments`
- `visits`
- `treatments`
- `prescriptions`
- `invoices`
- `payments`
- `expenses`
- `staff`
- `documents`
- `referrals`
- `audit_log`

Foreign keys use restrictive deletion for patient-linked clinical, billing, and document records. Important lookup paths are indexed by patient name, phone, appointment date/status, visit date, invoice date, and audit date. SQLite is opened with foreign keys enabled and WAL journaling when the native module is loaded.

The renderer maintains a single application snapshot for a predictable offline UX. The desktop save boundary writes the snapshot transactionally to `app_state` and refreshes the normalized clinical/index tables in one transaction. This keeps backup and restore simple while retaining a relational schema for integrity checks and future query/pagination work.

## Safety rules

- Patient identifiers are generated from a configurable prefix plus a zero-padded monotonic number.
- Financial payments are appended; invoice history is not rewritten when a payment is added.
- Clinical visits are dated records and are not silently replaced.
- Backup payloads have an explicit format marker, schema version, app version, timestamp, clinic metadata, and complete state.
- File names are sanitized before any future attachment path is opened.
- Renderer errors are user-facing and concise; technical failures are logged by `electron-log`.

## UI system

The visual system is intentionally light-only: white surfaces, soft neutral canvas, refined teal accent, subtle borders, controlled shadows, and one coherent inline SVG icon language. Layouts use constrained grids, flexible columns, tables inside a single horizontal scroll boundary, and responsive breakpoints for laptop, standard monitor, and narrow viewport sizes.

The dashboard is clinical/operational rather than financial. Finance is a separate navigation area. Empty workspaces show honest empty states and do not ship with example records.

## Localization

Navigation and system strings are sourced from `translations` in `src/app.js`. English is the default. Bengali can be switched without restarting the app. User-entered names, notes, and clinical terms are never machine-transformed.

## Build and deployment

Electron Builder is configured for:

- x64 Windows NSIS installer
- x64 Windows portable executable
- application icon and desktop / Start Menu shortcuts
- local app data retained on uninstall

The packaged app expects no Node, Python, SDK, database server, or developer tools on the end-user machine.
