import type { z } from "zod";

const STEP_TAG = "__formStep:" as const;

export const withStep = <T extends z.ZodTypeAny>(
	schema: T,
	step: number,
): T => {
	const existing = schema.description ? `${schema.description} ` : "";
	return schema.describe(`${existing}${STEP_TAG}${step}`) as T;
};

// Helper to extract the step number from a schema
const getStep = (s: z.ZodTypeAny): number | undefined => {
	const m = s.description?.match(/__formStep:(\d+)/);
	return m ? Number(m[1]) : undefined;
};

type StepMap = { [step: number]: string[] };

export function buildStepMap(schema: z.ZodObject<z.ZodRawShape>): StepMap {
	const map: StepMap = {};
	for (const [key, value] of Object.entries(schema.shape)) {
		const step = getStep(value as z.ZodTypeAny);
		if (step === undefined) continue;
		if (!map[step]) map[step] = [];
		map[step].push(key);
	}
	return map;
}
