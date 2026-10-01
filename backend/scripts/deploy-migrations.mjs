import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import process from 'node:process';
import { URL } from 'node:url';

if (process.env.VERCEL_ENV === 'production') {
  /** @type {string | undefined} */
  const migrationUrl = process.env.DATABASE_URL_UNPOOLED;

  try {
    const connection = new URL(migrationUrl || '');
    if (
      !['postgres:', 'postgresql:'].includes(connection.protocol) ||
      !connection.hostname ||
      connection.hostname.includes('-pooler') ||
      connection.pathname.length < 2
    ) {
      throw new Error('Invalid migration connection');
    }

    const require = createRequire(import.meta.url);
    const result = spawnSync(
      process.execPath,
      [require.resolve('prisma/build/index.js'), 'migrate', 'deploy'],
      {
        env: { ...process.env, DATABASE_URL: migrationUrl },
        stdio: ['ignore', 'inherit', 'inherit'],
      },
    );
    process.exitCode = result.status ?? 1;
  } catch {
    process.stderr.write(
      'Conexão direta de migrations indisponível ou inválida; deploy interrompido.\n',
    );
    process.exitCode = 1;
  }
}
