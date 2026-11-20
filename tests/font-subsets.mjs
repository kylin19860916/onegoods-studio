import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { build } from "esbuild";
import opentype from "opentype.js";
const result = await build({
  entryPoints: ["src/preview-fonts.js"],
  bundle: true,
  platform: "node",
  format: "esm",
  write: false,
});
const { loadPreviewFont } = await import(
  "data:text/javascript;base64," +
    Buffer.from(result.outputFiles[0].contents).toString("base64")
);
globalThis.fetch = async (path) =>
  new Response(await readFile("public" + path));
const samples = [
  ["huninn", "Huninn-Regular.woff", "陳怡君"],
  ["nunito", "nunito.woff", "Max"],
  ["lobster", "lobster.woff", "office"],
];
for (const [key, file, text] of samples) {
  const bytes = await readFile("public/assets/fonts/keyring/" + file);
  const original = opentype.parse(
    bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
  );
  const font = await loadPreviewFont(key, text);
  const a = original.getPath(text, 0, 0, 100, { kerning: true }).commands;
  const b = font.getPath(text, 0, 0, 100, { kerning: true }).commands;
  assert.equal(b.length, a.length);
  for (let i = 0; i < a.length; i++)
    for (const field of Object.keys(a[i])) {
      if (typeof a[i][field] === "number")
        assert(
          Math.abs(a[i][field] - b[i][field]) < 0.00001,
          key + " " + field,
        );
      else assert.equal(b[i][field], a[i][field]);
    }
}
const fallback = await loadPreviewFont("kuaile", "陳黃張");
assert.equal(fallback.fontKey, "sans-tc");
assert.equal(fallback.fallbackUsed, true);
console.log(
  "Font subset geometry, Latin ligatures, and missing-surname fallback passed.",
);
