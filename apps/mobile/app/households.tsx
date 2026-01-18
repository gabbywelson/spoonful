import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { Link, router } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { StatusBar } from "expo-status-bar";
import { useQuery } from "convex/react";
import { api } from "@spoonful/convex/convex/_generated/api";

const colors = {
	cream: "#faf8f5",
	creamDark: "#f0ede8",
	sage: "#a8c5a8",
	sageDark: "#8fb38f",
	sageLight: "#d4e5d4",
	lavender: "#c5b8d9",
	lavenderLight: "#e5dff0",
	text: "#4a4a4a",
	textLight: "#6b6b6b",
	textMuted: "#8b8b8b",
};

export default function HouseholdsScreen() {
	const { signOut } = useAuth();
	const households = useQuery(api.households.list);

	return (
		<View style={styles.container}>
			<StatusBar style="auto" />

			<View style={styles.header}>
				<Pressable onPress={() => router.back()}>
					<Text style={styles.backButton}>← Back</Text>
				</Pressable>
				<Text style={styles.title}>Your Households</Text>
			</View>

			<ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
				{households === undefined ? (
					<View style={styles.emptyCard}>
						<Text style={styles.emptyText}>Loading...</Text>
					</View>
				) : households.length === 0 ? (
					<View style={styles.emptyCard}>
						<Text style={styles.emptyTitle}>No households yet</Text>
						<Text style={styles.emptyText}>
							Create a new household or join one with an invite code to get started.
						</Text>
					</View>
				) : (
					<View style={styles.householdList}>
						{households.map((household) => (
							<View key={household._id} style={styles.householdCard}>
								<Text style={styles.householdName}>{household.name}</Text>
								<Text style={styles.householdMeta}>
									{household.memberCount} member{household.memberCount !== 1 ? "s" : ""}
									{household.role === "admin" && " • Admin"}
								</Text>
							</View>
						))}
					</View>
				)}

				<View style={styles.actions}>
					<Pressable style={styles.primaryButton}>
						<Text style={styles.primaryButtonText}>Create Household</Text>
					</Pressable>

					<Pressable style={styles.secondaryButton}>
						<Text style={styles.secondaryButtonText}>Join with Code</Text>
					</Pressable>
				</View>
			</ScrollView>

			<View style={styles.footer}>
				<Pressable style={styles.signOutButton} onPress={() => signOut()}>
					<Text style={styles.signOutText}>Sign Out</Text>
				</Pressable>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.cream,
	},
	header: {
		paddingHorizontal: 20,
		paddingTop: 60,
		paddingBottom: 20,
	},
	backButton: {
		color: colors.textMuted,
		fontSize: 16,
		marginBottom: 12,
	},
	title: {
		fontSize: 28,
		fontWeight: "600",
		color: colors.text,
	},
	content: {
		flex: 1,
	},
	contentContainer: {
		paddingHorizontal: 20,
		paddingBottom: 20,
	},
	emptyCard: {
		backgroundColor: "white",
		borderRadius: 16,
		padding: 32,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.04,
		shadowRadius: 8,
		elevation: 2,
	},
	emptyTitle: {
		fontSize: 20,
		fontWeight: "600",
		color: colors.text,
		marginBottom: 8,
	},
	emptyText: {
		fontSize: 15,
		color: colors.textMuted,
		textAlign: "center",
		lineHeight: 22,
	},
	householdList: {
		gap: 12,
	},
	householdCard: {
		backgroundColor: "white",
		borderRadius: 16,
		padding: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.04,
		shadowRadius: 8,
		elevation: 2,
	},
	householdName: {
		fontSize: 18,
		fontWeight: "600",
		color: colors.text,
		marginBottom: 4,
	},
	householdMeta: {
		fontSize: 14,
		color: colors.textMuted,
	},
	actions: {
		marginTop: 24,
		gap: 12,
	},
	primaryButton: {
		backgroundColor: colors.sage,
		paddingVertical: 16,
		borderRadius: 12,
		alignItems: "center",
	},
	primaryButtonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "600",
	},
	secondaryButton: {
		backgroundColor: colors.lavenderLight,
		paddingVertical: 16,
		borderRadius: 12,
		alignItems: "center",
	},
	secondaryButtonText: {
		color: colors.text,
		fontSize: 16,
		fontWeight: "600",
	},
	footer: {
		paddingHorizontal: 20,
		paddingBottom: 40,
	},
	signOutButton: {
		paddingVertical: 12,
		alignItems: "center",
	},
	signOutText: {
		color: colors.textMuted,
		fontSize: 14,
	},
});
