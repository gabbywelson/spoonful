// Utility functions for Convex

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDate(): string {
	const now = new Date();
	return now.toISOString().split("T")[0];
}

/**
 * Generate a random invite code for households
 */
export function generateInviteCode(): string {
	const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed similar-looking chars
	let code = "";
	for (let i = 0; i < 6; i++) {
		code += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return code;
}

/**
 * Calculate the maximum spoons a user should be assigned based on energy level
 */
export function getMaxSpoonsForEnergyLevel(energyLevel: "red" | "yellow" | "green"): number {
	switch (energyLevel) {
		case "red":
			return 3; // Low energy - only 3 spoons worth of chores
		case "yellow":
			return 6; // Medium energy - moderate load
		case "green":
			return 10; // High energy - full capacity
	}
}
