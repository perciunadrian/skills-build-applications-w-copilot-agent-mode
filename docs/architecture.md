# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: Keep API access in the shared frontend client and keep route components focused on rendering. Each capability should show an accessible loading state, a useful empty state, or an accessible error state as appropriate.
- Logic tier decision: Keep routes thin and implement validation and business behavior in the backend service layer. Return deliberate 4xx responses for invalid input, invalid or missing references, and unknown users; do not allow cast or validation errors to become 500 responses.
- Data tier decision: Express required fields and defaults in the Mongoose schemas. User identity and fitness goal, team name and mascot, activity references/type/minutes/points/date, and workout focus/minutes/difficulty must validate; team members default to an empty array. Keep seeding idempotent and preserve unrelated existing records.
- Activity tracking approach: Accept `userId`, `teamId`, `type`, and `minutes`; validate the IDs and confirm both referenced records exist. Store references as `user` and `team`, compute points server-side from minutes, and set `occurredAt` when creating the activity.
- Team management approach: Reject requests without a name with `400`, persist the submitted name and mascot, and expose members consistently in create and list responses.
- Leaderboard approach: Sum activity points by team, sort from highest total to lowest, and include each team's name, total points, and 1-based rank.
- Workout suggestions approach: Match the requested email to a user, use that user's goal and recent activity to put a relevant workout first, and include a brief reason. Return a 4xx response if no user matches.

## Test plan

Record the commands you run and what each failure means.

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend` — checks model validation/defaults and repeatable, non-destructive seeding. A failure points to schema or seed behavior.
- API command: `npm run test:api --prefix octofit-tracker/backend` — checks activity/team endpoints, leaderboard totals/ranks, and user-specific workout suggestions. A failure points to route/service behavior or its use of the data tier.
- Frontend command: `npm test --prefix octofit-tracker/frontend` — checks API-backed rendering and accessible loading, empty, and error states. A failure points to presentation behavior or API-client integration.
- Backend build command: `npm run build --prefix octofit-tracker/backend` — checks backend TypeScript compilation.
- Frontend build command: `npm run build --prefix octofit-tracker/frontend` — checks frontend production compilation.

Baseline run before implementation:

- `npm ci --prefix octofit-tracker/backend` and `npm ci --prefix octofit-tracker/frontend` completed successfully.
- `npm test --prefix octofit-tracker/backend` — 8 failed and 1 passed. The seed contract passed; model required-field checks failed, and API contracts failed for invalid-input responses, leaderboard results, and workout matching.
- `npm test --prefix octofit-tracker/frontend` — 15 failed. Rendering and route loading, empty, and API-error states did not meet the presentation contract.
- The targeted test commands above and both build commands have not yet been run. After the fixes, run data tests first, then API tests, frontend tests, and both builds; each tier's failure should be fixed before proceeding to dependent tiers.
