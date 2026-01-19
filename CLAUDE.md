# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Spoonful is a household chore management app based on "spoon theory" — helping people with limited energy (ADHD, chronic illness, mental health) manage chores fairly. Users have personal "spoon costs" (1-5) per chore and daily energy levels (red/yellow/green).

## Commands

```bash
# Start all dev servers in tmux (recommended)
./dev.sh

# Or run individually in separate terminals
pnpm run dev:convex   # Convex backend
pnpm run dev          # Web app (port 3000)
pnpm run dev:mobile   # Expo mobile app

# Linting & formatting
pnpm run lint         # Check with Biome
pnpm run lint:fix     # Auto-fix
pnpm run format       # Format with Biome

# Type checking
pnpm run typecheck    # All workspaces
```

## Architecture

```
apps/web/          → TanStack Start + React 19 + Tailwind
apps/mobile/       → Expo with expo-router
packages/convex/   → Shared Convex backend (database + functions)
```

**Data flow**: Web/Mobile → Clerk Auth → Convex Functions → Convex Database

## Key Patterns

### Convex Functions

All functions require authentication and household membership checks:

```typescript
import { requireCurrentUser, isHouseholdMember } from "./lib/auth";

const user = await requireCurrentUser(ctx);
if (!(await isHouseholdMember(ctx, user._id, args.householdId))) {
  throw new Error("Not a member of this household");
}
```

Function files: `users.ts`, `households.ts`, `chores.ts`, `dailyStatus.ts`, `assignments.ts`

### Web App Routes

File-based routing in `apps/web/src/routes/`. Import API and IDs:

```typescript
import { api } from "@spoonful/convex/convex/_generated/api";
import type { Id } from "@spoonful/convex/convex/_generated/dataModel";

// Cast route params to Convex IDs
householdId as Id<"households">
```

### Styling

CSS variables in `apps/web/src/styles.css`:
- Primary: `--color-sage` (green)
- Secondary: `--color-lavender` (purple)
- Fonts: Quicksand (body), Comfortaa (headings)

Classes: `.card`, `.btn`, `.btn-primary`, `.btn-secondary`, `.energy-badge`, `.energy-red/.yellow/.green`

## Code Style (Biome)

- Tabs for indentation
- Double quotes
- Semicolons always
- Trailing commas
- 100 char line width

## Database Notes

- Dates stored as `YYYY-MM-DD` strings
- Chores use soft delete (`isActive: false`)
- Energy levels: `"red"`, `"yellow"`, `"green"`
- Spoon costs: 1-5 scale

## UX Considerations

Keep the UI calm and encouraging — users may have energy limitations. Avoid judgmental language.
