from datetime import datetime, timezone

from app.exceptions import AppError
from app.models import post as post_model
from app.models.post import Post
from app.schemas.post_schema import CLASS_LEVELS, DAYS, TIME_SLOTS

# One class should last between 15 minutes and 6 hours
MIN_HOURS_PER_CLASS = 0.25
MAX_HOURS_PER_CLASS = 6


def _get_post_or_404(post_id):
    post = post_model.find_by_id(post_id)
    if post is None:
        raise AppError("Post not found.", 404)
    return post


def _find_verified_subject(teacher, subject):
    """Return the teacher's verified subject that matches (ignoring upper/lower case), or None."""
    for verified in teacher.get("verified_subjects", []):
        if verified.lower() == subject.lower():
            return verified
    return None


def get_options():
    return {"class_levels": CLASS_LEVELS, "days": DAYS, "time_slots": TIME_SLOTS}


def create_post(data, user):
    # Only students and teachers can post (the post type is the user's role)
    if user["role"] not in ("student", "teacher"):
        raise AppError("Only students and teachers can create posts.", 403)

    subject = " ".join(data.subject.split())   # remove extra spaces inside, e.g. "Higher   Math"
    qualification = None
    experience_years = None

    if user["role"] == "teacher":
        # A teacher can post only the subjects the admin has verified
        verified_subject = _find_verified_subject(user, subject)
        if verified_subject is None:
            raise AppError(
                "You can only post subjects you are verified to teach. "
                "Please get this subject verified first.",
                403,
            )
        subject = verified_subject   # use the verified spelling

        if data.qualification is None:
            raise AppError("Please enter your qualification.", 400)
        if data.experience_years is None:
            raise AppError("Please enter your years of experience.", 400)
        qualification = data.qualification
        experience_years = data.experience_years

    if data.classes_per_week > data.number_of_classes:
        raise AppError("Classes per week cannot be more than the total number of classes.", 400)

    hours_per_class = data.total_hours / data.number_of_classes
    if hours_per_class < MIN_HOURS_PER_CLASS or hours_per_class > MAX_HOURS_PER_CLASS:
        raise AppError(
            "Total hours do not match the number of classes. "
            "One class should be between 15 minutes and 6 hours long.",
            400,
        )

    if data.start_date is not None and data.start_date < datetime.now(timezone.utc).date():
        raise AppError("Start date cannot be in the past.", 400)

    description = data.description if data.description else None   # empty text becomes "no description"

    post = Post(
        author_id=user["_id"],
        author_name=user["full_name"],
        post_type=user["role"],
        title=" ".join(data.title.split()),
        subject=subject,
        class_level=data.class_level,
        number_of_classes=data.number_of_classes,
        classes_per_week=data.classes_per_week,
        total_hours=round(data.total_hours, 2),
        honorarium=data.honorarium,
        preferred_days=[day for day in DAYS if day in data.preferred_days],   # no duplicates, week order
        preferred_time=data.preferred_time,
        start_date=data.start_date.isoformat() if data.start_date else None,
        description=description,
        qualification=qualification,
        experience_years=experience_years,
    )
    post_id = post_model.insert_post(post)
    return Post.to_public(post_model.find_by_id(str(post_id)))


def list_posts(post_type, skip, limit):
    posts = post_model.find_all(post_type, skip, limit)
    return [Post.to_public(post) for post in posts]


def list_my_posts(user):
    posts = post_model.find_by_author(user["_id"])
    return [Post.to_public(post) for post in posts]


def get_post(post_id):
    return Post.to_public(_get_post_or_404(post_id))


def delete_post(post_id, user):
    post = _get_post_or_404(post_id)

    # A user can delete only their own posts
    if post["author_id"] != user["_id"]:
        raise AppError("You can only delete your own posts.", 403)

    if not post_model.delete_by_id(post["_id"]):
        raise AppError("Post not found.", 404)   # it was deleted a moment ago
    return {"message": "Post deleted."}
