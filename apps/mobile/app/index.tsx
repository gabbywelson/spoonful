import { View, Text, StyleSheet, Pressable } from "react-native";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { Link, Redirect } from "expo-router";
import { StatusBar } from "expo-status-bar";

// Note: In a real setup, you'd import from the convex package
// import { api } from "@spoonful/convex/convex/_generated/api";

export default function HomeScreen() {
	const { isSignedIn, isLoaded } = useAuth();

	if (!isLoaded) {
		return (
			<View style={styles.container}>
				<View style={styles.loading}>
					<Text style={styles.loadingText}>Loading...</Text>
				</View>
				<StatusBar style="auto" />
			</View>
		);
	}

	if (!isSignedIn) {
		return <Redirect href="/sign-in" />;
	}

	return <Dashboard />;
}

function Dashboard() {
	const { user } = useUser();

	return (
		<View style={styles.container}>
			<StatusBar style="auto" />

			<View style={styles.header}>
				<Text style={styles.greeting}>
					Welcome back{user?.firstName ? `, ${user.firstName}` : ""}!
				</Text>
				<Text style={styles.encouragement}>
					Every small step counts. You've got this.
				</Text>
			</View>

			<View style={styles.card}>
				<Text style={styles.cardTitle}>How are you feeling today?</Text>

				<View style={styles.energyButtons}>
					<Pressable style={[styles.energyButton, styles.energyRed]}>
						<Text style={styles.energyEmoji}>🔴</Text>
						<Text style={styles.energyLabel}>Low</Text>
					</Pressable>
					<Pressable style={[styles.energyButton, styles.energyYellow]}>
						<Text style={styles.energyEmoji}>🟡</Text>
						<Text style={styles.energyLabel}>Medium</Text>
					</Pressable>
					<Pressable style={[styles.energyButton, styles.energyGreen]}>
						<Text style={styles.energyEmoji}>🟢</Text>
						<Text style={styles.energyLabel}>High</Text>
					</Pressable>
				</View>
			</View>

			<View style={styles.card}>
				<Text style={styles.cardTitle}>Today's Tasks</Text>
				<Text style={styles.emptyText}>
					Set up your household to get started with tasks!
				</Text>
			</View>

			<View style={styles.actions}>
				<Link href="/households" asChild>
					<Pressable style={styles.primaryButton}>
						<Text style={styles.primaryButtonText}>View Households</Text>
					</Pressable>
				</Link>
			</View>
		</View>
	);
}

const colors = {
	cream: "#faf8f5",
	creamDark: "#f0ede8",
	sage: "#a8c5a8",
	sageDark: "#8fb38f",
	sageLight: "#d4e5d4",
	lavender: "#c5b8d9",
	lavenderLight: "#e5dff0",
	peach: "#f5cdb6",
	energyRed: "#e8a8a8",
	energyYellow: "#f5e0a8",
	energyGreen: "#a8d9a8",
	text: "#4a4a4a",
	textLight: "#6b6b6b",
	textMuted: "#8b8b8b",
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.cream,
		paddingHorizontal: 20,
		paddingTop: 60,
	},
	loading: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	loadingText: {
		fontSize: 16,
		color: colors.textMuted,
	},
	header: {
		marginBottom: 24,
	},
	greeting: {
		fontSize: 28,
		fontWeight: "600",
		color: colors.text,
		marginBottom: 4,
	},
	encouragement: {
		fontSize: 14,
		color: colors.textMuted,
		fontStyle: "italic",
	},
	card: {
		backgroundColor: "white",
		borderRadius: 16,
		padding: 20,
		marginBottom: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.04,
		shadowRadius: 8,
		elevation: 2,
	},
	cardTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: colors.text,
		marginBottom: 16,
	},
	energyButtons: {
		flexDirection: "row",
		gap: 12,
	},
	energyButton: {
		flex: 1,
		alignItems: "center",
		paddingVertical: 16,
		borderRadius: 12,
		borderWidth: 2,
		borderColor: "transparent",
	},
	energyRed: {
		backgroundColor: colors.energyRed,
	},
	energyYellow: {
		backgroundColor: colors.energyYellow,
	},
	energyGreen: {
		backgroundColor: colors.energyGreen,
	},
	energyEmoji: {
		fontSize: 24,
		marginBottom: 4,
	},
	energyLabel: {
		fontSize: 14,
		fontWeight: "500",
		color: colors.text,
	},
	emptyText: {
		color: colors.textMuted,
		textAlign: "center",
		paddingVertical: 20,
	},
	actions: {
		marginTop: "auto",
		paddingBottom: 40,
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
});
