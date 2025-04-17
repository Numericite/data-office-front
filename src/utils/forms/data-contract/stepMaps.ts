import { z } from "zod";
import { dataContractSchema } from "~/utils/forms/data-contract/schema";

type StepMap = { [step: number]: string[] };

export function buildStepMap(schema: z.ZodSchema): StepMap {
  const map: StepMap = {};
  Object.entries((schema as z.ZodObject<any>).shape).forEach(([key, value]) => {
    const step = ((value as z.ZodTypeAny)._def as any).__formStep ?? 0;
    map[step] ??= [];
    map[step].push(key);
  });
  return map;
}

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

export const STEPS = Object.keys(STEP_MAP).length; // 3
export const STEP_LABELS = [
  "Informations générales",
  "Liste des données",
  "Personnes impliquées",
] as const;
