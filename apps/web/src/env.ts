import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {},

	clientPrefix: "VITE_",

	client: {
		VITE_CONVEX_URL: z.string().url().describe("Convex deployment URL"),
		VITE_CLERK_PUBLISHABLE_KEY: z.string().startsWith("pk_").describe("Clerk publishable key"),
	},

	runtimeEnv: import.meta.env,

	emptyStringAsUndefined: true,

	skipValidation: !!import.meta.env.SKIP_ENV_VALIDATION,
});
