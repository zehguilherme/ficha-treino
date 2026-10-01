import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import process from 'node:process';
import { after, before, test } from 'node:test';
import { URL } from 'node:url';

/** @type {string} */
let fixture;
const direct = 'postgresql://migration:fake@database.neon.tech/neondb?sslmode=require';

before(() => {
  fixture = mkdtempSync(join(tmpdir(), 'deploy-migrations-'));
  copyFileSync(
    new URL('./deploy-migrations.mjs', import.meta.url),
    join(fixture, 'deploy-migrations.mjs'),
  );
  const prisma = join(fixture, 'node_modules', 'prisma');
  mkdirSync(prisma, { recursive: true });
  writeFileSync(
    join(prisma, 'package.json'),
    JSON.stringify({
      exports: { '.': './build/types.js', './build/index.js': './index.cjs' },
    }),
  );
  writeFileSync(
    join(prisma, 'index.cjs'),
    `
    console.log(JSON.stringify({ args: process.argv.slice(2), url: process.env.DATABASE_URL }));
    process.exit(Number(process.env.TEST_MIGRATION_STATUS || 0));
  `,
  );
});

after(() => {
  if (fixture) rmSync(fixture, { recursive: true, force: true });
});

/**
 * @param {string} environment
 * @param {string} migrationUrl
 * @param {string} status
 * @returns {import('node:child_process').SpawnSyncReturns<string>}
 */
const run = (environment, migrationUrl = direct, status = '0') =>
  spawnSync(process.execPath, [join(fixture, 'deploy-migrations.mjs')], {
    encoding: 'utf8',
    env: {
      ...process.env,
      VERCEL_ENV: environment,
      DATABASE_URL: 'postgresql://runtime:fake@database-pooler.neon.tech/neondb',
      DATABASE_URL_UNPOOLED: migrationUrl,
      TEST_MIGRATION_STATUS: status,
    },
  });

for (const environment of ['preview', 'development', '']) {
  test(`skips migrations outside production (${environment || 'local'})`, () => {
    const result = run(environment, '');
    assert.equal(result.status, 0);
    assert.equal(result.stdout, '');
  });
}

test('runs committed migrations with the direct connection in production', () => {
  const result = run('production');
  assert.equal(result.status, 0);
  /** @type {unknown} */
  const output = JSON.parse(result.stdout);
  assert.deepEqual(output, { args: ['migrate', 'deploy'], url: direct });
});

test('propagates migration failure to the deploy exit code', () => {
  assert.equal(run('production', direct, '7').status, 7);
});

for (const migrationUrl of [
  '',
  'invalid',
  'https://database.neon.tech/neondb',
  'postgresql://migration:fake@database-pooler.neon.tech/neondb',
]) {
  test(`rejects an unavailable or invalid direct connection (${migrationUrl || 'missing'})`, () => {
    const result = run('production', migrationUrl);
    assert.equal(result.status, 1);
    assert.equal(result.stdout, '');
    assert.match(result.stderr, /Conexão direta de migrations indisponível ou inválida/);
    assert.ok(!result.stderr.includes('fake'));
  });
}
