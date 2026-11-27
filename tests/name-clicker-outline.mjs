import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { nameClickerContours, parseKeyringFont } from '../server/keyring-geometry.mjs';
import { nameClickerOutline } from '../src/name-clicker-outline.js';
import { MX_CHAIN_EYELET, MX_NAME_FACE, mxChainEyelet } from '../src/cherry-mx-spec.js';
import { NAME_MX } from '../src/name-clicker-mechanism.js';
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
  for (const text of ['Max', 'III', 'WIDE', 'Olivia', 'Ken', 'Maya', 'A B', '玩好物', '飛', '林予', '林予曦']) {
    if ([...text].some(char => char !== ' ' && !font.charToGlyphIndex(char))) continue;
    const model = (() => {
      try {
        return nameClickerContours(font, text);
      } catch (error) {
        throw new Error(`Outline generation failed for ${key} / ${text}`, { cause: error });
      }
    })();
    const preview = nameClickerOutline(font, text);
    const xs = model.profile(MX_NAME_FACE.faceMargin).map(([x]) => x);
    const capLength = Math.max(...xs) - Math.min(...xs);
    const expected = capLength >= NAME_MX.dualSwitchCapLength - 1e-9 ? 2 : 1;
    if (key === 'chewy' && text === 'Max') assert.equal(model.mounts.length, 1);
    if (key === 'huninn' && text === 'Ken') assert.equal(model.mounts.length, 1);
    if (key === 'huninn' && text === 'Maya') assert.equal(model.mounts.length, 2);
    if (key === 'huninn' && text === 'Olivia') {
      assert(capLength >= 80 && capLength < 82);
      assert.equal(model.mounts.length, 2);
    }
    assert.equal(model.mounts.length, expected);
    assert.equal(model.dividers.length, expected - 1);
    if (expected === 2) {
      assert(model.mounts[0].x < 0 && model.mounts[1].x > 0);
      assert(model.mounts[1].x - model.mounts[0].x >= 21 - 1e-8);
    } else {
      assert.equal(model.mounts[0].x, 0);
    }
    assert.deepEqual(preview.mounts, model.mounts);
    // A seat-clearance subtraction must never open a notch through the cap skirt.
    const area = ring => Math.abs(ring.reduce((sum, [x,y], i) => {
      const [nx,ny] = ring[(i + 1) % ring.length]; return sum + x*ny - nx*y;
    }, 0) / 2);
    const perimeter = model.skirt.reduce((largest, polygon) => !largest || area(polygon[0]) > area(largest[0]) ? polygon : largest, null);
    assert.equal(perimeter.length, 2, key + ' ' + text + ' cut-open outer skirt');
    assert(Math.abs(area(perimeter[0]) - area(model.profile(MX_NAME_FACE.faceMargin))) < 0.001);
    assert.equal(model.capBack.length, 1);
    assert.equal(model.capBack[0].length, expected + 1);
    const sharedBack = preview.capBack[0];
    assert.deepEqual(sharedBack.getPoints().slice(0, -1).map(({x,y}) => [x,y]), model.capBack[0][0]);
    assert.deepEqual(sharedBack.holes.map(hole => hole.getPoints().slice(0, -1).map(({x,y}) => [x,y])), model.capBack[0].slice(1));
    const shell = model.profile(MX_NAME_FACE.shellMargin);
    const eyelet = mxChainEyelet(shell);
    assert.deepEqual(eyelet, mxChainEyelet(preview.profile(MX_NAME_FACE.shellMargin)
      .getPoints().slice(0, -1).map(({ x, y }) => [x, y])));
    const ys = eyelet.outline.map(([, y]) => y);
    assert.equal(Math.max(...ys), MX_CHAIN_EYELET.width / 2);
    assert.equal(Math.min(...ys), -MX_CHAIN_EYELET.width / 2);
    assert(contains(eyelet.outline, eyelet.holeX, 0));
    assert(contains(shell, eyelet.outline.at(-1)[0], 0));
    for (let angle = 0; angle < 2 * Math.PI; angle += Math.PI / 16) {
      const radius = MX_CHAIN_EYELET.holeDiameter / 2;
      const x = eyelet.holeX + radius * Math.cos(angle), y = radius * Math.sin(angle);
      assert(contains(eyelet.outline, x, y) && !contains(shell, x, y));
    }
    for (const margin of [MX_NAME_FACE.shellMargin, MX_NAME_FACE.faceMargin, MX_NAME_FACE.insetMargin]) {
      const shape = preview.profile(margin).getPoints().map(({ x, y }) => [x, y]);
      assert.deepEqual(shape.slice(0, -1), model.profile(margin), key + ' ' + text);
    }
    if (key === 'huninn' && text === 'Max') {
      // The old prototype's outer mounting pads filled these points above a and x.
      const inset = model.profile(0.35); // Keep the original anti-pad probe independent of colour-border width.
      const shell = model.profile(MX_NAME_FACE.shellMargin);
      assert.equal(model.mounts.length, 2);
      assert(!contains(inset, 0, 7.5));
      assert(!contains(inset, 4, 8));
      assert(contains(inset, 0, 4));
      for (const x of [14, 22]) {
        assert(!contains(inset, x, 8));
        assert(!contains(shell, x, 10 + (MX_NAME_FACE.shellMargin - 3.3)));
        assert(contains(inset, x, 0));
      }
    }
    checked++;
  }
}
console.log('Matching preview and production outlines:', checked);
