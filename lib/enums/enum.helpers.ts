import { SelectOption } from "@/components/Form";
import { EnumMetaRecord } from "./enum.types";

export function createLabelMap<const T extends readonly string[]>(
  values: T,
  meta: EnumMetaRecord<T[number]>,
): Record<T[number], string> {
  return Object.fromEntries(
    values.map((value: T[number]) => [value, meta[value].label]),
  ) as Record<T[number], string>;
}

export function createOptions<const T extends readonly string[]>(
  values: T,
  meta: EnumMetaRecord<T[number]>,
): SelectOption<T[number]>[] {
  return values.map((value: T[number]) => ({
    id: value,
    label: meta[value].label,
    icon: meta[value].icon,
    shortDesc: meta[value].shortDesc,
    color: meta[value].color,
  }));
}
