import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const keyPath = '/Users/kirilivanov/DEV/agent-verse/firebase-sa-key.json';
const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const idSnap = await db
  .collection('linkedIdentities')
  .where('provider', '==', 'siwe')
  .get();

const sorted = idSnap.docs
  .map((d) => ({ id: d.id, ...d.data() }))
  .sort((a, b) => (b.linkedAt ?? 0) - (a.linkedAt ?? 0))
  .slice(0, 10);

console.log(`\nSIWE linkedIdentities (${idSnap.size} total, showing latest ${sorted.length}):`);
for (const d of sorted) {
  const when = new Date(d.linkedAt).toISOString();
  console.log(`  ${d.id}  →  userId=${d.userId}  linkedAt=${when}`);
}

console.log(`\nUser docs for those:`);
for (const d of sorted) {
  const { userId } = d;
  const u = await db.collection('users').doc(userId).get();
  if (!u.exists) { console.log(`  ${userId}: <missing>`); continue; }
  const du = u.data();
  console.log(`  ${userId}:`, {
    walletAddress: du.walletAddress,
    creditBalance: du.creditBalance,
    starterCreditGranted: du.starterCreditGranted,
    createdAt: new Date(du.createdAt).toISOString(),
    name: du.name,
    email: du.email,
  });
}

console.log(`\nAll users total: ${(await db.collection('users').count().get()).data().count}`);
process.exit(0);