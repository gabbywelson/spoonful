import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, requireCurrentUser } from "./lib/auth";

/**
 * Get the current authenticated user
 */
export const me = query({
	args: {},
	handler: async (ctx) => {
		return await getCurrentUser(ctx);
	},
});

/**
 * Create or update a user from Clerk
 * This is called when a user signs in and needs to be synced to Convex
 * It verifies the caller's Clerk identity matches the provided clerkId
 */
export const upsertFromClerk = mutation({
	args: {
		clerkId: v.string(),
		email: v.string(),
		name: v.string(),
		avatarUrl: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		// Verify the caller is authenticated and their ID matches
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("Not authenticated");
		}
		if (identity.subject !== args.clerkId) {
			throw new Error("Cannot create user for different Clerk ID");
		}

		// Check if user already exists
		const existingUser = await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
			.unique();

		if (existingUser) {
			// Update existing user
			await ctx.db.patch(existingUser._id, {
				email: args.email,
				name: args.name,
				avatarUrl: args.avatarUrl,
			});
			return existingUser._id;
		}

		// Create new user
		const userId = await ctx.db.insert("users", {
			clerkId: args.clerkId,
			email: args.email,
			name: args.name,
			avatarUrl: args.avatarUrl,
		});

		return userId;
	},
});

/**
 * Update the current user's profile
 */
export const updateProfile = mutation({
	args: {
		name: v.optional(v.string()),
		avatarUrl: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const user = await requireCurrentUser(ctx);

		const updates: { name?: string; avatarUrl?: string } = {};
		if (args.name !== undefined) updates.name = args.name;
		if (args.avatarUrl !== undefined) updates.avatarUrl = args.avatarUrl;

		await ctx.db.patch(user._id, updates);
		return user._id;
	},
});
