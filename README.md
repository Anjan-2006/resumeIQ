# ResumeIQ

ResumeIQ is an AI-powered interview preparation platform that analyzes a candidate's resume against a job description, generates personalized interview questions and preparation plans, and helps create tailored resumes.

Candidates upload their resume in PDF format, provide a target job description, and receive an AI-generated preparation dossier complete with role match scores, targeted technical questions with model answers, behavioral questions using the STAR framework, identified skill gaps, and an interactive preparation roadmap. Candidates can also generate and download an ATS-optimized, tailored PDF resume aligned with the target role.

---

## Features

- **Resume Parsing**: In-memory text extraction from uploaded PDF resumes with file signature verification.
- **Job Description Analysis**: Compares candidate experience, skills, and background directly against target role requirements.
- **Interview Readiness Reports**:
  - Role match score (0–100) and evaluation overview.
  - 10+ role-specific technical interview questions with interviewer intentions and suggested answers.
  - 10+ behavioral questions with STAR (Situation, Task, Action, Result) response outlines.
  - Detailed skill gap assessment categorized by severity (low, medium, high).
  - Day-by-day preparation roadmap with persistent checklist tracking.
- **Tailored Resume PDF Generation**: Dynamically formats an ATS-aligned HTML resume using candidate data and renders it to a clean, downloadable A4 PDF via headless Chromium.
- **Temporary Preview and Storage**: Users can preview generated resumes, regenerate if desired, and save approved resumes to private cloud storage.
- **Asynchronous Background Processing**: Offloads AI inference and report generation to Redis and BullMQ queues, preventing HTTP timeouts and keeping the interface responsive.
- **Authentication and Account Management**:
  - Email and password registration with mandatory OTP verification.
  - Multi-factor authentication (MFA) via email OTP for login.
  - Google OAuth 2.0 authentication.
  - Password recovery with verified email OTP.
  - One-click guest demo login with usage quotas.
  - Account profile updates and in-app password changes.

---

## Architecture

The application is structured into modular services to separate web traffic from heavy compute tasks:

```text
[ React Frontend (Vite) ]
           |
           | HTTP REST (Cookies, JSON, Multipart)
           v
+-------------------------------------------------------+
| Express Backend API (Port 3000)                       |
| - Authentication, session tokens & rate limiting      |
| - PDF parsing, validation & Puppeteer PDF rendering   |
| - Report management & authenticated S3 downloads      |
+-------------------------------------------------------+
       |                     |                   |
       | Enqueues Job        | Reads/Writes      | Uploads/Downloads
       v                     v                   v
+--------------+     +---------------+   +---------------+
| Redis        |     | MongoDB Atlas |   | AWS S3 Bucket |
| Job Queue    |     | User data,    |   | Saved resume  |
+--------------+     | reports &     |   | PDF files     |
       |             | tokens        |   | (Private)     |
       | Dequeues    +---------------+   +---------------+
       v
+-------------------------------------------------------+
| Background Worker (BullMQ)                            |
| - Processes report generation jobs                    |
| - Calls Groq AI for structured analysis               |
| - Validates responses against Zod schemas             |
| - Updates report state and results in MongoDB         |
+-------------------------------------------------------+
```

### Component Roles

- **React Frontend**: Modern single-page application handling user input, report viewing, progress tracking, and in-browser PDF previews.
- **Node.js/Express Backend API**: Handles HTTP routing, input validation, authentication, session lifecycle, PDF generation via headless Puppeteer, and file downloads.
- **Background Worker**: Standalone Node.js process using BullMQ to handle long-running AI report generation without blocking web requests.
- **Redis**: In-memory data store used by BullMQ to manage background job queues and worker state.
- **MongoDB**: Primary document store for user profiles, interview reports, saved resume metadata, and refresh token records.
- **AWS S3**: Object storage for approved tailored resume PDFs, keeping binary files out of the database.
- **Groq AI**: High-speed LLM inference engine providing structured JSON responses validated with Zod schemas.

---

## Tech Stack

- **Frontend**: React 19, Vite, React Router, Axios, Sass, Framer Motion, Lucide Icons
- **Backend**: Node.js, Express, Multer, pdf-parse, Zod, Nodemailer
- **Background Processing**: BullMQ, Redis (ioredis)
- **AI & Document Generation**: Groq SDK (LLaMA models), Puppeteer (Headless Chromium)
- **Database & Storage**: MongoDB (Mongoose), AWS S3 (`@aws-sdk/client-s3`)
- **Authentication & Security**: Passport.js (Google OAuth 2.0), JWT (`jsonwebtoken`), bcryptjs, Helmet, express-rate-limit, cookie-parser, CORS
- **DevOps**: Docker, Docker Compose, Nginx

---

## Project Structure

```text
RESUMEIQ/
├── docker-compose.yml           # Multi-container setup (Redis, API, Worker, Client)
├── .env.example                 # Template for required environment variables
├── README.md
│
├── Backend/
│   ├── Dockerfile               # Backend container with Chromium and non-root user
│   ├── server.js                # Web API entry point
│   ├── worker.js                # Standalone background worker entry point
│   └── src/
│       ├── app.js               # Express app configuration & middleware
│       ├── config/              # Database, Redis, and Passport OAuth setup
│       ├── controller/          # Route controller logic (auth, interview)
│       ├── middlewares/         # Auth, file validation, and rate limiters
│       ├── models/              # Mongoose schemas (User, Report, Resume, Token)
│       ├── queues/              # BullMQ queue definitions
│       ├── routes/              # Express API route declarations
│       ├── services/            # Groq AI, S3, Nodemailer, and Token services
│       └── workers/             # BullMQ worker processor logic
│
└── Frontend/
    ├── Dockerfile               # Production multi-stage build (Node build + Nginx)
    ├── nginx.conf               # Nginx server config with SPA route fallback
    ├── vite.config.js           # Vite build configuration
    └── src/
        ├── App.jsx              # App shell and context providers
        ├── app.routes.jsx       # Route definitions and protected route guards
        ├── style.scss           # Theme variables and global styles
        └── features/
            ├── auth/            # Auth pages (Login, Register, Reset, Settings)
            └── interview/       # Dashboard, Report Viewer, and Resume Generator
```

---

## API Overview

### Authentication (`/api/auth`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Registers account and sends email verification OTP |
| `POST` | `/api/auth/verify-registration` | Verifies registration OTP and activates session |
| `POST` | `/api/auth/resend-registration-otp` | Resends registration OTP (60s cooldown) |
| `POST` | `/api/auth/login` | Validates credentials and sends 2FA login OTP |
| `POST` | `/api/auth/verify-login` | Verifies login OTP and sets session cookies |
| `POST` | `/api/auth/resend-login-otp` | Resends login OTP (60s cooldown) |
| `POST` | `/api/auth/forgot-password` | Sends password reset OTP to user's email |
| `POST` | `/api/auth/verify-forgot-password` | Validates reset OTP and issues temporary reset token |
| `POST` | `/api/auth/reset-password` | Updates password and directly logs in the user |
| `POST` | `/api/auth/resend-forgot-password` | Resends password reset OTP |
| `POST` | `/api/auth/guest-login` | Creates an instant guest session with demo quotas |
| `POST` | `/api/auth/refresh` | Rotates refresh token and issues a new access token |
| `POST` | `/api/auth/logout` | Revokes refresh token and clears session cookies |
| `GET`  | `/api/auth/getme` | Returns profile data for the current authenticated user |
| `PATCH`| `/api/auth/profile` | Updates user profile information |
| `PATCH`| `/api/auth/password` | Requests an OTP to change account password |
| `POST` | `/api/auth/password/verify` | Verifies OTP and applies the new password |
| `GET`  | `/api/auth/google` | Starts Google OAuth 2.0 authentication flow |
| `GET`  | `/api/auth/google/callback` | Google OAuth callback handler |

### Interview & Resumes (`/api/interview`)

All interview endpoints require an authenticated session.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/interview/` | Ingests resume PDF + job description and queues AI analysis |
| `GET`  | `/api/interview/status/:jobId` | Returns the current processing status of a queued report |
| `GET`  | `/api/interview/` | Fetches all saved interview reports for the current user |
| `GET`  | `/api/interview/report/:interviewId` | Fetches a single interview report by ID |
| `PATCH`| `/api/interview/report/:interviewId` | Renames an interview report title |
| `DELETE`| `/api/interview/report/:interviewId`| Deletes an interview report |
| `POST` | `/api/interview/resume/pdf/:interviewReportId` | Generates a temporary tailored resume PDF preview |
| `POST` | `/api/interview/resume/pdf/:interviewReportId/save` | Saves an approved resume PDF to S3 and registers metadata |
| `GET`  | `/api/interview/generated-resumes` | Lists metadata for all resumes saved in S3 |
| `GET`  | `/api/interview/resume/:resumeId/download` | Streams a saved PDF resume directly from AWS S3 |
| `DELETE`| `/api/interview/resume/:resumeId` | Deletes a resume from AWS S3 and database records |

---

## Environment Configuration

Create a `.env` file in the root directory (or copy `.env.example`):

```env
# Application Environment
NODE_ENV=development
FRONTEND_PORT=5173
BACKEND_PORT=3000
FRONTEND_URL=http://localhost:5173

# MongoDB Connection
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/resumeiq

# JWT & Session Secrets
JWT_SECRET=your_jwt_secret_here
ACCESS_TOKEN_SECRET=your_access_token_secret_here
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Groq AI Service
GROQ_API_KEY=gsk_your_groq_api_key_here

# AWS S3 Storage
AWS_REGION=ap-south-1
S3_BUCKET_NAME=your_s3_bucket_name
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_SESSION_TOKEN=

# Google OAuth 2.0 Credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# SMTP Email Configuration (for OTP delivery)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_app_password

# Redis Configuration (use 'redis' for Docker, '127.0.0.1' for local dev)
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
WORKER_CONCURRENCY=2
```

---

## Getting Started

### Running with Docker Compose

Docker Compose builds and runs all components: Redis, the Backend API, the Background Worker, and the Frontend.

1. Clone the repository:
   ```bash
   git clone https://github.com/Anjan-2006/resumeIQ.git
   cd resumeIQ
   ```

2. Set up your environment file:
   ```bash
   cp .env.example .env
   ```
   Add your credentials (MongoDB, Groq, AWS S3, and SMTP).

3. Start all services:
   ```bash
   docker compose up --build -d
   ```

4. Verify running containers:
   ```bash
   docker compose ps
   ```

5. Open `http://localhost:5173` in your browser.

To stop the containers:
```bash
docker compose down
```

---

### Local Development Setup

If running locally without Docker:

#### Prerequisites
- Node.js 20 LTS
- Local or hosted Redis instance
- MongoDB instance (Atlas or local)
- Google Chrome or Chromium installed for Puppeteer

#### 1. Start Redis
Ensure your Redis server is running locally:
```bash
redis-server
```

#### 2. Start Backend API
```bash
cd Backend
cp ../.env.example .env
# Set REDIS_HOST=127.0.0.1 in Backend/.env
npm install
npm start
```
The API server will listen on `http://localhost:3000`.

#### 3. Start Background Worker
In a new terminal:
```bash
cd Backend
npm run worker
```

#### 4. Start Frontend
In a new terminal:
```bash
cd Frontend
npm install
npm run dev
```
The Vite development server will open on `http://localhost:5173`.

---

## Security

- **HTTP-Only Cookies**: Authentication session tokens are stored in `httpOnly`, `sameSite` cookies with `secure` flags enabled in production to protect against XSS attacks.
- **Password Hashing**: User passwords are hashed using `bcryptjs` with salt rounds before database persistence.
- **Email OTP Verification**: Registration, login, and password resets require 6-digit one-time passcodes with short expiration windows and resend cooldowns.
- **Rate Limiting**: Critical endpoints (login, registration, OTP verification, AI generation) are guarded with `express-rate-limit` to prevent brute force and abuse.
- **Helmet Security Headers**: Standard HTTP response security headers are applied to protect against common web vulnerabilities.
- **Session Management**: Implements short-lived access tokens combined with revocable refresh tokens.
- **Private S3 Storage**: Generated resumes are stored in private AWS S3 buckets and accessed only through authenticated backend routes.
- **Input Validation**: Uploaded resumes are validated using binary magic bytes (`%PDF-`), and AI outputs are strictly checked against Zod schemas.
