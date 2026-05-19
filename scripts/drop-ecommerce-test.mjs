import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const keyPath = '/Users/kirilivanov/DEV/agent-verse/firebase-sa-key.json';
initializeApp({ credential: cert(JSON.parse(fs.readFileSync(keyPath, 'utf8'))) });
const db = getFirestore();

const PROJECT_ID = 'jS9PJNTo2fRVf2Z0Kkwrx';
const SESSION_ID = 'c-wyu9aV5p0sbQnyPIxiU';

async function deleteCollectionDocs(collName, projectId) {
  const snap = await db.collection(collName).where('projectId', '==', projectId).get();
  for (const doc of snap.docs) {
    await doc.ref.delete();
    console.log(`  deleted ${collName}/${doc.id}`);
  }
  return snap.size;
}

async function deleteSubcollections(docRef) {
  const subs = await docRef.listCollections();
  for (const sub of subs) {
    const snap = await sub.get();
    for (const d of snap.docs) {
      await d.ref.delete();
      console.log(`  deleted ${sub.path}/${d.id}`);
    }
  }
}

console.log(`Dropping E-commerce Store project + related data...\n`);

// Sweep any child rows keyed by projectId across collections we know of
let count = 0;
for (const coll of ['messages', 'deliverables', 'deliveryRequests', 'workflows', 'usageEvents', 'invocationCosts', 'events', 'sessions']) {
  count += await deleteCollectionDocs(coll, PROJECT_ID);
}

// Also delete any subcollections under the session doc (e.g. nested messages)
const sessionRef = db.collection('sessions').doc(SESSION_ID);
await deleteSubcollections(sessionRef);
const sessSnap = await sessionRef.get();
if (sessSnap.exists) {
  await sessionRef.delete();
  console.log(`  deleted sessions/${SESSION_ID}`);
}

// Finally the project doc itself
const projRef = db.collection('projects').doc(PROJECT_ID);
await deleteSubcollections(projRef);
const projSnap = await projRef.get();
if (projSnap.exists) {
  await projRef.delete();
  console.log(`  deleted projects/${PROJECT_ID}`);
}

console.log(`\nDone. Child rows by projectId deleted: ${count}`);
process.exit(0);
