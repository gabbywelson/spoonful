// Clerk authentication configuration for Convex
// This tells Convex how to verify Clerk JWTs
//
// Set CLERK_ISSUER_URL in your Convex dashboard environment variables:
// - Development: https://star-elk-18.clerk.accounts.dev (or your dev Clerk domain)
// - Production: Your production Clerk Frontend API URL
//
// Find it at: Clerk Dashboard → Configure → API Keys → Frontend API URL

const clerkIssuerUrl =
	process.env.CLERK_ISSUER_URL ?? "https://star-elk-18.clerk.accounts.dev";

export default {
	providers: [
		{
			domain: clerkIssuerUrl,
			applicationID: "convex",
		},
	],
};
