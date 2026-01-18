import { TanStackDevtools } from "@tanstack/react-devtools";
import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import ClerkProvider from "../integrations/clerk/provider";
import ConvexProvider from "../integrations/convex/provider";

import appCss from "../styles.css?url";

const siteUrl = "https://spoonful.online";
const siteName = "Spoonful";
const siteTitle = "Spoonful - Gentle Chore Management";
const siteDescription =
	"A kind, accessible household chore management app built with spoon theory in mind. Manage household tasks fairly based on everyone's energy levels.";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: siteTitle },
			{ name: "description", content: siteDescription },

			// Open Graph / Facebook
			{ property: "og:type", content: "website" },
			{ property: "og:url", content: siteUrl },
			{ property: "og:site_name", content: siteName },
			{ property: "og:title", content: siteTitle },
			{ property: "og:description", content: siteDescription },
			{ property: "og:image", content: `${siteUrl}/og-image.png` },
			{ property: "og:image:width", content: "1200" },
			{ property: "og:image:height", content: "630" },
			{ property: "og:image:alt", content: "Spoonful - A friendly spoon mascot for household chore management" },

			// Twitter Card
			{ name: "twitter:card", content: "summary_large_image" },
			{ name: "twitter:url", content: siteUrl },
			{ name: "twitter:title", content: siteTitle },
			{ name: "twitter:description", content: siteDescription },
			{ name: "twitter:image", content: `${siteUrl}/og-image.png` },
			{ name: "twitter:image:alt", content: "Spoonful - A friendly spoon mascot for household chore management" },

			// Additional meta tags
			{ name: "theme-color", content: "#a8c5a8" },
			{ name: "apple-mobile-web-app-capable", content: "yes" },
			{ name: "apple-mobile-web-app-status-bar-style", content: "default" },
			{ name: "apple-mobile-web-app-title", content: siteName },
		],
		links: [
			{ rel: "stylesheet", href: appCss },
			{ rel: "icon", href: "/favicon.ico", sizes: "any" },
			{ rel: "icon", type: "image/png", sizes: "32x32", href: "/logo192.png" },
			{ rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
			{ rel: "manifest", href: "/manifest.json" },
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com",
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous",
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Comfortaa:wght@400;500;600;700&family=Quicksand:wght@400;500;600;700&display=swap",
			},
		],
	}),

	component: RootComponent,
});

function RootComponent() {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<ClerkProvider>
					<ConvexProvider>
						<Outlet />
						<TanStackDevtools
							config={{ position: "bottom-right" }}
							plugins={[
								{
									name: "Router",
									render: <TanStackRouterDevtoolsPanel />,
								},
							]}
						/>
					</ConvexProvider>
				</ClerkProvider>
				<Scripts />
			</body>
		</html>
	);
}
