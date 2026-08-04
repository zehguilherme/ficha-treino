import { readFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";

const root = fileURLToPath(new URL("..", import.meta.url));

let envContent = "";
try {
  envContent = readFileSync(join(root, ".env"), "utf8");
} catch {
  // .env não existe — ok se variáveis estiverem no ambiente do CI/Vercel
}

const envVars = Object.fromEntries(
  envContent
    .split("\n")
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const idx = line.indexOf("=");
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
    })
);

const get = (key) => process.env[key] ?? envVars[key];

// NEXT_PUBLIC_GOOGLE_CLIENT_ID: obrigatória (sem fallback)
// NEXT_PUBLIC_API_URL: opcional — callback page usa fallback para localhost em dev
const required = ["NEXT_PUBLIC_GOOGLE_CLIENT_ID"];

const missing = required.filter((key) => !get(key));

if (missing.length > 0) {
  console.error(
    `ERRO: Variáveis de ambiente obrigatórias não definidas:\n${missing.map((k) => `  - ${k}`).join("\n")}\n\nDefina-as no .env local ou no dashboard do Vercel (Settings → Environment Variables).`
  );
  process.exit(1);
}

console.log("OK: Variáveis de ambiente verificadas.");
