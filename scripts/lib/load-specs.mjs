import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * 推导仓库根目录：
 * 1. 优先用 rootOverride
 * 2. 其次检测 cwd 是否有 src/harness（支持 harness init 生成的目录）
 * 3. 最后回退到 scripts 所在的上两级
 */
export function getRepoRoot(rootOverride) {
  if (rootOverride) return path.resolve(rootOverride);
  const cwd = process.cwd();
  if (fs.existsSync(path.join(cwd, "src/harness/schema/components"))) return cwd;
  return path.resolve(__dirname, "../..");
}

export function loadSpecs(rootOverride) {
  const root = getRepoRoot(rootOverride);
  const specDir = path.join(root, "src/harness/schema/components");
  if (!fs.existsSync(specDir)) return [];
  const files = fs.readdirSync(specDir).filter((f) => f.endsWith(".spec.json"));
  return files.map((f) => {
    const raw = fs.readFileSync(path.join(specDir, f), "utf8");
    return JSON.parse(raw);
  });
}
