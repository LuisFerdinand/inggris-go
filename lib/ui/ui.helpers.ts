import { TONE_STYLES } from "@/lib/ui/ui.index";
import { EnumTone } from "../enums/enum.types";

export function getToneStyle(tone?: EnumTone) {
  return TONE_STYLES[tone ?? "neutral"];
}
