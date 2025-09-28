from fastapi import FastAPI,Request
from Backend.models import Base
from Backend.database import engine
from Backend.routers import auth,teacher,student
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware



app=FastAPI()

Base.metadata.create_all(bind=engine)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get('/health-check')
def health_check():
    return {'status':'healthy'}

app.include_router(auth.router)
app.include_router(teacher.router)
app.include_router(student.router)
