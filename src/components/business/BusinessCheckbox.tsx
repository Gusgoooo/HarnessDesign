import { Checkbox } from "@/components/starter/checkbox";
import { createBusinessComponent } from "./business-wrapper";
import spec from "@/harness/schema/components/checkbox.spec.json";
import type { ComponentSpec } from "@/harness/schema/types";

/**
 * BusinessCheckbox：经 schema styleLock 治理的 Checkbox，consumer className 经黑名单剥离后再合并。
 */
export const BusinessCheckbox = createBusinessComponent(spec as ComponentSpec, Checkbox);
