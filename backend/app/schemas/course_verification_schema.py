from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


# The teacher's submit request is multipart form data (subject + files),
# so it is read with Form(...) and File(...) in the route, not with a schema.


class RejectRequest(BaseModel):
    reason: str = Field(min_length=3, max_length=300)


class FileInfo(BaseModel):
    stored_name: str
    original_name: str


class CourseVerificationResponse(BaseModel):
    id: str
    teacher_id: str
    subject: str
    files: List[FileInfo]
    status: str                              # pending, approved or rejected
    rejection_reason: Optional[str] = None
    created_at: datetime
    reviewed_at: Optional[datetime] = None
    teacher_name: Optional[str] = None       # only filled for the admin
    teacher_email: Optional[str] = None


class VerifiedSubjectsResponse(BaseModel):
    subjects: List[str]
