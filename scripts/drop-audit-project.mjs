import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

initializeApp({
  credential: cert(JSON.parse(fs.readFileSync('/Users/kirilivanov/DEV/agent-verse/firebase-sa-key.json', 'utf8'))),
});
const db = getFirestore();

const PROJECT_ID = 'NJu6kME6oXL9KT-SfLCg7';
const SESSION_ID = 'Ai1xYYMv6hBNdJyjYOb3W';

async function deleteSubcollections(docRef) {
  const subs = await docRef.listCollections();
  for (const sub of subs) {
    const snap = await sub.get();
    for (const d of snap.docs) await d.ref.delete();
    console.log(`  cleared subcollection ${sub.path} (${snap.size})`);
  }
}

async function sweepByProjectId(coll) {
  const snap = await db.collection(coll).where('projectId', '==', PROJECT_ID).get();
  for (const d of snap.docs) await d.ref.delete();
  if (snap.size) console.log(`  deleted ${coll}: ${snap.size}`);
}

async function sweepBySessionId(coll) {
  const snap = await db.collection(coll).where('sessionId', '==', SESSION_ID).get();
  for (const d of snap.docs) await d.ref.delete();
  if (snap.size) console.log(`  deleted ${coll} by sessionId: ${snap.size}`);
}

console.log(`Dropping project ${PROJECT_ID} + session ${SESSION_ID}...\n`);

for (const c of ['messages', 'deliverables', 'deliveryRequests', 'workflows', 'usageEvents', 'events']) {
  await sweepByProjectId(c);
}
// invocationCosts is keyed by sessionId, not projectId
await sweepBySessionId('invocationCosts');

const sessionRef = db.collection('sessions').doc(SESSION_ID);
await deleteSubcollections(sessionRef);
if ((await sessionRef.get()).exists) {
  await sessionRef.delete();
  console.log(`  deleted sessions/${SESSION_ID}`);
}

const projRef = db.collection('projects').doc(PROJECT_ID);
await deleteSubcollections(projRef);
if ((await projRef.get()).exists) {
  await projRef.delete();
  console.log(`  deleted projects/${PROJECT_ID}`);
}

console.log('\nDone.');
process.exit(0);
