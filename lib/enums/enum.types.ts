import { SelectOption } from "@/components/Form";

export type EnumTone =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral";

export type EnumMeta = {
  label: string;

  shortLabel?: string;

  icon?: string;

  shortDesc?: string;

  longDesc?: string;

  color?: string;

  tone?: EnumTone;
};

export type EnumMetaRecord<T extends string> = Record<T, EnumMeta>;

export type EnumOptions<T extends string> = SelectOption<T>;
