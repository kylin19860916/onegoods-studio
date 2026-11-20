import opentype from "opentype.js";
import manifest from "./font-subsets.json";

const shards = new Map();
async function shard(key, block) {
  const file = manifest[key]?.[block];
  if (!file) return null;
  if (!shards.has(file)) {
    const pending = fetch("/assets/fonts/subsets/" + file)
      .then((response) => {
        if (!response.ok) throw new Error("Font unavailable");
        return response.arrayBuffer();
      })
      .then((buffer) => opentype.parse(buffer))
      .catch((error) => {
        shards.delete(file);
        throw error;
      });
    shards.set(file, pending);
  }
  return shards.get(file);
}

export async function loadPreviewFont(key, text) {
  const characters = [...new Set([...text.normalize("NFC"), " "])];
  const blocks = [
    ...new Set(characters.map((character) => character.codePointAt(0) >> 8)),
  ];
  const selected = new Map(
    await Promise.all(
      blocks.map(async (block) => [block, await shard(key, block)]),
    ),
  );
  const missing = characters.some(
    (character) =>
      character !== " " &&
      !selected.get(character.codePointAt(0) >> 8)?.charToGlyphIndex(character),
  );
  if (missing && key !== "sans-tc") {
    const fallback = await loadPreviewFont("sans-tc", text);
    fallback.fallbackUsed = true;
    return fallback;
  }
  function fontFor(character) {
    return selected.get(character.codePointAt(0) >> 8);
  }
  function paths(value, x = 0, y = 0, size = 100, options = {}) {
    const result = [];
    let pen = x;
    const runs = [];
    for (const character of [...value]) {
      const font = fontFor(character);
      if (!font) throw new Error("有字元不在此款支援的字型中。");
      if (runs.at(-1)?.font === font) runs.at(-1).text += character;
      else runs.push({ font, text: character });
    }
    for (const { font, text } of runs) {
      result.push(...font.getPaths(text, pen, y, size, options));
      pen += font.getAdvanceWidth(text, size, options);
    }
    return { result, width: pen - x };
  }
  return {
    fallbackUsed: false,
    fontKey: key,
    charToGlyphIndex(character) {
      return fontFor(character)?.charToGlyphIndex(character) || 0;
    },
    getPaths(...args) {
      return paths(...args).result;
    },
    getPath(...args) {
      const path = new opentype.Path();
      for (const item of paths(...args).result) path.extend(item);
      return path;
    },
    getAdvanceWidth(value, size, options) {
      return paths(value, 0, 0, size, options).width;
    },
  };
}
