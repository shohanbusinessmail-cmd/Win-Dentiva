# Backup and restore

## Recommended routine

Create a backup at the end of a workday or before a large configuration change. Keep at least one recent copy on a separate external drive. Dentiva never silently deletes old patient records or old backup files.

## Create a backup

1. Open **Backup & restore**.
2. Choose **Back up now**.
3. Select a private local folder or external drive in the native save dialog.
4. Keep the generated `.dentiva.json` file. It contains a format marker, version, timestamp, clinic metadata, settings, audit history, and workspace records.

Backup files may contain sensitive patient information. Treat them like clinical records.

## Restore

1. Create a fresh backup of the current workspace first.
2. Choose **Restore from backup → Choose backup**.
3. Select a Dentiva backup file.
4. Review the warning and confirm only when the selected file is known to be correct.

Restore replaces the current workspace with the verified backup payload. A malformed or unrelated JSON file is rejected before replacement.

## Verification

Dentiva validates the backup marker, schema version, settings object, and patient collection before restore. The desktop storage layer writes a temporary file and renames it into place for crash-safe local JSON fallback writes. SQLite deployments use WAL journaling and foreign-key enforcement.

## Moving a clinic to another Windows computer

1. Install the same or newer Dentiva version.
2. Complete the minimum first-run setup if prompted.
3. Restore the backup from the external drive.
4. Confirm the clinic identity, patient count, and latest audit entries.
5. Create a new backup on the new computer.

Attachment files should be moved using the same protected folder strategy as the database. Do not open or execute an uploaded file from an untrusted source.
