import { generateOpenApiDocument } from "trpc-to-openapi";
import { appRouter } from "./api/root";

export const openApiDocument = generateOpenApiDocument(appRouter, {
	title: "Data Office API",
	description: "API documentation for the Data Office application",
	version: "1.0.0",
	baseUrl: `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/api`,
});
