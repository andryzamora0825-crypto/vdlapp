const cp = require('child_process');

const envs = {
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_cG9ldGljLWVtdS00Mi5jbGVyay5hY2NvdW50cy5kZXYk",
  CLERK_SECRET_KEY: "sk_test_U0Ah7iKRMg77aIn3JvUL0fsE6QF5ppvFhipg3GTWNf",
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: "/sign-in",
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: "/sign-up",
  DATABASE_URL: "postgresql://postgres:Andry13112023%40%25@db.qrsdhbchyytcvioxsjht.supabase.co:5432/postgres"
};

const targets = ['production', 'preview', 'development'];

for (const [key, val] of Object.entries(envs)) {
  for (const env of targets) {
    try {
      console.log(`Adding ${key} to ${env}`);
      cp.execSync(`npx -y vercel env rm ${key} ${env} -y`, { stdio: 'ignore' });
    } catch (e) { } // Ignore rm errors
    try {
      cp.execSync(`npx -y vercel env add ${key} ${env}`, { input: val, stdio: ['pipe', 'inherit', 'inherit'] });
      console.log(`Success for ${key} in ${env}`);
    } catch (e) {
      console.log(`Failed for ${key} in ${env}`);
    }
  }
}
