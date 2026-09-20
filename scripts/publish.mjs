import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
// The root-level assets directory is generated output, owned by this script.
const root = fileURLToPath(new URL('..', import.meta.url));
const dist = join(root, 'app', 'dist');
const html = await readFile(join(dist, 'index.html'), 'utf8');
if (!html.includes('./assets/')) throw new Error('Use Vite base: "./" for GitHub project Pages.');
const assets = await readdir(join(dist, 'assets'));
if (!assets.some(name => name.endsWith('.js')) || !assets.some(name => name.endsWith('.css'))) throw new Error('The build output is incomplete.');
await rm(join(root, 'assets'), { recursive: true, force: true });
await mkdir(join(root, 'assets'), { recursive: true });
await cp(join(dist, 'assets'), join(root, 'assets'), { recursive: true });
await writeFile(join(root, 'index.html'), html);
await writeFile(join(root, '.nojekyll'), '');
console.log('GitHub Pages output updated in the repository root. Commit index.html and assets/ with your source changes.');
