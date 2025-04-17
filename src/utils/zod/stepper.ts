// utils/zodStep.ts
import { z, type ZodTypeAny } from "zod";

const STEP_KEY = "__formStep";

declare module "zod" {
  interface ZodTypeDef {
    [STEP_KEY]?: number;
  }
}

/**
 * Annotates a Zod schema (object OR primitive) with the step index.
 */
export const withStep = <T extends ZodTypeAny>(schema: T, step: number): T => {
  const schemaCloned = schema.clone();
  return Object.assign(schemaCloned, {
    _def: { ...schema._def, [STEP_KEY]: step },
  }) as T;
};
