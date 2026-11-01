// Starts a throw-away tiket-help backend for the browser tests:
// in-memory MongoDB + test accounts + temporary uploads folder.
// Everything is deleted when the tests finish.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const BACKEND_DIR = path.resolve(process.env.BACKEND_DIR || path.join(here, '..', '..', 'tiket-help'));
const PORT = Number(process.env.E2E_BACKEND_PORT || 3100);
const FRONTEND_ORIGIN = process.env.E2E_FRONTEND_ORIGIN || 'http://localhost:5174';
const PASSWORD = 'secret123';

if (!fs.existsSync(path.join(BACKEND_DIR, 'app.js'))) {
  console.error(`\n❌ Backend not found in ${BACKEND_DIR}`);
  console.error('   Put the tiket-help backend next to this folder, or set BACKEND_DIR=path/to/tiket-help\n');
  process.exit(1);
}
if (!fs.existsSync(path.join(BACKEND_DIR, 'node_modules', 'mongodb-memory-server'))) {
  console.error(`\n❌ Run "npm install" in the backend folder first (${BACKEND_DIR})\n`);
  process.exit(1);
}

// load packages and files from the backend folder
const requireBackend = createRequire(path.join(BACKEND_DIR, 'package.json'));
const { MongoMemoryServer } = requireBackend('mongodb-memory-server');
const mongoose = requireBackend('mongoose');
const bcrypt = requireBackend('bcryptjs');
const jwt = requireBackend('jsonwebtoken');

const mongod = await MongoMemoryServer.create();
const uploadDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tiket-help-e2e-'));

process.env.MONGO_URI = mongod.getUri();
process.env.JWT_SECRET = crypto.randomBytes(32).toString('hex');
process.env.UPLOAD_DIR = uploadDir;
process.env.CORS_ORIGIN = FRONTEND_ORIGIN;
process.env.STATS_TIMEZONE = 'UTC';

await mongoose.connect(process.env.MONGO_URI);
const User = requireBackend(path.join(BACKEND_DIR, 'models', 'User.js'));

// Test accounts (one per situation the tests need)
const ACCOUNTS = {
  superadmin: { username: 'Sara', lastname: 'Super', email: 'super@e2e.test', role: 'superadmin', activated: true },
  admin: { username: 'Malek', lastname: 'Admin', email: 'admin@e2e.test', role: 'admin', activated: true },
  admin2: { username: 'Rami', lastname: 'Second', email: 'rami@e2e.test', role: 'admin', activated: true },
  user: { username: 'Nour', lastname: 'User', email: 'nour@e2e.test', role: 'user', activated: true },
  user2: { username: 'Ali', lastname: 'Other', email: 'ali@e2e.test', role: 'user', activated: true },
  changer: { username: 'Rim', lastname: 'Changer', email: 'rim@e2e.test', role: 'user', activated: true },
  pending: { username: 'Pat', lastname: 'Pending', email: 'pending@e2e.test', role: 'user', activated: false },
  lister: { username: 'Lina', lastname: 'Lister', email: 'lina@e2e.test', role: 'user', activated: true },
  profile: { username: 'Sami', lastname: 'Profile', email: 'sami@e2e.test', role: 'user', activated: true },
  empty: { username: 'Eya', lastname: 'Empty', email: 'eya@e2e.test', role: 'user', activated: true },
  alerts: { username: 'Alia', lastname: 'Alerts', email: 'alia@e2e.test', role: 'user', activated: true },
};

const hash = await bcrypt.hash(PASSWORD, 4);
const fixtures = { password: PASSWORD, apiUrl: `http://localhost:${PORT}/api`, accounts: {} };
for (const [key, data] of Object.entries(ACCOUNTS)) {
  const user = await User.create({ ...data, password: hash });
  // ready-made login token, so most tests skip the login form (and its rate limit)
  const token = jwt.sign({ userId: user._id, role: user.role, tv: 0 }, process.env.JWT_SECRET, { expiresIn: '1d' });
  fixtures.accounts[key] = { ...data, id: user._id.toString(), token };
}
fs.writeFileSync(path.join(here, '.fixtures.json'), JSON.stringify(fixtures, null, 2));

const app = requireBackend(path.join(BACKEND_DIR, 'app.js'));
const server = app.listen(PORT, () => console.log(`e2e backend ready on http://localhost:${PORT}`));

async function shutdown() {
  server.close();
  await mongoose.disconnect().catch(() => {});
  await mongod.stop().catch(() => {});
  fs.rmSync(uploadDir, { recursive: true, force: true });
  fs.rmSync(path.join(here, '.fixtures.json'), { force: true });
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
