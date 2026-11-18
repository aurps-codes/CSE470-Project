from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId

from app.models.database import posts_collection


class Post:
    """A tuition post. A student's post is a request ("I need a tutor"),
    a teacher's post is an offer ("I can teach this")."""

    def __init__(
        self,
        author_id,
        author_name,
        post_type,
        title,
        subject,
        class_level,
        number_of_classes,
        classes_per_week,
        total_hours,
        honorarium,
        preferred_days,
        preferred_time,
        start_date=None,
        description=None,
        qualification=None,
        experience_years=None,
    ):
        self.author_id = author_id                  # ObjectId of the user (users collection)
        self.author_name = author_name              # saved here so the post list needs no extra lookup
        self.post_type = post_type                  # "student" or "teacher" (same as the author's role)
        self.title = title
        self.subject = subject                      # shown to people, e.g. "Higher Math"
        self.subject_key = subject.lower()          # used for searching/filtering later, e.g. "higher math"
        self.class_level = class_level              # e.g. "HSC (Class 11-12)"
        self.number_of_classes = number_of_classes  # total classes wanted/offered
        self.classes_per_week = classes_per_week
        self.total_hours = total_hours              # total hours of all classes together
        self.honorarium = honorarium                # total amount in BDT for the whole course
        self.preferred_days = preferred_days        # e.g. ["Saturday", "Monday"]
        self.preferred_time = preferred_time        # Morning, Afternoon, Evening, Night or Flexible
        self.start_date = start_date                # "YYYY-MM-DD" text or None
        self.description = description
        self.qualification = qualification          # teacher posts only
        self.experience_years = experience_years    # teacher posts only
        self.created_at = datetime.now(timezone.utc)

    def to_document(self):
        return {
            "author_id": self.author_id,
            "author_name": self.author_name,
            "post_type": self.post_type,
            "title": self.title,
            "subject": self.subject,
            "subject_key": self.subject_key,
            "class_level": self.class_level,
            "number_of_classes": self.number_of_classes,
            "classes_per_week": self.classes_per_week,
            "total_hours": self.total_hours,
            "honorarium": self.honorarium,
            "preferred_days": self.preferred_days,
            "preferred_time": self.preferred_time,
            "start_date": self.start_date,
            "description": self.description,
            "qualification": self.qualification,
            "experience_years": self.experience_years,
            "created_at": self.created_at,
        }

    @staticmethod
    def to_public(document):
        # Fields that are safe to send to the browser (the author's email is not included)
        return {
            "id": str(document["_id"]),
            "author_id": str(document["author_id"]),
            "author_name": document["author_name"],
            "post_type": document["post_type"],
            "title": document["title"],
            "subject": document["subject"],
            "class_level": document["class_level"],
            "number_of_classes": document["number_of_classes"],
            "classes_per_week": document["classes_per_week"],
            "total_hours": document["total_hours"],
            "honorarium": document["honorarium"],
            "preferred_days": document["preferred_days"],
            "preferred_time": document["preferred_time"],
            "start_date": document["start_date"],
            "description": document["description"],
            "qualification": document["qualification"],
            "experience_years": document["experience_years"],
            "created_at": document["created_at"],
        }


# Database operations for posts

def insert_post(post):
    result = posts_collection.insert_one(post.to_document())
    return result.inserted_id


def find_by_id(post_id):
    try:
        object_id = ObjectId(post_id)
    except (InvalidId, TypeError):
        return None   # the id in the URL is not a valid MongoDB id
    return posts_collection.find_one({"_id": object_id})


def find_all(post_type, skip, limit):
    # post_type None means "all posts"
    query = {}
    if post_type is not None:
        query["post_type"] = post_type
    cursor = posts_collection.find(query).sort([("created_at", -1), ("_id", -1)])   # newest first
    return list(cursor.skip(skip).limit(limit))


def find_by_author(author_id):
    cursor = posts_collection.find({"author_id": author_id})
    return list(cursor.sort([("created_at", -1), ("_id", -1)]))   # newest first


def delete_by_id(post_id):
    result = posts_collection.delete_one({"_id": post_id})
    return result.deleted_count == 1
