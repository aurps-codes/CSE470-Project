from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app import config
from app.exceptions import AppError
from app.models.database import create_indexes
from app.routes import auth_routes

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


app.include_router(auth_routes.router)