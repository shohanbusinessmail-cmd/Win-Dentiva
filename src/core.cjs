const crypto = require('node:crypto');

const STATUS_FLOW = { Scheduled: 'Arrived', Arrived: 'In Consultation', Waiting: 'In Consultation', 'In Consultation': 'Completed' };
function nextQueueStatus(status) { return STATUS_FLOW[status] || status; }
function invoiceTotals(items = [], discount = 0, tax = 0) {
  const subtotal = items.reduce((sum, item) => sum + Math.max(0, Number(item.quantity || 0)) * Math.max(0, Number(item.unitPrice || 0)), 0);
  return { subtotal, discount: Math.max(0, Number(discount || 0)), tax: Math.max(0, Number(tax || 0)), total: Math.max(0, subtotal - Number(discount || 0) + Number(tax || 0)) };
}
function paymentStatus(total, payments = []) {
  const paid = payments.reduce((sum, payment) => sum + Math.max(0, Number(payment.amount || 0)), 0);
  return { paid, due: Math.max(0, Number(total || 0) - paid), status: paid >= Number(total || 0) && Number(total || 0) > 0 ? 'Paid' : paid > 0 ? 'Partially Paid' : 'Unpaid' };
}
function patientCode(prefix = 'DTV', number = 1) { return `${String(prefix).replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 8) || 'DTV'}-${String(number).padStart(6, '0')}`; }
function validateBackup(payload) { return Boolean(payload && payload.format === 'dentiva-backup' && payload.version === 1 && payload.state && Array.isArray(payload.state.patients) && payload.state.settings); }
function safeFileName(input) { return String(input || '').replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_').replace(/^\.+/, '').slice(0, 180) || 'attachment'; }
function passwordDigest(password, salt = crypto.randomBytes(16).toString('hex')) { return { salt, hash: crypto.scryptSync(String(password), salt, 64).toString('hex') }; }
module.exports = { nextQueueStatus, invoiceTotals, paymentStatus, patientCode, validateBackup, safeFileName, passwordDigest };
