import { build } from "esbuild";
import { existsSync } from "node:fs";
import { cp, mkdir, writeFile } from "node:fs/promises";
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
const evidence = path.join(path.dirname(destination), "review");
if (existsSync(evidence)) {
  await cp(evidence, path.join(destination, "review"), { recursive: true });
}
console.log(destination);
