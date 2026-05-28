import {
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  useQueryStates,
} from "nuqs";

import {
  PROGRAM_FORMAT,
  PROGRAM_LEVEL,
  PROGRAM_SCHEDULE_TYPE,
  PROGRAM_STATUS,
} from "@/lib/enums/enums";

import z from "zod";
import { REGISTRATION_TYPE } from "@/app/db/schema";

export const useProgramFilters = () => {
  return useQueryStates({
    /* Search */
    searchQuery: parseAsString.withDefault(""),

    /* Filters */
    status: parseAsStringEnum(z.enum(PROGRAM_STATUS).options),

    categoryId: parseAsString,

    format: parseAsStringEnum(z.enum(PROGRAM_FORMAT).options),

    level: parseAsStringEnum(z.enum(PROGRAM_LEVEL).options),

    scheduleType: parseAsStringEnum(z.enum(PROGRAM_SCHEDULE_TYPE).options),

    registrationType: parseAsStringEnum(z.enum(REGISTRATION_TYPE).options),

    /* Pagination */
    page: parseAsInteger.withDefault(1),

    limit: parseAsInteger.withDefault(10),
  });
};
