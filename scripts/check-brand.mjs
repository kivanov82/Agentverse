import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

initializeApp({
  credential: cert(JSON.parse(fs.readFileSync('/Users/kirilivanov/DEV/agent-verse/firebase-sa-key.json', 'utf8'))),
});
const db = getFirestore();

const projs = (await db.collection('projects').get()).docs.map((d) => d.data());
for (const p of projs) {
  console.log(`Project: ${p.name}  (${p.id})`);
  const answers = p.metadata?.answers ?? {};
  console.log(`  brandUrl:   ${answers.brandUrl ?? '<none>'}`);
  console.log(`  brandTheme: ${JSON.stringify(p.metadata?.brandTheme ?? null, null, 2)}`);
}
process.exit(0);
