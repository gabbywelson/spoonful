import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/tanstack-start";
import { useMutation } from "convex/react";
import { api } from "@spoonful/convex/convex/_generated/api";
import { useState } from "react";

export const Route = createFileRoute("/household/join")({
	component: JoinHouseholdPage,
});

function JoinHouseholdPage() {
	return (
		<>
			<SignedOut>
				<RedirectToSignIn />
			</SignedOut>
			<SignedIn>
				<JoinHouseholdForm />
			</SignedIn>
		</>
	);
}

function JoinHouseholdForm() {
	const [code, setCode] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();
	const joinHousehold = useMutation(api.households.join);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			const householdId = await joinHousehold({ inviteCode: code.trim() });
			navigate({ to: "/household/$householdId", params: { householdId } });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Invalid invite code");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div
			className="container"
			style={{
				paddingTop: "var(--spacing-2xl)",
				maxWidth: "500px",
			}}
		>
			<a
				href="/"
				style={{
					display: "inline-block",
					marginBottom: "var(--spacing-lg)",
					color: "var(--color-text-muted)",
				}}
			>
				← Back to Dashboard
			</a>

			<div className="card">
				<h1 style={{ marginBottom: "var(--spacing-md)" }}>Join a Household</h1>
				<p
					style={{
						color: "var(--color-text-light)",
						marginBottom: "var(--spacing-xl)",
					}}
				>
					Enter the invite code you received from a household member.
				</p>

				<form onSubmit={handleSubmit}>
					<div style={{ marginBottom: "var(--spacing-lg)" }}>
						<label htmlFor="code">Invite Code</label>
						<input
							id="code"
							type="text"
							value={code}
							onChange={(e) => setCode(e.target.value.toUpperCase())}
							placeholder="e.g., ABC123"
							required
							disabled={isLoading}
							style={{
								textTransform: "uppercase",
								letterSpacing: "0.1em",
								textAlign: "center",
								fontSize: "1.5rem",
							}}
							maxLength={6}
						/>
					</div>

					{error && (
						<p
							style={{
								color: "#c44",
								marginBottom: "var(--spacing-md)",
							}}
						>
							{error}
						</p>
					)}

					<button
						type="submit"
						className="btn btn-primary"
						style={{ width: "100%" }}
						disabled={isLoading || code.trim().length < 6}
					>
						{isLoading ? "Joining..." : "Join Household"}
					</button>
				</form>
			</div>
		</div>
	);
}
