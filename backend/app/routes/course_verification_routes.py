from typing import List, Literal

from fastapi import APIRouter, Depends, File, Form, UploadFile
from fastapi.responses import FileResponse

from app.controllers import course_verification_controller
from app.controllers.dependencies import (
    get_current_user,
    require_admin,
    require_teacher,
)
from app.schemas.auth_schema import MessageResponse
from app.schemas.course_verification_schema import (
    CourseVerificationResponse,
    RejectRequest,
    VerifiedSubjectsResponse,
)

router = APIRouter(prefix="/api/course-verifications", tags=["Course Verification"])


# Teacher

@router.post("", response_model=CourseVerificationResponse, status_code=201)
def submit_request(
    subject: str = Form(...),
    files: List[UploadFile] = File(...),
    teacher=Depends(require_teacher),
):
    return course_verification_controller.submit_request(teacher, subject, files)


@router.get("/mine", response_model=List[CourseVerificationResponse])
def list_my_requests(teacher=Depends(require_teacher)):
    return course_verification_controller.list_my_requests(teacher)


@router.get("/verified-subjects", response_model=VerifiedSubjectsResponse)
def get_verified_subjects(teacher=Depends(require_teacher)):
    return course_verification_controller.get_verified_subjects(teacher)


# Admin 

@router.get("", response_model=List[CourseVerificationResponse])
def list_requests_for_admin(
    status: Literal["pending", "approved", "rejected"] = "pending",
    admin=Depends(require_admin),
):
    return course_verification_controller.list_requests_for_admin(status)


@router.post("/{request_id}/approve", response_model=MessageResponse)
def approve_request(request_id: str, admin=Depends(require_admin)):
    return course_verification_controller.approve_request(request_id, admin)


@router.post("/{request_id}/reject", response_model=MessageResponse)
def reject_request(request_id: str, data: RejectRequest, admin=Depends(require_admin)):
    return course_verification_controller.reject_request(request_id, data, admin)


# Files (admin, or the teacher who uploaded them) 

@router.get("/{request_id}/files/{stored_name}")
def download_file(request_id: str, stored_name: str, user=Depends(get_current_user)):
    path, original_name = course_verification_controller.get_file(request_id, stored_name, user)
    return FileResponse(path, filename=original_name)
