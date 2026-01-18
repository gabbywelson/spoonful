import type { ReactNode } from "react";
import {
	createRootRoute,
	Outlet,
	ScrollRestoration,
} from "@tanstack/react-router";
import { Meta, Scripts } from "@tanstack/start";
import { ClerkProvider } from "@clerk/tanstack-start";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { useAuth } from "@clerk/tanstack-start";
import globalsCss from "~/styles/globals.css?url";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: "Spoonful - Gentle Chore Management" },
			{
				name: "description",
				content:
					"A kind, accessible household chore management app built with spoon theory in mind.",
			},
		],
		links: [{ rel: "stylesheet", href: globalsCss }],
	}),
	component: RootComponent,
});

function RootComponent() {
	return (
		<RootDocument>
			<ClerkProvider>
				<ConvexProviderWithClerk client={convex} useAuth={useAuth}>
					<Outlet />
				</ConvexProviderWithClerk>
			</ClerkProvider>
		</RootDocument>
	);
}

function RootDocument({ children }: { children: ReactNode }) {
	return (
		<html lang="en">
			<head>
				<Meta />
			</head>
			<body>
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}
