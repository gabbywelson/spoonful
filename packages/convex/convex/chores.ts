import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { defaultChores } from "./defaultChores";
import { isHouseholdAdmin, isHouseholdMember, requireCurrentUser } from "./lib/auth";
import { choreFrequency } from "./schema";

/**
 * Get all chores for a household
 */
export const list = query({
	args: { householdId: v.id("households") },
	handler: async (ctx, args) => {
		const user = await requireCurrentUser(ctx);

		if (!(await isHouseholdMember(ctx, user._id, args.householdId))) {
			throw new Error("Not a member of this household");
		}

		const chores = await ctx.db
			.query("chores")
			.withIndex("by_household", (q) => q.eq("householdId", args.householdId))
			.collect();

		// Get user's preferences for each chore
		const choresWithPreferences = await Promise.all(
			chores.map(async (chore) => {
				const preference = await ctx.db
					.query("chorePreferences")
					.withIndex("by_user_and_chore", (q) => q.eq("userId", user._id).eq("choreId", chore._id))
					.unique();

				return {
					...chore,
					mySpoonCost: preference?.spoonCost ?? chore.defaultSpoonCost,
				};
			}),
		);

		return choresWithPreferences;
	},
});

/**
 * Get the default chore catalog
 */
export const defaults = query({
	args: {},
	handler: async (ctx) => {
		await requireCurrentUser(ctx);
		return defaultChores;
	},
});

/**
 * Get a single chore
 */
export const get = query({
	args: { choreId: v.id("chores") },
	handler: async (ctx, args) => {
		const user = await requireCurrentUser(ctx);
		const chore = await ctx.db.get(args.choreId);

		if (!chore) return null;

		if (!(await isHouseholdMember(ctx, user._id, chore.householdId))) {
			throw new Error("Not a member of this household");
		}

		// Get all member preferences for this chore
		const preferences = await ctx.db
			.query("chorePreferences")
			.withIndex("by_chore", (q) => q.eq("choreId", args.choreId))
			.collect();

		const preferencesWithUsers = await Promise.all(
			preferences.map(async (pref) => {
				const prefUser = await ctx.db.get(pref.userId);
				return {
					...pref,
					userName: prefUser?.name ?? "Unknown",
				};
			}),
		);

		return {
			...chore,
			preferences: preferencesWithUsers,
		};
	},
});

/**
 * Create a new chore
 */
export const create = mutation({
	args: {
		householdId: v.id("households"),
		name: v.string(),
		description: v.optional(v.string()),
		frequency: choreFrequency,
		frequencyDays: v.optional(v.number()),
		isUnpleasant: v.boolean(),
		defaultSpoonCost: v.number(),
	},
	handler: async (ctx, args) => {
		const user = await requireCurrentUser(ctx);

		if (!(await isHouseholdMember(ctx, user._id, args.householdId))) {
			throw new Error("Not a member of this household");
		}

		// Validate spoon cost
		if (args.defaultSpoonCost < 1 || args.defaultSpoonCost > 5) {
			throw new Error("Spoon cost must be between 1 and 5");
		}

		// Validate custom frequency
		if (args.frequency === "custom" && !args.frequencyDays) {
			throw new Error("Custom frequency requires frequencyDays");
		}

		const choreId = await ctx.db.insert("chores", {
			householdId: args.householdId,
			name: args.name,
			description: args.description,
			frequency: args.frequency,
			frequencyDays: args.frequencyDays,
			isUnpleasant: args.isUnpleasant,
			defaultSpoonCost: args.defaultSpoonCost,
			isActive: true,
		});

		return choreId;
	},
});

/**
 * Create multiple chores from the default catalog
 */
export const createManyFromDefaults = mutation({
	args: {
		householdId: v.id("households"),
		choreKeys: v.array(v.string()),
	},
	handler: async (ctx, args) => {
		const user = await requireCurrentUser(ctx);

		if (!(await isHouseholdMember(ctx, user._id, args.householdId))) {
			throw new Error("Not a member of this household");
		}

		const selectedDefaults = defaultChores.filter((chore) => args.choreKeys.includes(chore.key));

		const existingChores = await ctx.db
			.query("chores")
			.withIndex("by_household", (q) => q.eq("householdId", args.householdId))
			.collect();

		const existingNames = new Set(
			existingChores.filter((chore) => chore.isActive).map((chore) => chore.name.toLowerCase()),
		);

		const createdIds = [];

		for (const chore of selectedDefaults) {
			const normalizedName = chore.name.toLowerCase();
			if (existingNames.has(normalizedName)) {
				continue;
			}

			const choreId = await ctx.db.insert("chores", {
				householdId: args.householdId,
				name: chore.name,
				description: chore.description,
				frequency: chore.frequency,
				frequencyDays: chore.frequencyDays,
				isUnpleasant: chore.isUnpleasant,
				defaultSpoonCost: chore.defaultSpoonCost,
				isActive: true,
			});

			existingNames.add(normalizedName);
			createdIds.push(choreId);
		}

		return {
			createdIds,
			skippedCount: selectedDefaults.length - createdIds.length,
		};
	},
});

/**
 * Update a chore (admin only)
 */
export const update = mutation({
	args: {
		choreId: v.id("chores"),
		name: v.optional(v.string()),
		description: v.optional(v.string()),
		frequency: v.optional(choreFrequency),
		frequencyDays: v.optional(v.number()),
		isUnpleasant: v.optional(v.boolean()),
		defaultSpoonCost: v.optional(v.number()),
		isActive: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const user = await requireCurrentUser(ctx);
		const chore = await ctx.db.get(args.choreId);

		if (!chore) {
			throw new Error("Chore not found");
		}

		if (!(await isHouseholdAdmin(ctx, user._id, chore.householdId))) {
			throw new Error("Only admins can update chores");
		}

		if (
			args.defaultSpoonCost !== undefined &&
			(args.defaultSpoonCost < 1 || args.defaultSpoonCost > 5)
		) {
			throw new Error("Spoon cost must be between 1 and 5");
		}

		const { choreId: _, ...updates } = args;
		await ctx.db.patch(args.choreId, updates);

		return args.choreId;
	},
});

/**
 * Delete a chore (admin only)
 */
export const remove = mutation({
	args: { choreId: v.id("chores") },
	handler: async (ctx, args) => {
		const user = await requireCurrentUser(ctx);
		const chore = await ctx.db.get(args.choreId);

		if (!chore) {
			throw new Error("Chore not found");
		}

		if (!(await isHouseholdAdmin(ctx, user._id, chore.householdId))) {
			throw new Error("Only admins can delete chores");
		}

		// Soft delete by marking inactive
		await ctx.db.patch(args.choreId, { isActive: false });
	},
});

/**
 * Set personal spoon cost for a chore
 */
export const setPreference = mutation({
	args: {
		choreId: v.id("chores"),
		spoonCost: v.number(),
	},
	handler: async (ctx, args) => {
		const user = await requireCurrentUser(ctx);
		const chore = await ctx.db.get(args.choreId);

		if (!chore) {
			throw new Error("Chore not found");
		}

		if (!(await isHouseholdMember(ctx, user._id, chore.householdId))) {
			throw new Error("Not a member of this household");
		}

		if (args.spoonCost < 1 || args.spoonCost > 5) {
			throw new Error("Spoon cost must be between 1 and 5");
		}

		// Check for existing preference
		const existing = await ctx.db
			.query("chorePreferences")
			.withIndex("by_user_and_chore", (q) => q.eq("userId", user._id).eq("choreId", args.choreId))
			.unique();

		if (existing) {
			await ctx.db.patch(existing._id, { spoonCost: args.spoonCost });
			return existing._id;
		}

		return await ctx.db.insert("chorePreferences", {
			userId: user._id,
			choreId: args.choreId,
			spoonCost: args.spoonCost,
		});
	},
});
