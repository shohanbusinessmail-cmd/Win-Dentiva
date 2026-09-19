# Release procedure

1. Update `version` in `package.json` and add a `CHANGELOG.md` entry.
2. Run `npm install` on the release runner.
3. Run `npm test` and `npm run lint`.
4. Run the manual checklist in `docs/QA.md` using a clean Windows user profile.
5. Run `npm run dist:win` on Windows or a Linux runner with Wine and the Electron Builder dependencies available.
6. Inspect the NSIS installer and portable `.exe` in `release/`.
7. Install the NSIS build into a clean Windows VM or sandbox.
8. Verify that the Dentiva icon, window title, Start Menu shortcut, desktop shortcut, first-run wizard, persistence, backup, restore, PDF/print handoff, and language switch work.
9. Verify that `release/` is not committed to Git; it is a local delivery artifact.
10. Tag the release and publish the installer through the connected GitHub repository if the project owner requests it.

## Artifact naming

- `Dentiva-<version>-Setup.exe` — assisted installer.
- `Dentiva-<version>-Portable.exe` — portable single-user build.

The application keeps local workspace data across uninstall by default so uninstalling the shell does not silently destroy patient data. A user must use the in-app backup and restore workflow before moving a clinic to a different computer.
