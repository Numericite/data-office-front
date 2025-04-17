import { z } from "zod";
import { dataContractSchema } from "~/utils/forms/data-contract/schema";
import { buildStepMap } from "~/utils/zod/stepper";

export const STEP_MAP = buildStepMap(dataContractSchema);

export const STEP_SCHEMAS = Object.fromEntries(
  Object.entries(STEP_MAP).map(([step, keys]) => {
    const pickShape = Object.fromEntries(keys.map((k) => [k, true])) as Record<
      keyof typeof dataContractSchema.shape,
      true
    >;
    return [Number(step), dataContractSchema.pick(pickShape)];
  })
) as Record<number, z.ZodObject<any>>;

export const STEPS = Object.keys(STEP_MAP).length;
export const STEP_LABELS = [
  "Informations générales",
  "Liste des données",
  "Personnes impliquées",
] as const;
