import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const keyPath = '/Users/kirilivanov/DEV/agent-verse/firebase-sa-key.json';
initializeApp({ credential: cert(JSON.parse(fs.readFileSync(keyPath, 'utf8'))) });
const db = getFirestore();

const collections = [
  'projects', 'sessions', 'messages', 'deliverables', 'deliveryRequests',
  'workflows', 'usageEvents', 'invocationCosts', 'events',
];

for (const name of collections) {
  const snap = await db.collection(name).limit(50).get();
  console.log(`${name}: ${snap.size} docs`);
  for (const doc of snap.docs.slice(0, 5)) {
    const d = doc.data();
    const label = d.name ?? d.title ?? d.id ?? doc.id;
    const projectId = d.projectId ?? '';
    const sessionId = d.sessionId ?? '';
    console.log(`  - ${doc.id}  ${label}  proj=${projectId}  sess=${sessionId}`);
  }
  if (snap.size > 5) console.log(`  ...and ${snap.size - 5} more`);
}
process.exit(0);
