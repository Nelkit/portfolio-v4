// Usage: pnpm admin:hash-password  (prompts for the password, prints ADMIN_PASSWORD_HASH)
// Mirrors app/lib/auth/password.ts — keep both formats in sync.
import { randomBytes, scryptSync } from 'node:crypto';
import { createInterface } from 'node:readline/promises';

const rl = createInterface({ input: process.stdin, output: process.stdout });
const password = await rl.question('Admin password: ');
rl.close();

if (password.length < 12) {
	console.error('Use at least 12 characters.');
	process.exit(1);
}

const salt = randomBytes(16);
const hash = scryptSync(password, salt, 64);
console.log(`\nADMIN_PASSWORD_HASH=scrypt:${salt.toString('base64url')}:${hash.toString('base64url')}`);
