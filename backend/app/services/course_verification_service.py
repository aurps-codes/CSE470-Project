import os
import uuid

from app import config
from app.exceptions import AppError
from app.models import course_verification as cv_model
from app.models import user as user_model
from app.models.course_verification import CourseVerification


def _read_and_check_files(files):
    """Check every uploaded file and return a list of (original_name, extension, bytes)."""
    # Browsers send one empty part when no file is chosen, so skip those
    files = [f for f in files if f.filename]

    if len(files) == 0:
        raise AppError("Please upload at least one document.", 400)
    if len(files) > config.MAX_FILES_PER_REQUEST:
        raise AppError(f"You can upload at most {config.MAX_FILES_PER_REQUEST} files.", 400)

    max_bytes = config.MAX_FILE_MB * 1024 * 1024
    checked = []

    for file in files:
        extension = os.path.splitext(file.filename)[1].lower()
        if extension not in config.ALLOWED_FILE_EXTENSIONS:
            raise AppError("Only PDF, PNG and JPG files are allowed.", 400)

        content = file.file.read(max_bytes + 1)   # read one extra byte to detect "too big"
        if len(content) > max_bytes:
            raise AppError(f"Each file must be {config.MAX_FILE_MB} MB or smaller.", 400)
        if len(content) == 0:
            raise AppError(f"'{file.filename}' is empty.", 400)

        checked.append((file.filename, extension, content))

    return checked


def _save_files(checked_files):
    os.makedirs(config.UPLOAD_DIR, exist_ok=True)
    saved = []

    for original_name, extension, content in checked_files:
        # A random name stops two files with the same name from overwriting each other
        # and stops a bad file name like "../../x.py" from escaping the uploads folder
        stored_name = uuid.uuid4().hex + extension
        with open(os.path.join(config.UPLOAD_DIR, stored_name), "wb") as output:
            output.write(content)
        saved.append({"stored_name": stored_name, "original_name": original_name})

    return saved


def _get_request_or_404(request_id):
    request = cv_model.find_by_id(request_id)
    if request is None:
        raise AppError("Verification request not found.", 404)
    return request


# ---------- Teacher ----------

def submit_request(teacher, subject, files):
    subject = " ".join(subject.split())   # trim and remove extra spaces inside
    if len(subject) < 2 or len(subject) > 60:
        raise AppError("Subject must be between 2 and 60 characters.", 400)

    if cv_model.find_active_for_subject(teacher["_id"], subject.lower()) is not None:
        raise AppError("You already have a pending or verified request for this subject.", 409)

    # Check everything first, and only then save, so a bad file leaves nothing behind
    checked_files = _read_and_check_files(files)
    saved_files = _save_files(checked_files)

    request = CourseVerification(teacher["_id"], subject, saved_files)
    request_id = cv_model.insert_request(request)
    return cv_model.find_by_id(str(request_id))


def list_my_requests(teacher):
    return cv_model.find_by_teacher(teacher["_id"])


def get_verified_subjects(teacher):
    return teacher.get("verified_subjects", [])


# ---------- Admin ----------

def list_requests_for_admin(status):
    requests = cv_model.find_by_status(status)
    # Attach each teacher's name and email so the admin knows who sent it
    return [(request, user_model.find_by_id(request["teacher_id"])) for request in requests]


def approve_request(request_id, admin):
    request = _get_request_or_404(request_id)

    if not cv_model.mark_reviewed(request["_id"], "approved", None, admin["_id"]):
        raise AppError("This request has already been reviewed.", 409)

    # The course is now saved for the teacher
    user_model.add_verified_subject(request["teacher_id"], request["subject"])


def reject_request(request_id, reason, admin):
    request = _get_request_or_404(request_id)

    if not cv_model.mark_reviewed(request["_id"], "rejected", reason.strip(), admin["_id"]):
        raise AppError("This request has already been reviewed.", 409)


# ---------- Files ----------

def get_file_path(request_id, stored_name, user):
    request = _get_request_or_404(request_id)

    # Only the admin or the teacher who uploaded the file may open it
    is_owner = request["teacher_id"] == user["_id"]
    if user["role"] != "admin" and not is_owner:
        raise AppError("You are not allowed to open this file.", 403)

    # Only serve names saved in this request (so nobody can ask for any file on the disk)
    for file in request["files"]:
        if file["stored_name"] == stored_name:
            return os.path.join(config.UPLOAD_DIR, stored_name), file["original_name"]

    raise AppError("File not found.", 404)
