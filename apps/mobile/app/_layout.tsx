import { ClerkLoaded, ClerkProvider } from "@clerk/clerk-expo";
import { useAuth } from "@clerk/clerk-expo";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { Slot } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { env } from "../lib/env";

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

// Initialize Convex client with validated env
const convex = new ConvexReactClient(env.EXPO_PUBLIC_CONVEX_URL);

export default function RootLayout() {
	const publishableKey = env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

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
