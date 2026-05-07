import type { ComponentSpec, ComponentSpecRegistry } from "./types";
import dataTable from "./components/data-table.spec.json";
import button from "./components/button.spec.json";
import input from "./components/input.spec.json";
import badge from "./components/badge.spec.json";
import checkbox from "./components/checkbox.spec.json";

const specs: ComponentSpec[] = [
  dataTable as ComponentSpec,
  button as ComponentSpec,
  input as ComponentSpec,
  badge as ComponentSpec,
  checkbox as ComponentSpec,
];

export const componentSpecRegistry: ComponentSpecRegistry = Object.fromEntries(
  specs.map((s) => [s.id, s]),
);

export function listSpecs(): ComponentSpec[] {
  return specs;
}
