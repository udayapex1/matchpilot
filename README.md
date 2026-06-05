# The Date Crew (TDC) Matchmaker Dashboard

A comprehensive, internal CRM platform for The Date Crew (TDC) matchmakers to manage customer profiles, log interaction notes, and match users via a deterministic heuristic engine and AI compatibility summaries.

## Tech Stack
- Next.js 15 (App Router)
- React 19
- Tailwind CSS
- ShadCN UI
- Prisma ORM (SQLite)
- TanStack Query
- Next.js Middleware Auth (Jose JWT)
- Google Gemini AI Integration

## Features
1. **Matchmaker Authentication**: Secure session-based login (`matchmaker@tdc.com` / `password123`) protecting dashboard routes using edge-compatible JWTs via Jose.
2. **Dashboard Overview**: Data table view of assigned customers with pagination and filtering.
3. **Customer 360 View**: Clean categorization of Biometrics, Education, Career, Family, and Preferences.
4. **Interaction Notes**: Securely add and delete historical interaction notes.
5. **Matching Engine**: Deterministic heuristic calculation between Male and Female profiles assessing age, income, height, education, profession, family, lifestyle, relocation, and kids preferences.
6. **Gemini AI Integration**: Automatically generates a highly personalized short compatibility explanation and a professional executive pitch introduction email.

## Setup Instructions

### 1. Prerequisites
- Node.js (v18 or newer)
- npm or yarn

### 2. Environment Setup
Rename `.env.example` to `.env` or just create `.env` in the root:
```env
DATABASE_URL="file:./dev.db"
GEMINI_API_KEY="YOUR_GOOGLE_GEMINI_API_KEY"
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Setup & Seeding
This will automatically push the schema and generate 200 realistic Indian mock profiles (100 Male, 100 Female):
```bash
npx prisma db push
npx prisma generate
npm run db:seed  # Or alternatively `npx ts-node --compiler-options "{\"module\":\"CommonJS\"}" prisma/seed.ts`
```

### 5. Run the Application
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

**Demo Credentials:**
- Email: `matchmaker@tdc.com`
- Password: `password123`
