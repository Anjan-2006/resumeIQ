# ResumeIQ

ResumeIQ is an AI-powered resume and interview preparation platform. A user can create an account, upload a resume, provide a target job description, and receive a personalized interview preparation report generated with Groq AI.

The application has two separate applications:

- `Backend`: Node.js, Express, MongoDB, Mongoose, JWT authentication, Groq AI, PDF parsing, and Puppeteer.
- `Frontend`: React 19, Vite, React Router, Axios, Sass, Framer Motion, and local state/context management.

## Product Workflow

1. A user creates an account or signs in.
2. Authentication is maintained through a JWT stored in a cookie.
3. The user reaches the protected dashboard.
4. The user enters a target job description.
5. The user may enter an optional self-description.
6. The user uploads a resume PDF.
7. The backend extracts text from the PDF in memory.
8. The extracted resume, self-description, and job description are sent to Groq AI.
9. Groq returns a structured interview report in JSON.
10. The backend validates the AI response using Zod.
11. The validated report is stored in MongoDB and returned to the frontend.
12. The frontend navigates to the report page.
13. The user reviews interview questions, skill gaps, and a preparation roadmap.
14. The user can mark roadmap tasks as complete.
15. The user can rename or delete saved reports.
16. The user can generate a temporary AI-tailored PDF resume preview.
17. The user can try another preview or explicitly keep and save the current resume.
18. Approved resumes are stored in private S3 storage and listed on the dashboard.
19. The user can preview, download, or delete saved resumes from the dashboard.

## Repository Structure

```text
RESUMEIQ/
├── README.md
├── project_summary.txt
├── resume.json
├── Backend/
│   ├── .env
│   ├── package.json
│   ├── package-lock.json
│   ├── server.js
│   ├── backendsummary.txt
│   └── src/
│       ├── app.js
│       ├── config/
│       │   ├── config.js
│       │   └── database.js
│       ├── controller/
│       │   ├── auth.controller.js
│       │   └── interview.controller.js
│       ├── middlewares/
│       │   ├── auth.middleware.js
│       │   └── file.middleware.js
│       ├── models/
│       │   ├── blacklist.model.js
│       │   ├── generatedResume.model.js
│       │   ├── interviewReport.model.js
│       │   └── user.model.js
│       ├── routes/
│       │   ├── auth.route.js
│       │   └── interview.routes.js
│       └── services/
│           ├── ai.service.js
│           ├── s3.service.js
│           └── temp.js
└── Frontend/
    ├── package.json
    ├── index.html
    ├── vite.config.js
    ├── eslint.config.js
    ├── public/
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── app.routes.jsx
        ├── App.css
        ├── style.scss
        └── features/
            ├── auth/
            │   ├── auth.context.jsx
            │   ├── auth.form.scss
            │   ├── components/
            │   │   ├── Loader.jsx
            │   │   ├── Navbar.jsx
            │   │   └── Protected.jsx
            │   ├── hooks/useAuth.js
            │   ├── pages/
            │   │   ├── Home.jsx
            │   │   ├── Login.jsx
            │   │   └── Register.jsx
            │   │   ├── services/auth.api.js
            │   │   └── styles/home.scss
            └── interview/
                ├── interview.context.jsx
                ├── hooks/useInterview.js
                ├── pages/Interview.jsx
                ├── services/interview.api.js
                └── style/interview.scss
```

# Backend

## Backend Stack

- Node.js
- Express
- MongoDB
- Mongoose
- bcryptjs
- JSON Web Token
- cookie-parser
- CORS
- Morgan
- Multer
- pdf-parse
- Groq SDK
- Zod
- Puppeteer
- AWS SDK for JavaScript v3 (Amazon S3)

The backend uses CommonJS modules with `require()` and `module.exports`.

## Backend Startup

[server.js](Backend/server.js) is the backend entry point. It:

1. Loads `.env` values using `dotenv`.
2. Imports the Express application.
3. Starts the MongoDB connection.
4. Starts the HTTP server on port `3000`.

The Express application is configured in [src/app.js](Backend/src/app.js). It enables:

- JSON request parsing.
- Cookie parsing.
- Morgan HTTP request logging.
- CORS with credentials.
- Authentication routes under `/api/auth`.
- Interview routes under `/api/interview`.

The configured frontend origin is `http://localhost:5173`.

## Environment Variables

Create `Backend/.env` with:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
AWS_REGION=ap-south-1
S3_BUCKET_NAME=resumeiq-resumes-anjan-581601708007-ap-south-1-an
```

For the configured deployment, `S3_BUCKET_NAME` is `resumeiq-resumes-anjan-581601708007-ap-south-1-an`.

The backend validates these values during startup in [config.js](Backend/src/config/config.js). AWS credentials are not stored in source code; the AWS SDK uses its standard credential provider chain.

## Authentication Features

Authentication is implemented in [auth.controller.js](Backend/src/controller/auth.controller.js).

### Registration

`POST /api/auth/register`

Accepts:

```json
{
  "username": "example",
  "email": "user@example.com",
  "password": "password"
}
```

The registration process:

- Validates required fields.
- Checks for an existing username or email.
- Hashes the password with bcryptjs.
- Creates the user in MongoDB.
- Signs a JWT containing the user ID and username.
- Stores the JWT in a `token` cookie.
- Returns the new user's public details.

### Login

`POST /api/auth/login`

Accepts an email and password. The backend:

- Finds the user by email.
- Compares the password with the bcrypt hash.
- Creates a one-day JWT on success.
- Stores the token in a cookie.
- Returns the authenticated user's public details.

### Logout

`GET /api/auth/logout`

The logout controller:

- Reads the JWT cookie.
- Stores the token in the blacklist collection.
- Clears the cookie.
- Prevents the token from being used again.

### Current User

`GET /api/auth/getme`

This is protected by the authentication middleware and returns the logged-in user's ID, username, and email.

## Authentication Middleware

[src/middlewares/auth.middleware.js](Backend/src/middlewares/auth.middleware.js) protects private routes.

It:

1. Reads `req.cookies.token`.
2. Rejects requests without a token.
3. Checks the blacklist collection.
4. Verifies the JWT using `JWT_SECRET`.
5. Stores decoded user information in `req.user`.
6. Passes the request to the controller.

## Backend Models

### User Model

[user.model.js](Backend/src/models/user.model.js) stores:

- `username`
- `email`
- `password`

Username and email are unique and required.

### Blacklist Model

[blacklist.model.js](Backend/src/models/blacklist.model.js) stores logged-out JWT tokens with timestamps.

### Interview Report Model

[interviewReport.model.js](Backend/src/models/interviewReport.model.js) stores:

- `jobDescription`
- `resume`
- `selfDescription`
- `matchScore`
- `technicalQuestions`
- `behaviouralQuestions`
- `skillGaps`
- `preparationPlanSchema`
- `user`
- `title`
- `createdAt`
- `updatedAt`

Technical and behavioral questions contain:

- Question text.
- Interviewer's intention.
- Suggested answer.

Skill gaps contain:

- Skill name.
- Severity: `low`, `medium`, or `high`.

Preparation-plan entries contain:

- Day.
- Focus.
- Tasks.

### Generated Resume Model

[generatedResume.model.js](Backend/src/models/generatedResume.model.js) stores metadata and the private S3 object reference for an approved resume:

- `user`
- `fileName`
- `s3Key`
- `createdAt`
- `updatedAt`

The PDF binary is stored in S3, not MongoDB. S3 objects use the key format `resumes/{userId}/{resumeId}.pdf`.

## Resume Upload and Parsing

[src/middlewares/file.middleware.js](Backend/src/middlewares/file.middleware.js) configures Multer with:

- In-memory storage.
- A maximum file size of 3 MB.
- The upload field name `resume`.

[src/controller/interview.controller.js](Backend/src/controller/interview.controller.js) uses `pdf-parse` to extract text from the uploaded PDF. The extracted text is saved inside the interview report for later tailored-resume generation.

## AI Report Generation

[src/services/ai.service.js](Backend/src/services/ai.service.js) contains the Groq integration.

The interview report prompt sends the following information to the model:

- Extracted resume text.
- Candidate self-description.
- Target job description.

The expected AI response contains:

- A match score from 0 to 100.
- A job title.
- Technical questions.
- Behavioral questions.
- Skill gaps.
- A day-wise preparation plan.

The service requests JSON-only output, parses the model response, and validates it against a Zod schema before returning it to the controller.

The prompt requests at least ten technical questions and ten behavioral questions.

## Interview API Routes

All interview routes require authentication.

| Method | Endpoint | Function |
|---|---|---|
| `POST` | `/api/interview/` | Upload resume and generate an AI interview report |
| `GET` | `/api/interview/` | Get the current user's reports |
| `GET` | `/api/interview/generated-resumes` | Get the current user's saved resume metadata |
| `GET` | `/api/interview/report/:interviewId` | Get one report owned by the current user |
| `PATCH` | `/api/interview/report/:interviewId` | Rename a report |
| `DELETE` | `/api/interview/report/:interviewId` | Delete a report |
| `POST` | `/api/interview/resume/pdf/:interviewReportId` | Generate a temporary tailored resume PDF preview |
| `POST` | `/api/interview/resume/pdf/:interviewReportId/save` | Upload an approved preview to S3 and save its MongoDB metadata |
| `GET` | `/api/interview/resume/:resumeId/download` | Download a saved resume from S3 |
| `DELETE` | `/api/interview/resume/:resumeId` | Delete a saved resume from S3 and MongoDB |

Every report lookup, rename, and delete operation checks both the report ID and the authenticated user's ID.

## Tailored Resume PDF Generation

The tailored resume process is implemented in [ai.service.js](Backend/src/services/ai.service.js) and [interview.controller.js](Backend/src/controller/interview.controller.js).

1. The backend retrieves the saved report and verifies ownership.
2. It sends the original resume, self-description, and job description to Groq.
3. Groq generates a complete HTML resume.
4. The prompt instructs the model not to invent facts, metrics, education, employers, dates, or technologies.
5. Zod validates the generated HTML response.
6. Puppeteer converts the generated HTML to an A4 PDF.
7. The backend returns the PDF as a temporary inline preview. It does not upload or save it yet.
8. The user can reject the preview and generate another one.
9. When the user approves it, the frontend sends the PDF to the save endpoint.
10. The backend uploads the approved PDF directly to private S3 and then creates the MongoDB metadata document.

The Puppeteer browser is closed in a `finally` block so cleanup runs when page creation, content loading, or PDF generation fails.

### S3 Resume Storage

[s3.service.js](Backend/src/services/s3.service.js) contains the dedicated S3 operations:

- `uploadResumePdf` uses `PutObjectCommand` with `ContentType: application/pdf`.
- `getResumePdf` uses `GetObjectCommand` and consumes the returned response stream into a PDF buffer.
- `deleteResumePdf` uses `DeleteObjectCommand`.

The S3 bucket remains private. Generated-resume list, download, and delete operations require authentication and scope database queries to the authenticated user.

# Frontend

## Frontend Stack

- React 19
- Vite
- React Router
- Axios
- Sass
- Framer Motion
- Lucide React
- React Icons
- ESLint

The frontend uses JavaScript and JSX with React Context for shared state.

## Frontend Startup

[main.jsx](Frontend/src/main.jsx) mounts the React application.

[App.jsx](Frontend/src/App.jsx):

- Wraps the application in `AuthProvider`.
- Wraps the application in `InterviewProvider`.
- Loads the router.
- Provides dark and light theme switching.
- Persists the selected theme in `localStorage`.

## Frontend Routes

Routes are declared in [app.routes.jsx](Frontend/src/app.routes.jsx).

| Route | Access | Screen |
|---|---|---|
| `/login` | Public | Login page |
| `/register` | Public | Registration page |
| `/` | Protected | Dashboard and report history |
| `/interview` | Protected | Interview screen route |
| `/interview/:id` | Protected | Specific interview report |

## Authentication Frontend Architecture

### Authentication Context

[auth.context.jsx](Frontend/src/features/auth/auth.context.jsx) stores:

- Current user.
- Authentication loading state.
- User setter.
- Loading setter.

When the application starts, it calls `/api/auth/getme` to restore the existing cookie session.

### Authentication Hook

[useAuth.js](Frontend/src/features/auth/hooks/useAuth.js) provides:

- `handleLogin`
- `handleRegister`
- `handleLogout`
- `user`
- `loading`

### Authentication API Service

[auth.api.js](Frontend/src/features/auth/services/auth.api.js) contains Axios functions for:

- Registration.
- Login.
- Logout.
- Current-user lookup.

Axios is configured with `withCredentials: true` so cookies are sent to the backend.

### Protected Route

[Protected.jsx](Frontend/src/features/auth/components/Protected.jsx):

- Shows a loader while authentication is being checked.
- Redirects unauthenticated users to `/login`.
- Renders protected content for authenticated users.

## Dashboard Features

[Home.jsx](Frontend/src/features/auth/pages/Home.jsx) is the main authenticated dashboard.

Implemented dashboard features include:

- ResumeIQ navigation bar.
- Logged-in username display.
- Logout button.
- New report form.
- Job-description text area.
- Optional self-description text area.
- Resume upload area.
- Drag-and-drop upload handling.
- File-size validation on the client.
- Report generation loading modal.
- AI-processing progress steps.
- Recent report loading.
- Recent report cards.
- Match-score badges.
- Relative report dates.
- Report navigation.
- Report rename workflow.
- Report delete confirmation workflow.
- Empty state for users without reports.
- Recently Generated Resumes section.
- Saved resume metadata cards sorted newest first.
- In-page PDF preview modal with close and Escape-key support.
- Saved resume download and delete actions.
- Empty state for users without saved resumes.

The dashboard uses [useInterview.js](Frontend/src/features/interview/hooks/useInterview.js) to call the backend and update shared report state.

## Interview Context and Hook

[interview.context.jsx](Frontend/src/features/interview/interview.context.jsx) stores:

- Current report.
- All reports.
- Generated resume metadata.
- Interview loading state.

[useInterview.js](Frontend/src/features/interview/hooks/useInterview.js) coordinates API calls and context updates for:

- Report generation.
- Single-report retrieval.
- All-report retrieval.
- Report rename.
- Report deletion.
- Temporary resume PDF preview generation.
- Approved resume saving.
- Saved resume PDF retrieval and download.
- Saved resume deletion.

## Interview Report Screen

[Interview.jsx](Frontend/src/features/interview/pages/Interview.jsx) loads the report ID from the URL and requests the corresponding report from the backend.

The report interface contains four main tabs:

### Technical Questions

Displays generated technical questions. Each question can be expanded to show:

- The question.
- The interviewer's intention.
- The suggested answer.

### Behavioral Questions

Displays generated behavioral questions with their intention and suggested answer. The interface labels these answers as STAR-method answers.

### Preparation Roadmap

Displays the AI-generated day-wise preparation plan as a timeline.

Implemented roadmap features:

- Day labels.
- Daily focus.
- Task lists.
- Task completion checkboxes.
- Completed-task count.
- Overall progress percentage.
- Persistent progress in `localStorage` per report.

### Tailored Resume

The tailored-resume tab provides:

- Resume-generation button.
- Generation loading state.
- Error display.
- PDF preview inside an iframe.
- "Not satisfied - Try again" regeneration action.
- "Looks good - Keep & Save" approval action.
- Download button after the resume is saved.
- Generated filename based on the report title.

Generated previews remain temporary in browser memory until the user approves them. The dashboard's saved-resume cards use an in-page PDF preview modal instead of opening a new browser tab.

## Styling and Theme

The frontend uses Sass stylesheets with CSS variables for dark and light themes.

Main styling areas include:

- Global theme variables in [style.scss](Frontend/src/style.scss).
- Authentication form styles in [auth.form.scss](Frontend/src/features/auth/auth.form.scss).
- Dashboard styles in [home.scss](Frontend/src/features/auth/styles/home.scss).
- Interview report styles in [interview.scss](Frontend/src/features/interview/style/interview.scss).

The interface includes:

- Responsive dashboard layouts.
- Responsive report layouts.
- Dark mode.
- Light mode.
- Loading indicators.
- Upload states.
- Error states.
- Interactive report cards.
- Expandable interview questions.
- Timeline roadmap UI.
- Embedded PDF preview.

# Data Flow

## Authentication Data Flow

```text
Login/Register page
        ↓
useAuth hook
        ↓
auth.api.js
        ↓
POST /api/auth/login or /register
        ↓
Backend validates credentials
        ↓
JWT is stored in cookie
        ↓
AuthContext stores user
        ↓
Protected route allows dashboard access
```

## Report Generation Data Flow

```text
Home.jsx form
        ↓
useInterview.generateInterviewReport()
        ↓
interview.api.js
        ↓
POST /api/interview/ multipart request
        ↓
Auth middleware validates cookie
        ↓
Multer receives resume
        ↓
pdf-parse extracts PDF text
        ↓
Groq AI generates structured JSON
        ↓
Zod validates the response
        ↓
MongoDB stores the report
        ↓
Frontend navigates to /interview/:id
        ↓
Interview.jsx loads and displays the report
```

## Tailored Resume Data Flow

```text
Interview.jsx Generate Resume
        ↓
POST /api/interview/resume/pdf/:interviewReportId
        ↓
Authenticated report lookup
        ↓
Groq generates HTML
        ↓
Zod validates HTML
        ↓
Puppeteer creates PDF buffer
        ↓
Temporary PDF preview returned to the frontend
        ↓
User selects "Looks good - Keep & Save"
        ↓
POST /api/interview/resume/pdf/:interviewReportId/save
        ↓
S3 PutObjectCommand uploads the PDF
        ↓
MongoDB stores GeneratedResume metadata
        ↓
Dashboard lists the saved resume metadata
```

## Saved Resume Data Flow

```text
Dashboard loads
        ↓
GET /api/interview/generated-resumes
        ↓
MongoDB returns metadata for the authenticated user
        ↓
Dashboard renders saved resume cards

Preview or Download action
        ↓
GET /api/interview/resume/:resumeId/download
        ↓
MongoDB ownership check
        ↓
S3 GetObjectCommand
        ↓
PDF blob returned to the frontend
```

## Report Management Data Flow

```text
Dashboard action
        ↓
useInterview hook
        ↓
interview.api.js
        ↓
PATCH or DELETE interview endpoint
        ↓
Backend verifies report ownership
        ↓
MongoDB updates or deletes report
        ↓
Interview context updates the dashboard
```

# Available Scripts

## Backend

From the `Backend` directory:

```bash
npm install
node server.js
```

The backend currently listens on port `3000`.

The backend `test` script is currently only a placeholder and exits with an error because no automated backend tests have been added.

## Frontend

From the `Frontend` directory:

```bash
npm install
npm run dev
```

Other scripts:

```bash
npm run build
npm run lint
npm run preview
```

The Vite development server normally runs on `http://localhost:5173`.

# Current Limitations

The following areas are implemented only partially or need follow-up work:

1. The frontend file picker currently advertises PDF, DOCX, and DOC, but the backend currently parses PDF files with `pdf-parse`. DOCX and DOC support is not implemented.
2. The interview page contains fallback sample data. If report loading fails, the UI can display fallback content instead of a clear failed-request screen.
3. Registration navigation does not currently check the returned success value before navigating to the dashboard.
4. The frontend production build passes, but ESLint currently reports context fast-refresh issues, a state-update-in-effect issue in the dashboard, and missing hook dependencies.
5. There is no automated backend test suite.
6. JWT cookies do not currently specify stronger production settings such as `httpOnly`, `secure`, `sameSite`, and an explicit max age.
7. Blacklisted tokens are stored but are not automatically removed after token expiration.
8. Backend upload validation limits size but does not fully validate the uploaded file MIME type.
9. The backend and frontend use hardcoded local development URLs instead of environment-based API configuration.
10. The generated AI response depends on the availability, token limits, and output behavior of the configured Groq model.
11. Saved resume history depends on both MongoDB metadata and the corresponding private S3 object remaining available.

# Implementation Summary

ResumeIQ currently has a working full-stack foundation with:

- A React dashboard.
- Public login and registration pages.
- Cookie-based JWT authentication.
- Protected backend APIs.
- MongoDB persistence.
- Resume PDF extraction.
- Groq-powered report generation.
- Structured AI response validation.
- Interview report history.
- Report rename and delete operations.
- Technical and behavioral interview preparation.
- Skill-gap analysis.
- Personalized preparation roadmap.
- Persistent roadmap task tracking.
- AI-generated tailored resume PDFs.
- Temporary resume preview with explicit keep-and-save approval.
- Private S3 storage for approved resume PDFs.
- Generated resume metadata history on the dashboard.
- In-page saved-resume preview, download, and delete actions.
- Dark/light theme support.

The main remaining work is hardening and polishing: adding tests, fixing lint issues, restricting uploads to supported file types, replacing mock fallback data with proper error handling, improving production cookie/security settings, and moving API configuration into environment variables.
