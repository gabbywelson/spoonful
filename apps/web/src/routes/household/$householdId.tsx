import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/clerk-react";
import { Link, Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/household/$householdId")({
	component: HouseholdLayout,
});

function HouseholdLayout() {
	return (
		<>
			<SignedOut>
				<RedirectToSignIn />
			</SignedOut>
			<SignedIn>
				<div className="container" style={{ paddingTop: "var(--spacing-2xl)" }}>
					<Link
						to="/"
						style={{
							display: "inline-block",
							marginBottom: "var(--spacing-lg)",
							color: "var(--color-text-muted)",
						}}
					>
						← Back to Dashboard
					</Link>
					<Outlet />
				</div>
			</SignedIn>
		</>
	);
}
