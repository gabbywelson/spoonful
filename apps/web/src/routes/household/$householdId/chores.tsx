import { createFileRoute, Link } from "@tanstack/react-router";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
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
				<ChoresManagement />
			</SignedIn>
		</>
	);
}

function ChoresManagement() {
	const { householdId } = Route.useParams();
	const chores = useQuery(api.chores.list, {
		householdId: householdId as Id<"households">,
	});
	const [showAddForm, setShowAddForm] = useState(false);

	if (chores === undefined) {
		return (
			<div className="container" style={{ paddingTop: "var(--spacing-2xl)" }}>
				<div className="loading">
					<div className="spinner" />
				</div>
			</div>
		);
	}

	return (
		<div className="container" style={{ paddingTop: "var(--spacing-2xl)" }}>
			<Link
				to="/household/$householdId"
				params={{ householdId }}
				style={{
					display: "inline-block",
					marginBottom: "var(--spacing-lg)",
					color: "var(--color-text-muted)",
				}}
			>
				← Back to Household
			</Link>

			<header
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: "var(--spacing-xl)",
				}}
			>
				<h1>Manage Chores</h1>
				<button
					onClick={() => setShowAddForm(!showAddForm)}
					className="btn btn-primary"
				>
					{showAddForm ? "Cancel" : "+ Add Chore"}
				</button>
			</header>

			{showAddForm && (
				<AddChoreForm
					householdId={householdId as Id<"households">}
					onSuccess={() => setShowAddForm(false)}
				/>
			)}

			{chores.length === 0 ? (
				<div className="card" style={{ textAlign: "center" }}>
					<p
						style={{
							color: "var(--color-text-muted)",
							marginBottom: "var(--spacing-md)",
						}}
					>
						No chores yet. Add your first chore to get started!
					</p>
				</div>
			) : (
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
						gap: "var(--spacing-lg)",
					}}
				>
					{chores.map((chore) => (
						<ChoreCard
							key={chore._id}
							chore={chore}
							householdId={householdId as Id<"households">}
						/>
					))}
				</div>
			)}
		</div>
	);
}

function AddChoreForm({
	householdId,
	onSuccess,
}: {
	householdId: Id<"households">;
	onSuccess: () => void;
}) {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [defaultSpoonCost, setDefaultSpoonCost] = useState(2);
	const [frequencyType, setFrequencyType] = useState<
		"daily" | "weekly" | "monthly" | "custom"
	>("weekly");
	const [frequencyDays, setFrequencyDays] = useState(7);
	const [isUnpleasant, setIsUnpleasant] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const createChore = useMutation(api.chores.create);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			await createChore({
				householdId,
				name: name.trim(),
				description: description.trim() || undefined,
				defaultSpoonCost,
				frequencyType,
				frequencyDays: frequencyType === "custom" ? frequencyDays : undefined,
				isUnpleasant,
			});
			onSuccess();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Something went wrong");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="card" style={{ marginBottom: "var(--spacing-xl)" }}>
			<h3 style={{ marginBottom: "var(--spacing-md)" }}>Add New Chore</h3>

			<form onSubmit={handleSubmit}>
				<div style={{ marginBottom: "var(--spacing-md)" }}>
					<label htmlFor="choreName">Chore Name *</label>
					<input
						id="choreName"
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="e.g., Wash dishes, Take out trash"
						required
						disabled={isLoading}
					/>
				</div>

				<div style={{ marginBottom: "var(--spacing-md)" }}>
					<label htmlFor="choreDescription">Description (optional)</label>
					<textarea
						id="choreDescription"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="Any helpful details about this chore..."
						disabled={isLoading}
						rows={2}
					/>
				</div>

				<div
					style={{
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
						gap: "var(--spacing-md)",
						marginBottom: "var(--spacing-md)",
					}}
				>
					<div>
						<label htmlFor="spoonCost">Default Spoon Cost</label>
						<select
							id="spoonCost"
							value={defaultSpoonCost}
							onChange={(e) => setDefaultSpoonCost(Number(e.target.value))}
							disabled={isLoading}
						>
							{[1, 2, 3, 4, 5].map((n) => (
								<option key={n} value={n}>
									{n} {n === 1 ? "spoon" : "spoons"}
								</option>
							))}
						</select>
					</div>

					<div>
						<label htmlFor="frequency">Frequency</label>
						<select
							id="frequency"
							value={frequencyType}
							onChange={(e) =>
								setFrequencyType(
									e.target.value as "daily" | "weekly" | "monthly" | "custom",
								)
							}
							disabled={isLoading}
						>
							<option value="daily">Daily</option>
							<option value="weekly">Weekly</option>
							<option value="monthly">Monthly</option>
							<option value="custom">Custom</option>
						</select>
					</div>
				</div>

				{frequencyType === "custom" && (
					<div style={{ marginBottom: "var(--spacing-md)" }}>
						<label htmlFor="customDays">Every X days</label>
						<input
							id="customDays"
							type="number"
							min={1}
							max={365}
							value={frequencyDays}
							onChange={(e) => setFrequencyDays(Number(e.target.value))}
							disabled={isLoading}
						/>
					</div>
				)}

				<div style={{ marginBottom: "var(--spacing-lg)" }}>
					<label
						style={{
							display: "flex",
							alignItems: "center",
							gap: "var(--spacing-sm)",
							cursor: "pointer",
						}}
					>
						<input
							type="checkbox"
							checked={isUnpleasant}
							onChange={(e) => setIsUnpleasant(e.target.checked)}
							disabled={isLoading}
							style={{ width: "auto" }}
						/>
						<span>This is an unpleasant chore</span>
					</label>
					<p
						style={{
							fontSize: "0.875rem",
							color: "var(--color-text-muted)",
							marginTop: "var(--spacing-xs)",
							marginLeft: "24px",
						}}
					>
						Unpleasant chores are tracked for fair distribution
					</p>
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
					disabled={isLoading || !name.trim()}
				>
					{isLoading ? "Adding..." : "Add Chore"}
				</button>
			</form>
		</div>
	);
}

function ChoreCard({
	chore,
	householdId,
}: {
	chore: {
		_id: Id<"chores">;
		name: string;
		description?: string;
		defaultSpoonCost: number;
		frequencyType: string;
		frequencyDays?: number;
		isUnpleasant: boolean;
		isActive: boolean;
	};
	householdId: Id<"households">;
}) {
	const [showPreferences, setShowPreferences] = useState(false);
	const deleteChore = useMutation(api.chores.remove);

	const frequencyLabel = {
		daily: "Daily",
		weekly: "Weekly",
		monthly: "Monthly",
		custom: `Every ${chore.frequencyDays} days`,
	}[chore.frequencyType];

	return (
		<div
			className="card"
			style={{ opacity: chore.isActive ? 1 : 0.6 }}
		>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "flex-start",
					marginBottom: "var(--spacing-sm)",
				}}
			>
				<h3>{chore.name}</h3>
				<span
					style={{
						fontSize: "0.875rem",
						background: chore.isUnpleasant
							? "var(--color-peach-light)"
							: "var(--color-cream-dark)",
						padding: "2px 8px",
						borderRadius: "var(--radius-full)",
					}}
				>
					{chore.defaultSpoonCost} 🥄
				</span>
			</div>

			{chore.description && (
				<p
					style={{
						fontSize: "0.875rem",
						color: "var(--color-text-light)",
						marginBottom: "var(--spacing-sm)",
					}}
				>
					{chore.description}
				</p>
			)}

			<div
				style={{
					display: "flex",
					gap: "var(--spacing-sm)",
					flexWrap: "wrap",
					marginBottom: "var(--spacing-md)",
				}}
			>
				<span
					style={{
						fontSize: "0.75rem",
						background: "var(--color-lavender-light)",
						padding: "2px 8px",
						borderRadius: "var(--radius-full)",
					}}
				>
					{frequencyLabel}
				</span>
				{chore.isUnpleasant && (
					<span
						style={{
							fontSize: "0.75rem",
							background: "var(--color-peach-light)",
							padding: "2px 8px",
							borderRadius: "var(--radius-full)",
						}}
					>
						Unpleasant
					</span>
				)}
			</div>

			<div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
				<button
					onClick={() => setShowPreferences(!showPreferences)}
					className="btn btn-soft"
					style={{ flex: 1, fontSize: "0.875rem" }}
				>
					My Preference
				</button>
				<button
					onClick={() => {
						if (
							confirm(`Are you sure you want to delete "${chore.name}"?`)
						) {
							deleteChore({ choreId: chore._id });
						}
					}}
					className="btn btn-soft"
					style={{
						fontSize: "0.875rem",
						color: "var(--color-rose-dark)",
					}}
				>
					Delete
				</button>
			</div>

			{showPreferences && (
				<PreferenceEditor
					choreId={chore._id}
					householdId={householdId}
					defaultSpoonCost={chore.defaultSpoonCost}
				/>
			)}
		</div>
	);
}

function PreferenceEditor({
	choreId,
	householdId,
	defaultSpoonCost,
}: {
	choreId: Id<"chores">;
	householdId: Id<"households">;
	defaultSpoonCost: number;
}) {
	const preference = useQuery(api.chores.getMyPreference, {
		choreId,
		householdId,
	});
	const setPreference = useMutation(api.chores.setPreference);
	const [personalSpoonCost, setPersonalSpoonCost] = useState<number | null>(
		null,
	);
	const [willingnessLevel, setWillingnessLevel] = useState<number>(3);
	const [isUpdating, setIsUpdating] = useState(false);

	// Initialize from preference when loaded
	useState(() => {
		if (preference) {
			setPersonalSpoonCost(preference.personalSpoonCost ?? null);
			setWillingnessLevel(preference.willingnessLevel ?? 3);
		}
	});

	const handleSave = async () => {
		setIsUpdating(true);
		try {
			await setPreference({
				choreId,
				householdId,
				personalSpoonCost:
					personalSpoonCost ?? undefined,
				willingnessLevel,
			});
		} finally {
			setIsUpdating(false);
		}
	};

	return (
		<div
			style={{
				marginTop: "var(--spacing-md)",
				paddingTop: "var(--spacing-md)",
				borderTop: "1px solid var(--color-cream-dark)",
			}}
		>
			<div style={{ marginBottom: "var(--spacing-sm)" }}>
				<label style={{ fontSize: "0.875rem" }}>
					How many spoons does this cost you?
				</label>
				<select
					value={personalSpoonCost ?? "default"}
					onChange={(e) =>
						setPersonalSpoonCost(
							e.target.value === "default" ? null : Number(e.target.value),
						)
					}
					disabled={isUpdating}
					style={{ fontSize: "0.875rem" }}
				>
					<option value="default">Use default ({defaultSpoonCost})</option>
					{[1, 2, 3, 4, 5].map((n) => (
						<option key={n} value={n}>
							{n} {n === 1 ? "spoon" : "spoons"}
						</option>
					))}
				</select>
			</div>

			<div style={{ marginBottom: "var(--spacing-md)" }}>
				<label style={{ fontSize: "0.875rem" }}>
					How willing are you to do this? (1-5)
				</label>
				<div
					style={{
						display: "flex",
						gap: "var(--spacing-xs)",
						marginTop: "var(--spacing-xs)",
					}}
				>
					{[1, 2, 3, 4, 5].map((level) => (
						<button
							key={level}
							onClick={() => setWillingnessLevel(level)}
							disabled={isUpdating}
							style={{
								flex: 1,
								padding: "var(--spacing-xs)",
								background:
									willingnessLevel === level
										? "var(--color-sage)"
										: "var(--color-cream-dark)",
								color:
									willingnessLevel === level ? "white" : "var(--color-text)",
								border: "none",
								borderRadius: "var(--radius-sm)",
								cursor: "pointer",
							}}
						>
							{level}
						</button>
					))}
				</div>
				<p
					style={{
						fontSize: "0.75rem",
						color: "var(--color-text-muted)",
						marginTop: "var(--spacing-xs)",
					}}
				>
					1 = strongly prefer not to, 5 = happy to do it
				</p>
			</div>

			<button
				onClick={handleSave}
				className="btn btn-primary"
				style={{ width: "100%", fontSize: "0.875rem" }}
				disabled={isUpdating}
			>
				{isUpdating ? "Saving..." : "Save Preference"}
			</button>
		</div>
	);
}
