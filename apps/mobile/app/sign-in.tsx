import { useAuth, useSSO } from "@clerk/clerk-expo";
import { Redirect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const kitchenImg = require("../assets/kitchen.png");
const livingRoomImg = require("../assets/living-room.png");
const outdoorsImg = require("../assets/outdoors.png");

const colors = {
	cream: "#faf8f5",
	creamDark: "#f0ede8",
	sage: "#a8c5a8",
	sageDark: "#8fb38f",
	sageLight: "#d4e5d4",
	lavender: "#c5b8d9",
	lavenderLight: "#e5dff0",
	lavenderDark: "#a598b9",
	text: "#4a4a4a",
	textLight: "#6b6b6b",
	textMuted: "#8b8b8b",
};

export default function SignInScreen() {
	const { isSignedIn, isLoaded } = useAuth();
	const { startSSOFlow } = useSSO();
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();
	const { width } = useWindowDimensions();

	// If already signed in, redirect to home
	if (isLoaded && isSignedIn) {
		return <Redirect href="/" />;
	}

	const handleGoogleSignIn = async () => {
		try {
			setIsLoading(true);
			const { createdSessionId, setActive } = await startSSOFlow({
				strategy: "oauth_google",
			});

			if (createdSessionId && setActive) {
				await setActive({ session: createdSessionId });
				router.replace("/");
			}
		} catch (err) {
			console.error("OAuth error:", err);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<SafeAreaView style={styles.container} edges={["top"]}>
			<StatusBar style="dark" />

			<ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
				{/* Hero Section */}
				<View style={styles.section}>
					<View style={styles.heroContent}>
						<Text style={styles.heroTitle}>
							Gentle chore management for{" "}
							<Text style={styles.gradientText}>real humans.</Text>
						</Text>
						<Text style={styles.heroSubtitle}>
							Manage household chores in a way that respects your energy, your limits, and your
							humanity. Built with spoon theory in mind.
						</Text>

						<Pressable
							style={[styles.button, styles.heroButton, isLoading && styles.buttonDisabled]}
							onPress={handleGoogleSignIn}
							disabled={isLoading}
						>
							<Text style={styles.buttonText}>
								{isLoading ? "Signing in..." : "Get Started"}
							</Text>
						</Pressable>
					</View>

					<View style={styles.imageWrapper}>
						<View style={styles.imageBackground} />
						<Image source={kitchenImg} style={styles.heroImage} resizeMode="contain" />
					</View>
				</View>

				{/* Motivation Section */}
				<View style={styles.section}>
					<View style={styles.imageWrapper}>
						<Image source={livingRoomImg} style={styles.sectionImage} resizeMode="contain" />
					</View>

					<View style={styles.textBlock}>
						<Text style={styles.sectionTitle}>Why "Spoonful"?</Text>
						<Text style={styles.paragraph}>
							<Text style={styles.bold}>Spoon Theory</Text> is a metaphor used by people with
							chronic illness, neurodivergence, and mental health challenges to explain the
							limited amount of energy they have each day.
						</Text>
						<Text style={styles.paragraph}>
							Traditional chore apps treat every day like a good day. They pile up overdue tasks
							and shame you with red notifications.
						</Text>
						<Text style={styles.paragraph}>
							<Text style={styles.bold}>Spoonful is different.</Text> We know some days are "low
							spoon" days. We help you prioritize what matters and forgive what can wait.
						</Text>
					</View>
				</View>

				{/* Features Section */}
				<View style={[styles.section, styles.creamSection]}>
					<Text style={styles.featuresTitle}>Features designed for you</Text>

					<View style={styles.featuresGrid}>
						<View style={styles.featureCard}>
							<Text style={styles.featureEmoji}>🔋</Text>
							<Text style={styles.featureCardTitle}>Daily Energy Check-ins</Text>
							<Text style={styles.featureCardText}>
								Start your day by sharing your energy level. Is it a Green, Yellow, or Red day?
							</Text>
						</View>

						<View style={styles.featureCard}>
							<Text style={styles.featureEmoji}>🥄</Text>
							<Text style={styles.featureCardTitle}>Personalized Costs</Text>
							<Text style={styles.featureCardText}>
								Dishes might be easy for you but hard for your partner. Assign "spoon costs"
								(1-5) individually.
							</Text>
						</View>

						<View style={styles.featureCard}>
							<Text style={styles.featureEmoji}>⚖️</Text>
							<Text style={styles.featureCardTitle}>Fair Distribution</Text>
							<Text style={styles.featureCardText}>
								We assign chores based on your current capacity and historical fairness.
							</Text>
						</View>
					</View>

					<View style={styles.encouragementWrapper}>
						<Image source={outdoorsImg} style={styles.sectionImage} resizeMode="contain" />
						<Text style={styles.encouragement}>
							"You're doing your best, and that's more than enough."
						</Text>
					</View>
				</View>

				{/* CTA Footer */}
				<View style={[styles.section, styles.footerSection]}>
					<Text style={styles.footerTitle}>Ready to find a better balance?</Text>
					<Pressable
						style={[styles.button, styles.footerButton, isLoading && styles.buttonDisabled]}
						onPress={handleGoogleSignIn}
						disabled={isLoading}
					>
						<Text style={styles.buttonText}>
							{isLoading ? "Signing in..." : "Join Spoonful Today"}
						</Text>
					</Pressable>
					<Text style={styles.copyright}>
						© {new Date().getFullYear()} Spoonful. Made with 💚 for healthy households.
					</Text>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "white",
	},
	scrollContent: {
		paddingBottom: 20,
	},
	section: {
		padding: 24,
		marginBottom: 0,
	},
	creamSection: {
		backgroundColor: colors.cream,
		paddingVertical: 40,
	},
	footerSection: {
		paddingVertical: 60,
		alignItems: "center",
	},
	heroContent: {
		marginBottom: 32,
	},
	heroTitle: {
		fontSize: 36,
		fontWeight: "700",
		color: colors.text,
		lineHeight: 44,
		marginBottom: 16,
	},
	gradientText: {
		color: colors.sageDark, // Simple fallback for gradient text
	},
	heroSubtitle: {
		fontSize: 18,
		color: colors.textLight,
		lineHeight: 26,
		marginBottom: 24,
	},
	button: {
		backgroundColor: colors.sage,
		paddingVertical: 16,
		paddingHorizontal: 24,
		borderRadius: 12,
		alignItems: "center",
		alignSelf: "flex-start",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	heroButton: {
		width: "100%",
	},
	footerButton: {
		width: "100%",
		marginBottom: 32,
	},
	buttonDisabled: {
		opacity: 0.7,
	},
	buttonText: {
		color: "white",
		fontSize: 18,
		fontWeight: "600",
	},
	imageWrapper: {
		position: "relative",
		alignItems: "center",
		marginBottom: 24,
	},
	imageBackground: {
		position: "absolute",
		top: -10,
		right: -10,
		width: "100%",
		height: "100%",
		backgroundColor: colors.sageLight,
		borderRadius: 24,
		transform: [{ rotate: "3deg" }],
		zIndex: -1,
	},
	heroImage: {
		width: "100%",
		height: 250,
		borderRadius: 24,
	},
	sectionImage: {
		width: "100%",
		height: 250,
		borderRadius: 24,
		marginBottom: 24,
	},
	textBlock: {
		marginBottom: 24,
	},
	sectionTitle: {
		fontSize: 28,
		fontWeight: "700",
		color: colors.sageDark,
		marginBottom: 16,
	},
	paragraph: {
		fontSize: 16,
		color: colors.text,
		lineHeight: 24,
		marginBottom: 16,
	},
	bold: {
		fontWeight: "700",
	},
	featuresTitle: {
		fontSize: 28,
		fontWeight: "700",
		color: colors.lavenderDark,
		marginBottom: 32,
		textAlign: "center",
	},
	featuresGrid: {
		gap: 20,
		marginBottom: 40,
	},
	featureCard: {
		backgroundColor: "white",
		borderRadius: 16,
		padding: 24,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 8,
		elevation: 2,
	},
	featureEmoji: {
		fontSize: 40,
		marginBottom: 16,
	},
	featureCardTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: colors.text,
		marginBottom: 8,
	},
	featureCardText: {
		fontSize: 15,
		color: colors.textLight,
		lineHeight: 22,
	},
	encouragementWrapper: {
		marginTop: 20,
		alignItems: "center",
	},
	encouragement: {
		fontSize: 18,
		fontStyle: "italic",
		color: colors.textMuted,
		textAlign: "center",
		marginTop: 20,
		maxWidth: 280,
	},
	footerTitle: {
		fontSize: 24,
		fontWeight: "700",
		color: colors.text,
		marginBottom: 24,
		textAlign: "center",
	},
	copyright: {
		fontSize: 14,
		color: colors.textMuted,
	},
});
