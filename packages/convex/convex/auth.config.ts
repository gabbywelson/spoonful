// Clerk authentication configuration for Convex
// This tells Convex how to verify Clerk JWTs

export default {
	providers: [
		{
			// The domain is your Clerk Frontend API domain
			// It will be something like: your-app.clerk.accounts.dev
			domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
			applicationID: "convex",
		},
	],
};
