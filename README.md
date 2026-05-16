# Requesty

A full-stack web application for managing vacation requests, featuring separate interfaces for employees submitting requests and admins reviewing them.

## Tech Stack

**Frontend**
- Vue 3 with Composition API and TypeScript
- Vite for build tooling and dev server
- Vue Router 4 for client-side routing
- Axios for HTTP requests
- Tailwind CSS v4 for styling
- `@lucide/vue` for icons
- `@lottiefiles/dotlottie-vue` for Lottie animations

**Backend**
- Node.js with Express
- TypeScript
- TypeORM as the ORM
- PostgreSQL 16 as the database

**Testing**
- Jest with ts-jest
- Supertest for HTTP integration tests

---

## Project Structure

```
vacation-management/
├── backend/                  # Node.js + Express API
│   ├── src/
│   │   ├── entities/         # TypeORM entities (User, VacationRequest)
│   │   ├── controllers/      # Express request handlers
│   │   ├── routes/           # Route definitions
│   │   ├── services/         # Business logic and DB access
│   │   ├── middleware/       # Validation and error handling
│   │   ├── config/           # DataSource and seed scripts
│   │   ├── app.ts            # Express app factory (used by both runtime and tests)
│   │   └── index.ts          # Server entry point
│   ├── tests/                # Jest integration tests
│   └── api.http              # HTTP requests for manual testing in IntelliJ/VS Code
└── frontend/                 # Vue 3 + Vite SPA
    └── src/
        ├── views/            # Top-level route components
        ├── components/       # Reusable UI components
        ├── composables/      # Reusable reactive state (e.g., useAuth)
        ├── services/         # Axios-based API client
        ├── router/           # Vue Router config
        ├── assets/           # Logos, gifs, and other static assets
        └── types/            # Shared TypeScript types
```

---

## Prerequisites

Before running the project, make sure you have:

- **Node.js 18+** and npm
- **PostgreSQL 16+** running locally
- A PostgreSQL user with permissions to create tables

---

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/leetalrivlin/vacation-management.git
cd vacation-management
```

### 2. Set up PostgreSQL

Create the development and test databases, and a dedicated user:

```bash
createdb vacation_management
createdb vacation_management_test
psql postgres
```

Inside `psql`:

```sql
CREATE USER vacation_user WITH PASSWORD 'vacation_pass';
GRANT ALL PRIVILEGES ON DATABASE vacation_management TO vacation_user;
GRANT ALL PRIVILEGES ON DATABASE vacation_management_test TO vacation_user;
\c vacation_management
GRANT ALL ON SCHEMA public TO vacation_user;
\c vacation_management_test
GRANT ALL ON SCHEMA public TO vacation_user;
\q
```

### 3. Set up the backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` if your PostgreSQL credentials differ from the defaults. Then seed the database with sample users:

```bash
npm run seed
```

This creates three users:
- Alice (Requester)
- Bob (Requester)
- Carol (Validator)

Start the backend dev server:

```bash
npm run dev
```

The API will be available at `http://localhost:3000`. You should see:

```
✓ Database connection established
✓ Server running on http://localhost:3000
```

### 4. Set up the frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Using the App

Open `http://localhost:5173` in your browser.

The home page presents a fake login dropdown with three identities:

- **Alice** or **Bob** → routed to the user dashboard at `/user`. Submit vacation requests and see your own request history.
- **Admin** → routed to the admin dashboard at `/admin`. View all requests across all users with status filtering, search, pagination, and approve/reject actions.

The avatar in the header shows the signed-in identity and exposes a Logout action. Since this is a take-home project, the login is purely client-side — there is no real authentication. The chosen identity is resolved to a backend user record at login time so requests are still attributed correctly.

---

## Running Tests

From the `backend/` directory:

```bash
npm test
```

The test suite includes 19 integration tests covering all API endpoints, validation rules, error cases, pagination/search behavior, and business logic (e.g., preventing double-approval).

Tests use a separate database (`vacation_management_test`) and reset the schema before each test for isolation.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/api/users` | List all users |
| `POST` | `/api/vacation-requests` | Submit a vacation request |
| `GET` | `/api/vacation-requests` | List all requests with pagination. Query params: `?status=`, `?search=`, `?page=` (default `1`), `?pageSize=` (default `10`, max `100`). Response: `{ items, total, page, pageSize, totalPages }`. `search` matches case-insensitively against user name, reason, and comments. |
| `GET` | `/api/vacation-requests/user/:userId` | List a specific user's requests |
| `PATCH` | `/api/vacation-requests/:id/approve` | Approve a pending request |
| `PATCH` | `/api/vacation-requests/:id/reject` | Reject a pending request (requires `comments`) |

For convenience, `backend/api.http` includes ready-to-run HTTP requests for testing each endpoint in IntelliJ or VS Code's HTTP client.

---

## Database Schema

### `users`
| Column | Type | Notes |
|--------|------|-------|
| `id` | integer | Primary key |
| `name` | varchar(100) | |
| `role` | enum | `Requester` or `Validator` |

### `vacation_requests`
| Column | Type | Notes |
|--------|------|-------|
| `id` | integer | Primary key |
| `user_id` | integer | Foreign key → `users.id` |
| `start_date` | date | |
| `end_date` | date | |
| `reason` | text | Nullable |
| `status` | enum | `Pending` / `Approved` / `Rejected`, defaults to `Pending` |
| `comments` | text | Nullable, used for manager feedback on rejection |
| `created_at` | timestamp | Auto-generated |

---

## Technical Decisions

**TypeScript throughout the stack.** Both backend and frontend use TypeScript, with shared concepts (entities, enums) mirrored as types on the frontend. This gives end-to-end type safety on API contracts.

**Separation of concerns in the backend.** Routes delegate to controllers, controllers handle HTTP concerns (parsing, status codes), and services contain business logic and DB access. This makes the code easy to follow and testable.

**App factory pattern (`createApp()`).** The Express app is created by a factory function and the server is started separately in `index.ts`. This lets Supertest import the app directly in tests without spinning up a real HTTP server.

**Lazy repository accessors.** Services use `() => AppDataSource.getRepository(Entity)` rather than capturing the repository at import time. This allows swapping the data source for tests without complex mocking.

**`refresh-key` pattern for the user's request list.** Rather than building global state with Pinia or Vuex (overkill for this scope), the parent component owns a counter that's passed as a prop to the list. Bumping it triggers a watch and re-fetches. Simple and explicit.

**Server-side filtering and pagination on the admin endpoint.** `GET /api/vacation-requests` accepts `status`, `search`, `page`, and `pageSize` and returns a paginated envelope. The TypeORM query joins the user relation and runs `LIKE` against `user.name`, `reason`, and `comments` so search works across all three fields without round-tripping data to the client. The admin dashboard debounces the search input by 300ms and resets to page 1 on any filter change.

**`useAuth` composable for fake login.** Auth state is a module-scoped `ref` exposed via a composable, persisted to `localStorage` so refreshes survive. Route guards in `router/index.ts` redirect unauthenticated users to `/` and bounce wrong-role users to their own dashboard. Swapping this for real auth later is a matter of replacing the resolver inside `login()`.

**Tailwind CSS over a component library.** Tailwind utility classes keep styling colocated with templates and avoid pulling in a heavy component framework for a small app. Brand colors are defined as `@theme` tokens in `src/style.css` (`--color-brand` `#19A689`, `--color-menu` `#233646`, `--color-approve` `#18B394`, `--color-reject` `#ED5565`) so they're reusable as `bg-brand`, `text-brand`, etc.

**Reject flow with a dedicated modal.** Per the requirements, rejecting a request requires a comment. A modal enforces this UX-wise (textarea is focused on open, empty submissions show inline error), and the backend independently validates the comment with middleware — defense in depth.

**TypeORM `synchronize: true`.** The schema is automatically generated from the entities. This is great for development and take-home projects, but should be replaced with proper migrations in production.

---

## Known Limitations

- **Fake authentication.** The login on the home page is purely client-side — it picks an identity (Alice / Bob / Admin) and stores it in `localStorage`. There is no password, token, or server-side session. In production, this would be replaced with proper auth (JWT, sessions, or OAuth).
- **No authorization checks on the API.** The backend doesn't verify that the caller is an admin before allowing approve/reject actions; the gating only happens in the frontend router. This would be the next obvious hardening step.
- **`synchronize: true` in TypeORM.** Suitable for development but unsafe for production — schema changes could drop data. A real deployment would use TypeORM migrations.
- **User's own request list isn't paginated.** Only the admin endpoint (`GET /api/vacation-requests`) is paginated; `GET /api/vacation-requests/user/:userId` still returns the full list. Fine for a single user's history at this scale.
- **No date range validation against existing requests.** A user could submit overlapping vacation requests. This could be added as a business rule.
- **No frontend tests.** Time-boxed at backend integration tests, which cover the highest-value functionality. Adding Vitest + Vue Test Utils for component tests would be a natural extension.
- **Hardcoded API base URL.** The frontend assumes the backend is at `http://localhost:3000`. Would be moved to an environment variable in a real deployment.

---

## Possible Extensions

If I were to keep building on this, the next features I'd add are:
- Real authentication and server-side authorization
- Email notifications when a request status changes
- A calendar view of approved vacations across the team
- Column sorting and saved filters on the admin dashboard
- Pagination on the user's request history
- Frontend tests with Vitest and Vue Test Utils

---

## License

MIT