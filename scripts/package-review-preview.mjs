import { build } from "esbuild";
import { cp, mkdir, rm, copyFile, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
const destination = process.argv[2];
if (
  !destination ||
  !path.isAbsolute(destination) ||
  destination === process.cwd()
)
  throw Error("Use an absolute output folder outside the source.");
await mkdir(destination, { recursive: true });
await cp("public", destination, { recursive: true });
const result = await build({
  entryPoints: ["preview/worker.js"],
  bundle: true,
  format: "esm",
  platform: "browser",
  write: false,
  minify: true,
});
await writeFile(
  path.join(destination, "_worker.js"),
  result.outputFiles[0].contents,
);
console.log(destination);
