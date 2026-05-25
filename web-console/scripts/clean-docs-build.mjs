import { rm, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const docsDir = resolve(scriptDir, "../../docs");

await mkdir(docsDir, { recursive: true });

await Promise.all(
  ["index.html", "assets", "images", "videos"].map((entry) =>
    rm(resolve(docsDir, entry), { force: true, recursive: true })
  )
);
