from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId

from app.models.database import course_verifications_collection


class CourseVerification:
    """A teacher's request to get one subject/course verified by the admin."""

    def __init__(self, teacher_id, subject, files):
        self.teacher_id = teacher_id          # ObjectId of the teacher (users collection)
        self.subject = subject                # shown to people, e.g. "Higher Math"
        self.subject_key = subject.lower()    # used to detect duplicates, e.g. "higher math"
        self.files = files                    # list of {"stored_name": ..., "original_name": ...}
        self.status = "pending"               # pending -> approved or rejected
        self.rejection_reason = None
        self.reviewed_by = None               # ObjectId of the admin
        self.reviewed_at = None
        self.created_at = datetime.now(timezone.utc)

    def to_document(self):
        return {
            "teacher_id": self.teacher_id,
            "subject": self.subject,
            "subject_key": self.subject_key,
            "files": self.files,
            "status": self.status,
            "rejection_reason": self.rejection_reason,
            "reviewed_by": self.reviewed_by,
            "reviewed_at": self.reviewed_at,
            "created_at": self.created_at,
        }

    @staticmethod
    def to_public(document, teacher=None):
        # Fields that are safe to send to the browser
        result = {
            "id": str(document["_id"]),
            "teacher_id": str(document["teacher_id"]),
            "subject": document["subject"],
            "files": document["files"],
            "status": document["status"],
            "rejection_reason": document["rejection_reason"],
            "created_at": document["created_at"],
            "reviewed_at": document["reviewed_at"],
        }
        if teacher is not None:
            result["teacher_name"] = teacher["full_name"]
            result["teacher_email"] = teacher["email"]
        return result


# Database operations for course verifications

def insert_request(request):
    result = course_verifications_collection.insert_one(request.to_document())
    return result.inserted_id


def find_by_id(request_id):
    try:
        object_id = ObjectId(request_id)
    except (InvalidId, TypeError):
        return None   # the id in the URL is not a valid MongoDB id
    return course_verifications_collection.find_one({"_id": object_id})


def find_by_teacher(teacher_id):
    cursor = course_verifications_collection.find({"teacher_id": teacher_id})
    return list(cursor.sort("created_at", -1))   # newest first


def find_by_status(status):
    cursor = course_verifications_collection.find({"status": status})
    return list(cursor.sort("created_at", 1))    # oldest first, so admin handles them in order


def find_active_for_subject(teacher_id, subject_key):
    # "Active" means still pending or already approved. A rejected one can be submitted again.
    return course_verifications_collection.find_one(
        {
            "teacher_id": teacher_id,
            "subject_key": subject_key,
            "status": {"$in": ["pending", "approved"]},
        }
    )


def mark_reviewed(request_id, status, reason, admin_id):
    # The filter "status: pending" makes sure a request can only be reviewed once,
    # even if two admins click at the same moment.
    result = course_verifications_collection.update_one(
        {"_id": request_id, "status": "pending"},
        {
            "$set": {
                "status": status,
                "rejection_reason": reason,
                "reviewed_by": admin_id,
                "reviewed_at": datetime.now(timezone.utc),
            }
        },
    )
    return result.modified_count == 1
