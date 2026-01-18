import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireCurrentUser, isHouseholdMember } from "./lib/auth";
import { getTodayDate, getMaxSpoonsForEnergyLevel } from "./lib/utils";

/**
 * Get today's assignments for a household
 */
export const getToday = query({
	args: { householdId: v.id("households") },
	handler: async (ctx, args) => {
		const user = await requireCurrentUser(ctx);

		if (!(await isHouseholdMember(ctx, user._id, args.householdId))) {
			throw new Error("Not a member of this household");
		}

		const today = getTodayDate();

		const assignments = await ctx.db
			.query("choreAssignments")
			.withIndex("by_household_and_date", (q) =>
				q.eq("householdId", args.householdId).eq("date", today),
			)
			.collect();

		// Enrich with chore and user details
		const enrichedAssignments = await Promise.all(
			assignments.map(async (assignment) => {
				const chore = await ctx.db.get(assignment.choreId);
				const assignee = await ctx.db.get(assignment.assignedTo);

				return {
					...assignment,
					choreName: chore?.name ?? "Unknown",
					choreDescription: chore?.description,
					isUnpleasant: chore?.isUnpleasant ?? false,
					assigneeName: assignee?.name ?? "Unknown",
					assigneeAvatar: assignee?.avatarUrl,
				};
			}),
		);

		return enrichedAssignments;
	},
});

/**
 * Get my assignments for today
 */
export const getMyToday = query({
	args: { householdId: v.id("households") },
	handler: async (ctx, args) => {
		const user = await requireCurrentUser(ctx);

		if (!(await isHouseholdMember(ctx, user._id, args.householdId))) {
			throw new Error("Not a member of this household");
		}

		const today = getTodayDate();

		const assignments = await ctx.db
			.query("choreAssignments")
			.withIndex("by_user_and_date", (q) => q.eq("assignedTo", user._id).eq("date", today))
			.collect();

		// Filter to this household and enrich
		const householdAssignments = await Promise.all(
			assignments
				.filter((a) => a.householdId === args.householdId)
				.map(async (assignment) => {
					const chore = await ctx.db.get(assignment.choreId);

					// Get user's spoon cost preference
					const preference = await ctx.db
						.query("chorePreferences")
						.withIndex("by_user_and_chore", (q) =>
							q.eq("userId", user._id).eq("choreId", assignment.choreId),
						)
						.unique();

					return {
						...assignment,
						choreName: chore?.name ?? "Unknown",
						choreDescription: chore?.description,
						isUnpleasant: chore?.isUnpleasant ?? false,
						spoonCost: preference?.spoonCost ?? chore?.defaultSpoonCost ?? 2,
					};
				}),
		);

		return householdAssignments;
	},
});

/**
 * Mark an assignment as complete
 */
export const complete = mutation({
	args: { assignmentId: v.id("choreAssignments") },
	handler: async (ctx, args) => {
		const user = await requireCurrentUser(ctx);
		const assignment = await ctx.db.get(args.assignmentId);

		if (!assignment) {
			throw new Error("Assignment not found");
		}

		// Only the assigned person can complete it
		if (assignment.assignedTo !== user._id) {
			throw new Error("You can only complete your own assignments");
		}

		const now = Date.now();

		// Mark as complete
		await ctx.db.patch(args.assignmentId, {
			completed: true,
			completedAt: now,
		});

		// Record in completion history
		const chore = await ctx.db.get(assignment.choreId);
		await ctx.db.insert("choreCompletions", {
			choreId: assignment.choreId,
			householdId: assignment.householdId,
			completedBy: user._id,
			completedAt: now,
			wasUnpleasant: chore?.isUnpleasant ?? false,
		});

		return args.assignmentId;
	},
});

/**
 * Skip an assignment (couldn't do it today)
 */
export const skip = mutation({
	args: {
		assignmentId: v.id("choreAssignments"),
		reason: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const user = await requireCurrentUser(ctx);
		const assignment = await ctx.db.get(args.assignmentId);

		if (!assignment) {
			throw new Error("Assignment not found");
		}

		if (assignment.assignedTo !== user._id) {
			throw new Error("You can only skip your own assignments");
		}

		await ctx.db.patch(args.assignmentId, {
			skipped: true,
			skippedReason: args.reason,
		});

		return args.assignmentId;
	},
});

/**
 * Generate assignments for today based on energy levels
 * This is a simplified allocation algorithm
 */
export const generateForToday = mutation({
	args: { householdId: v.id("households") },
	handler: async (ctx, args) => {
		const user = await requireCurrentUser(ctx);

		if (!(await isHouseholdMember(ctx, user._id, args.householdId))) {
			throw new Error("Not a member of this household");
		}

		const today = getTodayDate();

		// Check if already generated
		const existingAssignments = await ctx.db
			.query("choreAssignments")
			.withIndex("by_household_and_date", (q) =>
				q.eq("householdId", args.householdId).eq("date", today),
			)
			.first();

		if (existingAssignments) {
			throw new Error("Assignments already generated for today");
		}

		// Get all members with their statuses
		const memberships = await ctx.db
			.query("householdMembers")
			.withIndex("by_household", (q) => q.eq("householdId", args.householdId))
			.collect();

		const memberData = await Promise.all(
			memberships.map(async (m) => {
				const status = await ctx.db
					.query("dailyStatus")
					.withIndex("by_user_and_date", (q) => q.eq("userId", m.userId).eq("date", today))
					.unique();

				return {
					userId: m.userId,
					energyLevel: status?.energyLevel ?? "yellow", // default to yellow if not set
					maxSpoons: getMaxSpoonsForEnergyLevel(status?.energyLevel ?? "yellow"),
					assignedSpoons: 0,
				};
			}),
		);

		// Get active chores that need to be done today
		const allChores = await ctx.db
			.query("chores")
			.withIndex("by_household", (q) => q.eq("householdId", args.householdId))
			.collect();

		const activeChores = allChores.filter((c) => c.isActive);

		// Simple allocation: distribute chores trying to respect energy levels
		const assignments: Array<{
			choreId: (typeof activeChores)[0]["_id"];
			assignedTo: (typeof memberData)[0]["userId"];
		}> = [];

		for (const chore of activeChores) {
			// Find the member with the most remaining capacity who can do this chore
			const availableMembers = memberData
				.filter((m) => m.assignedSpoons + chore.defaultSpoonCost <= m.maxSpoons)
				.sort((a, b) => b.maxSpoons - b.assignedSpoons - (a.maxSpoons - a.assignedSpoons));

			if (availableMembers.length > 0) {
				const selected = availableMembers[0];
				selected.assignedSpoons += chore.defaultSpoonCost;
				assignments.push({
					choreId: chore._id,
					assignedTo: selected.userId,
				});
			}
		}

		// Create assignment records
		for (const assignment of assignments) {
			await ctx.db.insert("choreAssignments", {
				choreId: assignment.choreId,
				householdId: args.householdId,
				assignedTo: assignment.assignedTo,
				date: today,
				completed: false,
				skipped: false,
			});
		}

		return assignments.length;
	},
});

/**
 * Get fairness stats (who has done what)
 */
export const getFairnessStats = query({
	args: {
		householdId: v.id("households"),
		days: v.optional(v.number()), // lookback period, default 30
	},
	handler: async (ctx, args) => {
		const user = await requireCurrentUser(ctx);

		if (!(await isHouseholdMember(ctx, user._id, args.householdId))) {
			throw new Error("Not a member of this household");
		}

		const lookbackDays = args.days ?? 30;
		const cutoff = Date.now() - lookbackDays * 24 * 60 * 60 * 1000;

		// Get all completions in the period
		const completions = await ctx.db
			.query("choreCompletions")
			.withIndex("by_household", (q) => q.eq("householdId", args.householdId))
			.collect();

		const recentCompletions = completions.filter((c) => c.completedAt >= cutoff);

		// Get household members
		const memberships = await ctx.db
			.query("householdMembers")
			.withIndex("by_household", (q) => q.eq("householdId", args.householdId))
			.collect();

		// Calculate stats per member
		const stats = await Promise.all(
			memberships.map(async (m) => {
				const memberUser = await ctx.db.get(m.userId);
				const memberCompletions = recentCompletions.filter((c) => c.completedBy === m.userId);

				return {
					userId: m.userId,
					userName: memberUser?.name ?? "Unknown",
					totalCompleted: memberCompletions.length,
					unpleasantCompleted: memberCompletions.filter((c) => c.wasUnpleasant).length,
				};
			}),
		);

		return stats;
	},
});
