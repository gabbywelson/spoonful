import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireCurrentUser, isHouseholdMember } from "./lib/auth";
import { getTodayDate } from "./lib/utils";
import { energyLevel } from "./schema";

/**
 * Get the current user's status for today
 */
export const getMyToday = query({
	args: { householdId: v.id("households") },
	handler: async (ctx, args) => {
		const user = await requireCurrentUser(ctx);

		if (!(await isHouseholdMember(ctx, user._id, args.householdId))) {
			throw new Error("Not a member of this household");
		}

		const today = getTodayDate();

		return await ctx.db
			.query("dailyStatus")
			.withIndex("by_user_and_date", (q) => q.eq("userId", user._id).eq("date", today))
			.unique();
	},
});

/**
 * Get all household members' status for today
 */
export const getHouseholdToday = query({
	args: { householdId: v.id("households") },
	handler: async (ctx, args) => {
		const user = await requireCurrentUser(ctx);

		if (!(await isHouseholdMember(ctx, user._id, args.householdId))) {
			throw new Error("Not a member of this household");
		}

		const today = getTodayDate();

		// Get all statuses for this household today
		const statuses = await ctx.db
			.query("dailyStatus")
			.withIndex("by_household_and_date", (q) =>
				q.eq("householdId", args.householdId).eq("date", today),
			)
			.collect();

		// Get user info for each status
		const statusesWithUsers = await Promise.all(
			statuses.map(async (status) => {
				const statusUser = await ctx.db.get(status.userId);
				return {
					...status,
					userName: statusUser?.name ?? "Unknown",
					avatarUrl: statusUser?.avatarUrl,
				};
			}),
		);

		return statusesWithUsers;
	},
});

/**
 * Set energy level for today
 */
export const setToday = mutation({
	args: {
		householdId: v.id("households"),
		energyLevel: energyLevel,
		notes: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const user = await requireCurrentUser(ctx);

		if (!(await isHouseholdMember(ctx, user._id, args.householdId))) {
			throw new Error("Not a member of this household");
		}

		const today = getTodayDate();

		// Check for existing status
		const existing = await ctx.db
			.query("dailyStatus")
			.withIndex("by_user_and_date", (q) => q.eq("userId", user._id).eq("date", today))
			.unique();

		if (existing) {
			await ctx.db.patch(existing._id, {
				energyLevel: args.energyLevel,
				notes: args.notes,
			});
			return existing._id;
		}

		return await ctx.db.insert("dailyStatus", {
			userId: user._id,
			householdId: args.householdId,
			date: today,
			energyLevel: args.energyLevel,
			notes: args.notes,
		});
	},
});

/**
 * Get status history for a user
 */
export const getHistory = query({
	args: {
		householdId: v.id("households"),
		days: v.optional(v.number()), // defaults to 7
	},
	handler: async (ctx, args) => {
		const user = await requireCurrentUser(ctx);

		if (!(await isHouseholdMember(ctx, user._id, args.householdId))) {
			throw new Error("Not a member of this household");
		}

		const statuses = await ctx.db
			.query("dailyStatus")
			.withIndex("by_user", (q) => q.eq("userId", user._id))
			.order("desc")
			.take(args.days ?? 7);

		return statuses;
	},
});
