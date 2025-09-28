from pydantic import BaseModel
from Backend.database import SessionLocal
from starlette import status
from fastapi.responses import StreamingResponse
from Backend.routers.auth import db_dependency,get_user_from_token
from Backend.models import questions,answers,users
from typing import List
import uuid
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
import boto3
import io

router=APIRouter(
    prefix='/student',
    tags=['student']
)


AWS_ACCESS_KEY_ID="XXXXXXX"
AWS_SECRET_ACCESS_KEY="XXXXXXX"
AWS_REGION="XXXXXX"
BUCKET_NAME="XXXXXXXX"

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


@router.get('/questions/{course}',response_model=List[QuestionOut],status_code=status.HTTP_200_OK)
async def show_qps(course:str,db:db_dependency,user=Depends(get_user_from_token)):
    if user is None:
        raise HTTPException(status_code=404)

    if course.lower() == 'all':
        qp_model = db.query(questions).all()
    else:
        qp_model = db.query(questions).filter(questions.course == course).all()

    return qp_model or []

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
    
    # Get file from S3
    file_obj = s3_client.get_object(Bucket=BUCKET_NAME, Key=question.s3_key)
    file_stream = io.BytesIO(file_obj['Body'].read())
    
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