import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { unzipSync, strFromU8 } from 'fflate';
import { mxChainEyelet, mxPrintableEyelet, MX_NAME_FACE } from '../src/cherry-mx-spec.js';
import { nameClickerContours, parseKeyringFont } from '../server/keyring-geometry.mjs';
import { keyringFonts } from '../src/keyring-font-picker.js';
import createManifold from 'manifold-3d';
import { MECHANICAL_BASE, mechanicalBaseGrooves, mechanicalBaseLeft } from '../src/mechanical-base.js';
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
const { generateClicker3mf, generateMechanical3mf } = await import(pathToFileURL(bundle));
const huninn = readFileSync(join(root, 'public/assets/fonts/keyring/Huninn-Regular.woff'));
const kuaile = readFileSync(join(root, 'public/assets/fonts/keyring/kuaile.woff'));
const stack = nameMxStack();
assert(Math.abs(stack.roofBottom - stack.skirtBottom - NAME_MX.capDepth) < 1e-8);
assert(Math.abs(stack.roofBottom - stack.socketStart - NAME_MX.socketDepth) < 1e-8);
assert(stack.skirtBottom - NAME_MX.travel > NAME_MX.deck);
assert.equal(NAME_MX.capDepth, 4.993);
assert.equal(NAME_MX.socketDepth, 4.993);
assert.equal(NAME_MX.bossDiameter, 5.65);
assert.equal(NAME_MX.mountTop, 10.517);
assert.equal(NAME_MX.rimTop, 19.5);
assert(Math.abs(stack.rimTop - stack.skirtBottom - 2.976) < 1e-8);
const fixtures = ['濤','飛','Max','III','ONEGOODS','玩物工作室','林予曦'].map(text => ({ text, fontKey:'huninn', font:huninn }));
fixtures.push({text:'林予曦',fontKey:'kuaile',font:kuaile}, {text:'林予',fontKey:'kuaile',font:kuaile});
for (const fontKey of ['chiron-round', 'gensen-tw', 'tw-kai', 'genwan-tw']) {
  const font = readFileSync(join(root, 'public/assets/fonts/keyring', keyringFonts[fontKey]));
  for (const text of ['邱珼恩', '邱悅恩', '林予曦']) {
    fixtures.push({ text, fontKey, font, expectedSwitches: 2 });
  }
}
for (const [i,{text,fontKey,font,expectedSwitches = text === '林予曦' ? 2 : 1}] of fixtures.entries()) {
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
  if (expectedSwitches === 2) {
    assert.equal(settings.curr_bed_type, 'Textured PEI Plate');
    assert.deepEqual(settings.filament_settings_id, [
      'Bambu PLA Basic @BBL P2S', 'Bambu PLA Matte @BBL P2S', 'Bambu PLA Matte @BBL P2S',
    ]);
    assert.deepEqual(settings.filament_colour, ['#F2C879', '#EFB39E', '#FFFCF5']);
    assert.equal(settings.support_top_z_distance, '0.16');
    assert.equal(settings.support_bottom_z_distance, '0.16');
    assert.equal(settings.support_threshold_angle, '15');
  }
  assert.equal((xml.match(/name="Exclude supports inside MX well /g) ?? []).length, expectedSwitches);
  assert.equal((xml.match(/name="Exclude supports inside MX cap cross socket /g) ?? []).length, expectedSwitches);
  assert(xml.includes('Exclude supports under printable eyelet'));
  writeFileSync(join(dir,`sample-${i+1}.3mf`),file);
  console.log(fontKey, text, 'generated with P2S supports; full-press collision check passed');
}
const templates = JSON.parse(readFileSync(join(root, 'server/mechanical-base-templates.json')));
const kernel = await createManifold();
kernel.setup();
const { Manifold: Solid, CrossSection: Section, Mesh } = kernel;
for (const [index, template] of templates.entries()) {
  const count = index + 1;
  const keys = Array.from({ length: count }, () => ({ text: '', font: 'sans-tc', cap: '#a087c1', ink: '#fffcf5' }));
  const file = await generateMechanical3mf({ style: 'mechanical', text: '', base: '#393142', keys }, async () => {
    throw new Error('A blank key does not need a font');
  });
  const xml = strFromU8(unzipSync(file)['3D/3dmodel.model']);
  assert.equal((xml.match(/name="Exclude support under curved eyelet"/g) ?? []).length, 1);
  const base = xml.match(/name="Mechanical Base"[^>]*><mesh>(.*?)<\/mesh>/)[1];
  const vertices = Array.from(base.matchAll(/<vertex x="([^"]+)" y="([^"]+)" z="([^"]+)"/g), m => m.slice(1).map(Number));
  const triangles = Array.from(base.matchAll(/<triangle v1="(\d+)" v2="(\d+)" v3="(\d+)"/g), m => m.slice(1).map(Number));
  if (count === 1) assert.deepEqual({ vertices, triangles }, template);
  const mesh = (positions, faces) => new Solid(new Mesh({
    numProp: 3, vertProperties: Float32Array.from(positions.flat()), triVerts: Uint32Array.from(faces.flat()),
  }));
  const stock = mesh(template.vertices, template.triangles);
  const changed = mesh(vertices, triangles);
  const components = changed.decompose();
  const innerSlab = Solid.cube([180, 2 * (MECHANICAL_BASE.halfDepth - MECHANICAL_BASE.grooveDepth), 40], true);
  const removed = Solid.difference(stock, changed);
  const added = Solid.difference(changed, stock);
  const inside = Solid.intersection(innerSlab, removed);
  try {
    assert.equal(changed.status(), 'NoError');
    assert.equal(components.length, 1);
    assert.deepEqual(changed.boundingBox(), stock.boundingBox());
    assert(Math.abs(added.volume()) < 0.001);
    assert(Math.abs(inside.volume()) < 0.001, 'Grooves must only remove material outside the switch wells');
    const left = mechanicalBaseLeft(count);
    const exterior = Section.square([20, 20]).translate([left - 20, -10]);
    try {
      for (const [z, radius] of [[2.4, 3.24], [10.0, 2.49], [11.8, 2.49]]) {
        const ring = changed.slice(z);
        const bore = Section.circle(radius, 64);
        const centered = bore.translate([left - 2.9, 0]);
        const occupied = Section.intersection([ring, centered, exterior]);
        try { assert(occupied.area() < 0.001, `${count} key curved eyelet at Z=${z}`); }
        finally { for (const shape of [occupied, centered, bore, ring]) shape.delete(); }
      }
    } finally {
      exterior.delete();
    }
    const grooves = mechanicalBaseGrooves(count);
    assert.equal(grooves.length, count - 1);
    const expectedVolume = count === 1 ? 0 : grooves.length * MECHANICAL_BASE.grooveWidth
      * MECHANICAL_BASE.grooveDepth * stock.boundingBox().max[2];
    assert(Math.abs(removed.volume() - expectedVolume) < 0.02, count + ' key base groove volume');
    writeFileSync(join(dir, `mechanical-${count}.3mf`), file);
  } finally {
    for (const part of [inside, added, removed, innerSlab, ...components, changed, stock]) part.delete();
  }
}
console.log('Verified mechanical base grooves and unchanged interior for 1–6 keys.');
console.log('Output:', dir);
