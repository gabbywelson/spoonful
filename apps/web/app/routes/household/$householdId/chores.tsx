import { createFileRoute } from "@tanstack/react-router";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/tanstack-start";
import { useQuery, useMutation } from "convex/react";
import { api } from "@spoonful/convex/convex/_generated/api";
import type { Id } from "@spoonful/convex/convex/_generated/dataModel";
import { useState } from "react";

export const Route = createFileRoute("/household/$householdId/chores")({
	component: ChoresPage,
});

function ChoresPage() {
	return (
		<>
			<SignedOut>
				<RedirectToSignIn />
			</SignedOut>
			<SignedIn>
				<ChoresManager />
			</SignedIn>
		</>
	);
}

function ChoresManager() {
	const { householdId } = Route.useParams();
	const chores = useQuery(api.chores.list, {
		householdId: householdId as Id<"households">,
	});
	const [showNewForm, setShowNewForm] = useState(false);

	if (chores === undefined) {
		return (
			<div className="container" style={{ paddingTop: "var(--spacing-2xl)" }}>
				<div className="loading">
					<div className="spinner" />
				</div>
			</div>
		);
	}

	const activeChores = chores.filter((c) => c.isActive);
	const inactiveChores = chores.filter((c) => !c.isActive);

	return (
		<div className="container" style={{ paddingTop: "var(--spacing-2xl)" }}>
			<a
				href={`/household/${householdId}`}
				style={{
					display: "inline-block",
					marginBottom: "var(--spacing-lg)",
					color: "var(--color-text-muted)",
				}}
			>
				← Back to Household
			</a>

			<header
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: "var(--spacing-xl)",
				}}
			>
				<div>
					<h1>Manage Chores</h1>
					<p style={{ color: "var(--color-text-muted)" }}>
						Define the chores for your household and set your personal spoon costs.
					</p>
				</div>
				<button
					onClick={() => setShowNewForm(!showNewForm)}
					className="btn btn-primary"
				>
					{showNewForm ? "Cancel" : "+ Add Chore"}
				</button>
			</header>

			{showNewForm && (
				<NewChoreForm
					householdId={householdId as Id<"households">}
					onComplete={() => setShowNewForm(false)}
				/>
			)}

			{activeChores.length === 0 ? (
				<div className="card" style={{ textAlign: "center" }}>
					<p style={{ color: "var(--color-text-muted)" }}>
						No chores defined yet. Add your first chore to get started!
					</p>
				</div>
			) : (
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: "var(--spacing-md)",
					}}
				>
					{activeChores.map((chore) => (
						<ChoreCard
							key={chore._id}
							chore={chore}
						/>
					))}
				</div>
			)}

			{inactiveChores.length > 0 && (
				<div style={{ marginTop: "var(--spacing-2xl)" }}>
					<h2 style={{ color: "var(--color-text-muted)", marginBottom: "var(--spacing-md)" }}>
						Inactive Chores
					</h2>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							gap: "var(--spacing-md)",
							opacity: 0.6,
						}}
					>
						{inactiveChores.map((chore) => (
							<ChoreCard key={chore._id} chore={chore} />
						))}
					</div>
				</div>
			)}
		</div>
	);
}

function NewChoreForm({
	householdId,
	onComplete,
}: {
	householdId: Id<"households">;
	onComplete: () => void;
}) {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly" | "custom">("weekly");
	const [frequencyDays, setFrequencyDays] = useState(7);
	const [isUnpleasant, setIsUnpleasant] = useState(false);
	const [defaultSpoonCost, setDefaultSpoonCost] = useState(2);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const createChore = useMutation(api.chores.create);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setError(null);

		try {
			await createChore({
				householdId,
				name: name.trim(),
				description: description.trim() || undefined,
				frequency,
				frequencyDays: frequency === "custom" ? frequencyDays : undefined,
				isUnpleasant,
				defaultSpoonCost,
			});
			onComplete();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Something went wrong");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="card" style={{ marginBottom: "var(--spacing-xl)" }}>
			<h3 style={{ marginBottom: "var(--spacing-lg)" }}>New Chore</h3>

			<form onSubmit={handleSubmit}>
				<div style={{ display: "grid", gap: "var(--spacing-md)" }}>
					<div>
						<label htmlFor="name">Chore Name *</label>
						<input
							id="name"
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="e.g., Wash dishes, Vacuum living room"
							required
						/>
					</div>

					<div>
						<label htmlFor="description">Description (optional)</label>
						<textarea
							id="description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Any specific instructions or notes"
							rows={2}
						/>
					</div>

					<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-md)" }}>
						<div>
							<label htmlFor="frequency">Frequency</label>
							<select
								id="frequency"
								value={frequency}
								onChange={(e) => setFrequency(e.target.value as typeof frequency)}
							>
								<option value="daily">Daily</option>
								<option value="weekly">Weekly</option>
								<option value="monthly">Monthly</option>
								<option value="custom">Custom</option>
							</select>
						</div>

						{frequency === "custom" && (
							<div>
								<label htmlFor="frequencyDays">Every X days</label>
								<input
									id="frequencyDays"
									type="number"
									min={1}
									max={365}
									value={frequencyDays}
									onChange={(e) => setFrequencyDays(Number(e.target.value))}
								/>
							</div>
						)}
					</div>

					<div>
						<label>Default Spoon Cost</label>
						<div style={{ display: "flex", gap: "var(--spacing-sm)", marginTop: "var(--spacing-xs)" }}>
							{[1, 2, 3, 4, 5].map((cost) => (
								<button
									key={cost}
									type="button"
									onClick={() => setDefaultSpoonCost(cost)}
									style={{
										width: "48px",
										height: "48px",
										borderRadius: "var(--radius-md)",
										border: defaultSpoonCost === cost ? "2px solid var(--color-sage)" : "2px solid var(--color-cream-dark)",
										background: defaultSpoonCost === cost ? "var(--color-sage-light)" : "white",
										cursor: "pointer",
										fontSize: "1.25rem",
									}}
								>
									{cost}
								</button>
							))}
						</div>
						<p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "var(--spacing-xs)" }}>
							1 = Very easy, 5 = Very demanding
						</p>
					</div>

					<div>
						<label style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)", cursor: "pointer" }}>
							<input
								type="checkbox"
								checked={isUnpleasant}
								onChange={(e) => setIsUnpleasant(e.target.checked)}
								style={{ width: "auto" }}
							/>
							<span>This is an "unpleasant" chore (tracked for fairness)</span>
						</label>
					</div>

					{error && (
						<p style={{ color: "#c44" }}>{error}</p>
					)}

					<button
						type="submit"
						className="btn btn-primary"
						disabled={isSubmitting || !name.trim()}
					>
						{isSubmitting ? "Creating..." : "Create Chore"}
					</button>
				</div>
			</form>
		</div>
	);
}

function ChoreCard({
	chore,
}: {
	chore: {
		_id: Id<"chores">;
		name: string;
		description?: string;
		frequency: string;
		frequencyDays?: number;
		isUnpleasant: boolean;
		defaultSpoonCost: number;
		mySpoonCost: number;
		isActive: boolean;
	};
}) {
	const [isEditingCost, setIsEditingCost] = useState(false);
	const setPreference = useMutation(api.chores.setPreference);

	const handleSetCost = async (cost: number) => {
		await setPreference({ choreId: chore._id, spoonCost: cost });
		setIsEditingCost(false);
	};

	const frequencyLabel = {
		daily: "Daily",
		weekly: "Weekly",
		monthly: "Monthly",
		custom: `Every ${chore.frequencyDays} days`,
	}[chore.frequency];

	return (
		<div className="card">
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "flex-start",
				}}
			>
				<div style={{ flex: 1 }}>
					<h3
						style={{
							display: "flex",
							alignItems: "center",
							gap: "var(--spacing-sm)",
						}}
					>
						{chore.name}
						{chore.isUnpleasant && (
							<span
								style={{
									fontSize: "0.75rem",
									background: "var(--color-peach)",
									padding: "2px 8px",
									borderRadius: "var(--radius-full)",
								}}
							>
								Unpleasant
							</span>
						)}
					</h3>
					{chore.description && (
						<p style={{ color: "var(--color-text-light)", marginTop: "var(--spacing-xs)", marginBottom: 0 }}>
							{chore.description}
						</p>
					)}
					<p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginTop: "var(--spacing-xs)", marginBottom: 0 }}>
						{frequencyLabel} • Default: {chore.defaultSpoonCost} spoons
					</p>
				</div>

				<div style={{ textAlign: "right" }}>
					<p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "var(--spacing-xs)" }}>
						My cost
					</p>
					{isEditingCost ? (
						<div style={{ display: "flex", gap: "4px" }}>
							{[1, 2, 3, 4, 5].map((cost) => (
								<button
									key={cost}
									onClick={() => handleSetCost(cost)}
									style={{
										width: "32px",
										height: "32px",
										borderRadius: "var(--radius-sm)",
										border: chore.mySpoonCost === cost ? "2px solid var(--color-sage)" : "1px solid var(--color-cream-dark)",
										background: chore.mySpoonCost === cost ? "var(--color-sage-light)" : "white",
										cursor: "pointer",
									}}
								>
									{cost}
								</button>
							))}
						</div>
					) : (
						<button
							onClick={() => setIsEditingCost(true)}
							style={{
								background: "var(--color-sage-light)",
								border: "none",
								borderRadius: "var(--radius-md)",
								padding: "var(--spacing-sm) var(--spacing-md)",
								cursor: "pointer",
								fontSize: "1.25rem",
							}}
						>
							{chore.mySpoonCost} 🥄
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
