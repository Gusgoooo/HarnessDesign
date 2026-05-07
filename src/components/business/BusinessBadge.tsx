import { Badge } from "@/components/starter/badge";
import { createBusinessComponent } from "./business-wrapper";
import spec from "@/harness/schema/components/badge.spec.json";
import type { ComponentSpec } from "@/harness/schema/types";

/**
 * BusinessBadge：经 schema styleLock 治理的 Badge，consumer className 经黑名单剥离后再合并。
 */
export const BusinessBadge = createBusinessComponent(spec as ComponentSpec, Badge);
