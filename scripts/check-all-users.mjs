import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

initializeApp({
  credential: cert(JSON.parse(fs.readFileSync('/Users/kirilivanov/DEV/agent-verse/firebase-sa-key.json', 'utf8'))),
});
const db = getFirestore();

const users = (await db.collection('users').get()).docs.map((d) => d.data());
const identities = (await db.collection('linkedIdentities').get()).docs.map((d) => d.data());

console.log(`\n${users.length} users:`);
for (const u of users) {
  console.log(`  id: ${u.id}`);
  console.log(`    name:          ${u.name ?? '<none>'}`);
  console.log(`    email:         ${u.email ?? '<none>'}`);
  console.log(`    walletAddress: ${u.walletAddress ?? '<none>'}`);
  console.log(`    creditBalance: $${u.creditBalance}`);
  console.log(`    createdAt:     ${new Date(u.createdAt).toISOString()}`);
  console.log('');
}

console.log(`\n${identities.length} linked identities:`);
for (const i of identities) {
  console.log(`  ${i.id} → userId=${i.userId}  linkedAt=${new Date(i.linkedAt).toISOString()}`);
}

// Also check credit ledger
const ledger = (await db.collection('creditLedger').get()).docs.map((d) => d.data());
console.log(`\n${ledger.length} credit ledger entries:`);
for (const e of ledger.sort((a, b) => b.createdAt - a.createdAt).slice(0, 10)) {
  console.log(`  userId=${e.userId}  delta=$${e.delta}  source=${e.source}  balanceAfter=$${e.balanceAfter}  ${new Date(e.createdAt).toISOString()}`);
}
process.exit(0);
