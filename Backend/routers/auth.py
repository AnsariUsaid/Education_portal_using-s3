from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, validator
from Backend.models import users
from Backend.database import SessionLocal
from typing import Annotated
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import timedelta, datetime, timezone
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi.responses import JSONResponse
import secrets
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix='/auth',
    tags=['Authentication']
)

# Security configuration
SECRET_KEY = secrets.token_urlsafe(32)  # Generate secure secret key
ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = 60

bcrypt_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
oauth2_scheme = OAuth2PasswordBearer(tokenUrl='auth/login')

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_user_from_token(token: Annotated[str, Depends(oauth2_scheme)]):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get('sub')
        user_id: int = payload.get('id')
        role: str = payload.get('role')
        
        if user_id is None or username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"}
            )
        return {'username': username, 'id': user_id, 'role': role}
    
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"}
        )

def authenticate_user(username: str, password: str, db: Session):
    user = db.query(users).filter(
        users.username == username, 
        users.is_active == True
    ).first()
    
    if user is None:
        return False
    if not bcrypt_context.verify(password, user.hashed_password):
        return False
    return user

def create_access_token(username: str, user_id: int, role: str, expires_delta: timedelta):
    to_encode = {'sub': username, 'id': user_id, 'role': role}
    expires = datetime.now(timezone.utc) + expires_delta
    to_encode.update({'exp': expires})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

db_dependency = Annotated[Session, Depends(get_db)]

class CreateUser(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str
    
    @validator('username')
    def validate_username(cls, v):
        if len(v) < 3:
            raise ValueError('Username must be at least 3 characters long')
        return v
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v
    
    @validator('role')
    def validate_role(cls, v):
        if v not in ['student', 'teacher']:
            raise ValueError('Role must be either student or teacher')
        return v

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    created_at: datetime
    
    class Config:
        from_attributes = True

@router.post('/create-user', status_code=status.HTTP_201_CREATED, response_model=dict)
async def create_new_user(user: CreateUser, db: db_dependency):
    try:
        # Check if username exists
        existing_user = db.query(users).filter(users.username == user.username).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered"
            )
        
        # Check if email exists
        existing_email = db.query(users).filter(users.email == user.email).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        user_model = users(
            username=user.username,
            email=user.email,
            hashed_password=bcrypt_context.hash(user.password),
            role=user.role
        )
        
        db.add(user_model)
        db.commit()
        db.refresh(user_model)
        
        logger.info(f"New user created: {user.username} with role: {user.role}")
        
        return {
            "message": "User created successfully",
            "username": user.username,
            "role": user.role
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        )

@router.post('/login')
async def login_for_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: db_dependency):
    try:
        user = authenticate_user(form_data.username, form_data.password, db)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            user.username, user.id, user.role, access_token_expires
        )
        
        logger.info(f"User logged in: {user.username}")
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "role": user.role,
            "username": user.username,
            "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )

@router.post('/logout')
def logout():
    response = JSONResponse(content={"message": "Successfully logged out"})
    response.delete_cookie("access_token")
    return response

@router.get('/me', response_model=UserResponse)
async def get_current_user(db: db_dependency, user=Depends(get_user_from_token)):
    db_user = db.query(users).filter(users.id == user['id']).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return db_user
