import { SignInButton, SignUpButton } from "@clerk/clerk-react";
import { Link } from "@tanstack/react-router";
import kitchenImg from "@assets/kitchen.png";
import livingRoomImg from "@assets/living-room.png";
import outdoorsImg from "@assets/outdoors.png";

export function LandingPage() {
	return (
		<div className="landing-page">
			{/* Header */}
			<header className="fixed top-0 left-0 right-0 z-50 bg-(--color-cream) border-b border-(--color-cream-dark)">
				<div className="container flex items-center justify-between pt-6 pb-5">
					<Link
						to="/"
						className="text-2xl font-display font-bold"
						style={{
							background:
								"linear-gradient(135deg, var(--color-sage-dark), var(--color-lavender-dark))",
							WebkitBackgroundClip: "text",
							WebkitTextFillColor: "transparent",
							backgroundClip: "text",
							textDecoration: "none",
						}}
					>
						Spoonful
					</Link>
					<div className="flex items-center gap-3">
						<SignInButton>
							<button type="button" className="btn btn-soft">
								Sign In
							</button>
						</SignInButton>
						<SignUpButton>
							<button type="button" className="btn btn-primary">
								Get Started
							</button>
						</SignUpButton>
					</div>
				</div>
			</header>

			{/* Spacer for fixed header */}
			<div className="h-28" />

			{/* Hero Section */}
			<section className="min-h-[85vh] flex items-center justify-center relative overflow-hidden py-20 px-4">
				<div className="container grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center relative z-10">
					<div className="hero-content text-center md:text-left">
						<h1
							className="text-4xl md:text-5xl lg:text-6xl mb-8 leading-tight font-display font-bold"
							style={{
								background:
									"linear-gradient(135deg, var(--color-sage-dark), var(--color-lavender-dark))",
								WebkitBackgroundClip: "text",
								WebkitTextFillColor: "transparent",
								backgroundClip: "text",
							}}
						>
							Gentle chore management for real humans.
						</h1>
						<p className="text-lg md:text-xl text-(--color-text-light) mb-10 max-w-[500px] mx-auto md:mx-0 leading-relaxed">
							Manage household chores in a way that respects your energy, your limits, and your
							humanity. Built with spoon theory in mind.
						</p>
						<SignUpButton>
							<button
								type="button"
								className="btn btn-primary text-lg px-8 py-4 w-full md:w-auto"
							>
								Get Started
							</button>
						</SignUpButton>
					</div>
					<div className="hero-image relative mt-8 md:mt-0">
						<div
							className="absolute -top-5 -right-5 w-full h-full rounded-(--radius-xl) -z-10 rotate-3"
							style={{
								background: "var(--color-sage-light)",
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
			<section className="pt-20 pb-24 px-4 bg-white">
				<div className="container">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
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
							<h2 className="text-3xl md:text-4xl mb-8 text-(--color-sage-dark) font-display font-bold">
								Why "Spoonful"?
							</h2>
							<p className="text-lg mb-5 leading-relaxed">
								<strong>Spoon Theory</strong> is a metaphor used by people with chronic illness,
								neurodivergence, and mental health challenges to explain the limited amount of
								energy they have each day.
							</p>
							<p className="text-lg mb-5 leading-relaxed">
								Traditional chore apps treat every day like a good day. They pile up overdue tasks,
								shame you with red notifications, and assume you always have the same capacity.
							</p>
							<p className="text-lg leading-relaxed">
								<strong>Spoonful is different.</strong> We know some days are "low spoon" days. We
								help you prioritize what matters and forgive what can wait.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="pt-20 pb-24 px-4 bg-(--color-cream)">
				<div className="container">
					<h2 className="text-3xl md:text-4xl mb-16 text-(--color-lavender-dark) font-display font-bold text-center">
						Features designed for you
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
						<div className="card p-8 text-center">
							<div className="text-5xl mb-6">🔋</div>
							<h3 className="text-xl font-bold mb-4">Daily Energy Check-ins</h3>
							<p className="text-(--color-text-light) leading-relaxed">
								Start your day by sharing your energy level. Is it a Green (high energy), Yellow
								(okay), or Red (low energy) day?
							</p>
						</div>
						<div className="card p-8 text-center">
							<div className="text-5xl mb-6">🥄</div>
							<h3 className="text-xl font-bold mb-4">Personalized Costs</h3>
							<p className="text-(--color-text-light) leading-relaxed">
								Dishes might be easy for you but hard for your partner. Assign "spoon costs" (1-5)
								individually for each chore.
							</p>
						</div>
						<div className="card p-8 text-center">
							<div className="text-5xl mb-6">⚖️</div>
							<h3 className="text-xl font-bold mb-4">Fair Distribution</h3>
							<p className="text-(--color-text-light) leading-relaxed">
								We assign chores based on your current capacity and historical fairness, so no one
								gets stuck doing all the "unpleasant" tasks.
							</p>
						</div>
					</div>

					<div className="flex flex-col items-center">
						<img
							src={outdoorsImg}
							alt="Spoons enjoying the outdoors, free from chore stress"
							style={{
								maxWidth: "800px",
								width: "100%",
								height: "auto",
								borderRadius: "var(--radius-xl)",
								boxShadow: "var(--shadow-lifted)",
							}}
						/>
						<p className="encouragement mt-8 text-xl text-center">
							"You're doing your best, and that's more than enough."
						</p>
					</div>
				</div>
			</section>

			{/* CTA / Footer */}
			<section className="pt-20 pb-16 px-4 text-center bg-white">
				<div className="container">
					<h2 className="text-3xl md:text-4xl mb-8 font-display font-bold">
						Ready to find a better balance?
					</h2>
					<SignUpButton>
						<button
							type="button"
							className="btn btn-primary text-lg px-8 py-4 mb-16 w-full md:w-auto"
						>
							Join Spoonful Today
						</button>
					</SignUpButton>

					<footer className="border-t border-(--color-cream-dark) pt-8 text-(--color-text-muted) text-sm">
						<p>© {new Date().getFullYear()} Spoonful. Made with 💚 for healthy households.</p>
					</footer>
				</div>
			</section>
		</div>
	);
}
