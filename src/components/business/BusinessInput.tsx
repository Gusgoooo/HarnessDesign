import { Input } from "@/components/starter/input";
import { createBusinessComponent } from "./business-wrapper";
import spec from "@/harness/schema/components/input.spec.json";
import type { ComponentSpec } from "@/harness/schema/types";

/**
 * BusinessInput：经 schema styleLock 治理的 Input，consumer className 经黑名单剥离后再合并。
 */
export const BusinessInput = createBusinessComponent(spec as ComponentSpec, Input);
