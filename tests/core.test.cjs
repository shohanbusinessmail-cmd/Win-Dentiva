const test = require('node:test');
const assert = require('node:assert/strict');
const { nextQueueStatus, invoiceTotals, paymentStatus, patientCode, validateBackup, safeFileName, passwordDigest } = require('../src/core.cjs');

test('queue state advances through safe workflow', () => {
  assert.equal(nextQueueStatus('Scheduled'), 'Arrived');
  assert.equal(nextQueueStatus('Arrived'), 'In Consultation');
  assert.equal(nextQueueStatus('In Consultation'), 'Completed');
  assert.equal(nextQueueStatus('Completed'), 'Completed');
});
test('invoice totals protect against negative values', () => {
  assert.deepEqual(invoiceTotals([{ quantity: 2, unitPrice: 100 }, { quantity: 1, unitPrice: 50 }], 20, 10), { subtotal: 250, discount: 20, tax: 10, total: 240 });
  assert.equal(invoiceTotals([{ quantity: -2, unitPrice: 100 }], 0, 0).total, 0);
});
test('payment status handles partial payments', () => {
  assert.deepEqual(paymentStatus(500, [{ amount: 200 }]), { paid: 200, due: 300, status: 'Partially Paid' });
  assert.equal(paymentStatus(500, [{ amount: 500 }]).status, 'Paid');
  assert.equal(paymentStatus(500).status, 'Unpaid');
});
test('identifiers and filenames are normalized safely', () => {
  assert.equal(patientCode('dental care', 12), 'DENTALCA-000012');
  assert.equal(safeFileName('../x-ray:2026?.pdf'), '_x-ray_2026_.pdf');
});
test('backup validation rejects unrelated JSON', () => {
  assert.equal(validateBackup({ format: 'dentiva-backup', version: 1, state: { patients: [], settings: {} } }), true);
  assert.equal(validateBackup({ format: 'other', state: {} }), false);
});
test('password hashing is salted and repeatable for a known salt', () => {
  const a = passwordDigest('correct horse battery staple', 'fixed-salt');
  const b = passwordDigest('correct horse battery staple', 'fixed-salt');
  assert.equal(a.hash, b.hash);
  assert.notEqual(a.hash, passwordDigest('wrong password', 'fixed-salt').hash);
  assert.equal(a.hash.length, 128);
});
