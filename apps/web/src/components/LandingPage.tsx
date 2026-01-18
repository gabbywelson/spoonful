import { SignInButton } from "@clerk/clerk-react";
import kitchenImg from "@assets/kitchen.png";
import livingRoomImg from "@assets/living-room.png";
import outdoorsImg from "@assets/outdoors.png";

export function LandingPage() {
	return (
		<div className="landing-page">
			{/* Hero Section */}
			<section
				style={{
					minHeight: "90vh",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					position: "relative",
					overflow: "hidden",
					padding: "var(--spacing-xl) var(--spacing-md)",
				}}
			>
				<div
					className="container"
					style={{
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
						gap: "var(--spacing-2xl)",
						alignItems: "center",
						position: "relative",
						zIndex: 1,
					}}
				>
					<div className="hero-content">
						<h1
							style={{
								fontSize: "3.5rem",
								marginBottom: "var(--spacing-lg)",
								lineHeight: 1.2,
								background:
									"linear-gradient(135deg, var(--color-sage-dark), var(--color-lavender-dark))",
								WebkitBackgroundClip: "text",
								WebkitTextFillColor: "transparent",
								backgroundClip: "text",
							}}
						>
							Gentle chore management for real humans.
						</h1>
						<p
							style={{
								fontSize: "1.25rem",
								color: "var(--color-text-light)",
								marginBottom: "var(--spacing-xl)",
								maxWidth: "500px",
							}}
						>
							Manage household chores in a way that respects your energy, your limits, and your
							humanity. Built with spoon theory in mind.
						</p>
						<SignInButton mode="modal">
							<button
								type="button"
								className="btn btn-primary"
								style={{
									fontSize: "1.125rem",
									padding: "var(--spacing-md) var(--spacing-xl)",
								}}
							>
								Get Started
							</button>
						</SignInButton>
					</div>
					<div
						className="hero-image"
						style={{
							position: "relative",
						}}
					>
						<div
							style={{
								position: "absolute",
								top: "-20px",
								right: "-20px",
								width: "100%",
								height: "100%",
								background: "var(--color-sage-light)",
								borderRadius: "var(--radius-xl)",
								zIndex: -1,
								transform: "rotate(3deg)",
							}}
						/>
						<img
							src={kitchenImg}
							alt="A cozy, illustrated kitchen with happy spoons doing chores"
							style={{
								width: "100%",
								height: "auto",
								borderRadius: "var(--radius-xl)",
								boxShadow: "var(--shadow-lifted)",
							}}
						/>
					</div>
				</div>
			</section>

			{/* Motivation / Spoon Theory Section */}
			<section
				style={{
					padding: "var(--spacing-2xl) var(--spacing-md)",
					background: "white",
				}}
			>
				<div className="container">
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "1fr 1fr",
							gap: "var(--spacing-2xl)",
							alignItems: "center",
						}}
					>
						<div className="order-2 md:order-1">
							<img
								src={livingRoomImg}
								alt="Happy spoons relaxing in a cozy living room"
								style={{
									width: "100%",
									height: "auto",
									borderRadius: "var(--radius-xl)",
									boxShadow: "var(--shadow-medium)",
								}}
							/>
						</div>
						<div className="order-1 md:order-2">
							<h2
								style={{
									fontSize: "2.5rem",
									marginBottom: "var(--spacing-lg)",
									color: "var(--color-sage-dark)",
								}}
							>
								Why "Spoonful"?
							</h2>
							<p style={{ fontSize: "1.125rem", marginBottom: "var(--spacing-md)" }}>
								<strong>Spoon Theory</strong> is a metaphor used by people with chronic illness,
								neurodivergence, and mental health challenges to explain the limited amount of
								energy they have each day.
							</p>
							<p style={{ fontSize: "1.125rem", marginBottom: "var(--spacing-md)" }}>
								Traditional chore apps treat every day like a good day. They pile up overdue tasks,
								shame you with red notifications, and assume you always have the same capacity.
							</p>
							<p style={{ fontSize: "1.125rem" }}>
								<strong>Spoonful is different.</strong> We know some days are "low spoon" days. We
								help you prioritize what matters and forgive what can wait.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section
				style={{
					padding: "var(--spacing-2xl) var(--spacing-md)",
					background: "var(--color-cream)",
				}}
			>
				<div className="container" style={{ textAlign: "center" }}>
					<h2
						style={{
							fontSize: "2.5rem",
							marginBottom: "var(--spacing-2xl)",
							color: "var(--color-lavender-dark)",
						}}
					>
						Features designed for you
					</h2>

					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
							gap: "var(--spacing-xl)",
							marginBottom: "var(--spacing-2xl)",
						}}
					>
						<div className="card">
							<div
								style={{
									fontSize: "3rem",
									marginBottom: "var(--spacing-md)",
								}}
							>
								🔋
							</div>
							<h3 style={{ marginBottom: "var(--spacing-sm)" }}>Daily Energy Check-ins</h3>
							<p>
								Start your day by sharing your energy level. Is it a Green (high energy), Yellow
								(okay), or Red (low energy) day?
							</p>
						</div>
						<div className="card">
							<div
								style={{
									fontSize: "3rem",
									marginBottom: "var(--spacing-md)",
								}}
							>
								🥄
							</div>
							<h3 style={{ marginBottom: "var(--spacing-sm)" }}>Personalized Costs</h3>
							<p>
								Dishes might be easy for you but hard for your partner. Assign "spoon costs" (1-5)
								individually for each chore.
							</p>
						</div>
						<div className="card">
							<div
								style={{
									fontSize: "3rem",
									marginBottom: "var(--spacing-md)",
								}}
							>
								⚖️
							</div>
							<h3 style={{ marginBottom: "var(--spacing-sm)" }}>Fair Distribution</h3>
							<p>
								We assign chores based on your current capacity and historical fairness, so no one
								gets stuck doing all the "unpleasant" tasks.
							</p>
						</div>
					</div>

					<div
						style={{
							maxWidth: "800px",
							margin: "0 auto",
							position: "relative",
						}}
					>
						<img
							src={outdoorsImg}
							alt="Spoons enjoying the outdoors, free from chore stress"
							style={{
								width: "100%",
								height: "auto",
								borderRadius: "var(--radius-xl)",
								boxShadow: "var(--shadow-lifted)",
							}}
						/>
						<p
							className="encouragement"
							style={{
								marginTop: "var(--spacing-lg)",
								fontSize: "1.25rem",
							}}
						>
							"You're doing your best, and that's more than enough."
						</p>
					</div>
				</div>
			</section>

			{/* CTA / Footer */}
			<section
				style={{
					padding: "var(--spacing-2xl) var(--spacing-md)",
					textAlign: "center",
					background: "white",
				}}
			>
				<div className="container">
					<h2
						style={{
							fontSize: "2rem",
							marginBottom: "var(--spacing-lg)",
						}}
					>
						Ready to find a better balance?
					</h2>
					<SignInButton mode="modal">
						<button
							type="button"
							className="btn btn-primary"
							style={{
								fontSize: "1.125rem",
								padding: "var(--spacing-md) var(--spacing-xl)",
								marginBottom: "var(--spacing-2xl)",
							}}
						>
							Join Spoonful Today
						</button>
					</SignInButton>

					<footer
						style={{
							borderTop: "1px solid var(--color-cream-dark)",
							paddingTop: "var(--spacing-lg)",
							color: "var(--color-text-muted)",
							fontSize: "0.875rem",
						}}
					>
						<p>© {new Date().getFullYear()} Spoonful. Made with 💚 for healthy households.</p>
					</footer>
				</div>
			</section>
		</div>
	);
}
