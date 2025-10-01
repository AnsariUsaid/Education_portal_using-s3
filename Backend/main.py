from fastapi import FastAPI, Request
from Backend.models import Base
from Backend.database import engine
from Backend.routers import auth, teacher, student
from fastapi.middleware.cors import CORSMiddleware
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="EduPortal API",
    description="Professional Education Portal Backend",
    version="1.0.0"
)

# Create database tables
Base.metadata.create_all(bind=engine)

# CORS middleware - Updated for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:8080", "http://127.0.0.1:3000", "http://127.0.0.1:5173", "http://127.0.0.1:8080"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.get('/health-check')
def health_check():
    return {'status': 'healthy', 'message': 'EduPortal API is running'}

@app.get('/')
def root():
    return {'message': 'Welcome to EduPortal API', 'docs': '/docs'}

# Include routers
app.include_router(auth.router)
app.include_router(teacher.router)
app.include_router(student.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
