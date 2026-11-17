from datetime import datetime, timezone

from app.models.database import users_collection


class User:
    def __init__(self, full_name, email, password_hash, role):
        self.full_name = full_name
        self.email = email
        self.password_hash = password_hash
        self.role = role              
        self.is_verified = False
        self.verified_subjects = []   # filled when the admin approves a course verification
        self.created_at = datetime.now(timezone.utc)

    def to_document(self):
        return {
            "full_name": self.full_name,
            "email": self.email,
            "password_hash": self.password_hash,
            "role": self.role,
            "is_verified": self.is_verified,
            "verified_subjects": self.verified_subjects,
            "created_at": self.created_at,
        }

    @staticmethod
    def to_public(document):
        #sending safe fields to browser
        return {
            "id": str(document["_id"]),
            "full_name": document["full_name"],
            "email": document["email"],
            "role": document["role"],
        }


# Database operations for users

def find_by_email(email):
    return users_collection.find_one({"email": email})


def find_by_id(user_id):
    return users_collection.find_one({"_id": user_id})


def insert_user(user):
    result = users_collection.insert_one(user.to_document())
    return result.inserted_id


def mark_verified(email):
    users_collection.update_one({"email": email}, {"$set": {"is_verified": True}})


def delete_by_email(email):
    users_collection.delete_one({"email": email})


def add_verified_subject(user_id, subject):
    # $addToSet adds the subject only if it is not already in the list
    users_collection.update_one({"_id": user_id}, {"$addToSet": {"verified_subjects": subject}})
