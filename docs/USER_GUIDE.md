# Dentiva user guide

## First launch

1. Enter the clinic or dental care name and lead dentist.
2. Create the local administrator name, username, and password. Use at least eight characters.
3. Choose English or বাংলা, currency, patient ID prefix, invoice prefix, and the default appointment duration.
4. Select **Finish setup**. Dentiva opens an empty clinical dashboard.

There is no sample or fake data. Everything in the workspace is entered by your clinic.

## Daily workflow

### Check-in and queue

- Open **Queue / Today**.
- Use **Add walk-in** for an unscheduled arrival or select an appointment in the list.
- Move a patient through **Mark arrived → Start visit → Complete**.
- **Call next** moves the earliest active patient to consultation.

### Create a patient

Open **Patients → New patient**. Add the identity and contact information first. Sensitive medical context is stored on the profile and not exposed in the directory table. The patient receives a unique code such as `DTV-000001`.

### Record the clinical visit

From the dashboard, Queue, or a patient profile, choose **Record visit**. Add chief complaint, examination findings, diagnosis, treatment plan, clinical notes, and follow-up date. Visit entries are dated and remain visible in the timeline.

### Prescriptions

Choose **Prescriptions → New prescription**. Dentiva records exactly what the dentist enters; it does not make medical recommendations. Use **Print** from the prescription list for a clean print layout.

### Billing

Create an invoice in **Invoices & payments**. Record a payment separately. The invoice shows total, paid, due, and status. Payments are added to history and are not destructive edits.

### Appointments

Appointments can be created for a patient with date, time, type, duration, and notes. The status menu allows confirm, arrived, complete, no-show, and cancel. The original record remains available in the audit history.

## Settings

- **Clinic profile:** printed identity and contact details.
- **Appearance:** accent color and sidebar preference. Theme remains light-only.
- **Language:** English or Bengali.
- **Patient IDs:** configurable prefix for new patients.
- **Billing:** currency and invoice/receipt prefixes.
- **Security:** session timeout preferences and local authentication guidance.

## Reports and exports

Reports are separated from daily clinical operations. Use the Reports page for activity and finance overview. Patient and audit tables can be exported to CSV. Exports are created on demand and are not sent to a cloud service.

## Privacy

Dentiva is local-first. The core clinic workflow works without internet and the product has no analytics, patient-data training, or external AI dependency. Lock the workspace when leaving a shared workstation.

## Language

Switch language in **Settings → Language**. Restarting is not required. Clinic names and patient-entered data remain exactly as entered.
