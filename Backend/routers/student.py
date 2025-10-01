from pydantic import BaseModel
from Backend.database import SessionLocal
from starlette import status
from fastapi.responses import StreamingResponse
from Backend.routers.auth import db_dependency, get_user_from_token
from Backend.models import questions, answers, users
from Backend.config import settings
from typing import List, Optional
import uuid
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
import boto3
import io
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix='/student',
    tags=['Student Operations']
)

# S3 Configuration
s3_client = None
if all([settings.AWS_ACCESS_KEY_ID, settings.AWS_SECRET_ACCESS_KEY, settings.S3_BUCKET_NAME]):
    s3_client = boto3.client(
        "s3",
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION
    )

class QuestionOut(BaseModel):
    id: int
    title: str
    course: str
    description: Optional[str]
    uploaded_by: int
    uploader_name: Optional[str]
    created_at: datetime
    s3_key: str
    has_submitted: Optional[bool] = False
    
    class Config:
        from_attributes = True

class CourseOut(BaseModel):
    id: str
    name: str
    question_count: int
    
    class Config:
        from_attributes = True

class AnswerSubmission(BaseModel):
    question_id: int
    file_name: str
    file_size: int

def check_s3_config():
    if not s3_client:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="AWS S3 is not configured properly"
        )

@router.get('/questions/{course}', response_model=List[QuestionOut], status_code=status.HTTP_200_OK)
async def get_questions_by_course(course: str, db: db_dependency, user=Depends(get_user_from_token)):
    try:
        if user is None:
            raise HTTPException(status_code=401, detail="Unauthorized")
        
        # Build query
        query = db.query(questions, users.username).join(users, questions.uploaded_by == users.id)
        
        if course.lower() != 'all':
            query = query.filter(questions.course == course)
        
        results = query.all()
        
        # Check if student has submitted answers
        question_list = []
        for question, uploader_name in results:
            existing_answer = db.query(answers).filter(
                answers.question_id == question.id,
                answers.answered_by == user['id']
            ).first()
            
            question_data = QuestionOut(
                id=question.id,
                title=question.title,
                course=question.course,
                description=question.description,
                uploaded_by=question.uploaded_by,
                uploader_name=uploader_name,
                created_at=question.created_at,
                s3_key=question.s3_key,
                has_submitted=existing_answer is not None
            )
            question_list.append(question_data)
        
        return question_list
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching questions: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch questions")

@router.get('/courses', response_model=List[CourseOut], status_code=status.HTTP_200_OK)
async def list_courses(db: db_dependency, user=Depends(get_user_from_token)):
    try:
        if user is None:
            raise HTTPException(status_code=401, detail="Unauthorized")
        
        # Get distinct courses with question counts
        courses = db.query(questions.course, db.func.count(questions.id)).group_by(questions.course).all()
        
        result = []
        for idx, (course_name, question_count) in enumerate(courses):
            result.append(CourseOut(
                id=str(idx),
                name=course_name,
                question_count=question_count
            ))
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching courses: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch courses")

@router.get("/download/{qp_id}")
async def download_question(qp_id: int, db: db_dependency, user=Depends(get_user_from_token)):
    try:
        check_s3_config()
        
        if user is None:
            raise HTTPException(status_code=401, detail="Unauthorized")
        
        question = db.query(questions).filter(questions.id == qp_id).first()
        if not question:
            raise HTTPException(status_code=404, detail="Question not found")
        
        # Get file from S3
        file_obj = s3_client.get_object(Bucket=settings.S3_BUCKET_NAME, Key=question.s3_key)
        file_stream = io.BytesIO(file_obj['Body'].read())
        
        # Extract filename from s3_key
        filename = question.s3_key.split('/')[-1]
        
        logger.info(f"Student {user['username']} downloaded question {qp_id}")
        
        return StreamingResponse(
            io.BytesIO(file_stream.read()),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error downloading question {qp_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to download question")

@router.post("/upload_answer/{qp_id}")
async def upload_answer(
    qp_id: int,
    db: db_dependency,
    file: UploadFile = File(...),
    user=Depends(get_user_from_token)
):
    try:
        check_s3_config()
        
        if user is None:
            raise HTTPException(status_code=401, detail="Unauthorized")
        
        # Verify question exists
        question = db.query(questions).filter(questions.id == qp_id).first()
        if not question:
            raise HTTPException(status_code=404, detail="Question not found")
        
        # Check if already submitted
        existing_answer = db.query(answers).filter(
            answers.question_id == qp_id,
            answers.answered_by == user['id']
        ).first()
        
        if existing_answer:
            raise HTTPException(
                status_code=400, 
                detail="You have already submitted an answer for this question"
            )
        
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        file_extension = f".{file.filename.split('.')[-1].lower()}"
        if file_extension not in settings.ALLOWED_FILE_TYPES:
            raise HTTPException(
                status_code=400, 
                detail=f"File type not allowed. Allowed types: {settings.ALLOWED_FILE_TYPES}"
            )
        
        # Check file size
        file.file.seek(0, 2)  # Seek to end
        file_size = file.file.tell()
        file.file.seek(0)  # Reset to beginning
        
        if file_size > settings.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Maximum size: {settings.MAX_FILE_SIZE / 1024 / 1024}MB"
            )
        
        # Generate S3 key
        s3_key = f"answers/{qp_id}/{user['id']}_{uuid.uuid4()}{file_extension}"
        
        # Upload to S3
        s3_client.upload_fileobj(file.file, settings.S3_BUCKET_NAME, s3_key)
        
        # Save to database
        answer_entry = answers(
            question_id=qp_id,
            answered_by=user['id'],
            s3_key=s3_key,
            file_size=file_size,
            file_type=file_extension
        )
        
        db.add(answer_entry)
        db.commit()
        db.refresh(answer_entry)
        
        logger.info(f"Student {user['username']} uploaded answer for question {qp_id}")
        
        return {
            "message": "Answer uploaded successfully",
            "answer_id": answer_entry.id,
            "uploaded_at": answer_entry.uploaded_at.isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading answer: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to upload answer")

@router.get('/my-submissions', response_model=List[dict])
async def get_my_submissions(db: db_dependency, user=Depends(get_user_from_token)):
    try:
        if user is None:
            raise HTTPException(status_code=401, detail="Unauthorized")
        
        submissions = (
            db.query(answers, questions.title, questions.course)
            .join(questions, answers.question_id == questions.id)
            .filter(answers.answered_by == user['id'])
            .all()
        )
        
        result = []
        for answer, question_title, course in submissions:
            result.append({
                "answer_id": answer.id,
                "question_title": question_title,
                "course": course,
                "uploaded_at": answer.uploaded_at.isoformat(),
                "file_size": answer.file_size
            })
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching submissions: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch submissions")
