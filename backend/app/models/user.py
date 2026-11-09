from datetime import datetime, timezone


class User:
    def __init__(self, full_name, email, password_hash, role):
        self.full_name = full_name
        self.email = email
        self.password_hash = password_hash
        self.role = role              # "student", "teacher" or "parent"
        self.is_verified = False
        self.created_at = datetime.now(timezone.utc)

    def to_document(self):
        return {
            "full_name": self.full_name,
            "email": self.email,
            "password_hash": self.password_hash,
            "role": self.role,
            "is_verified": self.is_verified,
            "created_at": self.created_at,
        }

    @staticmethod
    def to_public(document):
        # Only the fields that are safe to send to the browser
        return {
            "id": str(document["_id"]),
            "full_name": document["full_name"],
            "email": document["email"],
            "role": document["role"],
        }