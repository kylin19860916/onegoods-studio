import { readFileSync, writeFileSync } from 'node:fs';
import { Vector3 } from 'three';
import { parseKeyringFont, generateKeyring } from '../../server/keyring-geometry.mjs';
import { buildClickerAssembly } from '../../src/clicker-viewer.js';
import { keyringFonts } from '../../src/keyring-font-picker.js';

const swatches = { ivory: '#fffcf5', lilac: '#a087c1', honey: '#f2c879', mint: '#9fd3c0', darkMint: '#689587' };
const font = key => parseKeyringFont(readFileSync('public/assets/fonts/keyring/' + keyringFonts[key]));
const spec = { widthMm: 65, heightMm: 27, baseMm: 3, letteringMm: 1, holeMm: 4, rimMm: 1.8 };
const samples = {};
const tabs = process.argv.includes('--tabs');
const tabLabels = [
  ['zh-hant', '名牌款', '按壓款', '關節字塊', 'sans-tc'],
  ['zh-hans', '名牌款', '按压款', '关节字块', 'sans-sc'],
  ['en', 'TAG', 'KEY', 'LINK', 'lilita'],
];
const keyrings = [
  ['nameplate', 'Mia', 'lilita', 'contour', swatches.lilac, undefined],
  ['articulated', 'LEO', 'lucky', 'articulated', swatches.darkMint, swatches.ivory],
];
const tabKeyrings = tabLabels.flatMap(([locale, name, , articulated, face]) => [
  [`nameplate-${locale}`, name, face, 'contour', swatches.lilac, undefined],
  [`articulated-${locale}`, articulated, face, 'articulated', swatches.darkMint, undefined],
]);
for (const [id, name, face, style, baseColor, accentColor] of (tabs ? tabKeyrings : keyrings)) {
  const palette = { baseColor, textColor: style === 'articulated' ? swatches.mint : swatches.ivory, accentColor };
  const result = generateKeyring(font(face), name, { ...spec, shape: style, ...palette });
  samples[id] = { name, font: face, source: 'server/keyring-geometry.mjs#generateKeyring', palette, meshes: result.meshes };
}
const clickers = [
  ['press', '飛', 'name', 'sans-tc'],
  ['press-abc', 'ABC', 'mechanical', 'lilita'],
];
const tabClickers = tabLabels.map(([locale, , name, , face]) => [`press-${locale}`, name, 'name', face]);
for (const [id, name, style, typeface] of (tabs ? tabClickers : clickers)) {
  const base = swatches.ivory, cap = swatches.honey, ink = swatches.ivory;
  const selectedFont = font(typeface);
  const keys = (style === 'name' ? [name] : [...name]).map(text => ({ text, font: selectedFont, cap, ink }));
  const assembly = buildClickerAssembly({ keys, base, cap, ink, style });
  assembly.updateMatrixWorld(true);
  const meshes = [];
  assembly.traverse(object => {
    if (!object.isMesh) return;
    const position = object.geometry.attributes.position;
    const points = Array.from({ length: position.count }, (_, index) =>
      new Vector3().fromBufferAttribute(position, index).applyMatrix4(object.matrixWorld).toArray());
    const indices = object.geometry.index?.array ?? points.map((_, index) => index);
    const triangles = [];
    for (let index = 0; index < indices.length; index += 3) triangles.push([...indices.slice(index, index + 3)]);
    meshes.push({ vertices: points, triangles, color: '#' + object.material.color.getHexString() });
  });
  samples[id] = { name, font: typeface, source: 'src/clicker-viewer.js#buildClickerAssembly', palette: { base, cap, ink }, meshes };
}
writeFileSync(process.argv[2], JSON.stringify(samples));
