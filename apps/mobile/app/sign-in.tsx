import { View, Text, StyleSheet, Pressable } from "react-native";
import { useSignIn, useSSO } from "@clerk/clerk-expo";
import { useState } from "react";
import { StatusBar } from "expo-status-bar";

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

export default function SignInScreen() {
	const { startSSOFlow } = useSSO();
	const [isLoading, setIsLoading] = useState(false);

	const handleGoogleSignIn = async () => {
		try {
			setIsLoading(true);
			const { createdSessionId, setActive } = await startSSOFlow({
				strategy: "oauth_google",
			});

			if (createdSessionId && setActive) {
				await setActive({ session: createdSessionId });
			}
		} catch (err) {
			console.error("OAuth error:", err);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<View style={styles.container}>
			<StatusBar style="auto" />

			<View style={styles.content}>
				<View style={styles.header}>
					<Text style={styles.title}>Spoonful</Text>
					<Text style={styles.subtitle}>
						Gentle chore management for real humans
					</Text>
				</View>

				<View style={styles.card}>
					<Text style={styles.cardText}>
						Built with spoon theory in mind. Manage household chores in a way
						that respects your energy, your limits, and your humanity.
					</Text>

					<View style={styles.features}>
						<Text style={styles.feature}>✨ Check in with your daily energy level</Text>
						<Text style={styles.feature}>🥄 Rate how many "spoons" each chore costs you</Text>
						<Text style={styles.feature}>⚖️ Fair distribution based on capacity</Text>
						<Text style={styles.feature}>💚 Built for ADHD, chronic illness, and mental health</Text>
					</View>

					<Pressable
						style={[styles.button, isLoading && styles.buttonDisabled]}
						onPress={handleGoogleSignIn}
						disabled={isLoading}
					>
						<Text style={styles.buttonText}>
							{isLoading ? "Signing in..." : "Continue with Google"}
						</Text>
					</Pressable>
				</View>

				<Text style={styles.encouragement}>
					"You're doing your best, and that's more than enough."
				</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.cream,
	},
	content: {
		flex: 1,
		paddingHorizontal: 24,
		paddingTop: 80,
		paddingBottom: 40,
	},
	header: {
		alignItems: "center",
		marginBottom: 32,
	},
	title: {
		fontSize: 48,
		fontWeight: "700",
		color: colors.sage,
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 18,
		color: colors.textLight,
		textAlign: "center",
	},
	card: {
		backgroundColor: "white",
		borderRadius: 20,
		padding: 24,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.04,
		shadowRadius: 8,
		elevation: 2,
	},
	cardText: {
		fontSize: 16,
		color: colors.text,
		lineHeight: 24,
		marginBottom: 20,
	},
	features: {
		marginBottom: 24,
		gap: 12,
	},
	feature: {
		fontSize: 15,
		color: colors.text,
	},
	button: {
		backgroundColor: colors.sage,
		paddingVertical: 16,
		borderRadius: 12,
		alignItems: "center",
	},
	buttonDisabled: {
		opacity: 0.6,
	},
	buttonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "600",
	},
	encouragement: {
		marginTop: "auto",
		fontSize: 14,
		fontStyle: "italic",
		color: colors.textMuted,
		textAlign: "center",
	},
});
