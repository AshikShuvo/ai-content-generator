# AI Content Creator - Client

React client application with authentication integration.

## Features

- ✅ React 19 with TypeScript
- ✅ React Router v6 for navigation
- ✅ Tailwind CSS for styling
- ✅ Axios for API requests
- ✅ JWT Authentication
- ✅ Protected routes
- ✅ Login & Registration pages
- ✅ Dashboard page

## Project Structure

```
src/
├── components/
│   └── ProtectedRoute.tsx    # Route guard for authenticated routes
├── contexts/
│   └── AuthContext.tsx        # Authentication context and hooks
├── pages/
│   ├── Login.tsx              # Login page
│   ├── Register.tsx           # Registration page
│   └── Dashboard.tsx          # Protected dashboard page
├── services/
│   └── api.ts                 # API service with axios
├── App.tsx                    # Main app with routing
└── main.tsx                   # Entry point
```

## Getting Started

### Prerequisites

Make sure the API server is running on `http://localhost:3000`.

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build

```bash
npm run build
```

## Authentication Flow

1. **Register**: Create a new account at `/register`
2. **Login**: Sign in at `/login`
3. **Dashboard**: After successful login, users are redirected to `/dashboard`
4. **Protected Routes**: Unauthenticated users trying to access `/dashboard` are redirected to `/login`
5. **Logout**: Click logout button in the dashboard to clear session

## API Integration

The client uses axios to communicate with the backend API:

- **Base URL**: `/api` (proxied to `http://localhost:3000`)
- **Auth Token**: Stored in localStorage and automatically included in requests
- **Error Handling**: 401 responses automatically redirect to login

## Available Routes

- `/` - Redirects to dashboard
- `/login` - Login page (public)
- `/register` - Registration page (public)
- `/dashboard` - Dashboard page (protected)

## Environment Configuration

API proxy is configured in `vite.config.ts`:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    }
  }
}
```
