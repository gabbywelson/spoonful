import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/tanstack-start";
import { useMutation } from "convex/react";
import { api } from "@spoonful/convex/convex/_generated/api";
import { useState } from "react";

export const Route = createFileRoute("/household/new")({
	component: NewHouseholdPage,
});

function NewHouseholdPage() {
	return (
		<>
			<SignedOut>
				<RedirectToSignIn />
			</SignedOut>
			<SignedIn>
				<NewHouseholdForm />
			</SignedIn>
		</>
	);
}

function NewHouseholdForm() {
	const [name, setName] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();
	const createHousehold = useMutation(api.households.create);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			const householdId = await createHousehold({ name: name.trim() });
			navigate({ to: "/household/$householdId", params: { householdId } });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Something went wrong");
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
				<h1 style={{ marginBottom: "var(--spacing-md)" }}>
					Create a Household
				</h1>
				<p
					style={{
						color: "var(--color-text-light)",
						marginBottom: "var(--spacing-xl)",
					}}
				>
					A household is where your team manages chores together. You can invite
					others after creating it.
				</p>

				<form onSubmit={handleSubmit}>
					<div style={{ marginBottom: "var(--spacing-lg)" }}>
						<label htmlFor="name">Household Name</label>
						<input
							id="name"
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="e.g., The Cozy Apartment, Smith Family"
							required
							disabled={isLoading}
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
						disabled={isLoading || !name.trim()}
					>
						{isLoading ? "Creating..." : "Create Household"}
					</button>
				</form>
			</div>
		</div>
	);
}
