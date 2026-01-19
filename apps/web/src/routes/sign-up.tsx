import { SignUp } from "@clerk/clerk-react";
import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sign-up")({
	component: SignUpPage,
});

function SignUpPage() {
	return (
		<div
			style={{
				minHeight: "100vh",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				padding: "var(--spacing-lg)",
				background: "var(--color-cream)",
			}}
		>
			<Link
				to="/"
				style={{
					marginBottom: "var(--spacing-xl)",
					textDecoration: "none",
				}}
			>
				<h1
					style={{
						fontFamily: "var(--font-display)",
						fontSize: "2rem",
						background:
							"linear-gradient(135deg, var(--color-sage-dark), var(--color-lavender-dark))",
						WebkitBackgroundClip: "text",
						WebkitTextFillColor: "transparent",
						backgroundClip: "text",
					}}
				>
					Spoonful
				</h1>
			</Link>

			<SignUp
				appearance={{
					variables: {
						colorPrimary: "#8fb38f",
						colorText: "#4a4a4a",
						colorTextSecondary: "#6b6b6b",
						colorBackground: "#ffffff",
						colorInputBackground: "#ffffff",
						colorInputText: "#4a4a4a",
						borderRadius: "0.75rem",
						fontFamily: "'Quicksand', 'Nunito', system-ui, sans-serif",
					},
					elements: {
						card: {
							boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)",
							border: "none",
						},
						headerTitle: {
							fontFamily: "'Comfortaa', 'Quicksand', system-ui, sans-serif",
							fontWeight: 600,
						},
						headerSubtitle: {
							color: "#6b6b6b",
						},
						formButtonPrimary: {
							backgroundColor: "#a8c5a8",
							"&:hover": {
								backgroundColor: "#8fb38f",
							},
						},
						footerActionLink: {
							color: "#8fb38f",
							"&:hover": {
								color: "#a899c2",
							},
						},
						formFieldInput: {
							borderColor: "#f0ede8",
							"&:focus": {
								borderColor: "#a8c5a8",
								boxShadow: "0 0 0 3px #d4e5d4",
							},
						},
						socialButtonsBlockButton: {
							borderColor: "#f0ede8",
							"&:hover": {
								backgroundColor: "#faf8f5",
							},
						},
						dividerLine: {
							backgroundColor: "#f0ede8",
						},
						dividerText: {
							color: "#8b8b8b",
						},
					},
				}}
				signInUrl="/sign-in"
				forceRedirectUrl="/"
			/>

			<p
				style={{
					marginTop: "var(--spacing-xl)",
					color: "var(--color-text-muted)",
					fontStyle: "italic",
					textAlign: "center",
				}}
			>
				You're taking a great step.
			</p>
		</div>
	);
}
