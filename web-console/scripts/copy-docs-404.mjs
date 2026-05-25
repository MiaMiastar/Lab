import { copyFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const docsDir = resolve(scriptDir, "../../docs");

await copyFile(resolve(docsDir, "index.html"), resolve(docsDir, "404.html"));
