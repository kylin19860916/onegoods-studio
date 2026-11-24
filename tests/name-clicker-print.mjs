import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { unzipSync, strFromU8 } from 'fflate';
import { mxChainEyelet, mxPrintableEyelet, MX_NAME_FACE } from '../src/cherry-mx-spec.js';
import { nameClickerContours, parseKeyringFont } from '../server/keyring-geometry.mjs';
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
const huninn = readFileSync(join(root, 'public/assets/fonts/keyring/Huninn-Regular.woff'));
const kuaile = readFileSync(join(root, 'public/assets/fonts/keyring/kuaile.woff'));
const stack = nameMxStack();
assert(Math.abs(stack.roofBottom - stack.skirtBottom - NAME_MX.capDepth) < 1e-8);
assert(Math.abs(stack.roofBottom - stack.socketStart - NAME_MX.socketDepth) < 1e-8);
assert(stack.skirtBottom - NAME_MX.travel > NAME_MX.deck);
assert.equal(NAME_MX.capDepth, 2.993);
assert.equal(NAME_MX.socketDepth, 2.993);
assert.equal(NAME_MX.bossDiameter, 5.65);
assert.equal(NAME_MX.mountTop, 8.517);
assert(Math.abs(stack.rimTop - stack.skirtBottom - 0.976) < 1e-8);
const fixtures = ['濤','飛','Max','III','ONEGOODS','玩物工作室','林予曦'].map(text => ({ text, fontKey:'huninn', font:huninn }));
fixtures.push({text:'林予曦',fontKey:'kuaile',font:kuaile});
for (const [i,{text,fontKey,font}] of fixtures.entries()) {
  const contour = nameClickerContours(parseKeyringFont(font), text);
  const eyelet = mxChainEyelet(contour.profile(MX_NAME_FACE.shellMargin));
  const ramp = mxPrintableEyelet(eyelet.outline, eyelet.rootLeft);
  assert(ramp.bottom > 3.7);
  assert.equal(Math.max(...eyelet.outline.map(([,y])=>y)), 4.3);
  const points = ramp.mesh.vertProperties, count = eyelet.outline.length;
  // Every ramp vertex advances <= 0.95 mm XY per mm Z; the final duplicate
  // outline is the straight top join, so it also satisfies this bound.
  for (let k = count * 3; k < points.length; k += 3) {
    const previous = k - count * 3, dz = points[k+2] - points[previous+2];
    const xy = Math.hypot(points[k] - points[previous], points[k+1] - points[previous+1]);
    assert(xy / dz < 0.952, text + ' eyelet underside is too shallow');
  }
  const file = await generateClicker3mf({ text, font:fontKey, colors:{border:'#f2c879',fill:'#efb39e',ink:'#fffcf5'} },new Response(font));
  const archive = unzipSync(file);
  const settings = JSON.parse(strFromU8(archive['Metadata/project_settings.config']));
  assert.equal(settings.printer_model,'Bambu Lab P2S');
  assert.equal(settings.layer_height,'0.16');
  assert.equal(settings.enable_support,'1');
  assert.equal(settings.support_style,'snug');
  assert.equal(settings.raft_first_layer_expansion,'0');
  assert.equal(settings.brim_type,'no_brim');
  const xml = strFromU8(archive['3D/3dmodel.model']);
  assert(!xml.includes('REMOVE - local support below MX boss'));
  const expectedSwitches = text === '林予曦' ? 3 : 1;
  assert.equal((xml.match(/name="Exclude supports inside MX well /g) ?? []).length, expectedSwitches);
  assert.equal((xml.match(/name="Exclude supports inside MX cap cross socket /g) ?? []).length, expectedSwitches);
  assert(xml.includes('Exclude supports under printable eyelet'));
  writeFileSync(join(dir,`sample-${i+1}.3mf`),file);
  console.log(text, 'generated with P2S supports; full-press collision check passed');
}
console.log('Output:', dir);
