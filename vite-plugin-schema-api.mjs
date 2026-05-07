import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

/**
 * 开发服务器中间件：读写 src/harness/schema/components/*.spec.json，保存后执行 sync:harness。
 * 供独立 Portal 与 Storybook 共用。
 */
export function schemaApiPlugin(repoRoot) {
  const specDir = path.join(repoRoot, "src/harness/schema/components");
  const tokensPath = path.join(repoRoot, "src/design-tokens/tokens.json");

  return {
    name: "harness-schema-api",
    /** 尽量先于静态资源处理，避免 /api/* 被错误吞掉 */
    enforce: "pre",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split("?")[0] ?? "";

        if (req.method === "GET" && url === "/api/design-tokens") {
          try {
            const body = fs.readFileSync(tokensPath, "utf8");
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(body);
          } catch {
            res.statusCode = 404;
            res.end("not found");
          }
          return;
        }

        if (req.method === "POST" && url === "/api/save-design-tokens") {
          let raw = "";
          req.on("data", (c) => {
            raw += String(c);
          });
          req.on("end", () => {
            try {
              const payload = JSON.parse(raw);
              const jsonText = payload.jsonText ?? "";
              JSON.parse(jsonText);
              const pretty = `${JSON.stringify(JSON.parse(jsonText), null, 2)}\n`;
              fs.writeFileSync(tokensPath, pretty, "utf8");
              execSync("npm run sync:tokens", { cwd: repoRoot, stdio: "inherit" });
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ ok: true }));
            } catch (e) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ ok: false, error: String(e) }));
            }
          });
          return;
        }

        if (req.method === "GET" && url === "/api/schemas") {
          try {
            const files = fs.readdirSync(specDir).filter((f) => f.endsWith(".spec.json"));
            const list = files.map((f) => {
              const spec = JSON.parse(fs.readFileSync(path.join(specDir, f), "utf8"));
              return { filename: f, id: spec.id, componentName: spec.componentName };
            });
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(JSON.stringify(list));
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: String(e) }));
          }
          return;
        }

        if (req.method === "GET" && url.startsWith("/api/schema/")) {
          const name = decodeURIComponent(url.replace("/api/schema/", ""));
          if (!/^[\w.-]+\.spec\.json$/.test(name)) {
            res.statusCode = 400;
            res.end("bad filename");
            return;
          }
          const file = path.join(specDir, name);
          if (!file.startsWith(specDir + path.sep)) {
            res.statusCode = 403;
            res.end("forbidden");
            return;
          }
          try {
            const body = fs.readFileSync(file, "utf8");
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(body);
          } catch {
            res.statusCode = 404;
            res.end("not found");
          }
          return;
        }

        if (req.method === "POST" && url === "/api/rename-component-title") {
          let raw = "";
          req.on("data", (c) => {
            raw += String(c);
          });
          req.on("end", () => {
            try {
              const payload = JSON.parse(raw);
              const importPathRaw = String(payload.importPath ?? "");
              const prevTitle = String(payload.prevTitle ?? "");
              const nextTitle = String(payload.nextTitle ?? "").trim();

              if (!importPathRaw || !prevTitle || !nextTitle || nextTitle === prevTitle) {
                res.statusCode = 400;
                res.setHeader("Content-Type", "application/json; charset=utf-8");
                res.end(JSON.stringify({ ok: false, error: "missing or unchanged title" }));
                return;
              }
              if (nextTitle.includes("/") || nextTitle.includes("\\")) {
                res.statusCode = 400;
                res.setHeader("Content-Type", "application/json; charset=utf-8");
                res.end(JSON.stringify({ ok: false, error: "title must not contain path separators" }));
                return;
              }

              const absImport = path.isAbsolute(importPathRaw)
                ? path.normalize(importPathRaw)
                : path.normalize(path.join(repoRoot, importPathRaw));
              const rel = path.relative(repoRoot, absImport);
              if (rel.startsWith("..")) {
                res.statusCode = 403;
                res.setHeader("Content-Type", "application/json; charset=utf-8");
                res.end(JSON.stringify({ ok: false, error: "forbidden path" }));
                return;
              }
              if (!rel.startsWith(`src${path.sep}`)) {
                res.statusCode = 403;
                res.setHeader("Content-Type", "application/json; charset=utf-8");
                res.end(JSON.stringify({ ok: false, error: "only src/** files allowed" }));
                return;
              }
              if (!/\.(stories\.(tsx|ts|jsx|js)|mdx)$/.test(rel)) {
                res.statusCode = 400;
                res.setHeader("Content-Type", "application/json; charset=utf-8");
                res.end(JSON.stringify({ ok: false, error: "only stories or mdx" }));
                return;
              }

              let text = fs.readFileSync(absImport, "utf8");
              const ext = path.extname(absImport);

              function escapeRe(s) {
                return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
              }

              if (ext === ".mdx") {
                const re = new RegExp(
                  `(<Meta\\s+[^>]*\\btitle=)(["'])${escapeRe(prevTitle)}\\2`,
                  "m",
                );
                if (!re.test(text)) {
                  res.statusCode = 400;
                  res.setHeader("Content-Type", "application/json; charset=utf-8");
                  res.end(JSON.stringify({ ok: false, error: "mdx Meta title not found" }));
                  return;
                }
                text = text.replace(re, (_, open, q) => `${open}${q}${nextTitle}${q}`);
              } else {
                const re = new RegExp(`(\\btitle\\s*:\\s*)(["'])${escapeRe(prevTitle)}\\2`);
                if (!re.test(text)) {
                  res.statusCode = 400;
                  res.setHeader("Content-Type", "application/json; charset=utf-8");
                  res.end(JSON.stringify({ ok: false, error: "csf title not found" }));
                  return;
                }
                text = text.replace(re, (_, open, q) => `${open}${q}${nextTitle}${q}`);
              }

              fs.writeFileSync(absImport, text, "utf8");
              res.setHeader("Content-Type", "application/json; charset=utf-8");
              res.end(JSON.stringify({ ok: true }));
            } catch (e) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json; charset=utf-8");
              res.end(JSON.stringify({ ok: false, error: String(e) }));
            }
          });
          return;
        }

        if (req.method === "POST" && url === "/api/save-schema") {
          let raw = "";
          req.on("data", (c) => {
            raw += String(c);
          });
          req.on("end", () => {
            try {
              const payload = JSON.parse(raw);
              const filename = payload.filename ?? "";
              const jsonText = payload.jsonText ?? "";
              if (!/^[\w.-]+\.spec\.json$/.test(filename)) {
                res.statusCode = 400;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ ok: false, error: "bad filename" }));
                return;
              }
              JSON.parse(jsonText);
              const pretty = `${JSON.stringify(JSON.parse(jsonText), null, 2)}\n`;
              const file = path.join(specDir, filename);
              if (!file.startsWith(specDir + path.sep)) {
                res.statusCode = 403;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ ok: false, error: "forbidden path" }));
                return;
              }
              fs.writeFileSync(file, pretty, "utf8");
              execSync("npm run sync:harness", { cwd: repoRoot, stdio: "inherit" });

              let auditResult = { passed: true, output: "" };
              try {
                const auditOutput = execSync("npm run harness:audit", { cwd: repoRoot, encoding: "utf8", timeout: 30000 });
                auditResult = { passed: true, output: auditOutput };
              } catch (auditErr) {
                auditResult = { passed: false, output: auditErr.stdout || auditErr.stderr || auditErr.message };
              }

              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ ok: true, audit: auditResult }));
            } catch (e) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ ok: false, error: String(e) }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}
