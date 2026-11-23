import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { unzipSync, strFromU8 } from 'fflate';
import { NAME_MX, nameMxStack } from '../src/name-clicker-mechanism.js';
const root = fileURLToPath(new URL('../', import.meta.url));
const dir = process.argv[2] ? resolve(process.argv[2]) : mkdtempSync(join(tmpdir(), 'ogs-mx-'));
mkdirSync(dir, { recursive: true });
const bundle = join(dir, 'generator.mjs');
await build({ absWorkingDir: root, entryPoints: ['server/clicker-print.ts'], outfile: bundle,
  bundle: true, platform: 'node', format: 'esm',
  banner: { js: 'import { createRequire as localRequire } from "node:module"; const require = localRequire(import.meta.url);' },
  plugins: [{ name: 'local-wasm', setup({ onResolve, onLoad }) {
    onResolve({ filter: /manifold\.wasm\?module$/ }, () => ({ path: 'wasm', namespace: 'local' }));
    onLoad({ filter: /.*/, namespace: 'local' }, () => ({ contents: `export default new WebAssembly.Module(Buffer.from("${readFileSync(join(root,'node_modules/manifold-3d/manifold.wasm')).toString('base64')}","base64"))` }));
  } }],
});
const { generateClicker3mf } = await import(pathToFileURL(bundle));
const font = readFileSync(join(root, 'public/assets/fonts/keyring/Huninn-Regular.woff'));
const stack = nameMxStack();
assert(Math.abs(stack.roofBottom - stack.skirtBottom - NAME_MX.capDepth) < 1e-8);
assert(Math.abs(stack.roofBottom - stack.socketStart - NAME_MX.socketDepth) < 1e-8);
assert(stack.skirtBottom - NAME_MX.travel > NAME_MX.deck);
for (const [i,text] of ['濤','飛','Max','III','ONEGOODS','玩物工作室'].entries()) {
  const file = await generateClicker3mf({ text, font:'huninn', colors:{border:'#f2c879',fill:'#efb39e',ink:'#fffcf5'} },new Response(font));
  const archive = unzipSync(file);
  const settings = JSON.parse(strFromU8(archive['Metadata/project_settings.config']));
  assert.equal(settings.printer_model,'Bambu Lab P2S');
  assert.equal(settings.layer_height,'0.16');
  assert.equal(settings.enable_support,'1');
  const xml = strFromU8(archive['3D/3dmodel.model']);
  assert(xml.includes('REMOVE - local support below MX boss'));
  assert(xml.includes('Exclude supports inside MX cap cross socket'));
  writeFileSync(join(dir,`sample-${i+1}.3mf`),file);
  console.log(text, 'generated with P2S supports; full-press collision check passed');
}
console.log('Output:', dir);
