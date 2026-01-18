import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	/**
	 * Client-side environment variables for Expo
	 * Must be prefixed with EXPO_PUBLIC_ to be included in the app bundle
	 */
	clientPrefix: "EXPO_PUBLIC_",
	client: {
		EXPO_PUBLIC_CONVEX_URL: z.string().url().describe("Convex deployment URL"),
		EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: z
			.string()
			.startsWith("pk_")
			.describe("Clerk publishable key"),
	},

	/**
	 * Server-side environment variables (build-time only)
	 */
	server: {
		// Add build-time env vars here if needed
	},

	/**
	 * Runtime environment - uses process.env in Expo/React Native
	 */
	runtimeEnv: {
		EXPO_PUBLIC_CONVEX_URL: process.env.EXPO_PUBLIC_CONVEX_URL,
		EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
	},

	/**
	 * Skip validation in certain environments
	 */
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,

	/**
	 * Treat empty strings as undefined
	 */
	emptyStringAsUndefined: true,
});
