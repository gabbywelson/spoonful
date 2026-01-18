import { createFileRoute, Link } from "@tanstack/react-router";
import {
	SignedIn,
	SignedOut,
	SignInButton,
	UserButton,
	useUser,
} from "@clerk/clerk-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@spoonful/convex/convex/_generated/api";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
	component: HomePage,
});

function HomePage() {
	return (
		<div className="container" style={{ paddingTop: "var(--spacing-2xl)" }}>
			<SignedOut>
				<LandingPage />
			</SignedOut>
			<SignedIn>
				<Dashboard />
			</SignedIn>
		</div>
	);
}

function LandingPage() {
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				textAlign: "center",
				gap: "var(--spacing-xl)",
				maxWidth: "600px",
				margin: "0 auto",
			}}
		>
			<div>
				<h1
					style={{
						fontSize: "3rem",
						marginBottom: "var(--spacing-md)",
						background:
							"linear-gradient(135deg, var(--color-sage-dark), var(--color-lavender-dark))",
						WebkitBackgroundClip: "text",
						WebkitTextFillColor: "transparent",
						backgroundClip: "text",
					}}
				>
					Spoonful
				</h1>
				<p
					style={{
						fontSize: "1.25rem",
						color: "var(--color-text-light)",
						marginBottom: 0,
					}}
				>
					Gentle chore management for real humans
				</p>
			</div>

			<div
				className="card"
				style={{
					padding: "var(--spacing-xl)",
					width: "100%",
				}}
			>
				<p style={{ marginBottom: "var(--spacing-lg)" }}>
					Built with spoon theory in mind. Manage household chores in a way that
					respects your energy, your limits, and your humanity.
				</p>

				<ul
					style={{
						textAlign: "left",
						listStyle: "none",
						display: "flex",
						flexDirection: "column",
						gap: "var(--spacing-sm)",
						marginBottom: "var(--spacing-xl)",
					}}
				>
					<li>✨ Check in with your daily energy level</li>
					<li>🥄 Rate how many "spoons" each chore costs you</li>
					<li>⚖️ Fair distribution based on capacity</li>
					<li>💚 Built for ADHD, chronic illness, and mental health</li>
				</ul>

				<SignInButton mode="modal">
					<button className="btn btn-primary" style={{ width: "100%" }}>
						Get Started
					</button>
				</SignInButton>
			</div>

			<p className="encouragement">
				"You're doing your best, and that's more than enough."
			</p>
		</div>
	);
}

function Dashboard() {
	const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
	const convexUser = useQuery(api.users.me);
	const upsertUser = useMutation(api.users.upsertFromClerk);

	// Sync Clerk user to Convex when signed in but not yet synced
	useEffect(() => {
		if (clerkLoaded && clerkUser && convexUser === null) {
			upsertUser({
				clerkId: clerkUser.id,
				email: clerkUser.primaryEmailAddress?.emailAddress ?? "",
				name: clerkUser.fullName ?? clerkUser.firstName ?? "User",
				avatarUrl: clerkUser.imageUrl,
			});
		}
	}, [clerkLoaded, clerkUser, convexUser, upsertUser]);

	// Show loading while Clerk or initial Convex query loads
	if (!clerkLoaded || convexUser === undefined) {
		return (
			<div className="loading">
				<div className="spinner" />
			</div>
		);
	}

	// User is syncing to Convex
	if (convexUser === null) {
		return <SetupPrompt />;
	}

	// User exists in Convex, now we can safely load households
	return <DashboardContent user={convexUser} />;
}

function DashboardContent({ user }: { user: { _id: string; name: string } }) {
	const households = useQuery(api.households.list);

	if (households === undefined) {
		return (
			<div className="loading">
				<div className="spinner" />
			</div>
		);
	}

	return (
		<div>
			<header
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: "var(--spacing-xl)",
				}}
			>
				<div>
					<h1>Welcome back{user.name ? `, ${user.name}` : ""}!</h1>
					<p className="encouragement" style={{ padding: 0, textAlign: "left" }}>
						Every small step counts. You've got this.
					</p>
				</div>
				<UserButton
					appearance={{
						elements: {
							avatarBox: {
								width: "48px",
								height: "48px",
							},
						},
					}}
				/>
			</header>

			{households.length === 0 ? (
				<NoHouseholdPrompt />
			) : (
				<HouseholdOverview households={households} />
			)}
		</div>
	);
}

function SetupPrompt() {
	return (
		<div className="card" style={{ textAlign: "center" }}>
			<h2 style={{ marginBottom: "var(--spacing-md)" }}>
				Let's get you set up!
			</h2>
			<p>We're syncing your account. This should only take a moment...</p>
			<div className="loading">
				<div className="spinner" />
			</div>
		</div>
	);
}

function NoHouseholdPrompt() {
	return (
		<div className="card" style={{ textAlign: "center" }}>
			<h2 style={{ marginBottom: "var(--spacing-md)" }}>
				Create or Join a Household
			</h2>
			<p style={{ marginBottom: "var(--spacing-lg)" }}>
				To start managing chores, you'll need to be part of a household. You can
				create one or join an existing one with an invite code.
			</p>

			<div
				style={{
					display: "flex",
					gap: "var(--spacing-md)",
					justifyContent: "center",
					flexWrap: "wrap",
				}}
			>
				<Link to="/household/new" className="btn btn-primary">
					Create Household
				</Link>
				<Link to="/household/join" className="btn btn-secondary">
					Join with Code
				</Link>
			</div>
		</div>
	);
}

function HouseholdOverview({
	households,
}: {
	households: Array<{
		_id: string;
		name: string;
		memberCount: number;
		role: string;
	}>;
}) {
	return (
		<div>
			<h2 style={{ marginBottom: "var(--spacing-lg)" }}>Your Households</h2>

			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
					gap: "var(--spacing-lg)",
				}}
			>
				{households.map((household) => (
					<Link
						key={household._id}
						to="/household/$householdId"
						params={{ householdId: household._id }}
						className="card"
						style={{
							textDecoration: "none",
							color: "inherit",
						}}
					>
						<h3 style={{ marginBottom: "var(--spacing-sm)" }}>
							{household.name}
						</h3>
						<p
							style={{
								color: "var(--color-text-muted)",
								marginBottom: "var(--spacing-sm)",
							}}
						>
							{household.memberCount} member
							{household.memberCount !== 1 ? "s" : ""}
						</p>
						{household.role === "admin" && (
							<span
								style={{
									fontSize: "0.75rem",
									background: "var(--color-lavender-light)",
									padding: "var(--spacing-xs) var(--spacing-sm)",
									borderRadius: "var(--radius-full)",
								}}
							>
								Admin
							</span>
						)}
					</Link>
				))}

				<Link
					to="/household/new"
					className="card"
					style={{
						textDecoration: "none",
						color: "var(--color-text-muted)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						minHeight: "120px",
						border: "2px dashed var(--color-cream-dark)",
						background: "transparent",
					}}
				>
					+ Create New Household
				</Link>
			</div>
		</div>
	);
}
