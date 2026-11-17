from app.models.course_verification import CourseVerification
from app.services import course_verification_service


def submit_request(teacher, subject, files):
    request = course_verification_service.submit_request(teacher, subject, files)
    return CourseVerification.to_public(request)


def list_my_requests(teacher):
    requests = course_verification_service.list_my_requests(teacher)
    return [CourseVerification.to_public(request) for request in requests]


def get_verified_subjects(teacher):
    return {"subjects": course_verification_service.get_verified_subjects(teacher)}


def list_requests_for_admin(status):
    pairs = course_verification_service.list_requests_for_admin(status)
    return [CourseVerification.to_public(request, teacher) for request, teacher in pairs]


def approve_request(request_id, admin):
    course_verification_service.approve_request(request_id, admin)
    return {"message": "Course verified."}


def reject_request(request_id, data, admin):
    course_verification_service.reject_request(request_id, data.reason, admin)
    return {"message": "Request rejected."}


def get_file(request_id, stored_name, user):
    return course_verification_service.get_file_path(request_id, stored_name, user)
