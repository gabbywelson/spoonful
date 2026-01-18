import { createFileRoute } from "@tanstack/react-router";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/tanstack-start";
import { useQuery, useMutation } from "convex/react";
import { api } from "@spoonful/convex/convex/_generated/api";
import type { Id } from "@spoonful/convex/convex/_generated/dataModel";
import { useState } from "react";

export const Route = createFileRoute("/household/$householdId")({
	component: HouseholdPage,
});

function HouseholdPage() {
	return (
		<>
			<SignedOut>
				<RedirectToSignIn />
			</SignedOut>
			<SignedIn>
				<HouseholdDashboard />
			</SignedIn>
		</>
	);
}

function HouseholdDashboard() {
	const { householdId } = Route.useParams();
	const household = useQuery(api.households.get, {
		householdId: householdId as Id<"households">,
	});
	const myStatus = useQuery(api.dailyStatus.getMyToday, {
		householdId: householdId as Id<"households">,
	});
	const myAssignments = useQuery(api.assignments.getMyToday, {
		householdId: householdId as Id<"households">,
	});

	if (household === undefined) {
		return (
			<div className="container" style={{ paddingTop: "var(--spacing-2xl)" }}>
				<div className="loading">
					<div className="spinner" />
				</div>
			</div>
		);
	}

	if (household === null) {
		return (
			<div className="container" style={{ paddingTop: "var(--spacing-2xl)" }}>
				<div className="card" style={{ textAlign: "center" }}>
					<h2>Household not found</h2>
					<p>This household doesn't exist or you don't have access.</p>
					<a href="/" className="btn btn-primary">
						Go Home
					</a>
				</div>
			</div>
		);
	}

	return (
		<div className="container" style={{ paddingTop: "var(--spacing-2xl)" }}>
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

			<header
				style={{
					marginBottom: "var(--spacing-xl)",
				}}
			>
				<h1>{household.name}</h1>
				<p style={{ color: "var(--color-text-muted)" }}>
					{household.members?.length} member
					{household.members?.length !== 1 ? "s" : ""}
				</p>
			</header>

			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
					gap: "var(--spacing-lg)",
				}}
			>
				{/* Energy Check-in Card */}
				<EnergyCheckIn
					householdId={householdId as Id<"households">}
					currentStatus={myStatus}
				/>

				{/* Today's Assignments Card */}
				<TodayAssignments
					householdId={householdId as Id<"households">}
					assignments={myAssignments ?? []}
				/>

				{/* Quick Actions Card */}
				<QuickActions householdId={householdId} inviteCode={household.inviteCode} />

				{/* Members Card */}
				<MembersCard members={household.members ?? []} />
			</div>
		</div>
	);
}

function EnergyCheckIn({
	householdId,
	currentStatus,
}: {
	householdId: Id<"households">;
	currentStatus: { energyLevel: string } | null | undefined;
}) {
	const setStatus = useMutation(api.dailyStatus.setToday);
	const [isUpdating, setIsUpdating] = useState(false);

	const handleSetEnergy = async (level: "red" | "yellow" | "green") => {
		setIsUpdating(true);
		try {
			await setStatus({ householdId, energyLevel: level });
		} finally {
			setIsUpdating(false);
		}
	};

	const energyLabels = {
		red: { label: "Low", description: "Taking it easy today" },
		yellow: { label: "Medium", description: "Doing okay" },
		green: { label: "High", description: "Feeling good!" },
	};

	return (
		<div className="card">
			<h3 style={{ marginBottom: "var(--spacing-md)" }}>
				How are you feeling today?
			</h3>

			<div
				style={{
					display: "flex",
					gap: "var(--spacing-sm)",
					marginBottom: "var(--spacing-md)",
				}}
			>
				{(["red", "yellow", "green"] as const).map((level) => (
					<button
						key={level}
						onClick={() => handleSetEnergy(level)}
						disabled={isUpdating}
						className={`energy-badge energy-${level}`}
						style={{
							flex: 1,
							padding: "var(--spacing-md)",
							border:
								currentStatus?.energyLevel === level
									? "2px solid var(--color-text)"
									: "2px solid transparent",
							cursor: "pointer",
							flexDirection: "column",
							display: "flex",
							alignItems: "center",
							gap: "var(--spacing-xs)",
						}}
					>
						<span style={{ fontSize: "1.5rem" }}>
							{level === "red" ? "🔴" : level === "yellow" ? "🟡" : "🟢"}
						</span>
						<span>{energyLabels[level].label}</span>
					</button>
				))}
			</div>

			{currentStatus && (
				<p
					className="encouragement"
					style={{ margin: 0, fontSize: "0.875rem" }}
				>
					{currentStatus.energyLevel === "red" &&
						"It's okay to take things slow. Be gentle with yourself."}
					{currentStatus.energyLevel === "yellow" &&
						"You're doing great! Remember to take breaks when you need them."}
					{currentStatus.energyLevel === "green" &&
						"Wonderful! Let's make the most of today."}
				</p>
			)}
		</div>
	);
}

function TodayAssignments({
	householdId,
	assignments,
}: {
	householdId: Id<"households">;
	assignments: Array<{
		_id: Id<"choreAssignments">;
		choreName: string;
		completed: boolean;
		skipped: boolean;
		spoonCost: number;
	}>;
}) {
	const completeAssignment = useMutation(api.assignments.complete);
	const generateAssignments = useMutation(api.assignments.generateForToday);
	const [isGenerating, setIsGenerating] = useState(false);

	const handleComplete = async (assignmentId: Id<"choreAssignments">) => {
		await completeAssignment({ assignmentId });
	};

	const handleGenerate = async () => {
		setIsGenerating(true);
		try {
			await generateAssignments({ householdId });
		} catch (err) {
			// Assignments may already exist
			console.error(err);
		} finally {
			setIsGenerating(false);
		}
	};

	const totalSpoons = assignments.reduce((sum, a) => sum + a.spoonCost, 0);
	const completedSpoons = assignments
		.filter((a) => a.completed)
		.reduce((sum, a) => sum + a.spoonCost, 0);

	return (
		<div className="card">
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: "var(--spacing-md)",
				}}
			>
				<h3>Today's Tasks</h3>
				<span style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
					{completedSpoons}/{totalSpoons} spoons
				</span>
			</div>

			{assignments.length === 0 ? (
				<div style={{ textAlign: "center", padding: "var(--spacing-lg)" }}>
					<p style={{ color: "var(--color-text-muted)", marginBottom: "var(--spacing-md)" }}>
						No assignments yet for today.
					</p>
					<button
						onClick={handleGenerate}
						className="btn btn-secondary"
						disabled={isGenerating}
					>
						{isGenerating ? "Generating..." : "Generate Today's Tasks"}
					</button>
				</div>
			) : (
				<ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
					{assignments.map((assignment) => (
						<li
							key={assignment._id}
							style={{
								display: "flex",
								alignItems: "center",
								gap: "var(--spacing-sm)",
								padding: "var(--spacing-sm)",
								background: assignment.completed
									? "var(--color-sage-light)"
									: "var(--color-cream)",
								borderRadius: "var(--radius-md)",
								opacity: assignment.completed || assignment.skipped ? 0.7 : 1,
							}}
						>
							<button
								onClick={() => handleComplete(assignment._id)}
								disabled={assignment.completed || assignment.skipped}
								style={{
									width: "24px",
									height: "24px",
									borderRadius: "50%",
									border: "2px solid var(--color-sage)",
									background: assignment.completed ? "var(--color-sage)" : "transparent",
									cursor: assignment.completed ? "default" : "pointer",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									color: "white",
									fontSize: "14px",
								}}
							>
								{assignment.completed && "✓"}
							</button>
							<span
								style={{
									flex: 1,
									textDecoration: assignment.completed ? "line-through" : "none",
								}}
							>
								{assignment.choreName}
							</span>
							<span
								style={{
									fontSize: "0.75rem",
									color: "var(--color-text-muted)",
								}}
							>
								{assignment.spoonCost} 🥄
							</span>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

function QuickActions({
	householdId,
	inviteCode,
}: {
	householdId: string;
	inviteCode: string;
}) {
	const [showCode, setShowCode] = useState(false);

	return (
		<div className="card">
			<h3 style={{ marginBottom: "var(--spacing-md)" }}>Quick Actions</h3>

			<div
				style={{
					display: "flex",
					flexDirection: "column",
					gap: "var(--spacing-sm)",
				}}
			>
				<a
					href={`/household/${householdId}/chores`}
					className="btn btn-soft"
					style={{ textAlign: "center" }}
				>
					Manage Chores
				</a>

				<button
					onClick={() => setShowCode(!showCode)}
					className="btn btn-soft"
				>
					{showCode ? "Hide" : "Show"} Invite Code
				</button>

				{showCode && (
					<div
						style={{
							textAlign: "center",
							padding: "var(--spacing-md)",
							background: "var(--color-lavender-light)",
							borderRadius: "var(--radius-md)",
						}}
					>
						<p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "var(--spacing-xs)" }}>
							Share this code to invite others:
						</p>
						<p
							style={{
								fontSize: "1.5rem",
								fontFamily: "monospace",
								letterSpacing: "0.2em",
								margin: 0,
							}}
						>
							{inviteCode}
						</p>
					</div>
				)}
			</div>
		</div>
	);
}

function MembersCard({
	members,
}: {
	members: Array<{
		role: string;
		user: { name: string; avatarUrl?: string } | null;
	}>;
}) {
	return (
		<div className="card">
			<h3 style={{ marginBottom: "var(--spacing-md)" }}>Members</h3>

			<ul
				style={{
					listStyle: "none",
					display: "flex",
					flexDirection: "column",
					gap: "var(--spacing-sm)",
				}}
			>
				{members.map((member, i) => (
					<li
						key={i}
						style={{
							display: "flex",
							alignItems: "center",
							gap: "var(--spacing-sm)",
						}}
					>
						<div
							style={{
								width: "32px",
								height: "32px",
								borderRadius: "50%",
								background: "var(--color-lavender-light)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								overflow: "hidden",
							}}
						>
							{member.user?.avatarUrl ? (
								<img
									src={member.user.avatarUrl}
									alt=""
									style={{ width: "100%", height: "100%", objectFit: "cover" }}
								/>
							) : (
								<span>{member.user?.name?.[0] ?? "?"}</span>
							)}
						</div>
						<span style={{ flex: 1 }}>{member.user?.name ?? "Unknown"}</span>
						{member.role === "admin" && (
							<span
								style={{
									fontSize: "0.75rem",
									background: "var(--color-lavender-light)",
									padding: "2px 8px",
									borderRadius: "var(--radius-full)",
								}}
							>
								Admin
							</span>
						)}
					</li>
				))}
			</ul>
		</div>
	);
}
