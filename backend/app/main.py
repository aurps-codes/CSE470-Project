from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app import config
from app.controllers import auth_controller
from app.exceptions import AppError
from app.repositories.database import create_indexes

create_indexes()

app = FastAPI(title="TutorNest API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[config.FRONTEND_URL],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(AppError)
def handle_app_error(request: Request, error: AppError):
    return JSONResponse(status_code=error.status_code, content={"detail": error.message})


app.include_router(auth_controller.router)