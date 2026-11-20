import { constants } from "node:fs";
import { access, copyFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { configureToolEnvironment } from "./tool-environment.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
process.chdir(root);
configureToolEnvironment(root);

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, CI: "1" },
  });
  if (result.error || result.status !== 0) {
    console.error("Local setup stopped. Resolve the error above and run npm run setup:local again.");
    process.exit(result.status || 1);
  }
}

try {
  await access("node_modules/wrangler/bin/wrangler.js");
} catch {
  console.error("Run npm ci before npm run setup:local.");
  process.exit(1);
}

try {
  await copyFile(".dev.vars.example", ".dev.vars", constants.COPYFILE_EXCL);
  console.log("Created .dev.vars from the empty local template.");
} catch (error) {
  if (error.code !== "EEXIST") throw error;
  console.log("Keeping your existing .dev.vars.");
}

const python = path.join(root, ".venv", process.platform === "win32" ? "Scripts/python.exe" : "bin/python");
try {
  await access(python);
} catch {
  run("python3", ["-m", "venv", ".venv"]);
}
run(python, ["-m", "pip", "install", "-r", "requirements-local.txt"]);
run(python, ["build.py"]);

// These identifiers match vite.config.ts. The CLI always uses local storage.
run(process.execPath, [
  "node_modules/wrangler/bin/wrangler.js",
  "d1", "migrations", "apply", "DB",
  "--local",
  "--config", "wrangler.local.jsonc",
  "--persist-to", ".wrangler/state",
]);

console.log("Local setup finished. Run npm run dev, then open the printed localhost URL.");
console.log("For local admin, open /signin-with-chatgpt?return_to=%2Fadmin.");
