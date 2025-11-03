# 🎓 EduPortal - Modern Education Platform

<div align="center">
  
  ![EduPortal](https://img.shields.io/badge/EduPortal-Education%20Platform-blue?style=for-the-badge)
  ![FastAPI](https://img.shields.io/badge/FastAPI-0.117.1-009688?style=for-the-badge&logo=fastapi)
  ![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=for-the-badge&logo=typescript)
  ![AWS S3](https://img.shields.io/badge/AWS%20S3-Storage-FF9900?style=for-the-badge&logo=amazon-aws)

  **A comprehensive platform connecting educators and students through seamless question paper sharing, answer submission, and academic collaboration.**

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

EduPortal is a modern, full-stack educational platform designed to streamline academic collaboration between teachers and students. Built with performance, security, and user experience in mind, it provides a seamless interface for managing question papers, submissions, and academic content.

### Key Highlights

- 🔐 **Secure Authentication** - JWT-based role-based access control
- ☁️ **Cloud Storage** - AWS S3 integration for reliable file storage
- 📱 **Responsive Design** - Modern, mobile-friendly UI built with TailwindCSS
- ⚡ **Fast & Scalable** - FastAPI backend with SQLAlchemy ORM
- 🎨 **Beautiful UI** - Professional design with shadcn/ui components
- 📊 **Analytics Dashboard** - Track submissions and student performance

---

## ✨ Features

### For Teachers
- 📤 **Upload Question Papers** - Quickly upload question papers with descriptions
- 👥 **Manage Submissions** - View and manage all student submissions
- 📈 **Track Progress** - Monitor student performance and submission history
- 🗂️ **Course Management** - Organize content by courses and subjects

### For Students
- 📥 **Download Papers** - Access question papers by course
- 📝 **Submit Answers** - Securely upload answer sheets
- ⏱️ **Track Status** - Real-time submission status tracking
- 📚 **Browse Courses** - Easy navigation through available courses

### Security & Performance
- 🔒 JWT authentication with secure token management
- 🛡️ Role-based access control (Teacher/Student)
- ☁️ AWS S3 for scalable file storage
- 🗄️ SQLAlchemy ORM with PostgreSQL/SQLite
- 🚀 Fast API responses with async operations

---

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI 0.117.1
- **ORM**: SQLAlchemy 2.0.43
- **Database**: PostgreSQL / SQLite
- **Authentication**: JWT (python-jose)
- **File Storage**: AWS S3 (Boto3)
- **Server**: Uvicorn

### Frontend
- **Framework**: React 18.3.1
- **Language**: TypeScript 5.8.3
- **Styling**: TailwindCSS 3.4.17
- **UI Components**: shadcn/ui (Radix UI)
- **Routing**: React Router 6.30.1
- **State Management**: TanStack Query 5.83.0
- **Build Tool**: Vite 5.4.19
- **Icons**: Lucide React

### DevOps & Tools
- **Version Control**: Git & GitHub
- **Package Managers**: pip, npm
- **Development**: Hot reload for both frontend and backend

---

## 🏗️ Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────┐
│                 │         │                  │         │             │
│  React Frontend │◄────────┤  FastAPI Backend │◄────────┤  PostgreSQL │
│  (Port 8080)    │  REST   │  (Port 8000)     │  ORM    │  Database   │
│                 │   API   │                  │         │             │
└─────────────────┘         └──────────────────┘         └─────────────┘
         │                           │
         │                           │
         │                           ▼
         │                  ┌─────────────────┐
         └─────────────────►│    AWS S3       │
               Upload       │  File Storage   │
                           └─────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.11 or higher
- Node.js 18.x or higher
- PostgreSQL (optional, SQLite works too)
- AWS Account (for S3 storage)
- Git

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/AnsariUsaid/Education_portal_using-s3.git
cd Education_portal_using-s3
```

#### 2. Backend Setup

```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables (see Environment Variables section)
# Create .env file in root directory

# Run the backend server
uvicorn Backend.main:app --reload --port 8000
```

The backend will be available at `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

#### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd Frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:8080`

---

## 📁 Project Structure

```
Education_portal_using-s3/
├── Backend/
│   ├── routers/
│   │   ├── auth.py           # Authentication endpoints
│   │   ├── teacher.py        # Teacher-specific endpoints
│   │   └── student.py        # Student-specific endpoints
│   ├── models.py             # SQLAlchemy database models
│   ├── database.py           # Database configuration
│   ├── main.py               # FastAPI application entry
│   └── __init__.py
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── ui/           # shadcn/ui components
│   │   ├── pages/
│   │   │   ├── Index.tsx     # Landing page
│   │   │   ├── Login.tsx     # Login page
│   │   │   ├── Signup.tsx    # Registration page
│   │   │   ├── TeacherDashboard.tsx
│   │   │   └── StudentDashboard.tsx
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utility functions
│   │   ├── App.tsx           # Main app component
│   │   └── main.tsx          # React entry point
│   ├── public/               # Static assets
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.ts
│
├── requirements.txt          # Python dependencies
├── portal.db                 # SQLite database (dev)
├── .gitignore
└── README.md
```

---

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Register new user |
| POST | `/auth/login` | Login and get JWT token |
| GET | `/auth/me` | Get current user info |

### Teacher Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/teacher/upload` | Upload question paper |
| GET | `/teacher/questions` | Get all questions |
| GET | `/teacher/submissions/{id}` | View submissions for a question |
| DELETE | `/teacher/questions/{id}` | Delete a question |

### Student Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/student/courses` | Get all available courses |
| GET | `/student/questions` | Get all questions |
| GET | `/student/questions/{course}` | Get questions by course |
| POST | `/student/submit` | Submit answer |
| GET | `/student/submissions` | Get user submissions |
| GET | `/student/download/{key}` | Download question paper |

For detailed API documentation with request/response schemas, visit `http://localhost:8000/docs` when the backend is running.

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# AWS Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your_bucket_name

# JWT Configuration
SECRET_KEY=your_super_secret_jwt_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database Configuration (Optional - defaults to SQLite)
DATABASE_URL=postgresql://user:password@localhost/eduportal

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:8080
```

### AWS S3 Setup

1. Create an AWS account
2. Create an S3 bucket
3. Configure IAM user with S3 permissions
4. Add credentials to `.env` file

**Important**: Never commit `.env` file to version control!

---

## 🚢 Deployment

### Backend Deployment (Railway/Heroku)

```bash
# Install gunicorn
pip install gunicorn

# Create Procfile
echo "web: gunicorn -w 4 -k uvicorn.workers.UvicornWorker Backend.main:app" > Procfile

# Deploy to your platform
```

### Frontend Deployment (Vercel/Netlify)

```bash
# Build for production
cd Frontend
npm run build

# Deploy the dist/ folder
```

---

## 👥 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- FastAPI for the amazing backend framework
- React and the React community
- shadcn/ui for beautiful components
- AWS for reliable cloud storage
- All contributors and supporters

---

## 📞 Contact

**Ansari Usaid**

- GitHub: [@AnsariUsaid](https://github.com/AnsariUsaid)
- Email: ansariusaid2005@gmail.com

---

<div align="center">
  
  **⭐ Star this repository if you find it helpful!**
  
  Made with ❤️ by [Ansari Usaid](https://github.com/AnsariUsaid)
  
</div>
