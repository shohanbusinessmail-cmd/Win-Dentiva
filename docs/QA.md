# QA checklist

## Automated checks

- `npm test` — calculation, payment, identifier, backup, filename, and password tests.
- `npm run lint` — JavaScript syntax for renderer, preload, and main process.

## Manual smoke test

Use a fresh profile or clear the browser preview localStorage.

- [ ] First-run setup rejects missing clinic name.
- [ ] First-run setup rejects weak or mismatched passwords.
- [ ] Setup persists after restart.
- [ ] Dashboard opens with no fake content.
- [ ] New patient receives a unique code.
- [ ] Patient directory search finds name, ID, phone, and email.
- [ ] Patient profile shows a private overview and empty visit timeline.
- [ ] Appointment creation requires a patient and shows in calendar and queue.
- [ ] Queue advances scheduled → arrived → consultation → completed.
- [ ] Clinical visit adds a dated timeline entry and follow-up.
- [ ] Prescription records only user-entered medicine details and prints.
- [ ] Treatment catalog can add and edit a procedure.
- [ ] Invoice calculates quantity, discount, tax, total, paid, and due.
- [ ] Payment creates an append-only transaction and partial status.
- [ ] Expenses remain in Finance and do not appear on clinical dashboard.
- [ ] Staff, referral, and document metadata records can be created.
- [ ] CSV exports open with correct headers.
- [ ] Backup writes or downloads a versioned Dentiva payload.
- [ ] Restore rejects unrelated JSON and warns before replacement.
- [ ] Lock/unlock rejects the wrong password and accepts the right password.
- [ ] English/Bengali switching updates navigation immediately.
- [ ] Sidebar collapsed preference persists.
- [ ] Print windows are readable and have no overlapping content.
- [ ] Application close/reopen retains records.

## Invalid-input and security checks

- [ ] Empty required fields are rejected by form constraints.
- [ ] Negative invoice/payment/expense values are rejected by `min` attributes and calculation guards.
- [ ] Long notes remain in a scrollable textarea and do not overlap cards.
- [ ] Unsafe attachment names are normalized by the core helper.
- [ ] Patient details are not exposed in the patient list beyond necessary contact fields.
- [ ] Renderer has no direct Node integration.
- [ ] SQL statements in the desktop schema are static/parameterized.
- [ ] Destructive deletion requires confirmation and is audited.

## Responsive inspection

Inspect at 1280×720, 1366×768, 1600×900, 1920×1080, and 2560×1440. At narrow widths, confirm the sidebar drawer, single-column content, controlled table scroll boundary, and reachable action buttons. The design uses a light theme independent of OS theme.

## Release gate

Do not ship until the intended Windows build has been created on a Windows or Wine-capable runner, the installer has been installed on a clean Windows profile, the portable executable has launched, and the manual smoke test above has passed.
