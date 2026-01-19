# Spoonful

A gentle household chore management app built with awareness of energy levels and accessibility in mind.

Based on "spoon theory" - the idea that people have a limited number of "spoons" (energy units) each day. This app helps households manage chores while respecting individual energy constraints due to ADHD, mental health, chronic illness, etc.

## Features

- **Household Management**: Create and manage households for couples, families, roommates, polycules, etc.
- **Chore Tracking**: Define chores with frequencies (daily, weekly, monthly, custom intervals)
- **Personal Energy Costs**: Each person rates how many "spoons" each chore costs them
- **Daily Energy Check-in**: Simple red/yellow/green energy level tracking
- **Smart Allocation**: Chores assigned based on energy, preferences, and fairness
- **Fairness Tracking**: Keeps track of who does unpleasant tasks to ensure equitable distribution

## Tech Stack

- **Web**: TanStack Start
- **Mobile**: React Native (Expo)
- **Backend**: Convex
- **Auth**: Clerk
- **Runtime**: pnpm
- **Linting/Formatting**: Biome

## Project Structure

```
spoonful/
├── apps/
│   ├── web/          # TanStack Start web app
│   └── mobile/       # Expo React Native app
├── packages/
│   └── convex/       # Shared Convex backend
└── biome.json        # Shared linting config
```

## Getting Started

### Prerequisites

- [pnpm](https://pnpm.io/) installed
- [Convex](https://convex.dev/) account
- [Clerk](https://clerk.com/) account

### Installation

```bash
# Install dependencies
pnpm install

# Start Convex dev server (in one terminal)
pnpm run dev:convex

# Start web app (in another terminal)
pnpm run dev
```

### Environment Variables

Create `.env.local` files in the appropriate app directories:

**apps/web/.env.local**:
```
VITE_CONVEX_URL=your_convex_url
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
```

## Development

```bash
# Run linting
pnpm run lint

# Fix linting issues
pnpm run lint:fix

# Format code
pnpm run format
```

## License

Private - All rights reserved
