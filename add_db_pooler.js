const cp = require('child_process');

const val = "postgresql://postgres.qrsdhbchyytcvioxsjht:Andry13112023%40%25@aws-1-us-west-2.pooler.supabase.com:6543/postgres";
const targets = ['production', 'preview', 'development'];

for (const env of targets) {
  try {
    cp.execSync(`npx -y vercel env rm DATABASE_URL ${env} -y`, { stdio: 'ignore' });
  } catch (e) {} 
  try {
    console.log(`Adding DATABASE_URL to ${env}...`);
    cp.execSync(`npx -y vercel env add DATABASE_URL ${env}`, { input: val, stdio: ['pipe', 'inherit', 'inherit'] });
    console.log(`Success in ${env}`);
  } catch (e) {
    console.log(`Failed in ${env}`);
  }
}
