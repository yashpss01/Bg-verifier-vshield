# 🛡️ VShield - Enterprise Background Verification (BGV) Platform

VShield is a secure, high-fidelity Background Verification (BGV) Platform designed for organizations to streamline recruiter workflows, manage candidates, and perform real-time verification of Aadhaar and PAN documents. 

Built with a modern web design philosophy, VShield features a custom-engineered **glassmorphism layout**, **real-time visual timeline trackers**, **interactive API response JSON logs**, and **professional printable verification reports**.

---

## 🚀 Key Features

- **Recruiter Security & Authentication**: Complete JWT-based signup/login workflow with secure password hashing (`bcryptjs`) and automated token refresh persistence.
- **Candidate CRUD Operations**: Full management panel for candidate registration with field formatting and real-time status attributes.
- **Real-Time Verification Engine**: Multi-step orchestrator verifying credentials against simulated Aadhaar and PAN registries.
- **Audit Logs & Raw Inspector**: Transparent audit history showcasing masked request payloads and raw JSON response metrics from identity registries.
- **Printable Verification Sheets**: A beautifully formatted digital credentials document ready for instant printing or local PDF exporting.
- **Supabase Integration**: Migrated and configured with connection pooling (`PgBouncer`) and direct database migration endpoints.

---

## 🛠️ Technology Stack

### Backend Services (`backend/`)
- **Runtime & Language**: Node.js + TypeScript (`ES2022`)
- **Web Framework**: Express.js
- **Database Engine**: PostgreSQL via **Supabase**
- **ORM Client**: Prisma Client (`v5.22.0`)
- **Security & Middlewares**:
  - `helmet`: Express HTTP security header optimization
  - `express-rate-limit`: Endpoint protection against automated brute-force attempts
  - `cors`: Secure cross-origin resource sharing
  - `bcryptjs`: Industry-grade password encryption
  - `jsonwebtoken`: Secure stateless JWT authentication
  - `zod`: Request body type validation validation schema

### Frontend Client (`frontend/`)
- **Framework**: React.js (`v19`) + Vite
- **Language**: TypeScript (strict compile configurations)
- **Styling Layout**: Vanilla Tailwind CSS v4 with curated design systems (Google Fonts: Outfit/Inter typography, animated micro-transitions, dark glassmorphism glass panels, and interactive timelines)
- **State & Forms**:
  - `react-router-dom`: SPA routing guards and redirection structures
  - `react-hook-form`: Optimized forms with state trackers
  - `zod` + `@hookform/resolvers`: High-fidelity client-side validation schema binding
  - `recharts`: Beautiful dashboard analytical reports

---

## 📂 Architecture Overview

```mermaid
graph TD
    A[React Tailwind Client] -->|Stateless JWT Token| B(Express.js Security Gateway)
    B -->|Helmet / Cors / Rate Limiting| C{Auth Route Guard}
    C -->|Unauthorized| D[Return 401]
    C -->|Authorized| E[Verification Engine & CRUD]
    E -->|PgBouncer Pooler: Port 6543| F[(Supabase PostgreSQL)]
    E -->|Mock Registry APIs| G[Internal Aadhaar / PAN Verification APIs]
```

---

## ⚙️ Environment Variables Setup

### Backend Environment Configuration
Create a `.env` file under the `/backend` directory:

```env
# Supabase PgBouncer Pooler String (used for queries)
DATABASE_URL="postgresql://postgres.rmslieajmzmixzyiqsmi:bg-verifier-vshield@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Supabase Direct connection String (used for migrations)
DIRECT_URL="postgresql://postgres.rmslieajmzmixzyiqsmi:bg-verifier-vshield@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"

# Authentication
JWT_SECRET="vshield_super_secure_secret_token_key_123!"

# Port Mapping
PORT=5000
```

---

## 🛢️ Database Schema & Relational Model

The Prisma relational structure is compiled and deployed directly to Supabase PostgreSQL:

```prisma
model User {
  id           String      @id @default(uuid())
  name         String
  email        String      @unique
  passwordHash String
  createdAt    DateTime    @default(now())
  candidates   Candidate[]
}

model Candidate {
  id               String            @id @default(uuid())
  fullName         String
  email            String
  phone            String
  aadhaarNumber    String
  panNumber        String
  dob              DateTime
  address          String
  status           String            @default("PENDING") // PENDING, VERIFIED, FAILED, PARTIAL
  createdAt        DateTime          @default(now())
  createdById      String
  createdBy        User              @relation(fields: [createdById], references: [id], onDelete: Cascade)
  verificationLogs VerificationLog[]

  @@index([createdById])
  @@index([status])
}

model VerificationLog {
  id                 String    @id @default(uuid())
  candidateId        String
  verificationType   String    // AADHAAR, PAN
  requestPayload     String    // Masked JSON String (XXXX-XXXX-1234)
  responsePayload    String    // Serialized API response payload
  verificationStatus String    // SUCCESS, FAILED
  verifiedAt         DateTime  @default(now())
  candidate          Candidate @relation(fields: [candidateId], references: [id], onDelete: Cascade)

  @@index([candidateId])
}
```

---

## 🔒 Security & Data Masking Compliance

To satisfy industry BGV audits and PII (Personally Identifiable Information) directives:
- **Aadhaar Masking**: Aadhaar numbers in the database log records (`VerificationLog.requestPayload`) are safely masked using `XXXX-XXXX-1234` format.
- **PAN Masking**: PAN card IDs are safely masked inside logs using `XXXXX1234F` format.
- **Stateless Validation**: Form fields strictly validate patterns at the frontend layer before requesting API execution, reducing database compute usage.

---

## 🏁 Step-by-Step Running Instructions

### 1. Prerequisite Installations
- Node.js (v18+)
- npm (v9+)

### 2. Configure Backend Server
From the root workspace, navigate to `/backend`:
```bash
# Move to backend folder
cd backend

# Install dependencies
npm install

# Run database schema migration to Supabase PostgreSQL
npx prisma migrate dev --name init

# Compile and build backend TS code
npm run build

# Start the dev API server
npm run dev
```

The VShield Server will spin up at `http://localhost:5000` with active connections to your Supabase PostgreSQL cluster.

### 3. Configure Frontend Client
Navigate to `/frontend`:
```bash
# Move to frontend folder
cd frontend

# Install dev and core assets
npm install

# Run standard Vite dev build
npm run dev
```

The VShield Client will render locally at `http://localhost:5173`. Open your browser to explore the dashboard.

---

## 📡 Key REST API Routes

### 👤 Authentication Services
- `POST /api/auth/register` - Create a new recruiter profile.
- `POST /api/auth/login` - Perform validation, issue bearer JWT token.

### 👥 Candidate CRUD Panel (Protected)
- `POST /api/candidates` - Register a candidate profile.
- `GET /api/candidates` - Fetch list of candidates with search, filter, and pagination support.
- `GET /api/candidates/:id` - Fetch candidate details and their log timeline.
- `PUT /api/candidates/:id` - Edit candidate attributes.
- `DELETE /api/candidates/:id` - Delete candidate from registry.

### 🛡️ Real-Time Document Verification Engine
- `POST /api/verifications/:id/start` - Orchestrates the background check by making external registry queries for the candidate.
- `/mock-api/aadhaar/verify` - Internal sandbox Aadhaar registry.
- `/mock-api/pan/verify` - Internal sandbox PAN registry.

### 📄 Digital Reports Sheet
- `GET /api/reports/:id` - Serves custom structured report details and outputs a beautiful, clean printable document sheet.