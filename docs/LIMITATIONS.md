# Release notes and known limitations

Dentiva 1.0.0 is a strong local-first clinic foundation with working first-run setup, patient/appointment/queue/clinical/prescription/billing/reporting/staff/backup workflows. The following are intentionally explicit so the release is not mistaken for a hospital-scale or regulated EHR:

- The current attachment flow registers safe file metadata; a full managed binary attachment vault with copy/move/preview and configurable per-file size enforcement should be completed before a clinic uses Dentiva as its only document repository.
- Printing uses the native Windows print workflow / Save as PDF hand-off rather than shipping a separate PDF rendering engine. A Windows printer or PDF printer must be available for physical/PDF output.
- The odontogram/tooth chart is not included in this release; clinical findings remain structured notes. It should only be added with a validated chart component and clinician review.
- Role-based multi-user permissions beyond the local administrator account are scaffolded in the data model but not exposed as a complete production feature.
- The browser preview is for design and QA only. It uses localStorage and should not be used for a clinic deployment.
- A Windows installer/portable build must be produced on a Windows or Wine-capable release runner because this Linux workspace could not download the Electron runtime artifact due to its certificate/network policy.

These are documented constraints, not hidden demo behavior. The application is designed so each capability can be expanded without changing the core patient identifiers or audit model.
