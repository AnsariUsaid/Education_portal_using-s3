from pydantic import BaseModel
from Backend.database import SessionLocal
from starlette import status
from fastapi.responses import StreamingResponse
from Backend.routers.auth import db_dependency,get_user_from_token
from Backend.models import questions,answers,users
from typing import List
from botocore.exceptions import ClientError
import uuid
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
import boto3
import io
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

router=APIRouter(
    prefix='/student',
    tags=['student']
)

# AWS Configuration from environment variables
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")
BUCKET_NAME = os.getenv("S3_BUCKET_NAME")

# Validate required environment variables
if not all([AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, BUCKET_NAME]):
    raise ValueError("Missing required AWS environment variables. Please check your .env file.")

s3_client = boto3.client(
    "s3",
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION
)


class QuestionOut(BaseModel):
    id: int
    title: str
    course: str
    uploaded_by: int
    s3_key: str

    class Config:
        orm_mode = True


class CourseOut(BaseModel):
    id: str   # unique identifier
    name: str # full course name

    class Config:
        orm_mode = True


@router.get('/questions/{course}', status_code=status.HTTP_200_OK)
async def show_qps(course:str, db:db_dependency, user=Depends(get_user_from_token)):
    if user is None:
        raise HTTPException(status_code=404)

    if course.lower() == 'all':
        qp_model = db.query(questions).all()
    else:
        qp_model = db.query(questions).filter(questions.course == course).all()

    # Add submission status for each question
    result = []
    for qp in qp_model:
        # Check if this student has submitted an answer for this question
        has_submitted = db.query(answers).filter(
            answers.question_id == qp.id,
            answers.answered_by == user['id']
        ).first() is not None
        
        result.append({
            "id": qp.id,
            "title": qp.title,
            "course": qp.course,
            "description": qp.description,
            "uploaded_by": qp.uploaded_by,
            "s3_key": qp.s3_key,
            "hasSubmitted": has_submitted
        })
    
    return result

@router.get('/courses', response_model=List[CourseOut], status_code=status.HTTP_200_OK)
async def list_courses(db: db_dependency, user=Depends(get_user_from_token)):
    # fetch distinct courses
    courses = db.query(questions.course).distinct().all()
    
    result = []
    for idx, (course_name,) in enumerate(courses):
        result.append({
            "id": f"{idx}",       # unique ID for frontend usage
            "name": course_name   # course name
        })

    return result



@router.get("/download/{qp_id}")
async def download_question(qp_id: int, db: db_dependency, user=Depends(get_user_from_token)):
    question = db.query(questions).filter(questions.id == qp_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    # Ensure s3_key exists on the DB record
    if not getattr(question, "s3_key", None):
        raise HTTPException(status_code=404, detail="No S3 key stored for this question")

    # Try to fetch file from S3 and provide clearer errors for missing keys
    attempted_keys = []
    candidate_keys = [question.s3_key]

    # If the stored key looks like a bare filename (no '/'), try the questions/<course>/prefix
    if question.s3_key and '/' not in question.s3_key:
        candidate_keys.append(f"questions/{question.course}/{question.s3_key}")
        candidate_keys.append(f"questions/{question.course}/{question.uploaded_by}_{question.s3_key}")

    file_stream = None
    for key in candidate_keys:
        attempted_keys.append(key)
        try:
            file_obj = s3_client.get_object(Bucket=BUCKET_NAME, Key=key)
            file_stream = io.BytesIO(file_obj['Body'].read())
            # update question.s3_key in memory (do not persist) so the filename used in header is correct
            question.s3_key = key
            break
        except ClientError as e:
            error_code = e.response.get("Error", {}).get("Code")
            # If key missing, try next candidate; for other errors, raise immediately
            if error_code != "NoSuchKey":
                raise HTTPException(status_code=500, detail=f"S3 error: {str(e)}")

    if file_stream is None:
        raise HTTPException(
            status_code=404,
            detail={
                "message": "File not found in S3 for this question",
                "attempted_keys": attempted_keys,
                "bucket": BUCKET_NAME,
            },
        )

    # Return as downloadable response
    return StreamingResponse(
        file_stream,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={question.s3_key.split('/')[-1]}"
        }
    )


@router.post("/upload_answer/{qp_id}")
async def upload_answer(
    qp_id: int,
    db: db_dependency,
    file: UploadFile = File(...),
    user=Depends(get_user_from_token)
    ):
    if user is None:
        raise HTTPException(status_code=401, detail="Unauthorized")

    extension = file.filename.split(".")[-1]
    s3_key = f"answers/{qp_id}/{user['id']}_{uuid.uuid4()}.{extension}"

    s3_client.upload_fileobj(file.file, BUCKET_NAME, s3_key)

    answer_entry = answers(
        question_id=qp_id,
        answered_by=user['id'],
        s3_key=s3_key
    )
    db.add(answer_entry)
    db.commit()
    db.refresh(answer_entry)

    return {"msg": "Answer uploaded successfully", "answer_id": answer_entry.id}