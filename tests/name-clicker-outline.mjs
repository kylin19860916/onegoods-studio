import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { nameClickerContours, parseKeyringFont } from '../server/keyring-geometry.mjs';
import { nameClickerOutline } from '../src/name-clicker-outline.js';
import { MX_NAME_FACE } from '../src/cherry-mx-spec.js';
import { keyringFonts } from '../src/keyring-font-picker.js';

function contains(points, x, y) {
  return points.reduce((inside, [ax, ay], index) => {
    const [bx, by] = points[(index + 1) % points.length];
    return (ay > y) !== (by > y) && x < ax + (bx - ax) * (y - ay) / (by - ay) ? !inside : inside;
  }, false);
}

let checked = 0;
for (const key of Object.keys(keyringFonts)) {
  const font = parseKeyringFont(readFileSync(new URL('../public/assets/fonts/keyring/' + keyringFonts[key], import.meta.url)));
  for (const text of ['Max', 'III', 'WIDE', 'A B', '玩好物']) {
    if ([...text].some(char => char !== ' ' && !font.charToGlyphIndex(char))) continue;
    const model = nameClickerContours(font, text);
    const preview = nameClickerOutline(font, text);
    assert.equal(preview.mountY, model.mountY);
    for (const margin of [MX_NAME_FACE.shellMargin, MX_NAME_FACE.faceMargin, MX_NAME_FACE.insetMargin]) {
      const shape = preview.profile(margin).getPoints().map(({ x, y }) => [x, y]);
      assert.deepEqual(shape.slice(0, -1), model.profile(margin), key + ' ' + text);
    }
    if (key === 'huninn' && text === 'Max') {
      // The old prototype's outer mounting pads filled these points above a and x.
      const inset = model.profile(MX_NAME_FACE.insetMargin);
      const shell = model.profile(MX_NAME_FACE.shellMargin);
      assert.equal(model.mountY, -0.5);
      assert(!contains(inset, 0, 7.5));
      assert(!contains(inset, 4, 8));
      assert(contains(inset, 0, 4));
      for (const x of [14, 22]) {
        assert(!contains(inset, x, 8));
        assert(!contains(shell, x, 10));
        assert(contains(inset, x, 0));
      }
    }
    checked++;
  }
}
console.log('Matching preview and production outlines:', checked);
