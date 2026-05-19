import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

initializeApp({
  credential: cert(JSON.parse(fs.readFileSync('/Users/kirilivanov/DEV/agent-verse/firebase-sa-key.json', 'utf8'))),
});
const db = getFirestore();

console.log('Dropping demo_coffee deliverables...\n');

const collections = ['deliverables', 'deliveryRequests', 'messages', 'sessions', 'workflows', 'usageEvents', 'invocationCosts', 'events', 'projects'];
let total = 0;

for (const coll of collections) {
  // Match by projectId
  const snap = await db.collection(coll).where('projectId', '==', 'demo_coffee').get();
  for (const doc of snap.docs) {
    await doc.ref.delete();
    console.log(`  deleted ${coll}/${doc.id}`);
    total++;
  }
}

// Also try a project doc with id demo_coffee, if any
const proj = await db.collection('projects').doc('demo_coffee').get();
if (proj.exists) {
  await proj.ref.delete();
  console.log(`  deleted projects/demo_coffee`);
  total++;
}

console.log(`\nDeleted ${total} demo_coffee docs.`);
process.exit(0);
