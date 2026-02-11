# API Connection & Authentication Guide

This project uses a unified API handling system with Next.js rewrites, a custom `useApi` hook, and a `UserContext` for session management.

## 1. Base URL & Proxy (Next.js Config)

To avoid CORS issues and keep the backend URL centralized, we use Next.js rewrites. All requests starting with `/api/proxy` are proxied to the backend.

**Base URL:** `https://reportam-backend-sun4.onrender.com/api`

Configuration in `next.config.ts`:
```typescript
async rewrites() {
  return [
    {
      source: '/api/proxy/:path*',
      destination: 'https://reportam-backend-sun4.onrender.com/api/:path*',
    },
  ];
}
```

## 2. Authentication Context (`UserContext`)

The `UserContext` (located in `src/contexts/UserContext.tsx`) manages the user's authentication state.

- **Token Storage:** The JWT token is stored in `localStorage` under the key `reportam_token`.
- **Automatic Initialization:** On page load, it checks for a stored token and fetches the user's profile from `/api/proxy/auth/me`.
- **Global Provider:** The entire app is wrapped in `<UserProvider>` (see `src/app/layout.tsx`).

### Usage:
```tsx
import { useUser } from "@/contexts/UserContext";

const { user, logout, login } = useUser();
```

## 3. The `useApi` Hook

The `useApi` hook (located in `src/hooks/useApi.ts`) is the primary way to interact with the backend.

### Key Features:
- **Automatic Auth:** Automatically adds `Authorization: Bearer <token>` to all requests if a token exists.
- **Proxy Handling:** Automatically prefixes endpoints with `/api/proxy` if not already present.
- **Method Helpers:** Provides `get`, `post`, `put`, `patch`, `del`, and `upload`.
- **401 Handling:** Automatically triggers `logout()` and redirects to `/signin` if the API returns a 401 Unauthorized error.
- **State Management:** Returns `loading` and `error` states for the current request.

### Basic Example:
```tsx
import { useApi } from "@/hooks/useApi";

const MyComponent = () => {
  const { get, post, loading, error } = useApi();

  const fetchData = async () => {
    try {
      const data = await get('/reports'); // Calls https://reportam-backend-sun4.onrender.com/api/reports
      console.log(data);
    } catch (err) {
      console.error("API Error:", err);
    }
  };

  return (
    <div>
      <button onClick={fetchData} disabled={loading}>
        {loading ? 'Loading...' : 'Fetch Data'}
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};
```

### POST Example:
```tsx
const submitData = async (payload) => {
  const result = await post('/reports', payload);
};
```

### File Upload Example:
```tsx
const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const result = await upload('/upload', formData);
};
```

## 4. Best Practices
- Always use the hook instead of raw `fetch`.
- Use relative paths for endpoints (e.g., `/auth/login` instead of `https://...`).
- Handle errors in a `try...catch` block if you need custom error handling, or rely on the `error` state returned by the hook.
