from Backend.database import Base
from sqlalchemy import Column, Integer, String,ForeignKey

class users(Base):
    __tablename__="users"
    id=Column(Integer,primary_key=True,index=True)
    username=Column(String)
    email=Column(String,unique=True,index=True)
    hashed_password=Column(String)
    role=Column(String)


class questions(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    course = Column(String)
    uploaded_by = Column(Integer, ForeignKey("users.id"))
    s3_key = Column(String)
    description = Column(String)


class answers(Base):
    __tablename__="answers"
    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"))
    answered_by = Column(Integer, ForeignKey("users.id"))
    s3_key = Column(String)
