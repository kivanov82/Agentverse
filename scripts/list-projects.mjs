import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const keyPath = '/Users/kirilivanov/DEV/agent-verse/firebase-sa-key.json';
initializeApp({ credential: cert(JSON.parse(fs.readFileSync(keyPath, 'utf8'))) });
const db = getFirestore();

const snap = await db.collection('projects').orderBy('updatedAt', 'desc').get();
console.log(`\n${snap.size} projects in Firestore:\n`);
for (const doc of snap.docs) {
  const p = doc.data();
  console.log(`  id: ${p.id}`);
  console.log(`    name: ${p.name}`);
  console.log(`    status: ${p.status}`);
  console.log(`    userId: ${p.userId ?? '<none>'}`);
  console.log(`    updatedAt: ${new Date(p.updatedAt).toISOString()}`);
  console.log(`    useCaseId: ${p.metadata?.useCaseId ?? '<none>'}`);
  console.log('');
}
process.exit(0);
