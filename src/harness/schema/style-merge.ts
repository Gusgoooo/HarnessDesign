import type { StyleLock, StyleLockRule } from "./types";

function ruleToRegex(rule: StyleLockRule): RegExp {
  return typeof rule.pattern === "string" ? new RegExp(rule.pattern) : rule.pattern;
}

/**
 * 在调用 tailwind-merge 之前，从用户 className 中剥离黑名单 token。
 * 这样「锁定」的间距/边框/品牌色无法通过 consumer className 注入。
 */
export function stripLockedClasses(userClassName: string | undefined, lock: StyleLock): string {
  if (!userClassName?.trim()) return "";
  const tokens = userClassName.trim().split(/\s+/);
  const blacklist = lock.blacklist.map(ruleToRegex);
  return tokens.filter((t) => !blacklist.some((re) => re.test(t))).join(" ");
}
