import { ClerkProvider } from "@clerk/clerk-react";
import { env } from "../../env";

export default function AppClerkProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<ClerkProvider
			publishableKey={env.VITE_CLERK_PUBLISHABLE_KEY}
			afterSignOutUrl="/"
			signInUrl="/sign-in"
			signUpUrl="/sign-up"
			signInForceRedirectUrl="/"
			signUpForceRedirectUrl="/"
		>
			{children}
		</ClerkProvider>
	);
}
