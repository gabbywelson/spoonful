// Clerk authentication configuration for Convex
// This tells Convex how to verify Clerk JWTs
//
// IMPORTANT: Replace the domain below with your Clerk Frontend API URL
// Find it at: Clerk Dashboard → Configure → API Keys → Frontend API URL
// Example: "https://musical-duck-42.clerk.accounts.dev"

export default {
	providers: [
		{
			domain: "https://star-elk-18.clerk.accounts.dev",
			applicationID: "convex",
		},
	],
};
