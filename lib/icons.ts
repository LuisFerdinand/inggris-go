import * as Icons from "lucide-react";

export const ICON_NAMES = Object.keys(Icons)
  .filter((key) => typeof (Icons as any)[key] === "function")
  .map((key) => key.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase());
