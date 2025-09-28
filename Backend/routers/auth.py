from fastapi import APIRouter,Depends,HTTPException,status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from Backend.models import users
from Backend.database import SessionLocal
from typing import Annotated
from starlette import status
from jose import JWTError,jwt
from passlib.context import CryptContext
from datetime import timedelta,datetime,timezone
from fastapi.security import OAuth2PasswordRequestForm,OAuth2PasswordBearer
from fastapi.responses import JSONResponse

router=APIRouter(
    prefix='/auth',
    tags=['auth']
)

SECRET_KEY='b41472c5407bedf4d0e4bd817beecc80f15b3970ff6ceea8092d8a2026ce8326'
ALGORITHM='HS256'

bcrypt_context=CryptContext(schemes=['bcrypt'],deprecated='auto')
autho2_scheme=OAuth2PasswordBearer(tokenUrl='auth/login')

def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_user_from_token(token:Annotated[str,Depends(autho2_scheme)]):
    try:
        payload=jwt.decode(token,SECRET_KEY,algorithms=ALGORITHM)
        username:str=payload.get('sub')
        id:int=payload.get('id')
        role:str=payload.get('role')
        if id is None or username is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not validated")
        return {'username':username,'id':id,'role':role}
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not validated")


def authenticate_user(username:str,password:str,db:Session):
    user=db.query(users).filter(users.username==username).first()
    if user is None:
        return False
    if not bcrypt_context.verify(password,user.hashed_password):
        return False
    return user

def create_access_token(username:str,user_id:int,role:str,expires_delta:timedelta):
    encode={'sub':username,'id':user_id,'role':role}
    expires=datetime.now(timezone.utc)+expires_delta
    encode.update({'exp':expires})
    return jwt.encode(encode,SECRET_KEY,algorithm=ALGORITHM)

db_dependency=Annotated[Session,Depends(get_db)]
class create_user(BaseModel):
    username:str
    email:str
    password:str
    role:str

@router.post('/create-user',status_code=status.HTTP_201_CREATED)
async def create_new_user(user:create_user,db:db_dependency):
    user_model=users(
        username=user.username,
        email=user.email,
        hashed_password=bcrypt_context.hash(user.password),
        role=user.role
    )
    db.add(user_model)
    db.commit()


@router.post('/login')
async def login_for_token(form_data:Annotated[OAuth2PasswordRequestForm,Depends()],db:db_dependency):
    user=authenticate_user(form_data.username,form_data.password,db)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not validated")
    token=create_access_token(user.username,user.id,user.role,timedelta(minutes=20))

    return {"access_token": token, "token_type": "bearer", "role": user.role}




@router.post('/logout')
def logout():
    response = JSONResponse(content={"msg": "Logged out successfully"})
    response.delete_cookie("access_token")
    return response