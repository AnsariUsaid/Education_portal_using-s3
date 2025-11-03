import uuid
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status,Form
import boto3
import io
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from Backend.database import SessionLocal
from starlette import status
from Backend.routers.auth import db_dependency,get_user_from_token
from Backend.models import questions,answers,users
from typing import List
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

router=APIRouter(
    prefix='/teacher',
    tags=['teacher']
)

class QPUpload(BaseModel):
    title: str
    course: str
    description: str

class QuestionOut(BaseModel):
    id: int
    title: str
    course: str
    uploaded_by: int
    s3_key: str

    class Config:
        orm_mode = True

# AWS Configuration from environment variables
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")
BUCKET_NAME = os.getenv("S3_BUCKET_NAME")

# Validate required environment variables
if not all([AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, BUCKET_NAME]):
    raise ValueError("Missing required AWS environment variables. Please check your .env file.")

s3_client=boto3.client(
    "s3",
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION
)

@router.get('/download/{qp_id}',status_code=status.HTTP_200_OK)
async def teacher_download(qp_id:int,db:db_dependency,user=Depends(get_user_from_token)):
    if user is None:
        raise HTTPException(status_code=401, detail="Unauthorized")
    question = db.query(questions).filter(questions.id == qp_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    file_obj=s3_client.get_object(Bucket=BUCKET_NAME, Key=question.s3_key)
    file_stream=io.BytesIO(file_obj['Body'].read())
    return StreamingResponse(
        file_stream,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={question.s3_key.split('/')[-1]}"
        }
    )


@router.post('/upload/')
async def upload_qp(
    db: db_dependency,
    title: str = Form(...),
    course: str = Form(...),
    description: str = Form(...),
    file: UploadFile = File(...),
    
    user=Depends(get_user_from_token)
):
    if user is None:
        raise HTTPException(status_code=401, detail="Unauthorized")

    extension = file.filename.split(".")[-1]
    s3_key = f"questions/{course}/{user['id']}_{uuid.uuid4()}.{extension}"

    s3_client.upload_fileobj(file.file, BUCKET_NAME, s3_key)

    new_qp = questions(
        title=title,
        course=course,
        uploaded_by=user['id'],
        s3_key=s3_key,
        description=description
    )
    db.add(new_qp)
    db.commit()
    db.refresh(new_qp)

    return {"msg": "Question uploaded successfully"}


    
@router.get('/uploaded-list',status_code=status.HTTP_200_OK)
async def uploaded_by_user_teacher(db:db_dependency,user=Depends(get_user_from_token)):
    if user is None:
        raise HTTPException(status_code=404)
    elif user['role']=='student':
        raise HTTPException(status_code=401)
    
    qp_model=db.query(questions).filter(questions.uploaded_by==user['id']).all()
    if not qp_model:
        return []
    
    # Add submission count for each question paper
    result = []
    for qp in qp_model:
        submission_count = db.query(answers).filter(answers.question_id == qp.id).count()
        result.append({
            "id": qp.id,
            "title": qp.title,
            "course": qp.course,
            "description": qp.description,
            "uploaded_by": qp.uploaded_by,
            "s3_key": qp.s3_key,
            "uploadedAt": qp.id,  # Using id as timestamp placeholder since model doesn't have created_at
            "studentUploads": submission_count
        })
    
    return result
    
@router.get('/student-uploads/{qp_id}', status_code=status.HTTP_200_OK)
async def student_uploads_for_qp(qp_id: int, db: db_dependency, user=Depends(get_user_from_token)):
    if user is None:
        raise HTTPException(status_code=401, detail="Unauthorized")
    if user['role'] != 'teacher':
        raise HTTPException(status_code=403, detail="Only teachers can access this")

    qp = db.query(questions).filter(questions.id == qp_id, questions.uploaded_by == user['id']).first()
    if not qp:
        raise HTTPException(status_code=404, detail="Question not found or not yours")

    # Join with users table to get student names
    uploads = (
        db.query(answers, users.username)
        .join(users, answers.answered_by == users.id)
        .filter(answers.question_id == qp_id)
        .all()
    )
    
    result = []
    for ans, student_name in uploads:
        result.append({
            "answer_id": ans.id,
            "student_name": student_name,
            "answered_by": ans.answered_by,
            "uploaded_at": str(ans.id),  # Using ID as placeholder since model doesn't have timestamp
            "s3_key": ans.s3_key,
            "qp_id": ans.question_id
        })
    
    return result


@router.get('/download-student-upload/{answer_id}')
async def download_student_upload(answer_id: int, db: db_dependency, user=Depends(get_user_from_token)):
    if user is None:
        raise HTTPException(status_code=401, detail="Unauthorized")
    if user['role'] != 'teacher':
        raise HTTPException(status_code=403, detail="Only teachers can access this")

    answer = (
        db.query(answers)
        .join(questions, answers.question_id == questions.id)
        .filter(answers.id == answer_id, questions.uploaded_by == user['id'])
        .first()
    )
    
    if not answer:
        raise HTTPException(status_code=404, detail="No answers uploaded")

    file_obj = s3_client.get_object(Bucket=BUCKET_NAME, Key=answer.s3_key)
    file_stream = io.BytesIO(file_obj['Body'].read())

    return StreamingResponse(
        file_stream,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={answer.s3_key.split('/')[-1]}"
        }
    )
