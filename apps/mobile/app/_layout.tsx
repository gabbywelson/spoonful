import { Slot } from "expo-router";
import { ClerkProvider, ClerkLoaded } from "@clerk/clerk-expo";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { useAuth } from "@clerk/clerk-expo";
import * as SecureStore from "expo-secure-store";

// Secure token cache for Clerk
const tokenCache = {
	async getToken(key: string) {
		try {
			return SecureStore.getItemAsync(key);
		} catch {
			return null;
		}
	},
	async saveToken(key: string, value: string) {
		try {
			return SecureStore.setItemAsync(key, value);
		} catch {
			return;
		}
	},
};

// Initialize Convex client
const convex = new ConvexReactClient(
	process.env.EXPO_PUBLIC_CONVEX_URL as string
);

export default function RootLayout() {
	const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

	if (!publishableKey) {
		throw new Error(
			"Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env file"
		);
	}

	return (
		<ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
			<ClerkLoaded>
				<ConvexProviderWithClerk client={convex} useAuth={useAuth}>
					<Slot />
				</ConvexProviderWithClerk>
			</ClerkLoaded>
		</ClerkProvider>
	);
}
