# ApiLabs Express Backend (TypeScript)

Full TypeScript Express backend — same models and DB logic as the Next.js app.

## Setup

```bash
npm install
cp .env.example .env
# fill in your values
```

**.env**
```
MONGODB_URI=mongodb://localhost:27017/apilabs
JWT_SECRET=some_long_random_secret_32_chars_minimum
PORT=5000
CLIENT_URL=http://localhost:3000
```

## Running

```bash
# Development (hot reload)
npm run dev

# Production
npm run build
npm start
```

## API Routes

| Method | Route | Auth Required | Description |
|--------|-------|---------------|-------------|
| POST | `/api/auth/signin` | No | Login |
| POST | `/api/auth/signup` | No | Register |
| POST | `/api/auth/signout` | No | Logout (clears cookie) |
| GET | `/api/auth/session` | Yes | Get current user |
| GET | `/api/collections?type=REST\|GRAPHQL` | Yes | List collections |
| POST | `/api/collections` | Yes | Create collection/folder |
| PUT | `/api/collections` | Yes | Add/update request in collection |
| DELETE | `/api/collections?id=xxx` | Yes | Delete collection + children |
| DELETE | `/api/collections/:colId/requests/:reqId` | Yes | Remove one request |
| GET | `/api/environments` | Yes | List environments |
| POST | `/api/environments` | Yes | Create environment |
| PUT | `/api/environments` | Yes | Update environment |
| DELETE | `/api/environments?id=xxx` | Yes | Delete environment |
| GET | `/api/history` | Yes | Get history (last 50) |
| POST | `/api/history` | Yes | Save history entry |
| DELETE | `/api/history` | Yes | Clear all history |
| POST | `/api/proxy` | No | Proxy requests (CORS bypass) |
| GET | `/api/echo` | No | Echo request details |
| GET | `/api/echo/sse` | No | SSE demo stream |
| GET | `/health` | No | Health check |

## Auth

JWT token is set as an **httpOnly cookie** on signin/signup.  
For API clients, pass it as `Authorization: Bearer <token>`.

## Updating the Next.js Frontend

Replace the `NEXTAUTH_URL` based auth with direct API calls:

```ts
// signin
const res = await fetch("http://localhost:5000/api/auth/signin", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include", // sends/receives the cookie
  body: JSON.stringify({ email, password }),
});

// signout
await fetch("http://localhost:5000/api/auth/signout", {
  method: "POST",
  credentials: "include",
});

// get session
const res = await fetch("http://localhost:5000/api/auth/session", {
  credentials: "include",
});
```

All other `/api/` fetch calls just need the base URL changed, e.g.:
```ts
// Before
fetch("/api/collections")

// After
fetch("http://localhost:5000/api/collections", { credentials: "include" })
```

Or set `NEXT_PUBLIC_API_URL=http://localhost:5000` in your Next.js `.env.local`
and use `${process.env.NEXT_PUBLIC_API_URL}/api/collections`.
