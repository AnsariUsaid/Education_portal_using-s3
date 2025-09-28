EduPortal

Description:
EduPortal is a student dashboard application built with FastAPI (backend) and React/TypeScript (frontend) that allows students to view, download, and submit question papers for various courses. It uses AWS S3 for secure file storage, PostgreSQL for data persistence, and supports JWT-based authentication for role-based access.

Tech Stack

Backend: FastAPI, Pydantic

Frontend: React, TypeScript, TailwindCSS

Database: PostgreSQL (SQLAlchemy ORM)

Authentication: JWT-based authentication

File Storage: AWS S3

Other Libraries/Tools: Boto3 (AWS SDK), Lucide-react (icons), Starlette

Features

Role-based authentication (students and teachers)

Browse courses and question papers

Download question papers from AWS S3

Upload answers securely to AWS S3

Track submission status (submitted/pending)

View all submissions for a question paper (teacher view)

Project Structure
EduPortal/
├─ Backend/
│  ├─ routers/          # API endpoints (teacher, student, auth)
│  ├─ models.py         # SQLAlchemy models for Users, Questions, Answers
│  ├─ database.py       # PostgreSQL connection setup
│  ├─ main.py           # FastAPI app initialization
│  └─ ...
├─ Frontend/
│  ├─ src/
│  │  ├─ components/    # Reusable UI components
│  │  ├─ pages/         # Page components (Login, Signup, StudentDashboard, TeacherDashboard)
│  │  ├─ hooks/         # Custom React hooks
│  │  ├─ App.tsx        # Main app entry
│  │  └─ index.tsx      # React DOM render
│  ├─ public/           # Static assets (favicon, images)
│  ├─ package.json      # Frontend dependencies
│  └─ tailwind.config.ts
├─ requirements.txt     # Backend dependencies
├─ README.md
└─ ...

Setup Instructions

Backend

Install dependencies:

pip install -r requirements.txt


Set up PostgreSQL and configure connection in database.py.

Run the FastAPI server:

uvicorn Backend.main:app --reload


Frontend

Navigate to Frontend folder:

cd Frontend


Install dependencies:

npm install


Start the development server:

npm run dev


Environment Variables

Configure AWS credentials in a .env file (do not push keys to GitHub).

JWT secret key for authentication.

Notes

This project uses AWS S3 for file storage, so make sure your AWS credentials are correctly configured.

Role-based access ensures students and teachers have separate views and permissions.

Frontend development received some assistance from AI tools to speed up UI creation.
