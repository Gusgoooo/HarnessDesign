import { Button } from "@/components/starter/button";
import { createBusinessComponent } from "./business-wrapper";
import spec from "@/harness/schema/components/button.spec.json";
import type { ComponentSpec } from "@/harness/schema/types";

/**
 * BusinessButton：经 schema styleLock 治理的 Button，consumer className 经黑名单剥离后再合并。
 * 通过 variant / size 语义 props 控制外观，禁止手写间距与品牌色。
 */
export const BusinessButton = createBusinessComponent(spec as ComponentSpec, Button);
