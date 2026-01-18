import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireCurrentUser, isHouseholdMember, isHouseholdAdmin } from "./lib/auth";
import { generateInviteCode } from "./lib/utils";

/**
 * Get all households the current user belongs to
 */
export const list = query({
	args: {},
	handler: async (ctx) => {
		const user = await requireCurrentUser(ctx);

		// Get all memberships for this user
		const memberships = await ctx.db
			.query("householdMembers")
			.withIndex("by_user", (q) => q.eq("userId", user._id))
			.collect();

		// Fetch household details for each membership
		const households = await Promise.all(
			memberships.map(async (membership) => {
				const household = await ctx.db.get(membership.householdId);
				if (!household) return null;

				// Get member count
				const members = await ctx.db
					.query("householdMembers")
					.withIndex("by_household", (q) => q.eq("householdId", household._id))
					.collect();

				return {
					...household,
					role: membership.role,
					memberCount: members.length,
				};
			}),
		);

		return households.filter(Boolean);
	},
});

/**
 * Get a single household by ID
 */
export const get = query({
	args: { householdId: v.id("households") },
	handler: async (ctx, args) => {
		const user = await requireCurrentUser(ctx);

		// Verify membership
		if (!(await isHouseholdMember(ctx, user._id, args.householdId))) {
			throw new Error("Not a member of this household");
		}

		const household = await ctx.db.get(args.householdId);
		if (!household) return null;

		// Get all members with their user info
		const memberships = await ctx.db
			.query("householdMembers")
			.withIndex("by_household", (q) => q.eq("householdId", args.householdId))
			.collect();

		const members = await Promise.all(
			memberships.map(async (m) => {
				const memberUser = await ctx.db.get(m.userId);
				return {
					...m,
					user: memberUser,
				};
			}),
		);

		return {
			...household,
			members,
		};
	},
});

/**
 * Create a new household
 */
export const create = mutation({
	args: {
		name: v.string(),
	},
	handler: async (ctx, args) => {
		const user = await requireCurrentUser(ctx);

		// Generate unique invite code
		let inviteCode = generateInviteCode();
		let existing = await ctx.db
			.query("households")
			.withIndex("by_invite_code", (q) => q.eq("inviteCode", inviteCode))
			.unique();

		// Keep generating until we get a unique code
		while (existing) {
			inviteCode = generateInviteCode();
			existing = await ctx.db
				.query("households")
				.withIndex("by_invite_code", (q) => q.eq("inviteCode", inviteCode))
				.unique();
		}

		// Create household
		const householdId = await ctx.db.insert("households", {
			name: args.name,
			inviteCode,
			createdBy: user._id,
		});

		// Add creator as admin member
		await ctx.db.insert("householdMembers", {
			userId: user._id,
			householdId,
			role: "admin",
			joinedAt: Date.now(),
		});

		return householdId;
	},
});

/**
 * Join a household via invite code
 */
export const join = mutation({
	args: {
		inviteCode: v.string(),
	},
	handler: async (ctx, args) => {
		const user = await requireCurrentUser(ctx);

		// Find household by invite code
		const household = await ctx.db
			.query("households")
			.withIndex("by_invite_code", (q) => q.eq("inviteCode", args.inviteCode.toUpperCase()))
			.unique();

		if (!household) {
			throw new Error("Invalid invite code");
		}

		// Check if already a member
		if (await isHouseholdMember(ctx, user._id, household._id)) {
			throw new Error("Already a member of this household");
		}

		// Add as member
		await ctx.db.insert("householdMembers", {
			userId: user._id,
			householdId: household._id,
			role: "member",
			joinedAt: Date.now(),
		});

		return household._id;
	},
});

/**
 * Update household name (admin only)
 */
export const update = mutation({
	args: {
		householdId: v.id("households"),
		name: v.string(),
	},
	handler: async (ctx, args) => {
		const user = await requireCurrentUser(ctx);

		if (!(await isHouseholdAdmin(ctx, user._id, args.householdId))) {
			throw new Error("Only admins can update household settings");
		}

		await ctx.db.patch(args.householdId, { name: args.name });
		return args.householdId;
	},
});

/**
 * Regenerate invite code (admin only)
 */
export const regenerateInviteCode = mutation({
	args: {
		householdId: v.id("households"),
	},
	handler: async (ctx, args) => {
		const user = await requireCurrentUser(ctx);

		if (!(await isHouseholdAdmin(ctx, user._id, args.householdId))) {
			throw new Error("Only admins can regenerate invite codes");
		}

		let inviteCode = generateInviteCode();
		let existing = await ctx.db
			.query("households")
			.withIndex("by_invite_code", (q) => q.eq("inviteCode", inviteCode))
			.unique();

		while (existing) {
			inviteCode = generateInviteCode();
			existing = await ctx.db
				.query("households")
				.withIndex("by_invite_code", (q) => q.eq("inviteCode", inviteCode))
				.unique();
		}

		await ctx.db.patch(args.householdId, { inviteCode });
		return inviteCode;
	},
});

/**
 * Leave a household
 */
export const leave = mutation({
	args: {
		householdId: v.id("households"),
	},
	handler: async (ctx, args) => {
		const user = await requireCurrentUser(ctx);

		const membership = await ctx.db
			.query("householdMembers")
			.withIndex("by_user_and_household", (q) =>
				q.eq("userId", user._id).eq("householdId", args.householdId),
			)
			.unique();

		if (!membership) {
			throw new Error("Not a member of this household");
		}

		// Check if this is the last admin
		if (membership.role === "admin") {
			const allMembers = await ctx.db
				.query("householdMembers")
				.withIndex("by_household", (q) => q.eq("householdId", args.householdId))
				.collect();

			const admins = allMembers.filter((m) => m.role === "admin");
			if (admins.length === 1 && allMembers.length > 1) {
				throw new Error("Cannot leave: you are the only admin. Promote another member first.");
			}
		}

		await ctx.db.delete(membership._id);
	},
});
