import { api } from "@spoonful/convex/convex/_generated/api";
import type { Id } from "@spoonful/convex/convex/_generated/dataModel";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import {
	Bath,
	BedDouble,
	Briefcase,
	BrushCleaning,
	Check,
	ClipboardCheck,
	DoorOpen,
	Droplets,
	Lamp,
	Laptop,
	Leaf,
	Shirt,
	ShoppingBag,
	ShowerHead,
	Sofa,
	Sparkles,
	SprayCan,
	Trash2,
	Tv,
	Users,
	Utensils,
} from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/household/$householdId/chores")({
	component: ChoresManagement,
});

function ChoresManagement() {
	const { householdId } = Route.useParams();
	const chores = useQuery(api.chores.list, {
		householdId: householdId as Id<"households">,
	});
	const defaults = useQuery(api.chores.defaults);
	const createDefaults = useMutation(api.chores.createManyFromDefaults);
	const [showAddForm, setShowAddForm] = useState(false);
	const [selectedDefaults, setSelectedDefaults] = useState<string[]>([]);
	const [isAddingDefaults, setIsAddingDefaults] = useState(false);
	const [defaultsError, setDefaultsError] = useState<string | null>(null);
	const [defaultsMessage, setDefaultsMessage] = useState<string | null>(null);

	const defaultsByRoom = useMemo(() => {
		if (!defaults) return [];
		const rooms = new Map<string, typeof defaults>();
		for (const chore of defaults) {
			const roomChores = rooms.get(chore.room) ?? [];
			roomChores.push(chore);
			rooms.set(chore.room, roomChores);
		}
		return Array.from(rooms.entries()).map(([room, roomChores]) => ({
			room,
			chores: roomChores,
		}));
	}, [defaults]);

	const handleToggleDefault = (key: string) => {
		setSelectedDefaults((prev) =>
			prev.includes(key) ? prev.filter((value) => value !== key) : [...prev, key],
		);
	};

	const handleAddDefaults = async () => {
		if (selectedDefaults.length === 0) return;
		setIsAddingDefaults(true);
		setDefaultsError(null);
		setDefaultsMessage(null);

		try {
			const result = await createDefaults({
				householdId: householdId as Id<"households">,
				choreKeys: selectedDefaults,
			});
			setSelectedDefaults([]);
			if (result.createdIds.length > 0) {
				setDefaultsMessage(`Added ${result.createdIds.length} chores to your household.`);
			} else {
				setDefaultsMessage("Those chores are already in your household.");
			}
		} catch (err) {
			setDefaultsError(err instanceof Error ? err.message : "Something went wrong");
		} finally {
			setIsAddingDefaults(false);
		}
	};

	if (chores === undefined) {
		return (
			<div className="loading">
				<div className="spinner" />
			</div>
		);
	}
	const hasChores = chores.length > 0;

	return (
		<>
			<header
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: "var(--spacing-xl)",
				}}
			>
				<h1>Manage Chores</h1>
				{hasChores && (
					<button
						type="button"
						onClick={() => setShowAddForm(!showAddForm)}
						className="btn btn-primary"
					>
						{showAddForm ? "Cancel" : "+ Add Chore"}
					</button>
				)}
			</header>

			{hasChores && showAddForm && (
				<AddChoreForm
					householdId={householdId as Id<"households">}
					onSuccess={() => setShowAddForm(false)}
				/>
			)}

			{!hasChores ? (
				<div style={{ display: "grid", gap: "var(--spacing-xl)" }}>
					{/* Defaults selection */}
					<section>
						<div style={{ marginBottom: "var(--spacing-lg)" }}>
							<h2 style={{ marginBottom: "var(--spacing-xs)" }}>Pick chores that fit your home</h2>
							<p style={{ color: "var(--color-text-muted)", margin: 0 }}>
								Select what matters to you. You can always add more later.
							</p>
						</div>

						{defaults === undefined ? (
							<div className="loading">
								<div className="spinner" />
							</div>
						) : (
							<div style={{ display: "grid", gap: "var(--spacing-xl)" }}>
								{defaultsByRoom.map((room) => (
									<div key={room.room}>
										<h3
											style={{
												marginBottom: "var(--spacing-md)",
												fontSize: "1.125rem",
												color: "var(--color-text-light)",
												fontWeight: 500,
											}}
										>
											{room.room}
										</h3>
										<div
											style={{
												display: "grid",
												gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
												gap: "var(--spacing-md)",
											}}
										>
											{room.chores.map((chore) => {
												const isSelected = selectedDefaults.includes(chore.key);
												return (
													<button
														type="button"
														key={chore.key}
														onClick={() => handleToggleDefault(chore.key)}
														style={{
															position: "relative",
															display: "flex",
															flexDirection: "column",
															alignItems: "center",
															textAlign: "center",
															padding: "var(--spacing-lg) var(--spacing-md)",
															borderRadius: "var(--radius-lg)",
															border: isSelected
																? "2px solid var(--color-sage)"
																: "2px solid transparent",
															background: isSelected ? "var(--color-sage-light)" : "white",
															cursor: "pointer",
															transition: "all 0.15s ease",
															boxShadow: isSelected
																? "0 4px 12px rgba(168, 197, 168, 0.3)"
																: "0 2px 8px rgba(0, 0, 0, 0.04)",
														}}
													>
														{isSelected && (
															<span
																style={{
																	position: "absolute",
																	top: 8,
																	right: 8,
																	width: 20,
																	height: 20,
																	borderRadius: "50%",
																	background: "var(--color-sage)",
																	display: "flex",
																	alignItems: "center",
																	justifyContent: "center",
																}}
															>
																<Check size={12} color="white" strokeWidth={3} />
															</span>
														)}
														<ChoreIcon icon={chore.icon} size="large" />
														<span
															style={{
																marginTop: "var(--spacing-sm)",
																fontWeight: 600,
																fontSize: "0.9375rem",
																color: "var(--color-text)",
																lineHeight: 1.3,
															}}
														>
															{chore.name}
														</span>
														{chore.description && (
															<span
																style={{
																	marginTop: "var(--spacing-xs)",
																	fontSize: "0.8125rem",
																	color: "var(--color-text-muted)",
																	lineHeight: 1.4,
																}}
															>
																{chore.description}
															</span>
														)}
													</button>
												);
											})}
										</div>
									</div>
								))}

								{defaultsError && <p style={{ color: "#c44", margin: 0 }}>{defaultsError}</p>}
								{defaultsMessage && (
									<p
										style={{
											color: "var(--color-sage-dark)",
											margin: 0,
											padding: "var(--spacing-md)",
											background: "var(--color-sage-light)",
											borderRadius: "var(--radius-md)",
										}}
									>
										{defaultsMessage}
									</p>
								)}

								<div
									style={{
										position: "sticky",
										bottom: "var(--spacing-lg)",
										background: "var(--color-cream)",
										padding: "var(--spacing-md) 0",
										display: "flex",
										justifyContent: "center",
									}}
								>
									<button
										type="button"
										className="btn btn-primary"
										onClick={handleAddDefaults}
										disabled={isAddingDefaults || selectedDefaults.length === 0}
										style={{
											padding: "var(--spacing-md) var(--spacing-xl)",
											fontSize: "1rem",
										}}
									>
										{isAddingDefaults
											? "Adding..."
											: selectedDefaults.length === 0
												? "Select chores to add"
												: `Add ${selectedDefaults.length} chore${selectedDefaults.length === 1 ? "" : "s"}`}
									</button>
								</div>
							</div>
						)}
					</section>

					{/* Custom chore form */}
					<section>
						<div
							style={{
								borderTop: "1px solid var(--color-cream-dark)",
								paddingTop: "var(--spacing-xl)",
							}}
						>
							<h3
								style={{
									marginBottom: "var(--spacing-sm)",
									fontSize: "1.125rem",
									color: "var(--color-text-light)",
									fontWeight: 500,
								}}
							>
								Or add a custom chore
							</h3>
							<AddChoreForm householdId={householdId as Id<"households">} onSuccess={() => {}} />
						</div>
					</section>
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
						<ChoreCard key={chore._id} chore={chore} />
					))}
				</div>
			)}
		</>
	);
}

const iconMap = {
	utensils: Utensils,
	"trash-2": Trash2,
	sparkles: Sparkles,
	sink: ShowerHead,
	bath: Bath,
	"spray-can": SprayCan,
	"bed-double": BedDouble,
	shirt: Shirt,
	lamp: Lamp,
	sofa: Sofa,
	tv: Tv,
	broom: BrushCleaning,
	droplets: Droplets,
	briefcase: Briefcase,
	"clipboard-check": ClipboardCheck,
	laptop: Laptop,
	leaf: Leaf,
	"door-open": DoorOpen,
	"shopping-bag": ShoppingBag,
	users: Users,
};

function ChoreIcon({ icon, size = "small" }: { icon: string; size?: "small" | "large" }) {
	const Icon = iconMap[icon as keyof typeof iconMap] ?? Sparkles;
	const isLarge = size === "large";
	return (
		<span
			style={{
				width: isLarge ? 56 : 28,
				height: isLarge ? 56 : 28,
				borderRadius: "var(--radius-lg)",
				background: isLarge
					? "linear-gradient(135deg, var(--color-lavender-light) 0%, var(--color-cream-dark) 100%)"
					: "var(--color-cream-dark)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				flexShrink: 0,
			}}
		>
			<Icon size={isLarge ? 28 : 16} strokeWidth={isLarge ? 1.5 : 2} />
		</span>
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
	const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly" | "custom">("weekly");
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
				frequency,
				frequencyDays: frequency === "custom" ? frequencyDays : undefined,
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
							value={frequency}
							onChange={(e) =>
								setFrequency(e.target.value as "daily" | "weekly" | "monthly" | "custom")
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

				{frequency === "custom" && (
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

				<button type="submit" className="btn btn-primary" disabled={isLoading || !name.trim()}>
					{isLoading ? "Adding..." : "Add Chore"}
				</button>
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
		defaultSpoonCost: number;
		frequency: string;
		frequencyDays?: number;
		isUnpleasant: boolean;
		isActive: boolean;
	};
}) {
	const [showPreferences, setShowPreferences] = useState(false);
	const deleteChore = useMutation(api.chores.remove);

	const frequencyLabel = {
		daily: "Daily",
		weekly: "Weekly",
		monthly: "Monthly",
		custom: `Every ${chore.frequencyDays} days`,
	}[chore.frequency];

	return (
		<div className="card" style={{ opacity: chore.isActive ? 1 : 0.6 }}>
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
						background: chore.isUnpleasant ? "var(--color-peach-light)" : "var(--color-cream-dark)",
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
					type="button"
					onClick={() => setShowPreferences(!showPreferences)}
					className="btn btn-soft"
					style={{ flex: 1, fontSize: "0.875rem" }}
				>
					My Preference
				</button>
				<button
					type="button"
					onClick={() => {
						if (confirm(`Are you sure you want to delete "${chore.name}"?`)) {
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
				<PreferenceEditor choreId={chore._id} defaultSpoonCost={chore.defaultSpoonCost} />
			)}
		</div>
	);
}

function PreferenceEditor({
	choreId,
	defaultSpoonCost,
}: {
	choreId: Id<"chores">;
	defaultSpoonCost: number;
}) {
	const setPreference = useMutation(api.chores.setPreference);
	const [personalSpoonCost, setPersonalSpoonCost] = useState<number>(defaultSpoonCost);
	const [isUpdating, setIsUpdating] = useState(false);

	const handleSave = async () => {
		setIsUpdating(true);
		try {
			await setPreference({
				choreId,
				spoonCost: personalSpoonCost,
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
			<div style={{ marginBottom: "var(--spacing-md)" }}>
				<label htmlFor="personalSpoonCost" style={{ fontSize: "0.875rem" }}>
					How many spoons does this cost you?
				</label>
				<select
					id="personalSpoonCost"
					value={personalSpoonCost}
					onChange={(e) => setPersonalSpoonCost(Number(e.target.value))}
					disabled={isUpdating}
					style={{ fontSize: "0.875rem" }}
				>
					{[1, 2, 3, 4, 5].map((n) => (
						<option key={n} value={n}>
							{n} {n === 1 ? "spoon" : "spoons"}
						</option>
					))}
				</select>
			</div>

			<button
				type="button"
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
