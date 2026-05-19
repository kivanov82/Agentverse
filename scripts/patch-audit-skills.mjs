import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

initializeApp({
  credential: cert(JSON.parse(fs.readFileSync('/Users/kirilivanov/DEV/agent-verse/firebase-sa-key.json', 'utf8'))),
});
const db = getFirestore();

const PROJECT_ID = 'NJu6kME6oXL9KT-SfLCg7';
const SKILLS = ['feynman-auditor']; // cheapest bundle — $3

const ref = db.collection('projects').doc(PROJECT_ID);
const snap = await ref.get();
if (!snap.exists) {
  console.error('Project not found');
  process.exit(1);
}
const data = snap.data();
const metadata = data.metadata ?? {};
const answers = metadata.answers ?? {};
const updated = {
  ...metadata,
  answers: { ...answers, selectedAuditSkills: SKILLS },
};
await ref.update({ metadata: updated, updatedAt: Date.now() });

console.log(`Patched ${PROJECT_ID}: selectedAuditSkills = ${JSON.stringify(SKILLS)}`);
process.exit(0);
