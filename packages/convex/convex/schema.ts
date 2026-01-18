import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Energy level type for daily check-ins
export const energyLevel = v.union(v.literal("red"), v.literal("yellow"), v.literal("green"));

// Frequency type for chores
export const choreFrequency = v.union(
	v.literal("daily"),
	v.literal("weekly"),
	v.literal("monthly"),
	v.literal("custom"),
);

// Role type for household members
export const memberRole = v.union(v.literal("admin"), v.literal("member"));

export default defineSchema({
	// Users synced from Clerk
	users: defineTable({
		clerkId: v.string(),
		email: v.string(),
		name: v.string(),
		avatarUrl: v.optional(v.string()),
	}).index("by_clerk_id", ["clerkId"]),

	// Households (groups of users)
	households: defineTable({
		name: v.string(),
		inviteCode: v.string(),
		createdBy: v.id("users"),
	}).index("by_invite_code", ["inviteCode"]),

	// Join table for users <-> households
	householdMembers: defineTable({
		userId: v.id("users"),
		householdId: v.id("households"),
		role: memberRole,
		joinedAt: v.number(), // timestamp
	})
		.index("by_user", ["userId"])
		.index("by_household", ["householdId"])
		.index("by_user_and_household", ["userId", "householdId"]),

	// Chore definitions
	chores: defineTable({
		householdId: v.id("households"),
		name: v.string(),
		description: v.optional(v.string()),
		frequency: choreFrequency,
		frequencyDays: v.optional(v.number()), // for custom frequency
		isUnpleasant: v.boolean(), // track for fairness
		defaultSpoonCost: v.number(), // default 1-5 cost
		isActive: v.boolean(),
	}).index("by_household", ["householdId"]),

	// Personal preferences for each chore
	chorePreferences: defineTable({
		userId: v.id("users"),
		choreId: v.id("chores"),
		spoonCost: v.number(), // 1-5, personal override
	})
		.index("by_user", ["userId"])
		.index("by_chore", ["choreId"])
		.index("by_user_and_chore", ["userId", "choreId"]),

	// Daily energy status check-ins
	dailyStatus: defineTable({
		userId: v.id("users"),
		householdId: v.id("households"),
		date: v.string(), // YYYY-MM-DD format
		energyLevel: energyLevel,
		notes: v.optional(v.string()), // optional notes for the day
	})
		.index("by_user", ["userId"])
		.index("by_user_and_date", ["userId", "date"])
		.index("by_household_and_date", ["householdId", "date"]),

	// Chore assignments for each day
	choreAssignments: defineTable({
		choreId: v.id("chores"),
		householdId: v.id("households"),
		assignedTo: v.id("users"),
		date: v.string(), // YYYY-MM-DD format
		completed: v.boolean(),
		completedAt: v.optional(v.number()), // timestamp when completed
		skipped: v.boolean(), // if someone couldn't do it
		skippedReason: v.optional(v.string()),
	})
		.index("by_household_and_date", ["householdId", "date"])
		.index("by_user_and_date", ["assignedTo", "date"])
		.index("by_chore", ["choreId"]),

	// Historical completion tracking for fairness calculations
	choreCompletions: defineTable({
		choreId: v.id("chores"),
		householdId: v.id("households"),
		completedBy: v.id("users"),
		completedAt: v.number(), // timestamp
		wasUnpleasant: v.boolean(), // snapshot of whether chore was marked unpleasant
	})
		.index("by_household", ["householdId"])
		.index("by_user", ["completedBy"])
		.index("by_chore", ["choreId"]),
});
