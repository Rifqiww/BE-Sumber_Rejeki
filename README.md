# UMKM Backend & Admin Dashboard

This project is a robust Fullstack application designed for managing UMKM (MSME) operations. It features a high-performance backend built with **Bun** and **Hono**, paired with a modern, responsive Admin Dashboard built with **React** and **Vite**.

## 🛠️ Tech Stack

### Backend

- **Runtime**: [Bun](https://bun.sh/) - A fast all-in-one JavaScript runtime.
- **Framework**: [Hono](https://hono.dev/) - A small, fast, and ultrafast web framework.
- **Database**: MySQL.
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) - Lightweight and type-safe TypeScript ORM.
- **Validation**: [Zod](https://zod.dev/) - TypeScript-first schema declaration and validation.
- **Authentication**: JWT & Bcrypt.
- **Payments**: Midtrans.
- **Storage**: Cloudinary (Image Hosting).

### Frontend (Admin Dashboard)

- **Build Tool**: [Vite](https://vitejs.dev/) - Next Generation Frontend Tooling.
- **Framework**: [React](https://react.dev/) (TypeScript).
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/).
- **Icons**: [Lucide React](https://lucide.dev/).
- **Charts**: [ApexCharts](https://apexcharts.com/) (React ApexCharts).
- **State Management**: React Hooks & Context API.
- **Notifications**: React Hot Toast.

---

## ✨ Key Features

- **Dashboard Analytics**: Real-time overview of Revenue, Orders, and Top Selling Products with interactive charts (Rolling 12 Months).
- **Order Management**:
  - View all orders with detailed status.
  - Filter orders by status (Multi-select support).
  - Update order statuses directly (e.g., "Belum dibayar" to "Sedang dikirim").
- **Product Management**:
  - CRUD operations for Products.
  - Image upload support (Cloudinary).
  - Category assignment.
  - Stock and Price tracking.
- **Category Management**:
  - Manage product categories.
  - **Protection**: Prevents deletion of categories currently in use by products.
- **Secure Authentication**: Admin login with role-based protection.

---

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed.
- A running **MySQL** database.

### 1. Installation

Install dependencies for both the backend and frontend:

```bash
# Root (Backend)
bun install

# Admin (Frontend)
cd admin && bun install
```

### 2. Environment Variables

Create a `.env` file in the **root** directory and configure your credentials:

```env
# Server
PORT=3000
JWT_SECRET=your_jwt_secret_here

# Database (MySQL)
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

> **Note**: The Admin frontend expects the backend to run at `http://localhost:3000`. If you change the port, update `admin/src/services/api.ts`.

### 3. Database Migration

Push the database schema (defined in `src/db/schema.ts`) to your MySQL instance:

```bash
bun x drizzle-kit push
```

### 4. Running the Project

You can run the backend and frontend continuously in separate terminals.

#### ➤ Start Backend (Root)

Runs the API server in watch mode:

```bash
bun run dev
```

#### ➤ Start Admin Dashboard

Runs the frontend development server:

```bash
bun run admin
```

#### ➤ Create Admin User

Initialize a default admin account if needed:

```bash
bun run create-admin
```

---

## 🔧 Troubleshooting

**Port 3000 Already in Use**
If `bun run dev` fails with code 58, port 3000 is occupied.

- **Windows**: `netstat -ano | findstr :3000` then `taskkill /PID <PID> /F`.
- **Linux/Mac**: `lsof -i :3000` then `kill -9 <PID>`.

**"undefined" is not valid JSON**
Clear your browser's Local Storage for `localhost` if you encounter login loop issues from previous sessions.

---

_Built with ❤️ using Bun & React_
