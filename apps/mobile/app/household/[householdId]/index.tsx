import { api } from "@spoonful/convex/convex/_generated/api";
import type { Id } from "@spoonful/convex/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { router, useLocalSearchParams } from "expo-router";
import {
	Bath,
	BedDouble,
	Briefcase,
	Broom,
	ClipboardCheck,
	DoorOpen,
	Droplets,
	Lamp,
	Laptop,
	Leaf,
	Shirt,
	ShoppingBag,
	Sink,
	Sofa,
	Sparkles,
	SprayCan,
	Trash2,
	Tv,
	Users,
	Utensils,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import {
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";

const colors = {
	cream: "#faf8f5",
	creamDark: "#f0ede8",
	sage: "#a8c5a8",
	sageDark: "#8fb38f",
	sageLight: "#d4e5d4",
	lavender: "#c5b8d9",
	lavenderLight: "#e5dff0",
	text: "#4a4a4a",
	textLight: "#6b6b6b",
	textMuted: "#8b8b8b",
	rose: "#d88c8c",
};

const iconMap = {
	"utensils": Utensils,
	"trash-2": Trash2,
	"sparkles": Sparkles,
	"sink": Sink,
	"bath": Bath,
	"spray-can": SprayCan,
	"bed-double": BedDouble,
	"shirt": Shirt,
	"lamp": Lamp,
	"sofa": Sofa,
	"tv": Tv,
	"broom": Broom,
	"droplets": Droplets,
	"briefcase": Briefcase,
	"clipboard-check": ClipboardCheck,
	"laptop": Laptop,
	"leaf": Leaf,
	"door-open": DoorOpen,
	"shopping-bag": ShoppingBag,
	"users": Users,
};

export default function HouseholdDetailScreen() {
	const { householdId } = useLocalSearchParams();
	const householdIdValue = householdId as Id<"households">;
	const household = useQuery(api.households.get, { householdId: householdIdValue });
	const chores = useQuery(api.chores.list, { householdId: householdIdValue });
	const defaults = useQuery(api.chores.defaults);
	const createDefaults = useMutation(api.chores.createManyFromDefaults);
	const createChore = useMutation(api.chores.create);

	const [selectedDefaults, setSelectedDefaults] = useState<string[]>([]);
	const [isAddingDefaults, setIsAddingDefaults] = useState(false);
	const [defaultsMessage, setDefaultsMessage] = useState<string | null>(null);
	const [defaultsError, setDefaultsError] = useState<string | null>(null);

	const [name, setName] = useState("");
	const [defaultSpoonCost, setDefaultSpoonCost] = useState(2);
	const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">("weekly");
	const [isUnpleasant, setIsUnpleasant] = useState(false);
	const [isCreating, setIsCreating] = useState(false);
	const [createError, setCreateError] = useState<string | null>(null);

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

	const activeChoreCount = chores?.filter((chore) => chore.isActive).length ?? 0;

	const toggleDefault = (key: string) => {
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
				householdId: householdIdValue,
				choreKeys: selectedDefaults,
			});
			setSelectedDefaults([]);
			setDefaultsMessage(
				result.createdIds.length > 0
					? `Added ${result.createdIds.length} chores.`
					: "Those chores are already in your household.",
			);
		} catch (err) {
			setDefaultsError(err instanceof Error ? err.message : "Something went wrong");
		} finally {
			setIsAddingDefaults(false);
		}
	};

	const handleCreateChore = async () => {
		if (!name.trim()) return;
		setIsCreating(true);
		setCreateError(null);
		try {
			await createChore({
				householdId: householdIdValue,
				name: name.trim(),
				defaultSpoonCost,
				frequency,
				isUnpleasant,
			});
			setName("");
			setDefaultSpoonCost(2);
			setFrequency("weekly");
			setIsUnpleasant(false);
		} catch (err) {
			setCreateError(err instanceof Error ? err.message : "Something went wrong");
		} finally {
			setIsCreating(false);
		}
	};

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Pressable onPress={() => router.back()}>
					<Text style={styles.backButton}>← Back</Text>
				</Pressable>
				<Text style={styles.title}>{household?.name ?? "Household"}</Text>
				<Text style={styles.subtitle}>{activeChoreCount} active chore(s)</Text>
			</View>

			<ScrollView contentContainerStyle={styles.content}>
				{activeChoreCount === 0 && (
					<View style={styles.card}>
						<Text style={styles.cardTitle}>Start with a few defaults</Text>
						<Text style={styles.cardText}>
							Pick the chores that make sense for your home. You can always adjust later.
						</Text>

						{defaults === undefined ? (
							<Text style={styles.cardText}>Loading defaults...</Text>
						) : (
							<View style={styles.roomList}>
								{defaultsByRoom.map((room) => (
									<View key={room.room} style={styles.roomSection}>
										<Text style={styles.roomTitle}>{room.room}</Text>
										<View style={styles.defaultGrid}>
											{room.chores.map((chore) => (
												<Pressable
													key={chore.key}
													onPress={() => toggleDefault(chore.key)}
													style={[
														styles.defaultCard,
														selectedDefaults.includes(chore.key) && styles.defaultCardSelected,
													]}
												>
													<View style={styles.iconWrapper}>
														<ChoreIcon icon={chore.icon} />
													</View>
													<View style={{ flex: 1 }}>
														<Text style={styles.defaultName}>{chore.name}</Text>
														<Text style={styles.defaultDesc} numberOfLines={2}>
															{chore.description ?? "A helpful household reset."}
														</Text>
													</View>
												</Pressable>
											))}
										</View>
									</View>
								))}
							</View>
						)}

						{defaultsError && <Text style={styles.errorText}>{defaultsError}</Text>}
						{defaultsMessage && <Text style={styles.mutedText}>{defaultsMessage}</Text>}

						<Pressable
							style={[
								styles.primaryButton,
								(selectedDefaults.length === 0 || isAddingDefaults) && styles.buttonDisabled,
							]}
							onPress={handleAddDefaults}
							disabled={selectedDefaults.length === 0 || isAddingDefaults}
						>
							<Text style={styles.primaryButtonText}>
								{isAddingDefaults ? "Adding..." : "Add selected chores"}
							</Text>
						</Pressable>
					</View>
				)}

				<View style={styles.card}>
					<Text style={styles.cardTitle}>Add a custom chore</Text>
					<TextInput
						value={name}
						onChangeText={setName}
						placeholder="Chore name"
						placeholderTextColor={colors.textMuted}
						style={styles.input}
					/>

					<View style={styles.row}>
						<Text style={styles.label}>Spoon cost</Text>
						<View style={styles.pillRow}>
							{[1, 2, 3, 4, 5].map((value) => (
								<Pressable
									key={value}
									onPress={() => setDefaultSpoonCost(value)}
									style={[
										styles.pill,
										defaultSpoonCost === value && styles.pillActive,
									]}
								>
									<Text style={styles.pillText}>{value}</Text>
								</Pressable>
							))}
						</View>
					</View>

					<View style={styles.row}>
						<Text style={styles.label}>Frequency</Text>
						<View style={styles.pillRow}>
							{(["daily", "weekly", "monthly"] as const).map((value) => (
								<Pressable
									key={value}
									onPress={() => setFrequency(value)}
									style={[styles.pill, frequency === value && styles.pillActive]}
								>
									<Text style={styles.pillText}>{value}</Text>
								</Pressable>
							))}
						</View>
					</View>

					<Pressable
						onPress={() => setIsUnpleasant((prev) => !prev)}
						style={styles.checkboxRow}
					>
						<View style={[styles.checkbox, isUnpleasant && styles.checkboxChecked]} />
						<Text style={styles.label}>This is an unpleasant chore</Text>
					</Pressable>

					{createError && <Text style={styles.errorText}>{createError}</Text>}

					<Pressable
						style={[styles.primaryButton, (!name.trim() || isCreating) && styles.buttonDisabled]}
						onPress={handleCreateChore}
						disabled={!name.trim() || isCreating}
					>
						<Text style={styles.primaryButtonText}>
							{isCreating ? "Adding..." : "Add chore"}
						</Text>
					</Pressable>
				</View>
			</ScrollView>
		</View>
	);
}

function ChoreIcon({ icon }: { icon: string }) {
	const Icon = iconMap[icon as keyof typeof iconMap] ?? Sparkles;
	return <Icon size={18} color={colors.text} />;
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.cream,
	},
	header: {
		paddingHorizontal: 20,
		paddingTop: 60,
		paddingBottom: 12,
	},
	backButton: {
		color: colors.textMuted,
		fontSize: 16,
		marginBottom: 8,
	},
	title: {
		fontSize: 26,
		fontWeight: "600",
		color: colors.text,
	},
	subtitle: {
		color: colors.textMuted,
		marginTop: 4,
	},
	content: {
		paddingHorizontal: 20,
		paddingBottom: 32,
		gap: 16,
	},
	card: {
		backgroundColor: "white",
		borderRadius: 16,
		padding: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.04,
		shadowRadius: 8,
		elevation: 2,
	},
	cardTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: colors.text,
		marginBottom: 8,
	},
	cardText: {
		color: colors.textMuted,
		marginBottom: 16,
		lineHeight: 20,
	},
	roomList: {
		gap: 16,
		marginBottom: 16,
	},
	roomSection: {
		gap: 8,
	},
	roomTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: colors.text,
	},
	defaultGrid: {
		gap: 10,
	},
	defaultCard: {
		flexDirection: "row",
		gap: 12,
		alignItems: "center",
		padding: 12,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: colors.creamDark,
		backgroundColor: "white",
	},
	defaultCardSelected: {
		backgroundColor: colors.sageLight,
		borderColor: colors.sage,
	},
	iconWrapper: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: colors.creamDark,
		alignItems: "center",
		justifyContent: "center",
	},
	defaultName: {
		fontWeight: "600",
		color: colors.text,
	},
	defaultDesc: {
		color: colors.textMuted,
		fontSize: 12,
		marginTop: 2,
	},
	row: {
		gap: 8,
		marginBottom: 16,
	},
	label: {
		fontWeight: "600",
		color: colors.text,
	},
	pillRow: {
		flexDirection: "row",
		gap: 8,
		flexWrap: "wrap",
	},
	pill: {
		paddingVertical: 6,
		paddingHorizontal: 12,
		borderRadius: 16,
		backgroundColor: colors.creamDark,
	},
	pillActive: {
		backgroundColor: colors.lavenderLight,
	},
	pillText: {
		color: colors.text,
		fontWeight: "600",
	},
	checkboxRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		marginBottom: 16,
	},
	checkbox: {
		width: 18,
		height: 18,
		borderRadius: 4,
		borderWidth: 2,
		borderColor: colors.textMuted,
	},
	checkboxChecked: {
		backgroundColor: colors.sage,
		borderColor: colors.sageDark,
	},
	input: {
		borderWidth: 1,
		borderColor: colors.creamDark,
		borderRadius: 12,
		paddingHorizontal: 12,
		paddingVertical: 10,
		color: colors.text,
		marginBottom: 16,
	},
	primaryButton: {
		backgroundColor: colors.sage,
		paddingVertical: 14,
		borderRadius: 12,
		alignItems: "center",
	},
	primaryButtonText: {
		color: "white",
		fontWeight: "600",
	},
	buttonDisabled: {
		opacity: 0.6,
	},
	mutedText: {
		color: colors.textMuted,
		marginBottom: 12,
	},
	errorText: {
		color: colors.rose,
		marginBottom: 12,
	},
});
