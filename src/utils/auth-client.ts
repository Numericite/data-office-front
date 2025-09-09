import { createAuthClient } from "better-auth/react";
import {
	inferAdditionalFields,
	genericOAuthClient,
} from "better-auth/client/plugins";
import type { auth } from "./auth";

export const authClient = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
	plugins: [inferAdditionalFields<typeof auth>(), genericOAuthClient()],
});

export type Session = typeof authClient.$Infer.Session;
