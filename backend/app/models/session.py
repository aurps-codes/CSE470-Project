from datetime import datetime, timezone

from app.models.database import sessions_collection


class Session:
    def __init__(self, user_id, token, expires_at):
        self.user_id = user_id
        self.token = token
        self.expires_at = expires_at
        self.created_at = datetime.now(timezone.utc)

    def to_document(self):
        return {
            "user_id": self.user_id,
            "token": self.token,
            "expires_at": self.expires_at,
            "created_at": self.created_at,
        }


# Database operations for sessions. 

def insert_session(session):
    sessions_collection.insert_one(session.to_document())


def find_by_token(token):
    return sessions_collection.find_one({"token": token})


def delete_by_token(token):
    sessions_collection.delete_one({"token": token})