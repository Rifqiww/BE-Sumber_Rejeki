# UMKM Backend & Admin Dashboard

This project consists of a Bun-based Hono backend and a Vite-based react admin frontend.

## Prerequisites

- [Bun](https://bun.sh/) installed on your machine.
- A running MySQL database (as specified in `drizzle.config.ts`).
- Environment variables configured in `.env`.

## Startup Steps

### 1. Install Dependencies

Run this in the root directory:

```bash
bun install
```

And in the `admin` directory:

```bash
cd admin && bun install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory and add the following variables:

```env
# Server Configuration
PORT=3000
JWT_SECRET=your_jwt_secret_here

# Database Configuration (MySQL)
DATABASE_URL=mysql://user:password@localhost:3306/db_name

# Payments (Midtrans)
MIDTRANS_SERVER_KEY=your_server_key
MIDTRANS_CLIENT_KEY=your_client_key
MIDTRANS_IS_PRODUCTION=false

# Image Hosting (Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

> [!NOTE]
> The Admin dashboard currently connects to `http://localhost:3000` by default. If you change the `PORT` in your `.env`, you will need to update the `baseURL` in `admin/src/services/api.ts`.

### 3. Database Migration (If needed)

If you haven't set up the database schema yet, you can push the schema defined in `src/db/schema.ts` to your database:

```bash
bun x drizzle-kit push
```

### 4. Run the Project

#### Start Backend (Root)

```bash
bun run dev
```

_This starts the server at `src/server.ts` with hot-reload._

#### Start Admin Dashboard

```bash
bun run admin
```

_This targets the `admin` folder and starts the development server._

#### Create Admin User (Optional)

If you need to initialize an admin account:

```bash
bun run create-admin
```

## Summary of Scripts

| Command                | Description                             |
| :--------------------- | :-------------------------------------- |
| `bun run dev`          | Starts backend server (watch mode)      |
| `bun run admin`        | Starts admin frontend                   |
| `bun run create-admin` | Script to initialize admin user         |
| `bun run start`        | Starts backend server (production mode) |

## Troubleshooting

### 1. Error: script "dev" exited with code 58

This usually means a port is already in use.

- **Cause**: You might have multiple terminal windows running the backend or another app is using port 3000.
- **Solution**: Close any other terminal windows running the project. If you're on Windows, you might need to kill the process:
  ```powershell
  # Find what is using port 3000
  netstat -ano | findstr :3000
  # Kill the process (replace <PID> with the number from the command above)
  taskkill /PID <PID> /F
  ```

### 2. JSON.parse: "undefined" is not valid JSON

If you see this error in the browser console:

- **Cause**: Invalid data stored in your browser's `localStorage` from a previous session.
- **Solution**: I've added a fix in `AuthContext.tsx` to handle this, but you can also clear your storage:
  1. Open Browser DevTools (F12).
  2. Go to **Application** tab -> **Local Storage**.
  3. Right-click your site and click **Clear**.

---

This project was created using `bun init` in bun v1.3.1. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
