import { cp, mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { resolve, join, relative } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
await mkdir(join(root, '.sites-runtime'), { recursive: true });
const build = await mkdtemp(join(root, '.sites-runtime/pages-'));
for (const name of ['app', 'components', 'features', 'lib', 'public', 'tsconfig.json', 'package.json']) {
  await cp(join(root, name), join(build, name), {
    recursive: true,
    filter: (source) => !['app/api', 'app/app', 'app/sign-in', 'app/manifest.ts'].includes(relative(root, source).replaceAll('\\', '/')),
  });
}
const base = '/swim-forward';
await writeFile(join(build, 'next.config.mjs'), `export default { output: 'export', basePath: '${base}', trailingSlash: true, images: { unoptimized: true }, poweredByHeader: false };`);
const notice = `import Link from 'next/link'; import { Brand } from '@/components/core';
export default function Page() { return <><header className="public-header"><Brand /></header><main id="main" className="auth-page"><h1>Parent accounts are coming soon</h1><p>The public website is ready to explore. Secure sign-in and live coaching updates are not available here yet.</p><Link className="button primary" href="/demo">Explore the demonstration</Link><Link href="/">Back to home</Link></main></>; }`;
for (const route of ['app', 'sign-in']) {
  await mkdir(join(build, 'app', route), { recursive: true });
  await writeFile(join(build, 'app', route, 'page.tsx'), notice);
}
const layoutPath = join(build, 'app/layout.tsx');
const layout = (await readFile(layoutPath, 'utf8')).replace('"/favicon.svg"', '"/swim-forward/favicon.svg"').replace('"/icon-192.png"', '"/swim-forward/icon-192.png"');
await writeFile(layoutPath, layout);
const result = spawnSync(process.execPath, [join(root, 'node_modules/next/dist/bin/next'), 'build', '--webpack'], { cwd: build, stdio: 'inherit', env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' } });
if (result.status !== 0) process.exit(result.status ?? 1);
await cp(join(build, 'out'), join(root, '.pages-out'), { recursive: true });
await writeFile(join(root, '.pages-out/.nojekyll'), '');
console.log('GitHub Pages build ready in .pages-out');
// Static hosts do not apply Next's server rewrite for segmented route payloads.
// Keep the exported files and add the dotted URLs requested by client navigation.
const { readdir } = await import('node:fs/promises');
for (const file of await readdir(join(root, '.pages-out'), { recursive: true })) {
  const parts = file.replaceAll('\\', '/').split('/');
  const segment = parts.findIndex((part) => part.startsWith('__next.'));
  if (segment >= 0 && segment < parts.length - 1 && file.endsWith('.txt')) {
    const alias = [...parts.slice(0, segment), parts.slice(segment).join('.')].join('/');
    await cp(join(root, '.pages-out', file), join(root, '.pages-out', alias));
  }
}
