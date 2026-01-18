import type { QueryCtx, MutationCtx } from "../_generated/server";

/**
 * Get the current authenticated user from Clerk identity
 * Returns null if not authenticated
 */
export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
	const identity = await ctx.auth.getUserIdentity();
	if (!identity) {
		return null;
	}

	// Find user by Clerk ID
	const user = await ctx.db
		.query("users")
		.withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
		.unique();

	return user;
}

/**
 * Get the current authenticated user, throwing if not found
 */
export async function requireCurrentUser(ctx: QueryCtx | MutationCtx) {
	const user = await getCurrentUser(ctx);
	if (!user) {
		throw new Error("Not authenticated");
	}
	return user;
}

/**
 * Check if a user is a member of a household
 */
export async function isHouseholdMember(
	ctx: QueryCtx | MutationCtx,
	userId: string,
	householdId: string,
) {
	const membership = await ctx.db
		.query("householdMembers")
		.withIndex("by_user_and_household", (q) =>
			// biome-ignore lint/suspicious/noExplicitAny: Convex Id types
			q.eq("userId", userId as any).eq("householdId", householdId as any),
		)
		.unique();

	return membership !== null;
}

/**
 * Check if a user is an admin of a household
 */
export async function isHouseholdAdmin(
	ctx: QueryCtx | MutationCtx,
	userId: string,
	householdId: string,
) {
	const membership = await ctx.db
		.query("householdMembers")
		.withIndex("by_user_and_household", (q) =>
			// biome-ignore lint/suspicious/noExplicitAny: Convex Id types
			q.eq("userId", userId as any).eq("householdId", householdId as any),
		)
		.unique();

	return membership?.role === "admin";
}
