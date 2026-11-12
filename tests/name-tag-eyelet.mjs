import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { generateKeyring, parseKeyringFont } from '../server/keyring-geometry.mjs';

const font = parseKeyringFont(readFileSync(new URL('../public/assets/fonts/keyring/Huninn-Regular.woff', import.meta.url)));
const spec = { baseMm: 3, letteringMm: 1, holeMm: 4, rimMm: 1.8, baseColor: '#a087c1', textColor: '#fffcf5' };

function bounds(points, axis) {
  const values = points.map(point => point[axis]);
  return [Math.min(...values), Math.max(...values)];
}

for (const [widthMm, heightMm] of [[50, 20.8], [65, 27], [80, 33.2]]) {
  for (const shape of ['contour', 'capsule', 'rounded']) {
    for (const name of ['你的名字', '林予曦', 'Mia', 'Max', 'F', 'J', 'i', 'Q', '飛', '’A']) {
      const model = generateKeyring(font, name, { ...spec, widthMm, heightMm, shape, accentColor: '#efb39e' });
      const label = [shape, widthMm, name].join(' ');
      const rings = model.preview.base.split('Z').filter(Boolean).map(path =>
        [...path.matchAll(/[ML](-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g)].map(([, x, y]) => [Number(x), -Number(y)])
      );
      const [outside] = rings;
      const [bottom, top] = bounds(outside, 1);
      const [left] = bounds(outside, 0);
      const boreX = left + (shape === 'contour' ? spec.holeMm / 2 + spec.rimMm : 5.8);
      const boreY = (bottom + top) / 2;
      const hole = rings.slice(1).find(points => points.length === 64 && points.every(([x, y]) =>
        Math.abs(Math.hypot(x - boreX, y - boreY) - spec.holeMm / 2) <= 0.002
      ));
      assert(hole, label + ' must have a centered Ø4 mm through hole');
      for (const [meshName, expected] of [['Base', [0.8, 3]], ['Base accent', [0, 0.8]]]) {
        const mesh = model.meshes.find(item => item.name === meshName);
        const boreVertices = mesh.vertices.filter(([x, y]) =>
          Math.abs(Math.hypot(x - boreX, y - boreY) - spec.holeMm / 2) <= 0.002);
        assert.deepEqual(bounds(boreVertices, 2), expected, label + ' ' + meshName);
      }
      assert(model.dimensions[0] <= widthMm + 0.002, label + ' exceeds selected width');
    }
  }
}
console.log('Verified centered and full-depth eyelets across 90 name-tag configurations.');
