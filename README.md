# ExamCoach

SE3040 - Application Frameworks (2026)  
BSc (Hons) in Information Technology - Software Engineering  
Year 03 Group Project (Full Stack Application Development)

ExamCoach is a full-stack MERN application that helps students prepare for standardized exams using AI-powered tools, structured study planning, and real-time assessment monitoring.

---

## Table of Contents

1. Project Overview
2. Functional Components and Requirements
3. System Architecture
4. Technology Stack
5. Setup Instructions
6. API Endpoint Documentation
7. Authentication and Authorization
8. Deployment Report
9. Testing Instruction Report
10. Features
11. Folder Structure
12. Contributors
13. Screenshots and Evidence

---

## 1. Project Overview

ExamCoach is designed as an intelligent exam-preparation platform where students can summarize learning materials, practice quizzes, build study plans, and track performance. Teachers and administrators can manage educational content, monitor quiz activities, and maintain platform quality.

### Main Features

- AI Learning Lab for summarization and related learning resources
- Practice quizzes and assessment workflows
- Study plan generation and analytics dashboards
- Course management using streams, subjects, and lessons
- Real-time cheating detection with Socket.io tab-switch alerts

### User Roles

- Student: Access AI tools, attempt quizzes, generate study plans, track progress
- Teacher: Manage lessons and quizzes
- Admin: Manage users, subjects, and platform-level analytics

---

## 2. Functional Components and Requirements

The backend is organized into multiple functional components, each with clear responsibilities and REST endpoints.

### Component 1: Authentication and User Management

- Student registration and login
- OTP verification and password reset flow
- Profile retrieval for logged-in users
- Role assignment and protected route access

### Component 2: AI Learning Lab

- AI summarization from text or uploaded files
- Save summary history with related resources
- View and manage user summary history
- Third-party AI integration using Google Gemini

### Component 3: Quiz and Assessment

- Quiz creation and listing
- Enrollment-key and password-protected access
- Quiz attempt submission and score calculation
- Real-time invigilation support via Socket.io events

### Component 4: Study Plan and Analytics

- Personalized study plan generation
- Daily timetable and progress tracking
- Study-time logging and missed-goal handling
- Student analytics and journaling

### Component 5: Course Management

- Subject creation and retrieval
- Lesson creation and retrieval per subject
- Learning material upload and link management

All components follow REST principles, proper HTTP methods, validation, and error handling.

---

## 3. System Architecture

ExamCoach follows a client-server architecture with REST APIs and real-time sockets.

- Frontend (React + Vite) communicates with backend over HTTP/HTTPS
- Backend (Express) exposes REST endpoints for CRUD and business logic
- MongoDB stores users, subjects, lessons, quizzes, attempts, and study plans
- Socket.io provides real-time monitoring events for quiz behavior
- External services provide AI, media storage, and calendar synchronization

### Architecture Summary

- Frontend: React functional components, hooks-based state flow
- Backend: Express controllers, middleware, routes, services
- Database: MongoDB with Mongoose schema modeling
- Integrations:
  - Google Gemini AI
  - Cloudinary
  - Google Calendar API

### Real-Time Events

- join-quiz
- join-teacher-monitor
- tab-switch
- student-tab-switch

REST API handles standard operations, while Socket.io handles real-time cheating detection alerts.

---

## 4. Technology Stack

### Frontend

- React (Vite)
- JavaScript (ES6+)
- CSS and UI component styling

### Backend

- Node.js
- Express.js
- Socket.io

### Database

- MongoDB
- Mongoose

### Testing

- Jest (unit testing)
- Postman (integration/API testing)
- Artillery (performance testing)

### External APIs and Services

- Google Gemini AI
- Cloudinary
- Google Calendar API

---

## 5. Setup Instructions

## Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- MongoDB Atlas URI or local MongoDB
- API keys for Gemini and Cloudinary

## Backend Setup

1. Clone the repository:

```bash
git clone https://github.com/<your-username-or-org>/ExamCoach.git
cd ExamCoach
```

2. Move to backend folder:

```bash
cd Backend
```

3. Install dependencies:

```bash
npm install
```

4. Create a .env file in Backend and configure:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
FRONTEND_URL=http://localhost:5173
JWT_EXPIRES_IN=30d
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/calendar/callback
```

5. Run the backend:

```bash
npm run dev
```

6. Verify backend:

- URL: http://localhost:5000
- Expected: ExamCoach API is running

## Frontend Setup

1. Open a new terminal and navigate to frontend:

```bash
cd Frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create a .env file in Frontend:

```env
VITE_API_URL=http://localhost:5000
```

4. Run frontend:

```bash
npm run dev
```

5. Open frontend URL (default):

- http://localhost:5173

## Run Full System Locally

- Terminal 1: Backend (npm run dev)
- Terminal 2: Frontend (npm run dev)

---

## 6. API Endpoint Documentation

Base URL (Local): http://localhost:5000  
Base URL (Production): https://examcoach-backend-mnoy.onrender.com

All major endpoints below include method, URL, description, request body, response, and auth requirement.

### 6.1 Authentication

### POST /api/auth/register

- Method: POST
- URL: /api/auth/register
- Implementation Note: Backend currently implements this as /api/auth/register-student
- Description: Register a new student account
- Authentication: Not required

Request body:

```json
{
  "firstName": "Nimal",
  "lastName": "Perera",
  "email": "nimal.perera@example.com",
  "password": "StrongPassword123!"
}
```

Response example:

```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "userId": "67f8f6132b4e7d7bcf06f123"
}
```

### POST /api/auth/login

- Method: POST
- URL: /api/auth/login
- Description: Authenticate user and return JWT token
- Authentication: Not required

Request body:

```json
{
  "email": "nimal.perera@example.com",
  "password": "StrongPassword123!"
}
```

Response example:

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "67f8f6132b4e7d7bcf06f123",
    "name": "Nimal Perera",
    "email": "nimal.perera@example.com",
    "role": "student"
  }
}
```

### 6.2 AI Learning Lab

### POST /api/ai/summarize

- Method: POST
- URL: /api/ai/summarize
- Description: Generate summary and related resources from text or uploaded files
- Authentication: Not required in current implementation

Request body (JSON mode):

```json
{
  "text": "Photosynthesis converts light energy into chemical energy.",
  "summaryType": "paragraph"
}
```

Response example:

```json
{
  "summary": "Photosynthesis converts sunlight, water, and carbon dioxide into glucose and oxygen.",
  "relatedResources": [
    {
      "title": "Khan Academy Photosynthesis",
      "link": "https://www.khanacademy.org/science/biology/photosynthesis-in-plants",
      "type": "website"
    },
    {
      "title": "Photosynthesis Crash Course",
      "link": "https://www.youtube.com/watch?v=sQK3Yr4Sc_k",
      "type": "youtube"
    }
  ]
}
```

### POST /api/ai/save

- Method: POST
- URL: /api/ai/save
- Description: Save generated AI summary to user history
- Authentication: Not required in current implementation

Request body:

```json
{
  "title": "Photosynthesis Notes",
  "summary": "Plants produce glucose using light energy.",
  "type": "text",
  "originalText": "Long source content...",
  "userId": "67f8f66a2b4e7d7bcf06f128",
  "summaryType": "paragraph",
  "relatedResources": [
    {
      "title": "Biology LibreTexts",
      "link": "https://bio.libretexts.org/",
      "type": "website"
    }
  ]
}
```

Response example:

```json
{
  "_id": "6800bb3f5c2a2ed8f012a900",
  "user": "67f8f66a2b4e7d7bcf06f128",
  "title": "Photosynthesis Notes",
  "summary": "Plants produce glucose using light energy.",
  "type": "text",
  "createdAt": "2026-04-11T08:15:00.000Z"
}
```

### GET /api/ai/history/:userId

- Method: GET
- URL: /api/ai/history/:userId
- Description: Get summary history for a user
- Authentication: Not required in current implementation

Request body:

```json
{}
```

Response example:

```json
[
  {
    "_id": "6800bb3f5c2a2ed8f012a900",
    "user": "67f8f66a2b4e7d7bcf06f128",
    "title": "Photosynthesis Notes",
    "summary": "Plants produce glucose using light energy.",
    "summaryType": "paragraph",
    "type": "text",
    "createdAt": "2026-04-11T08:15:00.000Z"
  }
]
```

### DELETE /api/ai/history/:id

- Method: DELETE
- URL: /api/ai/history/:id
- Description: Delete one AI history item
- Authentication: Not required in current implementation

Request body:

```json
{
  "userId": "67f8f66a2b4e7d7bcf06f128"
}
```

Response example:

```json
{
  "message": "History item deleted successfully"
}
```

### 6.3 Course Management

### POST /api/subjects

- Method: POST
- URL: /api/subjects
- Description: Create a new subject
- Authentication: Required (Admin)

Request body:

```json
{
  "name": "Advanced Biology",
  "stream": "67f9e74f2a9d1f2c6e3d1111",
  "teacher": "67f9e74f2a9d1f2c6e3d2222",
  "description": "Core biology syllabus for AL students"
}
```

Response example:

```json
{
  "success": true,
  "data": {
    "_id": "6800be115c2a2ed8f012b111",
    "name": "Advanced Biology",
    "description": "Core biology syllabus for AL students"
  }
}
```

### GET /api/subjects

- Method: GET
- URL: /api/subjects
- Description: Retrieve all subjects
- Authentication: Not required

Request body:

```json
{}
```

Response example:

```json
{
  "success": true,
  "data": [
    {
      "_id": "6800be115c2a2ed8f012b111",
      "name": "Advanced Biology",
      "description": "Core biology syllabus for AL students"
    }
  ]
}
```

### GET /api/lessons/:subjectId

- Method: GET
- URL: /api/lessons/:subjectId
- Implementation Note: Current backend route is /api/subjects/:subjectId/lessons
- Description: Retrieve lessons for a given subject
- Authentication: Not required

Request body:

```json
{}
```

Response example:

```json
{
  "success": true,
  "data": [
    {
      "_id": "6800c0025c2a2ed8f012c111",
      "title": "Cell Structure",
      "description": "Introduction to cell organelles"
    }
  ]
}
```

### 6.4 Quiz

### POST /api/quizzes

- Method: POST
- URL: /api/quizzes
- Description: Create a quiz with questions, timing, and access controls
- Authentication: Currently not enforced by middleware for creation in this route; recommended Teacher/Admin protection

Request body:

```json
{
  "title": "Cell Biology Revision Quiz",
  "description": "Practice quiz for unit revision",
  "subject": "Biology",
  "timeLimit": 30,
  "maxAttempts": 2,
  "enrollmentKey": "BIO-APR-2026",
  "quizPassword": "bio123",
  "questions": [
    {
      "question": "Which organelle is called the powerhouse of the cell?",
      "options": ["Nucleus", "Mitochondria", "Golgi body", "Ribosome"],
      "correctAnswer": 1,
      "explanation": "Mitochondria produce ATP."
    }
  ]
}
```

Response example:

```json
{
  "success": true,
  "data": {
    "_id": "6800c3705c2a2ed8f012d111",
    "title": "Cell Biology Revision Quiz",
    "subject": "Biology",
    "totalQuestions": 1,
    "isActive": true
  }
}
```

### GET /api/quizzes

- Method: GET
- URL: /api/quizzes
- Description: Retrieve active quizzes
- Authentication: Not required

Request body:

```json
{}
```

Response example:

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "6800c3705c2a2ed8f012d111",
      "title": "Cell Biology Revision Quiz",
      "subject": "Biology",
      "timeLimit": 30
    }
  ]
}
```

### 6.5 Study Plan

### POST /api/study-plan

- Method: POST
- URL: /api/study-plan
- Description: Create personalized study plan and timetable
- Authentication: Required (Student)

Request body:

```json
{
  "studyHoursPerDay": 3,
  "subjects": [
    {
      "name": "Biology",
      "examDate": "2026-05-20",
      "isWeak": true,
      "topics": ["Cell Biology", "Genetics", "Ecology"]
    },
    {
      "name": "Chemistry",
      "examDate": "2026-05-28",
      "isWeak": false,
      "topics": ["Atomic Structure", "Bonding"]
    }
  ]
}
```

Response example:

```json
{
  "success": true,
  "data": {
    "_id": "6800c7705c2a2ed8f012e111",
    "studyHoursPerDay": 3,
    "daysUntilNextExam": 39,
    "timetable": {
      "totalDays": 30
    }
  }
}
```

### GET /api/study-plan

- Method: GET
- URL: /api/study-plan
- Description: Retrieve logged-in student study plan
- Authentication: Required (Student)

Request body:

```json
{}
```

Response example:

```json
{
  "success": true,
  "data": {
    "_id": "6800c7705c2a2ed8f012e111",
    "studyHoursPerDay": 3,
    "subjects": [
      {
        "name": "Biology",
        "isWeak": true
      }
    ],
    "dailyLogs": [
      {
        "date": "2026-04-11T00:00:00.000Z",
        "totalMinutes": 150,
        "goalMet": false
      }
    ]
  }
}
```

### API Documentation Tooling

- Postman collection: Use project Postman workspace/collection for endpoint validation
- Optional: Swagger documentation can be added to expose interactive API docs

---

## 7. Authentication and Authorization

ExamCoach uses JWT-based authentication for protected endpoints.

### JWT Flow

1. User logs in using /api/auth/login
2. Server returns a signed JWT
3. Frontend stores token (session/local storage strategy)
4. Frontend includes token in Authorization header
5. Backend protect middleware verifies token
6. authorize middleware applies role checks

### Authorization Header Format

```http
Authorization: Bearer <token>
```

### Protected Route Examples

- Admin-only: POST /api/subjects
- Student-only: POST /api/study-plan, GET /api/study-plan
- Mixed role routes: Teacher/Admin lesson management

---

## 8. Deployment Report

### Backend Deployment

- Platform: Render
- Live URL: https://examcoach-backend-mnoy.onrender.com

#### Backend Deployment Steps

1. Push latest backend code to GitHub
2. Create a Web Service in Render
3. Set root directory to Backend
4. Set build command:

```bash
npm install
```

5. Set start command:

```bash
npm start
```

6. Configure environment variables in Render dashboard

### Frontend Deployment

- Platform: Vercel
- Live URL: https://exam-coach-sigma.vercel.app

#### Frontend Deployment Steps

1. Import repository into Vercel
2. Set root directory to Frontend
3. Configure environment variables:

```env
VITE_API_URL=https://examcoach-backend-mnoy.onrender.com
```

4. Build and deploy from main branch

### Environment Variables (No Secrets Exposed)

| Variable             | Description                         |
| -------------------- | ----------------------------------- |
| PORT                 | Backend server port                 |
| MONGO_URI            | MongoDB connection string           |
| JWT_SECRET           | JWT signing secret                  |
| JWT_EXPIRES_IN       | Token lifetime                      |
| GEMINI_API_KEY       | Gemini AI key                       |
| CLOUDINARY_URL       | Cloudinary connection URL           |
| FRONTEND_URL         | Frontend URL for CORS and callbacks |
| GOOGLE_CLIENT_ID     | Google OAuth client id              |
| GOOGLE_CLIENT_SECRET | Google OAuth client secret          |
| GOOGLE_REDIRECT_URI  | Google OAuth callback URL           |
| VITE_API_URL         | Frontend API base URL               |

### Deployment Evidence

Include screenshots in this README or docs/screenshots for:

- Backend deployment success (Render dashboard)
- Frontend deployment success (Vercel dashboard)
- Live API health-check response
- Working frontend home page using deployed backend

### Deployment Screenshots

#### Backend Deployment - Render (Build Logs)

![Render Build Logs](docs/screenshots/render-backend-build-logs.png)

#### Backend Deployment - Render (Service Live)

![Render Service Live](docs/screenshots/render-backend-live.png)

#### Frontend Deployment - Vercel (Production Ready)

![Vercel Production Deployment](docs/screenshots/vercel-frontend-production-ready.png)

---

## 9. Testing Instruction Report

Run all testing commands from the `Backend` directory.

### 9.1 Study Plan Testing

#### Unit Test

```bash
npx jest test/unit/studyPlan.test.js --verbose
```

#### Integration Test

```bash
npx jest test/integration/studyPlan.test.js --verbose
```

#### Performance Test

```bash
npx artillery run test/performance/performance-studyplan.yml
```

### 9.2 AI Learning Lab Testing

#### Unit Test

```bash
npx --yes jest@29.7.0 --runInBand --testMatch "**/test/unit/aiLab.test.js"
```

#### Integration Test

```bash
npx --yes jest@29.7.0 --runInBand --testMatch "**/test/integration/aiLab.test.js"
```

#### Performance Test

```bash
npx artillery run test/performance/performance-ailab.yml --quiet --output test/performance/ailab-result.json
```

### 9.3 Course Management Testing

#### Unit Test

```bash
npx --yes jest@29.7.0 --runInBand --testMatch "**/test/unit/course.test.js"
```

#### Integration Test

```bash
npx --yes jest@29.7.0 --runInBand --testMatch "**/test/integration/course.test.js"
```

#### Performance Test

```bash
npx artillery run test/performance/performance-course.yml --quiet --output test/performance/course-result.json
```

### 9.4 AI Quiz Generator Testing

#### Unit Test

```bash
npx jest test/unit/aiquizgen.test.js --verbose
```

#### Integration Test

```bash
npx jest test/integration/aiquizgen.test.js --verbose
```

#### Performance Test

```bash
npx artillery run test/performance/performance-aiquiz.yml --output test/performance/aiquiz-result.json
```

### 9.5 User Management Testing

#### Unit Test

```bash
npx jest test/unit/usercom.test.js --verbose
```

#### Integration Test

```bash
npx jest test/integration/usercom.test.js --verbose
```

#### Performance Test

```bash
npx artillery run test/performance/performance-registerstudent.yml --output test/performance/registerstudent-result.json
```

### 9.6 Testing Environment Configuration

- Node.js and npm installed
- Backend dependencies installed (`npm install`)
- MongoDB accessible for integration scenarios
- Backend server running for API and performance tests where required

---

## 10. Features

- Full RESTful API with CRUD operations
- Role-based access control and protected routes
- AI summary generation and resource suggestions
- AI quiz generation and analytics support
- Study plan generation with progress tracking
- Subject and lesson management workflows
- Real-time cheating detection using Socket.io
- Cloud media handling with Cloudinary
- Calendar integration support
- Deployed frontend and backend services

---

## 11. Folder Structure

```text
ExamCoach/
├── README.md
├── Backend/
│   ├── index.js
│   ├── package.json
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── test/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── performance/
│   └── uploads/
└── Frontend/
    ├── package.json
    ├── index.html
    ├── src/
    │   ├── App.jsx
    │   ├── components/
    │   ├── layouts/
    │   ├── pages/
    │   ├── services/
    │   └── utils/
    └── public/
```

---

## 12. Contributors

Replace the placeholders below with final team details.

| Name      | Student ID | Contribution Area            |
| --------- | ---------- | ---------------------------- |
| Member 01 | ITxxxxxxxx | Backend and API              |
| Member 02 | ITxxxxxxxx | Frontend and UI              |
| Member 03 | ITxxxxxxxx | Testing and QA               |
| Member 04 | ITxxxxxxxx | Deployment and Documentation |

---

## 13. Screenshots and Evidence

Add evidence files and update image paths.

### 13.1 UI Screenshots

![Login Page](docs/screenshots/ui-login.png)
![Dashboard](docs/screenshots/ui-dashboard.png)

### 13.2 API Testing Screenshots

![Postman Auth Test](docs/screenshots/postman-auth.png)
![Postman Study Plan Test](docs/screenshots/postman-study-plan.png)

### 13.3 Performance Testing Screenshots

![Artillery Report](docs/screenshots/artillery-report.png)

### 13.4 Deployment Screenshots

![Render Deployment](docs/screenshots/render-deployment.png)
![Vercel Deployment](docs/screenshots/vercel-deployment.png)

---

## Final Notes

This project satisfies the full-stack assignment requirements by combining secure REST API development, React frontend integration, role-based security, external API usage, deployment, and multi-level testing.
