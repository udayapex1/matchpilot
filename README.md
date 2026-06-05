# MatchPilot CRM 💌

MatchPilot is a secure, intelligent internal CRM platform built for matchmakers to manage client profiles, analyze compatibility, and generate AI-powered introduction pitches.

![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Features

- **Advanced Matchmaking Engine:** A built-in deterministic heuristic algorithm that automatically scores compatibility based on age, height, location, habits, and family preferences.
- **AI Compatibility Insights:** Powered by OpenRouter (`google/gemma-4-31b-it:free`), generating deep qualitative compatibility explanations and personalized executive pitches for matchmakers to send.
- **360° Customer Profiles:** Comprehensive data visualization of a customer's personal biometrics, education, career, lifestyle, and highly-specific partner expectations.
- **Secure Authentication:** Custom stateless JWT authentication layer using `jose` and Edge-compatible `bcryptjs`.
- **Premium UI/UX:** Built with Shadcn UI, Framer Motion, and Magic UI. Features a responsive grid, horizontal scrolling tables, animated UI skeletons, counting tickers, and custom glassmorphism dark mode transitions.

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Database ORM:** [Prisma](https://www.prisma.io/)
- **Database Hosting:** [Supabase](https://supabase.com/) PostgreSQL (Configured with IPv4 Connection Pooling)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Components:** [Shadcn UI](https://ui.shadcn.com/) & [Magic UI](https://magicui.design/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone <repository-url>
cd MatchPilot
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory and add the following keys:

```env
# Supabase PostgreSQL Connection Pooler (Required for Vercel: Port 6543 + pgbouncer=true)
DATABASE_URL="postgresql://postgres.[ID]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection for Prisma Migrations (Port 5432)
DIRECT_URL="postgresql://postgres.[ID]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# JWT Secret for Session Hashing (Generate a secure random string)
JWT_SECRET="your_super_secret_jwt_string_here"

# OpenRouter key for MatchPilot AI capabilities
OPENROUTER_API_KEY="sk-or-v1-..."
```

### 4. Database Setup
Push the Prisma schema to your database and generate the client types:

```bash
npx prisma db push
npx prisma generate
```

*(Optional)* Seed the database with 20 dummy test profiles:
```bash
npx tsx prisma/seed.ts
```

### 5. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

## ☁️ Deployment

MatchPilot is fully optimized for deployment on **Vercel**. 

1. Push your code to GitHub.
2. Import the repository into Vercel.
3. In the Vercel Dashboard, add all Environment Variables from step 3.
4. **Important:** The `postinstall` script in `package.json` will automatically run `prisma generate` during the Vercel build phase to ensure types are built for serverless edge network functions.
5. Hit **Deploy**.

## 📊 Codebase Structure

- `src/app/dashboard/` - Core CRM application and routing.
- `src/app/api/` - Backend API routes (REST & AI endpoints).
- `src/components/` - Reusable UI elements (Shadcn, Theme toggles).
- `src/services/matching.service.ts` - The mathematical compatibility engine.
- `src/proxy.ts` - Next.js edge routing and auth validation.
- `prisma/schema.prisma` - Database models and schema.

---
Built by the MatchPilot Team.
