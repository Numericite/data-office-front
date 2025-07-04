import type { z, ZodTypeAny } from "zod";

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

type StepMap = { [step: number]: string[] };

export function buildStepMap(schema: z.ZodSchema): StepMap {
	const map: StepMap = {};
	Object.entries((schema as z.ZodObject<z.ZodRawShape>).shape).forEach(
		([key, value]) => {
			// biome-ignore lint/suspicious/noExplicitAny: dasdsa
			const step = ((value as z.ZodTypeAny)._def as any).__formStep;
			if (step === undefined) return;
			map[step] ??= [];
			map[step].push(key);
		},
	);
	return map;
}
