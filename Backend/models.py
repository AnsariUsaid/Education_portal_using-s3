from Backend.database import Base
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

class users(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)
    
    # Relationships
    uploaded_questions = relationship("questions", back_populates="uploader")
    submitted_answers = relationship("answers", back_populates="student")

class questions(Base):
    __tablename__ = "questions"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    course = Column(String(100), nullable=False, index=True)
    description = Column(Text)
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    s3_key = Column(String(500), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    file_size = Column(Integer)
    file_type = Column(String(20))
    
    # Relationships
    uploader = relationship("users", back_populates="uploaded_questions")
    student_answers = relationship("answers", back_populates="question")

class answers(Base):
    __tablename__ = "answers"
    
    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    answered_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    s3_key = Column(String(500), nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    file_size = Column(Integer)
    file_type = Column(String(20))
    
    # Relationships
    question = relationship("questions", back_populates="student_answers")
    student = relationship("users", back_populates="submitted_answers")
