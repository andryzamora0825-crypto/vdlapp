const cp = require('child_process');
const token = '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';

function addEnv(env) {
  try {
    console.log('Adding to', env);
    cp.execSync('npx -y vercel env add OPENAI_API_KEY ' + env, { input: token, stdio: ['pipe', 'inherit', 'inherit'] });
    console.log('Success for', env);
  } catch (e) {
    console.log('Failed for', env);
  }
}

addEnv('production');
addEnv('preview');
addEnv('development');
