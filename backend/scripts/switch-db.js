const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const mode = process.argv[2] || 'sqlite';
const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
let content = fs.readFileSync(schemaPath, 'utf8');

if (mode === 'sqlite') {
  content = content.replace(
    /datasource db \{[\s\S]*?\}/,
    `datasource db {\n  provider = "sqlite"\n  url      = "file:./dev.db"\n}`
  );
  console.log('Switching database mode to SQLite (Local Development)...');
} else {
  content = content.replace(
    /datasource db \{[\s\S]*?\}/,
    `datasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}`
  );
  console.log('Switching database mode to PostgreSQL (Production/Configured)...');
}

fs.writeFileSync(schemaPath, content, 'utf8');
console.log('Updated prisma/schema.prisma successfully.');

try {
  execSync('npx prisma generate', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
  if (mode === 'sqlite') {
    execSync('npx prisma db push', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
  }
} catch (e) {
  console.error('Prisma command error:', e.message);
}
