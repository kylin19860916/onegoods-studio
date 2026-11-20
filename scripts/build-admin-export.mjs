import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { readFile, writeFile, copyFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
const wasm = await readFile("node_modules/manifold-3d/manifold.wasm");
const wasmName =
  "manifold-" +
  createHash("sha256").update(wasm).digest("hex").slice(0, 12) +
  ".wasm";
await mkdir("public/assets", { recursive: true });
await writeFile("public/assets/" + wasmName, wasm);
const result = await build({
  entryPoints: ["src/admin-clicker-export.js"],
  bundle: true,
  format: "esm",
  platform: "browser",
  minify: true,
  write: false,
  external: ["node:*"],
  define: { "import.meta.env.DEV": "false" },
  plugins: [
    {
      name: "browser-manufacturing-kernel",
      setup(builder) {
        builder.onLoad(
          { filter: /server\/clicker-print\.ts$/ },
          async (args) => {
            let contents = await readFile(args.path, "utf8");
            contents = contents.replace(/import wasm from .*?;\n/, "");
            const start = contents.indexOf("function getKernel()");
            const end = contents.indexOf(
              "export async function generateClicker3mf",
              start,
            );
            contents =
              contents.slice(0, start) +
              `function getKernel(){
     kernel ??= createManifold({locateFile:()=>'/assets/${wasmName}'}).then(module=>{
       module.setup();return module;
     }).catch(error=>{kernel=undefined;throw error;});
     return kernel;
   }\n` +
              contents.slice(end);
            return {
              contents,
              loader: "ts",
              resolveDir: fileURLToPath(new URL("../server/", import.meta.url)),
            };
          },
        );
      },
    },
  ],
});
const bytes = result.outputFiles[0].contents;
const filename =
  "admin-export-" +
  createHash("sha256").update(bytes).digest("hex").slice(0, 12) +
  ".js";
await writeFile("public/assets/" + filename, bytes);
await writeFile("preview/admin-export-entry.txt", filename);
