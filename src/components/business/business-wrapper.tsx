import * as React from "react";
import { twMerge } from "tailwind-merge";
import type { ComponentSpec } from "@/harness/schema/types";
import { stripLockedClasses } from "@/harness/schema/style-merge";

type AnyProps = Record<string, unknown>;

/**
 * 将任意 Shadcn / Headless 包装为「业务组件」的高阶工厂：
 * - 统一合并 className 前先剥离 schema 黑名单
 * - 同一套模式可在 ~5 分钟内复制到 Button / Input 等
 */
export function createBusinessComponent<P extends { className?: string }>(
  spec: ComponentSpec,
  Inner: React.ComponentType<P>,
): React.ForwardRefExoticComponent<React.PropsWithoutRef<P> & React.RefAttributes<Element>> {
  const displayName = spec.componentName;
  const Wrapped = React.forwardRef<Element, P>(function BusinessWrapped(props, ref) {
    const { className, ...rest } = props as P & { className?: string };
    const safeUser = stripLockedClasses(className, spec.styleLock);
    const merged = twMerge(spec.styleLock.baselineTokens.join(" "), safeUser);
    return <Inner {...(rest as P)} ref={ref as never} className={merged} />;
  });
  Wrapped.displayName = displayName;
  return Wrapped as unknown as React.ForwardRefExoticComponent<
    React.PropsWithoutRef<P> & React.RefAttributes<Element>
  >;
}
