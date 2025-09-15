import z from "zod";

export const ZGetListParams = z.object({
	page: z.number().min(1),
	numberPerPage: z.number().min(1),
});
