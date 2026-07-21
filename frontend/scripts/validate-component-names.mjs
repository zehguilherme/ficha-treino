import { readdirSync } from "fs";
import { join, extname, basename } from "path";
import { fileURLToPath } from "url";

const componentsDir = join(fileURLToPath(new URL("..", import.meta.url)), "src/components");

const allowedExtensions = new Set([".tsx", ".ts"]);
const errors = [];

function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (allowedExtensions.has(extname(entry.name))) {
      const name = basename(entry.name, extname(entry.name));
      if (name[0] !== name[0].toUpperCase()) {
        errors.push(entry.name);
      }
    }
  }
}

walk(componentsDir);

if (errors.length > 0) {
  console.error(
    `ERRO: Os seguintes arquivos em src/components/ não começam com maiúscula:\n${errors.map((f) => `  - ${f}`).join("\n")}`
  );
  process.exit(1);
}

console.log("OK: Todos os componentes seguem PascalCase.");
